import pandas as pd
import numpy as np
from datetime import datetime
from app.core.utils.cleaning_supplies import update_column_based_on_worker
from app.core.utils.columns_names import (
    DOCUMENT, ROLE, STATUS, CAMPAIGN, TEAM, MANAGER, SUPERVISOR, COORDINATOR,
    CONTRACT_TYPE, START_DATE, TERMINATION_DATE, WORK_TYPE, REQUIREMENT_ID,
    EMPLOYEE_NAME, FATHER_LAST_NAME, MOTHER_LAST_NAME, NAME, TENURE, TRAINEE,
    CHAT_CUSTOMER, CHAT_RIDER, MAIL_CUSTOMER, MAIL_RIDER, MAIL_VENDORS,
    CALL_VENDORS, GLOVO_SPAIN, GERENCIA, UPDATE
)

COLUMNS_PEOPLE_CONSULTATION = {
    "NRO. DOCUMENTO": DOCUMENT,
    "CARGO": ROLE,
    "ESTADO": STATUS,
    "SERVICIO": CAMPAIGN,
    "DETALLE SERVICIO": TEAM,
    "GERENTE": MANAGER,
    "SUPERVISOR": SUPERVISOR,
    "RESPONSABLE": COORDINATOR,
    "TIPO CONTRATO": CONTRACT_TYPE,
    "FECHA ING.": START_DATE,
    "FECHA CESE": TERMINATION_DATE,
    "TIPO TRABAJO": WORK_TYPE,
    "ID REQUERIMIENTO": REQUIREMENT_ID,
    "NOMBRE EMPLEADO": EMPLOYEE_NAME,
    "APELLIDO PATERNO ": FATHER_LAST_NAME,
    "APELLIDO MATERNO": MOTHER_LAST_NAME
}

FILTER_MANAGEMENT = ['CAPACITACION', 'EXPERIENCIA CLIENTE', 'GERENCIA 1', 'GLOVO']

ROLE_MAP = {
        "RESPONSABLE DE OPERACIONES": "COORDINATOR",
        "EJECUTIVO DE CALIDAD": "QUALITY",
        "COORDINADOR DE GESTION EN TIEMPO REAL": "SR RTA",
        "JEFE DE OPERACIONES": "COORDINATOR",
        "ANALISTA DE GESTION EN TIEMPO REAL": "RTA",
        "RESPONSABLE DE CONTROL DE GESTION": "COORDINATOR RTA",
        "ANALISTA PPP": "PPP",
        "FORMADOR": "TRAINING",
        "AGENTE": "AGENT",
        "AGENTE 1": "QA/TR",
        "COORDINADOR DE CAPACITACION": "COORDINATOR TRAINING",
        "COORDINADOR DE CALIDAD": "COORDINATOR QUALITY",
        "SUPERVISOR DE CALIDAD": "SR QUALITY",
        "SUPERVISOR": "SUPERVISOR",
        "SUPERVISOR DE CAPACITACION": "SR TRAINING",
        "GERENTE DE OPERACIONES": "MANAGER"
    }

def clean_people(data_active: pd.DataFrame, data_inactive: pd.DataFrame) -> pd.DataFrame:

    data = pd.concat([data_active,data_inactive], ignore_index=True)
    data = data.rename(columns=COLUMNS_PEOPLE_CONSULTATION)

    current_date = datetime.now()
    first_day_month = current_date.replace(day=1)
    limit_date = (first_day_month - pd.DateOffset(months=1)) if current_date.day <= 10 else first_day_month

    data[TERMINATION_DATE] = pd.to_datetime(data[TERMINATION_DATE], errors='coerce')
    mask = (
        (data[STATUS].str.lower() == 'activo') |
        ((data[STATUS].str.lower() == 'inactivo') & (data[TERMINATION_DATE] >= limit_date))
    )
    data = data.loc[mask]

    data = data[data[CAMPAIGN].isin(FILTER_MANAGEMENT)]

    data = data.loc[
        (data[CAMPAIGN] == 'GLOVO') |
        ((data[CAMPAIGN] == 'GERENCIA 1') & (data[ROLE] == 'GERENTE DE OPERACIONES'))
    ]

    data[[EMPLOYEE_NAME, FATHER_LAST_NAME, MOTHER_LAST_NAME]] = data[
        [EMPLOYEE_NAME, FATHER_LAST_NAME, MOTHER_LAST_NAME]
    ].fillna('')

    full_names = (
        data[[EMPLOYEE_NAME, FATHER_LAST_NAME, MOTHER_LAST_NAME]]
        .fillna("")
        .agg(" ".join, axis=1)
        .str.replace(r"\s+", " ", regex=True)
        .str.strip()
    )

    def fast_unique_name(name):
        parts = name.split()
        seen = set()
        return " ".join([p for p in parts if not (p in seen or seen.add(p))])

    data[NAME] = full_names.apply(fast_unique_name)

    for col in [NAME, MANAGER, SUPERVISOR, COORDINATOR]:
        data[col] = data[col].fillna('').str.title().str.strip()

    for col in [MANAGER, SUPERVISOR, COORDINATOR]:
        data = update_column_based_on_worker(data, data, col, NAME)

    data[START_DATE] = pd.to_datetime(data[START_DATE], errors='coerce')

    now = pd.Timestamp.now()
    valid_mask = data[START_DATE].notna()
    diff_months = ((now.year - data.loc[valid_mask, START_DATE].dt.year) * 12
                + (now.month - data.loc[valid_mask, START_DATE].dt.month))
    data.loc[valid_mask, TENURE] = diff_months.clip(lower=0)
    data[TRAINEE] = np.where(data[TENURE] < 1, "DESPEGANDO", None)

    data[ROLE] = data[ROLE].replace(ROLE_MAP)

    cols = [
        DOCUMENT, NAME, ROLE, STATUS, CAMPAIGN, TEAM, MANAGER, SUPERVISOR, COORDINATOR,
        CONTRACT_TYPE, START_DATE, TERMINATION_DATE, WORK_TYPE, REQUIREMENT_ID, TENURE, TRAINEE
    ]

    data = data[cols].drop_duplicates(ignore_index=True)

    return data
