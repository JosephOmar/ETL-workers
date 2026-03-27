from typing import Optional

def format_interval_label(start: Optional[str], end: Optional[str]) -> str:
    def to_end_of_hour(interval: str) -> str:
        hour = int(interval.split(":")[0])
        return f"{hour:02d}:59"

    # Sin filtros
    if not start and not end:
        return "00:00 - 23:59"

    # Ambos definidos
    if start and end:
        return f"{start} - {to_end_of_hour(end)}"

    # Solo start
    if start:
        return f"{start} - {to_end_of_hour(start)}"

    # Solo end
    return f"00:00 - {to_end_of_hour(end)}"