from fastapi import HTTPException
from typing import Mapping

def validate_and_map_filename(
    file_name: str,
    name_mapping: Mapping[str, str],
    error_detail_no_keyword: str = "El archivo debe tener un nombre válido.",
    error_detail_bad_ext: str = "El archivo debe ser un archivo Excel (.xlsx) o CSV (.csv)."
) -> str:

    if not any(keyword in file_name for keyword in name_mapping):
        raise HTTPException(status_code=400, detail=error_detail_no_keyword)

    if not (file_name.endswith('.xlsx') or file_name.endswith('.csv')):
        raise HTTPException(status_code=400, detail=error_detail_bad_ext)

    for keyword in sorted(name_mapping, key=len, reverse=True):
        if keyword in file_name:
            file_name = file_name.replace(keyword, name_mapping[keyword])
            break

    return file_name.replace(" ", "_")
