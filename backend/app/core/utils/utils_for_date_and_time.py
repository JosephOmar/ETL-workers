import pytz
import pandas as pd
from datetime import datetime, timedelta, time, date
from app.core.utils.columns_names import START_TIME_PE, START_DATE_PE

def convert_timezone_columns(
    df: pd.DataFrame,
    date_col_src: str,
    time_col_src: str,
    date_col_dst: str,
    time_col_dst: str,
    tz_src: str = "America/Lima",
    tz_dst: str = "Europe/Madrid",
) -> pd.DataFrame:

    dt = pd.to_datetime(
        df[date_col_src].astype(str) + " " + df[time_col_src].astype(str),
        errors="coerce"
    )

    dt = dt.dt.tz_localize(tz_src).dt.tz_convert(tz_dst)

    df[date_col_dst] = dt.dt.date
    df[time_col_dst] = dt.dt.time

    return df

def compute_break_date(row, start_col, end_col):
    bs = row[start_col]
    be = row[end_col]
    st = row[START_TIME_PE]
    base_date_bs = row[START_DATE_PE]

    if pd.isna(bs) or pd.isna(be) or pd.isna(st) or pd.isna(base_date_bs):
        return None, None

    if bs > st:
        bs_date = base_date_bs
    else:
        bs_date = base_date_bs + timedelta(days=1)

    if be > bs:
        be_date = bs_date
    else:
        be_date = bs_date + timedelta(days=1)

    return bs_date, be_date

def calculate_shift_minutes(start, end) -> int:

    # nulls
    if start is None or end is None:
        return 0

    # NaN
    if pd.isna(start) or pd.isna(end):
        return 0

    # timedelta -> time
    if isinstance(start, timedelta):
        total_seconds = int(start.total_seconds())
        start = time(
            (total_seconds // 3600) % 24,
            (total_seconds % 3600) // 60,
            total_seconds % 60
        )

    if isinstance(end, timedelta):
        total_seconds = int(end.total_seconds())
        end = time(
            (total_seconds // 3600) % 24,
            (total_seconds % 3600) // 60,
            total_seconds % 60
        )

    # string -> time
    if isinstance(start, str):
        start = datetime.strptime(start, "%H:%M:%S").time()

    if isinstance(end, str):
        end = datetime.strptime(end, "%H:%M:%S").time()

    # validación final
    if not isinstance(start, time) or not isinstance(end, time):
        return 0

    start_dt = datetime.combine(date.today(), start)
    end_dt = datetime.combine(date.today(), end)

    if end_dt <= start_dt:
        end_dt += timedelta(days=1)

    return int((end_dt - start_dt).total_seconds() / 60)

def timedelta_to_time(x):
    if isinstance(x, pd.Timedelta):
        total_seconds = int(x.total_seconds())
        h = total_seconds // 3600
        m = (total_seconds % 3600) // 60
        s = total_seconds % 60
        return time(h % 24, m, s)
    return x