import pandas as pd

def normalize_for_db(df: pd.DataFrame) -> pd.DataFrame:

    # datetime -> object
    for col in df.select_dtypes(include=["datetime", "datetimetz"]).columns:
        df[col] = df[col].astype(object)

    # IMPORTANTE:
    # convertir todo a object para permitir None reales
    df = df.astype(object)

    # reemplazar NaN por None
    df = df.where(pd.notnull(df), None)

    return df