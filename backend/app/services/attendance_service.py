from fastapi import HTTPException, UploadFile
from typing import List
from sqlmodel import select, and_
from datetime import date, datetime, timedelta

from app.services.utils.upload_service import handle_file_upload_generic
from app.utils.validate_excel_attendance import validate_excel_attendance, ATTENDANCE_MAPPING
from app.core.attendance.clean_attendance import clean_attendance
from app.models.worker import Worker
from app.models.schedule import Schedule
from app.services.utils.normalize import normalize_for_db
from app.core.utils.columns_names import API_EMAIL
from sqlmodel.ext.asyncio.session import AsyncSession
from app.crud.attendance import get_workers_and_schedule_for_attendance, bulk_upsert_attendance_on_conflict

async def process_and_persist_attendance(
    files: List[UploadFile],
    session: AsyncSession,
    target_date: date | None = None,
) -> dict:
    try:
        df = await handle_file_upload_generic(
            files=files,
            validator=validate_excel_attendance,
            keyword_to_slot=ATTENDANCE_MAPPING,
            required_slots=list(ATTENDANCE_MAPPING.values()),
            post_process=clean_attendance,
        )
        df = normalize_for_db(df)
        if target_date is None:
            target_date = date.today()
        enriched_rows = await get_workers_and_schedule_for_attendance(session,df,target_date)

        records = []
        now = datetime.now()

        for row in enriched_rows:

            start_dt = datetime.combine(row["date"], row["schedule_start"])
            end_dt = datetime.combine(row["date"], row["schedule_end"])

            break_start = row.get("break_start")
            break_end = row.get("break_end")

            if break_start and break_end:
                break_start_dt = datetime.combine(row["date"], break_start)
                break_end_dt = datetime.combine(row["date"], break_end)
                time_break = int((break_end_dt - break_start_dt).total_seconds() / 60)
            else:
                time_break = 0

            if start_dt and end_dt:
                effective_end = min(now, end_dt)

                if effective_end > start_dt:
                    total_time_scheduled = int((effective_end - start_dt).total_seconds() / 60)
                else:
                    total_time_scheduled = 0
            else:
                total_time_scheduled = 0

            time_outside_scheduled = 0
            time_aux_productive = 0
            time_aux_non_productive = 0

            status = "Absent"

            # ! CHECK_IN
            valid_check_in = []

            for time_, duration in row["check_in_group"]:
                check_in_dt = datetime.combine(row["date"], time_)

                if check_in_dt >= start_dt - timedelta(hours=3):
                    valid_check_in.append((check_in_dt, duration))

            valid_check_in.sort(key=lambda x: x[0])

            check_in = None

            if valid_check_in:
                check_in_dt, duration = valid_check_in[0]
                check_in = check_in_dt.time()

                if check_in_dt <= start_dt + timedelta(minutes=10):
                    status = "Present"
                else:
                    status = "Late"
                # ! TIME IN ADHERENCE AND TIME OUTSIDE SCHEDULED
                for check_in_dt, duration in valid_check_in:
                    check_in_end = check_in_dt + timedelta(minutes=duration)

                    in_start = max(check_in_dt, start_dt)
                    in_end = min(check_in_end, end_dt)

                    if in_start < in_end:
                        time_aux_productive += round((in_end - in_start).total_seconds() / 60)

                    out_start = max(check_in_dt, end_dt)
                    out_end = min(check_in_end, end_dt + timedelta(hours=4))

                    if out_start < out_end:
                        time_outside_scheduled += round((out_end - out_start).total_seconds() / 60)
            # ! CHECK_OUT
            valid_check_out = []

            for time_, duration in row["check_out_group"]:
                check_out_dt = datetime.combine(row["date"], time_)

                if start_dt < check_out_dt <= end_dt + timedelta(hours=4):
                    valid_check_out.append((check_out_dt, duration))

            valid_check_out.sort(key=lambda x: x[0])

            check_out = None

            if now >= end_dt and valid_check_out:

                window_start = end_dt - timedelta(minutes=5)
                window_end = end_dt + timedelta(hours=4)

                near_end = [(check_out_dt, duration) for check_out_dt, duration in valid_check_out if window_start <= check_out_dt <= window_end]

                if near_end:
                    check_out = max(near_end, key=lambda x: x[0])[0]
                else:
                    check_out = valid_check_out[-1][0]
            # ! TIME_OUT_ADHERENCE (OFFLINE)
            for check_out_dt, duration in valid_check_out:
                check_out_end = check_out_dt + timedelta(minutes=duration)

                overlap_start = max(check_out_dt, start_dt)
                overlap_end = min(check_out_end, end_dt)

                if overlap_start < overlap_end:
                    time_aux_non_productive  += round((overlap_end - overlap_start).total_seconds() / 60)
            # ! TIME_OUT_ADHERENCE (BUSY, UNAVAILABLE, ON HOLD CASE) - AUX NON PRODUCTIVE
            valid_aux_non_productive = []

            for time_, duration in row["time_non_productive_group"]:
                aux_non_prod_dt = datetime.combine(row["date"], time_)

                if start_dt - timedelta(hours=4) <= aux_non_prod_dt <= end_dt + timedelta(hours=4):
                    valid_aux_non_productive.append((aux_non_prod_dt, duration))

            valid_aux_non_productive.sort(key=lambda x: x[0])

            for aux_non_prod_dt, duration in valid_aux_non_productive:
                aux_non_prod_end = aux_non_prod_dt + timedelta(minutes=duration)

                overlap_start = max(aux_non_prod_dt, start_dt)
                overlap_end = min(aux_non_prod_end, end_dt)

                if overlap_start < overlap_end:
                    time_aux_non_productive  += round((overlap_end - overlap_start).total_seconds() / 60)

            # ! ADHERENCE

            effective_work_time = total_time_scheduled - time_break

            if effective_work_time > 0:
                adherence = time_aux_productive / effective_work_time
                adherence = min(adherence, 1)
            else:
                adherence = 0

            if valid_check_in:
                records.append({
                    'api_email' : row["api_email"],
                    'date' : row["date"],
                    'check_in' : check_in,
                    'check_out' : check_out,
                    'status' : status,
                    'time_aux_productive': time_aux_productive,
                    'time_aux_non_productive': time_aux_non_productive,
                    'adherence' : adherence,
                    'time_outside_scheduled': time_outside_scheduled
                })

        if not records:
            return {"inserted_or_updated": 0}

        result = await bulk_upsert_attendance_on_conflict(
            session=session,
            attendance_data=records
        )

        await session.commit()
        return result

    except Exception as e:
        print(f"❌ [ATTENDANCE] Error inesperado en process_and_persist_attendance: {e}")
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")