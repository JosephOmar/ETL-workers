import pandas as pd
from datetime import datetime, timedelta, time
import numpy as np
from app.core.utils.columns_names import DOCUMENT, START_DATE_ES, START_DATE_PE, END_DATE_PE, END_DATE_ES, START_TIME_PE, START_TIME_ES, END_TIME_PE, END_TIME_ES, BREAK_START_DATE_ES, BREAK_START_DATE_PE, BREAK_START_TIME_ES, BREAK_END_DATE_ES, BREAK_END_DATE_PE, BREAK_END_TIME_ES, BREAK_END_TIME_PE,BREAK_START_TIME_PE, REST_DAY
from app.core.utils.utils_for_date_and_time import compute_break_date, convert_timezone_columns, timedelta_to_time

def clean_schedule_ppp(df: pd.DataFrame) -> pd.DataFrame:

    try:
        dni_col = next(col for col in df.columns if col[1] == "DNI")
    except StopIteration:
        raise ValueError("No se encontró una columna con header de nivel 1 == 'DNI'")

    date_values = sorted({c[0] for c in df.columns if isinstance(c[0], datetime)})

    records = []

    for date in date_values:
        wanted = {
            "Hora Inicio": START_TIME_PE,
            "Hora Fin": END_TIME_PE,
            "Inicio Almuerzo": BREAK_START_TIME_PE,
            "Fin Almuerzo": BREAK_END_TIME_PE,
        }

        sub_cols = [dni_col]
        col_renames = {"DNI": DOCUMENT}

        for original_name, new_name in wanted.items():
            col_key = (date, original_name)
            if col_key in df.columns:
                sub_cols.append(col_key)
                col_renames[original_name] = new_name

        if len(sub_cols) == 1:
            continue

        sub = df.loc[:, sub_cols].copy()

        sub.columns = [c[1] for c in sub.columns]

        sub = sub.rename(columns=col_renames)

        for col in [START_TIME_PE, END_TIME_PE, BREAK_START_TIME_PE, BREAK_END_TIME_PE]:
            if col not in sub.columns:
                sub[col] = None

        sub[START_DATE_PE] = date.date()
        sub[END_DATE_PE] = date.date()

        for i, row in sub.iterrows():
            try:
                start_time = pd.to_timedelta(row[START_TIME_PE])
                end_time = pd.to_timedelta(row[END_TIME_PE])
            except ValueError:
                continue

            start_time_in_minutes = start_time.total_seconds() / 60
            end_time_in_minutes = end_time.total_seconds() / 60

            if end_time_in_minutes < start_time_in_minutes:
                sub.at[i, END_DATE_PE] = sub.at[i, END_DATE_PE] + timedelta(days=1)

        sub[REST_DAY] = sub[START_TIME_PE].isna()

        for col in [START_TIME_PE, END_TIME_PE, BREAK_START_TIME_PE, BREAK_END_TIME_PE]:
          sub[col] = sub[col].apply(timedelta_to_time)

        records.append(sub[[DOCUMENT, START_DATE_PE, END_DATE_PE, START_TIME_PE, END_TIME_PE,
                            BREAK_START_TIME_PE, BREAK_END_TIME_PE, REST_DAY]])

    data = pd.concat(records, ignore_index=True)

    mask_rest = data[REST_DAY]
    data.loc[mask_rest, START_TIME_PE] = time(0, 0)
    data.loc[mask_rest, END_TIME_PE] = time(0, 0)

    data.loc[mask_rest, BREAK_START_TIME_PE] = None
    data.loc[mask_rest, BREAK_END_TIME_PE] = None

    data[BREAK_START_DATE_PE], data[BREAK_END_DATE_PE] = zip(
        *data.apply(lambda r: compute_break_date(r, BREAK_START_TIME_PE, BREAK_END_TIME_PE), axis=1
    ))

    data = convert_timezone_columns(data, START_DATE_PE, START_TIME_PE, START_DATE_ES, START_TIME_ES)
    data = convert_timezone_columns(data, END_DATE_PE, END_TIME_PE, END_DATE_ES, END_TIME_ES)
    data = convert_timezone_columns(data, BREAK_START_DATE_PE, BREAK_START_TIME_PE, BREAK_START_DATE_ES, BREAK_START_TIME_ES)
    data = convert_timezone_columns(data, BREAK_END_DATE_PE, BREAK_END_TIME_PE, BREAK_END_DATE_ES, BREAK_END_TIME_ES)

    return data