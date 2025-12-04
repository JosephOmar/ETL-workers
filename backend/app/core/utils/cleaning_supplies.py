import pandas as pd
import re
from datetime import datetime
import pytz
from rapidfuzz import process, fuzz
from typing import Union
import numpy as np

def update_column_based_on_worker(
    df_target: pd.DataFrame,
    df_reference: pd.DataFrame,
    column_to_update: str,
    reference_column: str,
    score_threshold: int = 90
) -> pd.DataFrame:

    ref_values = df_reference[reference_column].dropna().unique().tolist()
    target_values = df_target[column_to_update].dropna().unique().tolist()

    if not ref_values or not target_values:
        return df_target

    ref_lower = [r.lower().strip() for r in ref_values]
    tgt_lower = [t.lower().strip() for t in target_values]

    sim_matrix = process.cdist(
        tgt_lower, ref_lower,
        scorer=fuzz.token_sort_ratio,
        workers=-1
    )

    best_idx = np.argmax(sim_matrix, axis=1)
    best_scores = sim_matrix[np.arange(len(tgt_lower)), best_idx]

    mapping = {}
    for i, score in enumerate(best_scores):
        if score >= score_threshold:
            mapping[target_values[i]] = ref_values[best_idx[i]]

    # Aplicar reemplazos
    df_target[column_to_update] = df_target[column_to_update].replace(mapping)
    return df_target

def clean_observations(valor):
    if pd.isna(valor) or valor in [0,"0","nan",None]:
        return ""
    return valor
