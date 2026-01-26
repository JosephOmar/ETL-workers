"""update sla_breached

Revision ID: 82c5249b763c
Revises: fe5ecd02314b
Create Date: 2026-01-26 11:26:24.893355

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '82c5249b763c'
down_revision: Union[str, Sequence[str], None] = 'fe5ecd02314b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
