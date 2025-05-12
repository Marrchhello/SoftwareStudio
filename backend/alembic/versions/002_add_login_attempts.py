"""add login attempts

Revision ID: 002
Revises: 001
Create Date: 2024-03-11 11:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add failed_login_attempts and locked_until columns to students table
    op.add_column('students', sa.Column('failed_login_attempts', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('students', sa.Column('locked_until', sa.DateTime(), nullable=True))


def downgrade() -> None:
    # Remove the columns
    op.drop_column('students', 'locked_until')
    op.drop_column('students', 'failed_login_attempts') 