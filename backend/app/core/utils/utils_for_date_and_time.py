import pytz
import pandas as pd
from datetime import datetime, timedelta
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