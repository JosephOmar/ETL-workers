import pandas as pd
from app.core.workers.clean_people import clean_people
from app.core.workers.clean_scheduling_ppp import clean_scheduling_ppp
from app.core.utils.cleaning_supplies import update_column_based_on_worker
from app.core.utils.columns_names import NAME, API_EMAIL, API_ID, DOCUMENT, SUPERVISOR, REQUIREMENT_ID, TEAM
import numpy as np

def merge_worker_data(df_people: pd.DataFrame, df_scheduling_ppp: pd.DataFrame) -> pd.DataFrame:

    merged = pd.merge(
        df_people,
        df_scheduling_ppp,
        on='document',
        how='left',
        suffixes=('_people', '_ppp')
    )

    # merged['observation_1'] = merged['observation_1'].fillna('')
    # merged['observation_2'] = merged['observation_2'].fillna('')

    merged['team_ppp'] = merged['team_ppp'].replace('', np.nan)
    merged['supervisor_ppp'] = merged['supervisor_ppp'].replace('', np.nan)
    merged['requirement_id_ppp'] = merged['requirement_id_ppp'].replace('', np.nan)

    merged[TEAM] = merged['team_ppp'].fillna(merged['team_people'])
    merged[SUPERVISOR] = merged['supervisor_ppp'].fillna(merged['supervisor_people'])
    merged[REQUIREMENT_ID] = merged['requirement_id_ppp'].fillna(merged['requirement_id_people'])

    merged = merged.drop(columns=['team_people', 'team_ppp','supervisor_people', 'supervisor_ppp','requirement_id_people', 'requirement_id_ppp'])

    return merged

def generate_workers(
    people_active: pd.DataFrame,
    people_inactive: pd.DataFrame,
    scheduling_ppp: pd.DataFrame,
    api_id: pd.DataFrame
) -> pd.DataFrame:

    df_people = clean_people(people_active, people_inactive)
    df_scheduling_ppp = clean_scheduling_ppp(scheduling_ppp)

    api_id = api_id.rename(columns={
        'DOCUMENT': DOCUMENT,
        'API EMAIL': API_EMAIL,
        'API ID': API_ID
    })
    api_id = api_id[[DOCUMENT, API_EMAIL, API_ID]]
    print(api_id)

    for df in [df_people, df_scheduling_ppp, api_id]:
        if DOCUMENT in df.columns:
            df[DOCUMENT] = df[DOCUMENT].astype(str).str.lstrip("0").str.replace(r"\.0$", "", regex=True)

    df_people_and_ppp = merge_worker_data(df_people, df_scheduling_ppp)

    df_final_worker = pd.merge(
        df_people_and_ppp,
        api_id,
        on=DOCUMENT,
        how="left"
    )
    print(df_final_worker[df_final_worker[DOCUMENT] == '46584234'])
    df_final_worker = update_column_based_on_worker(
        df_final_worker,
        df_people,
        SUPERVISOR,
        NAME
    )

    return df_final_worker
