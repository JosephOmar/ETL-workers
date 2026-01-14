import io
import pandas as pd
from fastapi import UploadFile
from typing import Mapping, List, Callable, Any, Dict

EXCEL_READ_CONFIGS: Dict[str, Dict[str, Dict[str, Any]]] = {
    "scheduling_ppp": {
        "default": {
            "sheet_name": "RESUMEN",
            "skiprows": 5,
            "header": 0,
            "engine": "openpyxl",
        }
    },
    "schedule_ppp": {
        "default": {
            "sheet_name": "RESUMEN",
            "skiprows": 4,
            "header": [0, 1],
            "engine": "openpyxl",
        }
    },
    "master_glovo": {
        "ubycall": {
            "sheet_name": "AGENTES_UBY",
            "header": 0,
            "engine": "openpyxl",
        },
        "concentrix": {
            "sheet_name": "AGENTES_GLOVO",
            "header": 0,
            "engine": "openpyxl",
        },
        "backup": {
            "sheet_name": "BUCK UP",
            "header": 0,
            "engine": "openpyxl",
        },
        "supervisor": {
            "sheet_name": "ESTRUCTURA_GLOVO",
            "header": 0,
            "engine": "openpyxl",
        },
    }
}

def read_file_safely(file_stream: io.BytesIO, filename: str) -> pd.DataFrame:

    file_stream.seek(0)
    lower = filename.lower()

    if lower.endswith(".xlsx"):
        for kw, sheets_cfg in EXCEL_READ_CONFIGS.items():
            if kw in lower:
                results = {}

                for sheet_key, params in sheets_cfg.items():
                    try:
                        file_stream.seek(0)
                        df = pd.read_excel(file_stream, **params)
                        results[sheet_key] = df
                    except Exception as e:
                        raise ValueError(
                            f"Error leyendo '{filename}' hoja '{sheet_key}': {e}"
                        )

                if len(results) == 1:
                    return next(iter(results.values()))

                return results

        try:
            return pd.read_excel(file_stream, engine="openpyxl")
        except Exception as e:
            raise ValueError(
                f"Error leyendo Excel '{filename}' (default): {e}"
            )

    elif lower.endswith('.csv'):
        try:
            file_stream.seek(0)
            return pd.read_csv(file_stream, encoding="utf-8")
        except Exception as e:
            raise ValueError(f"Error leyendo CSV '{filename}': {e}")

    else:
        raise ValueError(f"Formato no soportado: '{filename}'")


async def handle_file_upload_generic(
    files: List[UploadFile],
    validator: Callable[[str], str],
    keyword_to_slot: Mapping[str, str],
    required_slots: List[str],
    post_process: Callable[..., Any]
) -> Any:

    slot_data = {slot: None for slot in keyword_to_slot.values()}

    for file in files:
        safe_name = validator(file.filename)
        content = await file.read()
        df = read_file_safely(io.BytesIO(content), safe_name)

        for kw, slot in keyword_to_slot.items():
            if kw in safe_name.lower():
                slot_data[slot] = df
                break

    missing = [s for s in required_slots if slot_data.get(s) is None]
    if missing:
        raise ValueError(f"Faltan archivos requeridos: {', '.join(missing)}")

    dfs_required = [slot_data[s] for s in required_slots]

    optional_slots = {
        slot: df
        for slot, df in slot_data.items()
        if slot not in required_slots
    }
    return post_process(*dfs_required, **optional_slots)
