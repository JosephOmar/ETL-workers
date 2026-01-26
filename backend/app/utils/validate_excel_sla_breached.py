from app.utils.common import validate_and_map_filename

SLA_MAPPING = {
    "sla_breached" : "sla_breached"
}

def validate_excel_sla_breached(file_name: str) -> str:
    return validate_and_map_filename(
        file_name=file_name,
        name_mapping=SLA_MAPPING,
        error_detail_no_keyword=(
            "El archivo debe tener un nombre válido "
        )
    )
