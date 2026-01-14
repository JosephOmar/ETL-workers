import pandas as pd
from datetime import date
from typing import List, Tuple
from app.core.utils.columns_names import TIME_ONLINE, TIME_PRODUCTIVE, TIME_NON_PRODUCTIVE, TIME_OFFLINE, START_DATE_PE, START_TIME_PE, API_EMAIL

def extract_times(
    df: pd.DataFrame,
    valid_states: list[str],
    state_col: str = "State",
    start_col: str = "Start Time",
    end_col: str = "End Time",
) -> List[Tuple[pd.Timestamp, float]]:

    subset = df[df[state_col].str.upper().isin(valid_states)]

    mask = subset[start_col].notna() & subset[end_col].notna()

    durations = (subset.loc[mask, end_col] - subset.loc[mask, start_col]).dt.total_seconds() / 60

    return list(
        zip(
            subset.loc[mask, start_col].dt.time,
            durations
        )
    )

def clean_attendance(data: pd.DataFrame, target_date: pd.Timestamp | None = None) -> pd.DataFrame:

    if target_date is None:
        target_date = pd.Timestamp.today().normalize()

    target_date = pd.Timestamp(target_date).date()

    data = data[data['Platform'] == 'api']

    data = data.rename(columns={'Agent Email': API_EMAIL})
    data = data[[API_EMAIL, 'Start Time', 'End Time', 'State']].copy()

    data = data[data['State'].str.upper() != 'DATA UNAVAILABLE']

    data['Start Time'] = pd.to_datetime(data['Start Time'], format="%Y-%m-%d %H:%M:%S", errors='coerce')

    data['End Time'] = pd.to_datetime(data['End Time'], format="%Y-%m-%d %H:%M:%S", errors='coerce')

    data = data[data['Start Time'].dt.date == target_date]

    results = []
    for agent, group in data.groupby(API_EMAIL):

        check_in_group = extract_times(group, valid_states=TIME_ONLINE + TIME_PRODUCTIVE)
        check_out_group = extract_times(group, valid_states=TIME_OFFLINE)
        time_productive_group = extract_times(group, valid_states=TIME_PRODUCTIVE)
        time_non_productive_group = extract_times(group, valid_states=TIME_NON_PRODUCTIVE)

        if not check_in_group and not check_out_group:
            continue

        results.append({
            API_EMAIL: agent,
            'date': target_date,
            'check_in_group': check_in_group,
            'check_out_group': check_out_group,
            "time_productive_group" : time_productive_group,
            'time_non_productive_group': time_non_productive_group,
        })

    return pd.DataFrame(results) 
