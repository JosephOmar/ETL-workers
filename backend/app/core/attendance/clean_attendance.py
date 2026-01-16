import pandas as pd
from datetime import date
from typing import List, Tuple
from app.core.utils.columns_names import TIME_ONLINE, TIME_PRODUCTIVE, TIME_NO_PRODUCTIVE, TIME_OFFLINE, START_DATE_PE, START_TIME_PE, API_EMAIL

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
            subset.loc[mask, start_col],
            durations
        )
    )

def build_events(
    times: List[Tuple[pd.Timestamp, float]],
    event_type: str
) -> List[dict]:
    return [
        {
            "start": start.to_pydatetime(),
            "minutes": int(round(minutes)),
            "type": event_type
        }
        for start, minutes in times
        if minutes > 0
    ]

def clean_attendance(data: pd.DataFrame) -> pd.DataFrame:

    # if target_date is None:
    #     target_date = pd.Timestamp.today().normalize()

    # target_date = pd.Timestamp(target_date).date()

    data = data[data['Platform'] == 'api']

    data = data.rename(columns={'Agent Email': API_EMAIL})
    data = data[[API_EMAIL, 'Start Time', 'End Time', 'State']].copy()

    data = data[data['State'].str.upper() != 'DATA UNAVAILABLE']

    data['Start Time'] = pd.to_datetime(data['Start Time'], format="%Y-%m-%d %H:%M:%S", errors='coerce')

    data['End Time'] = pd.to_datetime(data['End Time'], format="%Y-%m-%d %H:%M:%S", errors='coerce')

    # start_window = pd.Timestamp(target_date) - pd.Timedelta(hours=24)
    # end_window   = pd.Timestamp(target_date) + pd.Timedelta(hours=24)

    # data = data[
    #     (data['Start Time'] >= start_window) &
    #     (data['Start Time'] <= end_window)
    # ]

    results = []
    for agent, group in data.groupby(API_EMAIL):

        events = []

        events += build_events(
            extract_times(group, TIME_ONLINE),
            "ONLINE"
        )

        events += build_events(
            extract_times(group, TIME_PRODUCTIVE),
            "AUX_PRODUCTIVE"
        )

        events += build_events(
            extract_times(group, TIME_NO_PRODUCTIVE),
            "AUX_NO_PRODUCTIVE"
        )

        events += build_events(
            extract_times(group, TIME_OFFLINE),
            "OFFLINE"
        )

        if not events:
            continue

        results.append({
            API_EMAIL: agent,
            "events": sorted(events, key=lambda e: e["start"])
        })
    print(pd.DataFrame(results).head(10))
    return pd.DataFrame(results)
