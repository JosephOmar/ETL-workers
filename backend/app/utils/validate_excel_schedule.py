from app.utils.common import validate_and_map_filename

_SCHEDULE_MAPPING = {
    "schedule_concentrix": "schedule_concentrix",
    "people_obs":          "people_obs",
    "schedule_ppp":        "schedule_ppp"
}

def validate_excel_schedule(file_name: str) -> str:
    return validate_and_map_filename(
        file_name=file_name,
        name_mapping=_SCHEDULE_MAPPING,
        error_detail_no_keyword=(
            "El archivo debe tener un nombre válido "
        )
    )
