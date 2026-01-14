"""add unique constraint to worker.document

Revision ID: b2b3beefcc91
Revises: 1b9773fc5e76
Create Date: 2025-12-11 15:05:11.035079

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b2b3beefcc91'
down_revision: Union[str, Sequence[str], None] = '82ffa2102a9c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # --- WORKER UNIQUE ---
    op.create_unique_constraint(
        "worker_unique_document",
        "worker",
        ["document"]
    )

    # --- SCHEDULE CHANGES ---

    # Renombrar columna worker_document → document
    op.alter_column(
        "schedule",
        "worker_document",
        new_column_name="document"
    )

    # Renombrar columnas base PE
    op.alter_column("schedule", "start_date",
                    new_column_name="start_date_pe")
    op.alter_column("schedule", "end_date",
                    new_column_name="end_date_pe")
    op.alter_column("schedule", "start_time",
                    new_column_name="start_time_pe")
    op.alter_column("schedule", "end_time",
                    new_column_name="end_time_pe")
    op.alter_column("schedule", "break_start",
                    new_column_name="break_start_time_pe")
    op.alter_column("schedule", "break_end",
                    new_column_name="break_end_time_pe")

    # Agregar nuevas columnas PE
    op.add_column("schedule",sa.Column("break_start_date_pe", sa.Date(), nullable=True))
    op.add_column("schedule",sa.Column("break_end_date_pe", sa.Date(), nullable=True))

    # Agregar columnas ES
    op.add_column("schedule",sa.Column("start_date_es", sa.Date(), nullable=True))
    op.add_column("schedule",sa.Column("end_date_es", sa.Date(), nullable=True))
    op.add_column("schedule",sa.Column("start_time_es", sa.Time(), nullable=True))
    op.add_column("schedule",sa.Column("end_time_es", sa.Time(), nullable=True))
    op.add_column("schedule",sa.Column("break_start_date_es", sa.Date(), nullable=True))
    op.add_column("schedule",sa.Column("break_end_date_es", sa.Date(), nullable=True))
    op.add_column("schedule",sa.Column("break_start_time_es", sa.Time(), nullable=True))
    op.add_column("schedule",sa.Column("break_end_time_es", sa.Time(), nullable=True))

    # Nuevo UNIQUE
    op.create_unique_constraint(
        "schedule_unique_key",
        "schedule",
        ["document", "start_date_pe", "start_time_pe"]
    )


def downgrade():
    # --- REMOVE UNIQUE ---
    op.drop_constraint("schedule_unique_key", "schedule", type_="unique")
    op.drop_constraint("worker_unique_document", "worker", type_="unique")

    # Eliminar columnas nuevas ES
    op.drop_column("schedule", "break_end_time_es")
    op.drop_column("schedule", "break_start_time_es")
    op.drop_column("schedule", "break_end_date_es")
    op.drop_column("schedule", "break_start_date_es")
    op.drop_column("schedule", "end_time_es")
    op.drop_column("schedule", "start_time_es")
    op.drop_column("schedule", "end_date_es")
    op.drop_column("schedule", "start_date_es")

    # Eliminar columnas nuevas PE
    op.drop_column("schedule", "break_end_date_pe")
    op.drop_column("schedule", "break_start_date_pe")

    # Renombrar columnas PE → originales
    op.alter_column("schedule", "break_end_time_pe",
                    new_column_name="break_end")
    op.alter_column("schedule", "break_start_time_pe",
                    new_column_name="break_start")
    op.alter_column("schedule", "end_time_pe",
                    new_column_name="end_time")
    op.alter_column("schedule", "start_time_pe",
                    new_column_name="start_time")
    op.alter_column("schedule", "end_date_pe",
                    new_column_name="end_date")
    op.alter_column("schedule", "start_date_pe",
                    new_column_name="start_date")

    # Renombrar document → worker_document
    op.alter_column(
        "schedule",
        "document",
        new_column_name="worker_document"
    )