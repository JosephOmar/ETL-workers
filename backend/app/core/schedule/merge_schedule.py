import pandas as pd
from app.core.schedule.clean_schedule_people import clean_schedule_concentrix
from app.core.schedule.clean_schedule_ubycall import clean_schedule_ubycall
from app.core.schedule.clean_schedule_ppp import clean_schedule_ppp
from app.core.utils.utils_for_string_and_number import clean_document

KEY_COLS = ["document", "start_date_pe", "end_date_pe"]

TIME_COLS = [
    "start_time_pe",
    "end_time_pe",
    "break_start_time_pe",
    "break_end_time_pe",
    "start_time_es",
    "end_time_es",
    "break_start_time_es",
    "break_end_time_es",
]

DATE_COLS = [
    "start_date_pe",
    "end_date_pe",
    "break_start_date_pe",
    "break_end_date_pe",
    "start_date_es",
    "end_date_es",
    "break_start_date_es",
    "break_end_date_es",
]

FLAG_COLS = ["is_rest_day"]

def merge_schedule_concentrix(df_conc: pd.DataFrame, df_ppp: pd.DataFrame) -> pd.DataFrame:
    for df in (df_conc, df_ppp):
        df["document"] = df["document"].astype(str)

    df = df_conc.merge(
        df_ppp,
        on=KEY_COLS,
        how="left",
        suffixes=("", "_ppp"),
    )

    replace_cols = TIME_COLS + DATE_COLS + FLAG_COLS

    for col in replace_cols:
        ppp_col = f"{col}_ppp"
        if ppp_col in df.columns:
            df[col] = df[ppp_col].combine_first(df[col])

    mask_rest = df["is_rest_day_ppp"] == True

    df.loc[mask_rest, TIME_COLS] = pd.NaT
    df.loc[mask_rest, ["break_start_date_pe", "break_end_date_pe"]] = pd.NaT

    df = df.drop(columns=[c for c in df.columns if c.endswith("_ppp")])

    return df

def merge_schedule(schedule_people: pd.DataFrame, schedule_ppp: pd.DataFrame, people_obs: pd.DataFrame, schedule_ubycall: pd.DataFrame) -> pd.DataFrame :
    df_concentrix = clean_schedule_concentrix(schedule_people, people_obs)

    df_ubycall = clean_schedule_ubycall(schedule_ubycall)

    df_ppp = clean_schedule_ppp(schedule_ppp)
    df_concentrix = merge_schedule_concentrix(df_concentrix, df_ppp)
    df_final = pd.concat([df_concentrix, df_ubycall])
    df_final = clean_document(df_final)

    return df_final