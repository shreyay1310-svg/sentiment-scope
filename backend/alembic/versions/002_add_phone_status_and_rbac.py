"""Add phone and status to users table and RBAC updates

Revision ID: 002_add_phone_status_and_rbac
Revises: 001_initial_mysql_schema
Create Date: 2026-11-23 13:30:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '002_add_phone_status_and_rbac'
down_revision = '001_initial_mysql_schema'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Add phone and status columns to users table
    try:
        op.add_column('users', sa.Column('phone', sa.String(50), nullable=True, server_default=''))
        op.add_column('users', sa.Column('status', sa.String(20), nullable=False, server_default='active'))
    except Exception:
        pass

def downgrade() -> None:
    try:
        op.drop_column('users', 'status')
        op.drop_column('users', 'phone')
    except Exception:
        pass
