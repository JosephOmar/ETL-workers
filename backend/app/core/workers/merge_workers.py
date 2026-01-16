import pandas as pd
from app.core.workers.clean_people import clean_people
from app.core.workers.clean_scheduling_ppp import clean_scheduling_ppp
from app.core.utils.cleaning_supplies import update_column_based_on_worker
from app.core.utils.columns_names import NAME, API_EMAIL, API_ID, DOCUMENT, SUPERVISOR, REQUIREMENT_ID, TEAM, OBSERVATION_1, OBSERVATION_2, PRODUCTIVE, MANAGER, CAMPAIGN, ROLE, WORK_TYPE, CONTRACT_TYPE, TERMINATION_DATE, TRAINEE
from app.core.utils.cleaning_supplies import clean_observations, clean_productive
from app.core.utils.utils_for_string_and_number import clean_document
from app.core.workers.clean_master_ubycall import clean_master_ubycall
from app.core.workers.clean_scheduling_ubycall import clean_scheduling_ubycall
import numpy as np

def merge_data_for_priority(df_primary: pd.DataFrame, df_secondary: pd.DataFrame, *keys: str) -> pd.DataFrame:

    merged = pd.merge(
        df_primary,
        df_secondary,
        on='document',
        how='left',
        suffixes=('_primary', '_secondary')
    )

    for key in keys:
        primary_col = f"{key}_primary"
        secondary_col = f"{key}_secondary"

        merged[[primary_col, secondary_col]] = (
            merged[[primary_col, secondary_col]].replace('', np.nan)
        )

        merged[key] = merged[secondary_col].fillna(merged[primary_col])

        merged = merged.drop(columns=[primary_col, secondary_col])

    return merged

def merge_worker_ubycall(df_ubycall_master: pd.DataFrame, df_ubycall_scheduling: pd.DataFrame) -> pd.DataFrame:

    combined_data = pd.concat([df_ubycall_master, df_ubycall_scheduling])

    combined_data = combined_data.drop_duplicates(subset=[DOCUMENT], keep='first')

    combined_data[MANAGER] = 'Rosa Del Pilar Agurto Quispe'
    combined_data[CAMPAIGN] = 'Glovo'
    combined_data[ROLE] = 'Agent'
    combined_data[WORK_TYPE] = 'Remoto'
    combined_data[CONTRACT_TYPE] = 'Ubycall'
    combined_data[TERMINATION_DATE] = np.nan
    combined_data[REQUIREMENT_ID] = np.nan
    combined_data[TRAINEE] = np.nan
    combined_data[OBSERVATION_1] = np.nan
    combined_data[OBSERVATION_2] = np.nan
    combined_data[PRODUCTIVE] = 'Sí'

    return combined_data

def clean_api_id(api_id: pd.DataFrame) -> pd.DataFrame:

    api_id = api_id.rename(columns={
        'DOCUMENT': DOCUMENT,
        'API EMAIL': API_EMAIL,
        'API ID': API_ID
    })

    return api_id[[DOCUMENT, API_EMAIL, API_ID]]

def generate_workers(
    people_active: pd.DataFrame,
    people_inactive: pd.DataFrame,
    scheduling_ppp: pd.DataFrame,
    scheduling_ubycall: pd.DataFrame,
    api_id: pd.DataFrame,
    master_glovo: dict
) -> pd.DataFrame:

    df_master_concentrix = master_glovo["concentrix"]
    df_master_concentrix = df_master_concentrix.rename(columns={'DNI': DOCUMENT, 'ASIGNACIÓN INTERNA': SUPERVISOR})
    df_master_concentrix = df_master_concentrix[[DOCUMENT, SUPERVISOR]]

    SUPERVISOR_VALUES = ['APOYO TL UBY', 'APOYO TL']
    df_master_backup = master_glovo['backup']
    df_master_backup = df_master_backup.rename(columns={'DNI': DOCUMENT, 'ASIGNACIÓN INTERNA': ROLE})
    df_master_backup = df_master_backup[[DOCUMENT, ROLE]]
    df_master_backup = df_master_backup[df_master_backup[ROLE].isin(SUPERVISOR_VALUES)]

    df_master_supervisor = master_glovo['supervisor']
    df_master_supervisor = df_master_supervisor.rename(columns={'DNI': DOCUMENT, 'CARGO PEOPLE': ROLE})
    df_master_supervisor[ROLE] = 'Supervisor'
    df_master_supervisor = df_master_supervisor[[DOCUMENT, ROLE]]

    df_master_ubycall = master_glovo["ubycall"]
    # ! CLEAN AGENTS CONCENTRIX FILES
    df_people = clean_people(people_active, people_inactive)
    df_scheduling_ppp = clean_scheduling_ppp(scheduling_ppp)
    # ! CLEAN AGENTS UBYCALL FILES
    df_ubycall_master = clean_master_ubycall(df_master_ubycall)
    df_ubycall_scheduling = clean_scheduling_ubycall(scheduling_ubycall)
    # ! CLEAN API_ID CX + UBY
    df_api_id = clean_api_id(api_id)

    # ! CLEAN DOCUMENT
    for df in [df_people, df_scheduling_ppp, df_api_id, df_ubycall_master, df_ubycall_scheduling, df_master_concentrix, df_master_backup, df_master_supervisor]:
        df = clean_document(df)

    # ! MERGE TEAM AND REQUIREMENT ID FROM PPP // MERGE SUPERVISOR FROM MASTER
    df_people_and_ppp = merge_data_for_priority(df_people, df_scheduling_ppp, TEAM, REQUIREMENT_ID)
    df_people_ppp_and_master = merge_data_for_priority(df_people_and_ppp, df_master_concentrix, SUPERVISOR)
    df_people_ppp_and_master = merge_data_for_priority(df_people_ppp_and_master, df_master_backup, ROLE)
    df_people_ppp_and_master = merge_data_for_priority(df_people_ppp_and_master, df_master_supervisor, ROLE)

    # ! MERGE AGENTS UBYCALL FROM SCHEDULING AND MASTER
    df_ubycall = merge_worker_ubycall(df_ubycall_master, df_ubycall_scheduling)

    # ! CONCAT CX + UBY
    df_final_worker = pd.concat([df_people_ppp_and_master, df_ubycall])

    # ! MERGE CX + UBY WITH API_ID
    df_final_worker = pd.merge(
        df_final_worker,
        df_api_id,
        on=DOCUMENT,
        how="left"
    )

    # ! UPDATE NAME SUPERVISOR FROM PEOPLE
    df_final_worker = update_column_based_on_worker(
        df_final_worker,
        df_people,
        SUPERVISOR,
        NAME
    )

    df_final_worker[OBSERVATION_1] = df_final_worker[OBSERVATION_1].astype(str).str.strip().apply(clean_observations)
    df_final_worker[OBSERVATION_2] = df_final_worker[OBSERVATION_2].astype(str).str.strip().apply(clean_observations)
    df_final_worker[PRODUCTIVE] = df_final_worker[PRODUCTIVE].astype(str).str.strip().apply(clean_productive)
    df_final_worker[REQUIREMENT_ID] = df_final_worker[REQUIREMENT_ID].astype(str)

    cols_str = df_final_worker.select_dtypes(include="object").columns
    for col in cols_str:
        if col != API_EMAIL:
            df_final_worker[col] = df_final_worker[col].str.title()

    return df_final_worker
