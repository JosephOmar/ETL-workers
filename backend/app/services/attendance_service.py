from fastapi import HTTPException, UploadFile
from typing import List
from sqlmodel import select, and_
from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo

from app.services.utils.upload_service import handle_file_upload_generic
from app.utils.validate_excel_attendance import validate_excel_attendance, ATTENDANCE_MAPPING
from app.core.attendance.clean_attendance import clean_attendance
from app.models.worker import Worker
from app.models.schedule import Schedule
from app.services.utils.normalize import normalize_for_db
from app.core.utils.columns_names import API_EMAIL
from sqlmodel.ext.asyncio.session import AsyncSession
from app.crud.attendance import get_workers_and_schedule_for_attendance, bulk_upsert_attendance_on_conflict

def intersect_minutes(a_start, a_end, b_start, b_end) -> int:
    start = max(a_start, b_start)
    end = min(a_end, b_end)
    if start >= end:
        return 0
    return int((end - start).total_seconds() / 60)

TZ = ZoneInfo("America/Lima")

async def process_and_persist_attendance(
    files: List[UploadFile],
    session: AsyncSession,
    attendance_date: date,
) -> dict:
    try:
        df = await handle_file_upload_generic(
            files=files,
            validator=validate_excel_attendance,
            keyword_to_slot=ATTENDANCE_MAPPING,
            required_slots=list(ATTENDANCE_MAPPING.values()),
            post_process=clean_attendance,
        )

        enriched_rows = await get_workers_and_schedule_for_attendance(session,df)

        records = []
        now = datetime.now(TZ)
        print(enriched_rows[0])
        for row in enriched_rows:

            api_email = row["api_email"]
            events = row["events"]
            schedules = row["schedules"]

            for schedule in schedules:
                if schedule.start_date_pe != attendance_date:
                    continue
                if (
                    schedule.is_rest_day
                    or not schedule.start_date_pe
                    or not schedule.end_date_pe
                    or not schedule.start_time_pe
                    or not schedule.end_time_pe
                ):
                    continue
                # -----------------------------
                # 1️⃣ Construir ventanas datetime
                # -----------------------------
                start_dt = datetime.combine(
                    schedule.start_date_pe,
                    schedule.start_time_pe,
                    tzinfo=TZ
                )
                
                end_dt = datetime.combine(
                    schedule.end_date_pe,
                    schedule.end_time_pe,
                    tzinfo=TZ
                )

                if end_dt <= start_dt:
                    continue

                time_break = 0

                if (
                    schedule.break_start_date_pe
                    and schedule.break_start_time_pe
                    and schedule.break_end_date_pe
                    and schedule.break_end_time_pe
                ):
                    break_start_dt = datetime.combine(
                        schedule.break_start_date_pe,
                        schedule.break_start_time_pe,
                        tzinfo=TZ
                    )
                    
                    break_end_dt = datetime.combine(
                        schedule.break_end_date_pe,
                        schedule.break_end_time_pe,
                        tzinfo=TZ
                    )
                    time_break = intersect_minutes(
                        break_start_dt, break_end_dt,
                        start_dt, min(now, end_dt)
                    )

                effective_end = min(now, end_dt)
                total_time_scheduled = intersect_minutes(
                    start_dt, effective_end,
                    start_dt, end_dt
                )

                effective_work_time = max(total_time_scheduled - time_break, 0)

                # -----------------------------
                # 3️⃣ Acumuladores
                # -----------------------------
                time_aux_productive = 0
                time_aux_no_productive = 0

                early_login_minutes = 0
                late_logout_minutes = 0

                first_online_dt = None
                last_offline_dt = None
                had_online_during_shift = False

                last_online_dt = None
                # -----------------------------
                # 4️⃣ Procesar events
                # -----------------------------
                for e in events:
                    ev_start = e["start"]
                    if ev_start.tzinfo is None:
                        ev_start = ev_start.replace(tzinfo=TZ)
                    ev_end = ev_start + timedelta(minutes=e["minutes"])
                    ev_type = e["type"]

                    # -------- CHECK IN ----------
                    if ev_type in ("ONLINE", "AUX_PRODUCTIVE"):
                        if ev_end > start_dt and ev_start < end_dt:
                            had_online_during_shift = True
                            if not first_online_dt or ev_start < first_online_dt:
                                first_online_dt = max(ev_start, start_dt)

                        time_aux_productive += intersect_minutes(
                            ev_start, ev_end,
                            start_dt, end_dt
                        )

                        early_login_minutes += intersect_minutes(
                            ev_start, ev_end,
                            start_dt - timedelta(hours=4),
                            start_dt
                        )

                        late_logout_minutes += intersect_minutes(
                            ev_start, ev_end,
                            end_dt, end_dt + timedelta(hours=4)
                        )

                        if not last_online_dt or ev_end > last_online_dt:
                            last_online_dt = ev_end
                    # -------- OFFLINE / AUX ------
                    if ev_type in ("OFFLINE", "AUX_NO_PRODUCTIVE"):
                        time_aux_no_productive += intersect_minutes(
                            ev_start, ev_end,
                            start_dt, end_dt
                        )

                        if ev_type == "OFFLINE":
                            if ev_start < end_dt and ev_start > start_dt:
                                last_offline_dt = ev_start
                            elif ev_start >= end_dt:
                                last_offline_dt = end_dt
                # ---------------- CHECK IN ----------------
                left_early = False
                early_leave_minutes = 0
                EARLY_LEAVE_TOLERANCE = timedelta(minutes=10)

                if now >= end_dt and last_online_dt:
                    if last_online_dt < end_dt - EARLY_LEAVE_TOLERANCE:
                        left_early = True
                        early_leave_minutes = int(
                            (end_dt - last_online_dt).total_seconds() / 60
                        )
                # ---------------- CHECK IN ----------------
                check_in_dt = None
                if had_online_during_shift:
                    check_in_dt = first_online_dt

                late_login_minutes = 0
                late_login = False
                LATE_TOLERANCE = timedelta(minutes=10)

                if check_in_dt and check_in_dt > start_dt + LATE_TOLERANCE:
                    late_login = True
                    late_login_minutes = int(
                        (check_in_dt - start_dt).total_seconds() / 60
                    )

                # ---------------- CHECK OUT ----------------
                check_out_dt = None
                if now >= end_dt:
                    if last_online_dt:
                        if last_offline_dt and last_offline_dt > last_online_dt:
                            check_out_dt = last_offline_dt
                        else:
                            check_out_dt = end_dt

                status = "Absent"
                # -----------------------------
                # 5️⃣ Status
                # -----------------------------
                if check_in_dt:
                    if check_in_dt <= start_dt + timedelta(minutes=10):
                        status = "Present"
                    else:
                        status = "Late"

                # -----------------------------
                # 6️⃣ Adherence
                # -----------------------------
                if effective_work_time > 0:
                    adherence = round(min(time_aux_productive / effective_work_time, 1) * 100)
                else:
                    adherence = 0
                # -----------------------------
                # 6️⃣ Flags Loing and Logout
                # -----------------------------
                early_login = early_login_minutes > 0
                late_logout = late_logout_minutes > 0
                # -----------------------------
                # 6️⃣ Calculated Variables
                # -----------------------------
                adherence_status = None
                if adherence >= 90:
                    adherence_status = 'Low'
                elif adherence >= 80:
                    adherence_status = 'Medium'
                elif adherence >= 70:
                    adherence_status = 'High'
                else:
                    adherence_status = 'Critical'
                # -----------------------------
                # 7️⃣ Guardar registro
                # -----------------------------
                intermediate_aux = time_aux_no_productive - (late_login_minutes + early_leave_minutes)
                main_deviation_reason = None
                if now >= end_dt:
                    if max(intermediate_aux, late_login_minutes, early_leave_minutes) == intermediate_aux:
                        main_deviation_reason = 'Excesive Aux'
                    elif max(intermediate_aux, late_login_minutes, early_leave_minutes) == late_login_minutes:
                        main_deviation_reason = 'Late Login'
                    elif max(intermediate_aux, late_login_minutes, early_leave_minutes) == early_leave_minutes:
                        main_deviation_reason = 'Early Leave'
                if check_in_dt:
                    records.append({
                        "api_email": api_email,
                        "schedule_id": schedule.id,
                        "effective_work_time": effective_work_time,
                        "date": start_dt.date(),

                        # Tiempos base
                        "check_in": check_in_dt.time(),
                        "check_out": check_out_dt.time() if check_out_dt else None,

                        # Estado
                        "status": status,

                        # Tiempos (minutos)
                        "time_aux_productive": time_aux_productive,
                        "time_aux_no_productive": time_aux_no_productive,

                        # Adherence
                        "adherence": adherence,
                        "adherence_status": adherence_status,
                        "main_deviation_reason": main_deviation_reason,

                        # Flags de comportamiento
                        "early_login": early_login,
                        "early_login_minutes": early_login_minutes,

                        "late_logout": late_logout,
                        "late_logout_minutes": late_logout_minutes,

                        "left_early": left_early,
                        "early_leave_minutes": early_leave_minutes,

                        "late_login": late_login,
                        "late_login_minutes": late_login_minutes,
                    })

        if not records:
            return {"inserted_or_updated": 0}

        result = await bulk_upsert_attendance_on_conflict(
            session=session,
            attendance_data=records
        )
        return result

    except Exception as e:
        print(f"❌ [ATTENDANCE] Error inesperado en process_and_persist_attendance: {e}")
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")