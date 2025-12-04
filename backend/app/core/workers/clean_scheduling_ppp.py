import pandas as pd
from app.core.utils.cleaning_supplies import clean_observations
from app.core.utils.columns_names import DOCUMENT, OBSERVATION_1, OBSERVATION_2, TEAM, REQUIREMENT_ID, SUPERVISOR, PRODUCTIVE

COLUMNS_SCHEDULING_PPP = {
    "DNI": DOCUMENT,
    "CANAL": TEAM,
    "Observaciones 1°": OBSERVATION_1,
    "Observaciones 2°": OBSERVATION_2,
    "ID" : REQUIREMENT_ID,
    "SUPERVISOR" : SUPERVISOR,
    "Productivo": PRODUCTIVE
}

REQUIRED_COLUMNS = list(COLUMNS_SCHEDULING_PPP.keys())

def clean_scheduling_ppp(data: pd.DataFrame) -> pd.DataFrame:

    data.columns = data.columns.str.strip()

    data = data.rename(columns=COLUMNS_SCHEDULING_PPP)

    data[OBSERVATION_1] = data[OBSERVATION_1].astype(str).str.strip().apply(clean_observations)
    data[OBSERVATION_2] = data[OBSERVATION_2].astype(str).str.strip().apply(clean_observations)

    data = data[list(COLUMNS_SCHEDULING_PPP.values())]

    return data