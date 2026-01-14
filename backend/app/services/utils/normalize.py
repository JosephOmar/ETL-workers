import pandas as pd

def normalize_for_db(df: pd.DataFrame) -> pd.DataFrame:
    for col in df.select_dtypes(include=["datetime", "datetimetz"]).columns:
        df[col] = df[col].astype(object)
    return df.where(pd.notnull(df), None)