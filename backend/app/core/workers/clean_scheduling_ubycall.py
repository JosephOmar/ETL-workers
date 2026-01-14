import pandas as pd
from datetime import datetime
import numpy as np

# Importar las variables
from app.core.utils.columns_names import DOCUMENT, NAME, STATUS, START_DATE, SUPERVISOR, COORDINATOR, TEAM, TENURE, CHAT_CUSTOMER, CHAT_RIDER, CALL_VENDORS

COLUMNS_SCHEDULING_UBYCALL = {
    "DNI": DOCUMENT,
    "NOMBRECOMPLETO": NAME,
    "HORARIOSELECCIONADO": STATUS,
    "FECHA_CREA_AGENTE": START_DATE,
    "CAMPANA": TEAM
}


def clean_scheduling_ubycall(data: pd.DataFrame) -> pd.DataFrame:

    data = data.rename(columns=COLUMNS_SCHEDULING_UBYCALL)

    data = data.drop_duplicates(subset=[NAME])

    data[TEAM] = data[TEAM].replace({
        'GLOVO -  GLOVER ESPANA': 'RIDER TIER1',
        'GLOVO -  USER ESPANA': 'CUSTOMER TIER1',
        'GLOVO - PARTNER SERVICES': 'VENDOR TIER1'
    })

    data[START_DATE] = pd.to_datetime(data[START_DATE], format='%Y%m%d', errors='coerce')

    now = pd.Timestamp.now()
    valid_mask = data[START_DATE].notna()
    diff_months = ((now.year - data.loc[valid_mask, START_DATE].dt.year) * 12
                + (now.month - data.loc[valid_mask, START_DATE].dt.month))
    data.loc[valid_mask, TENURE] = diff_months.clip(lower=0)

    return data[[DOCUMENT, NAME, TEAM, STATUS, START_DATE, TENURE]]
