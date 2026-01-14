from app.utils.common import validate_and_map_filename

SCHEDULE_MAPPING = {
    "schedule_concentrix": "schedule_concentrix",
    "people_obs":          "people_obs",
    "schedule_ubycall": "schedule_ubycall"
}

def validate_excel_schedule(file_name: str) -> str:
    return validate_and_map_filename(
        file_name=file_name,
        name_mapping=SCHEDULE_MAPPING,
        error_detail_no_keyword=(
            "El archivo debe tener un nombre válido "
        )
    )
