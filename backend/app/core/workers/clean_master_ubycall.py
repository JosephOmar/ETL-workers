import pandas as pd
from app.core.utils.columns_names import DOCUMENT, NAME, STATUS, START_DATE, SUPERVISOR, COORDINATOR, TEAM, TENURE


COLUMNS_MASTER_GLOVO = {
    "DNI": DOCUMENT,
    "NOMBRE": NAME,
    "ESTADO": STATUS,
    "FECHA DE ALTA": START_DATE,
    "SUPERVISOR": SUPERVISOR,
    "RESPONSABLE": COORDINATOR,
    "CANALES GLOVO": TEAM
}

def clean_master_ubycall(data: pd.DataFrame) -> pd.DataFrame:

    data = data.rename(columns=COLUMNS_MASTER_GLOVO)

    data[TEAM] = data[TEAM].replace(
        {'Ubycall Chat User': 'CUSTOMER TIER1', 'Ubycall Chat Glover': 'RIDER TIER1', 'Ubycall Partnercall Es': 'VENDOR TIER1'})

    data[START_DATE] = pd.to_datetime(data[START_DATE], errors='coerce')

    now = pd.Timestamp.now()
    valid_mask = data[START_DATE].notna()
    diff_months = ((now.year - data.loc[valid_mask, START_DATE].dt.year) * 12
                + (now.month - data.loc[valid_mask, START_DATE].dt.month))
    data.loc[valid_mask, TENURE] = diff_months.clip(lower=0)

    return data[list(COLUMNS_MASTER_GLOVO.values()) + [TENURE]]
