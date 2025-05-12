"""add timestamps

Revision ID: 003
Revises: 002
Create Date: 2024-03-11 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime

# revision identifiers, used by Alembic.
revision = '003'
down_revision = None  # Set to None since this is independent of other migrations
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Add created_at column to assignments table if it doesn't exist
    op.execute("""
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'assignments' AND column_name = 'created_at'
        ) THEN
            ALTER TABLE assignments ADD COLUMN created_at TIMESTAMP DEFAULT NOW();
            UPDATE assignments SET created_at = NOW() WHERE created_at IS NULL;
            ALTER TABLE assignments ALTER COLUMN created_at SET NOT NULL;
        END IF;
    END $$;
    """)

    # Add submitted_at column to grades table if it doesn't exist
    op.execute("""
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'grades' AND column_name = 'submitted_at'
        ) THEN
            ALTER TABLE grades ADD COLUMN submitted_at TIMESTAMP DEFAULT NOW();
            UPDATE grades SET submitted_at = NOW() WHERE submitted_at IS NULL;
            ALTER TABLE grades ALTER COLUMN submitted_at SET NOT NULL;
        END IF;
    END $$;
    """)

def downgrade() -> None:
    # Remove created_at column from assignments table if it exists
    op.execute("""
    DO $$
    BEGIN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'assignments' AND column_name = 'created_at'
        ) THEN
            ALTER TABLE assignments DROP COLUMN created_at;
        END IF;
    END $$;
    """)
    
    # Remove submitted_at column from grades table if it exists
    op.execute("""
    DO $$
    BEGIN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'grades' AND column_name = 'submitted_at'
        ) THEN
            ALTER TABLE grades DROP COLUMN submitted_at;
        END IF;
    END $$;
    """) 