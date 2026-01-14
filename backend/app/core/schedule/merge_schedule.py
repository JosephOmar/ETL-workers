import pandas as pd
from app.core.schedule.clean_schedule_people import clean_schedule_concentrix
from app.core.schedule.clean_schedule_ubycall import clean_schedule_ubycall
from app.core.utils.utils_for_string_and_number import clean_document

def merge_schedule(schedule_people: pd.DataFrame, people_obs: pd.DataFrame, schedule_ubycall: pd.DataFrame) -> pd.DataFrame :
    df_concentrix = clean_schedule_concentrix(schedule_people, people_obs)

    df_ubycall = clean_schedule_ubycall(schedule_ubycall)

    df_final = pd.concat([df_concentrix, df_ubycall])

    df_final = clean_document(df_final)

    return df_final