import pandas as pd
from app.core.utils.columns_names import DOCUMENT

def clean_document(df: pd.DataFrame) -> pd.DataFrame:

    if DOCUMENT in df.columns:
        df[DOCUMENT] = df[DOCUMENT].astype(str).str.lstrip("0").str.replace(r"\.0$", "", regex=True)

    return df