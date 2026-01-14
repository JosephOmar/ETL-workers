import pandas as pd
import numpy as np
from datetime import date, timedelta, time, datetime
from app.core.utils.columns_names import (
    DOCUMENT, START_DATE_PE, END_DATE_PE,
    START_TIME_PE, END_TIME_PE,
    BREAK_START_DATE_PE, BREAK_END_DATE_PE,
    BREAK_START_TIME_PE, BREAK_END_TIME_PE,
    START_DATE_ES, END_DATE_ES,
    START_TIME_ES, END_TIME_ES,
    BREAK_START_DATE_ES, BREAK_END_DATE_ES,
    BREAK_START_TIME_ES, BREAK_END_TIME_ES,
    REST_DAY, OBS
)
from app.core.utils.utils_for_date_and_time import compute_break_date, convert_timezone_columns
from app.core.utils.utils_for_string_and_number import clean_document

def clean_schedule_concentrix(
    data: pd.DataFrame,
    data_obs: pd.DataFrame,
    week: int | None = None,
    year: int | None = None
) -> pd.DataFrame:

    data = data[data["SERVICIO"] == "GLOVO"]

    today = date.today()
    year = year or today.isocalendar()[0]
    week = week or today.isocalendar()[1]
    monday = date.fromisocalendar(year, week, 1)

    days = ["Lunes", "Martes", "Miercoles", "Jueves",
            "Viernes", "Sabado", "Domingo"]
    idx_map = {d: i for i, d in enumerate(days)}
    records = []

    for day in days:
        idx = idx_map[day]
        current_date = monday + timedelta(days=idx)

        ing_col = f"INGRESO_{day.upper()}"
        sal_col = f"SALIDA_{day.upper()}"
        ref_col = f"REFRIGERIO_{day.upper()}"

        sub = data[["NRO_DOCUMENTO", ing_col, sal_col, ref_col]].copy()

        sub.rename(columns={
            "NRO_DOCUMENTO": DOCUMENT,
            ing_col: START_TIME_PE,
            sal_col: END_TIME_PE,
            ref_col: "REF"
        }, inplace=True)

        sub[START_DATE_PE] = current_date
        sub[END_DATE_PE] = current_date

        ref = sub["REF"].fillna("").astype(str)
        ref_split = ref.str.split("-", n=1, expand=True)
        sub[BREAK_START_TIME_PE] = ref_split[0].str.strip().replace("", None)
        sub[BREAK_END_TIME_PE] = ref_split[1].str.strip().replace("", None)
        sub.drop(columns=["REF"], inplace=True)

        td_start = pd.to_timedelta(sub[START_TIME_PE], errors="coerce")
        td_end = pd.to_timedelta(sub[END_TIME_PE], errors="coerce")
        cruza = td_end < td_start
        sub.loc[cruza, END_DATE_PE] = sub.loc[cruza, END_DATE_PE] + timedelta(days=1)

        sub[START_TIME_PE] = pd.to_datetime(sub[START_TIME_PE],format="%H:%M:%S", errors="coerce").dt.time
        sub[REST_DAY] = sub[START_TIME_PE].isna()

        date_col = current_date.strftime("%d/%m/%Y")
        if date_col in data_obs.columns:
            obs_map = data_obs.set_index("NRO_DOCUMENTO")[date_col]
            sub[OBS] = sub[DOCUMENT].map(obs_map)
            sub[OBS] = sub[OBS].astype(object)
            mask_valid = sub[OBS].str.match(r"^(?!FLT$)[A-Za-z]{3}$")
            sub[OBS] = sub[OBS].where(mask_valid, None)
        else:
            sub[OBS] = None
        records.append(sub)

    data = pd.concat(records, ignore_index=True)

    for col in (START_TIME_PE, END_TIME_PE, BREAK_START_TIME_PE, BREAK_END_TIME_PE):
        data[col] = (
            pd.to_datetime(data[col], format="%H:%M:%S", errors="coerce")
            .dt.floor("min")
            .dt.time
        )

    data[BREAK_START_DATE_PE], data[BREAK_END_DATE_PE] = zip(
        *data.apply(lambda r: compute_break_date(r, BREAK_START_TIME_PE, BREAK_END_TIME_PE), axis=1
    ))

    data = convert_timezone_columns(df=data, date_col_src=START_DATE_PE, time_col_src=START_TIME_PE, date_col_dst=START_DATE_ES, time_col_dst=START_TIME_ES)
    data = convert_timezone_columns(df=data, date_col_src=END_DATE_PE, time_col_src=END_TIME_PE, date_col_dst=END_DATE_ES, time_col_dst=END_TIME_ES)
    data = convert_timezone_columns(df=data, date_col_src=BREAK_START_DATE_PE, time_col_src=BREAK_START_TIME_PE, date_col_dst=BREAK_START_DATE_ES, time_col_dst=BREAK_START_TIME_ES)
    data = convert_timezone_columns(df=data, date_col_src=BREAK_END_DATE_PE, time_col_src=BREAK_END_TIME_PE, date_col_dst=BREAK_END_DATE_ES, time_col_dst=BREAK_END_TIME_ES)

    return data[
        [
            DOCUMENT,
            START_DATE_PE, END_DATE_PE,
            START_TIME_PE, END_TIME_PE,
            BREAK_START_DATE_PE, BREAK_END_DATE_PE,
            BREAK_START_TIME_PE, BREAK_END_TIME_PE,
            START_DATE_ES, END_DATE_ES,
            START_TIME_ES, END_TIME_ES,
            BREAK_START_DATE_ES, BREAK_END_DATE_ES,
            BREAK_START_TIME_ES, BREAK_END_TIME_ES,
            REST_DAY, OBS
        ]
    ]
