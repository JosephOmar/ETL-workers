from app.utils.common import validate_and_map_filename

ATTENDANCE_MAPPING = {
    "attendance": "attendance",
}

def validate_excel_attendance(file_name: str) -> str:
    return validate_and_map_filename(
        file_name=file_name,
        name_mapping=ATTENDANCE_MAPPING,
        error_detail_no_keyword="El archivo debe tener un nombre válido (attendance)."
    )
