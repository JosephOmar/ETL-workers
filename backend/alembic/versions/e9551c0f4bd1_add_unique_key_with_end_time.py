"""add unique key with end_time

Revision ID: e9551c0f4bd1
Revises: 0694c9ade970
Create Date: 2026-01-10 17:14:43.333485

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e9551c0f4bd1'
down_revision: Union[str, Sequence[str], None] = '0694c9ade970'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_unique_constraint(
        "schedule_unique_key",
        "schedule",
        ["document", "start_date_pe", "start_time_pe", "end_time_pe"]
    )
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
