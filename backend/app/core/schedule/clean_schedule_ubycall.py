# app/core/workers_schedule/schedule_ubycall.py

import pandas as pd
from datetime import time
from app.core.utils.columns_names import DOCUMENT, START_DATE_PE, END_DATE_PE, START_TIME_PE, END_TIME_PE, START_DATE_ES, END_DATE_ES, START_TIME_ES,  END_TIME_ES
from app.core.utils.utils_for_date_and_time import convert_timezone_columns

SCHEDULE_UBYCALL_COLUMNS = {
    'DNI':        DOCUMENT,
    'FECHA':      START_DATE_PE,
    'HORAINICIO': START_TIME_PE,
    'HORAFIN':    END_TIME_PE
}

def clean_schedule_ubycall(data: pd.DataFrame) -> pd.DataFrame:
    data = data.rename(columns=SCHEDULE_UBYCALL_COLUMNS)

    data[START_DATE_PE] = pd.to_datetime(data[START_DATE_PE]).dt.date

    for col in (START_TIME_PE, END_TIME_PE):
        data[col] = (
            pd.to_datetime(data[col], format='%H:%M:%S', errors='coerce')
                .dt.time
        )

    data[END_DATE_PE] = data[START_DATE_PE]

    data = convert_timezone_columns(data, START_DATE_PE, START_TIME_PE, START_DATE_ES, START_TIME_ES)
    data = convert_timezone_columns(data, END_DATE_PE, END_TIME_PE, END_DATE_ES, END_TIME_ES)

    return data[[DOCUMENT, START_DATE_PE, END_DATE_PE, START_TIME_PE, END_TIME_PE, START_DATE_ES, END_DATE_ES, START_TIME_ES,  END_TIME_ES]]
