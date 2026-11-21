"""001_initial_mysql_schema

Revision ID: 001_initial_mysql
Revises: 
Create Date: 2026-11-21 17:50:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001_initial_mysql'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # 1. users
    op.create_table(
        'users',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('email', sa.String(255), unique=True, nullable=False, index=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('avatar', sa.Text(), nullable=True),
        sa.Column('is_verified', sa.Boolean(), default=True, nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False)
    )

    # 2. roles
    op.create_table(
        'roles',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('name', sa.String(50), unique=True, nullable=False, index=True),
        sa.Column('description', sa.String(255), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False)
    )

    # 3. user_roles
    op.create_table(
        'user_roles',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('role_id', sa.String(36), sa.ForeignKey('roles.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.UniqueConstraint('user_id', 'role_id', name='uq_user_role')
    )

    # 4. analyses
    op.create_table(
        'analyses',
        sa.Column('id', sa.String(36), primary_key=True, index=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('input_type', sa.String(20), nullable=False, default='text'),
        sa.Column('source_name', sa.String(255), nullable=False),
        sa.Column('text', sa.Text(), nullable=False),
        sa.Column('sentiment', sa.String(20), nullable=False, index=True),
        sa.Column('confidence', sa.Float(), nullable=False),
        sa.Column('score', sa.Float(), nullable=False),
        sa.Column('emotions', sa.JSON(), nullable=False),
        sa.Column('keywords', sa.JSON(), nullable=False),
        sa.Column('explanation', sa.Text(), nullable=False),
        sa.Column('classification_details', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, index=True),
        sa.Column('updated_at', sa.DateTime(), nullable=False)
    )

    # 5. uploaded_files
    op.create_table(
        'uploaded_files',
        sa.Column('id', sa.String(36), primary_key=True, index=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('file_name', sa.String(255), nullable=False),
        sa.Column('file_type', sa.String(20), nullable=False),
        sa.Column('file_size', sa.BigInteger(), default=0, nullable=False),
        sa.Column('file_path', sa.String(500), nullable=False),
        sa.Column('status', sa.String(50), default='completed', nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False)
    )

    # 6. sentiment_results
    op.create_table(
        'sentiment_results',
        sa.Column('id', sa.String(36), primary_key=True, index=True),
        sa.Column('file_id', sa.String(36), sa.ForeignKey('uploaded_files.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('row_index', sa.Integer(), nullable=False),
        sa.Column('row_text', sa.Text(), nullable=False),
        sa.Column('sentiment', sa.String(20), nullable=False, index=True),
        sa.Column('confidence', sa.Float(), nullable=False),
        sa.Column('score', sa.Float(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False)
    )

    # 7. reports
    op.create_table(
        'reports',
        sa.Column('id', sa.String(36), primary_key=True, index=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('period', sa.String(20), nullable=False),
        sa.Column('total_analyzed', sa.Integer(), default=0, nullable=False),
        sa.Column('positive_percentage', sa.Float(), default=0.0, nullable=False),
        sa.Column('neutral_percentage', sa.Float(), default=0.0, nullable=False),
        sa.Column('negative_percentage', sa.Float(), default=0.0, nullable=False),
        sa.Column('file_path', sa.String(500), nullable=True),
        sa.Column('report_data', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False)
    )

    # 8. notifications
    op.create_table(
        'notifications',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('is_read', sa.Boolean(), default=False, nullable=False),
        sa.Column('type', sa.String(50), default='info', nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False)
    )

    # 9. activity_logs
    op.create_table(
        'activity_logs',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True, index=True),
        sa.Column('action', sa.String(100), nullable=False),
        sa.Column('details', sa.Text(), nullable=True),
        sa.Column('ip_address', sa.String(45), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, index=True)
    )

    # 10. user_settings
    op.create_table(
        'user_settings',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False, index=True),
        sa.Column('email_alerts', sa.Boolean(), default=True, nullable=False),
        sa.Column('weekly_digest', sa.Boolean(), default=True, nullable=False),
        sa.Column('high_negative_spike_alert', sa.Boolean(), default=True, nullable=False),
        sa.Column('dark_mode', sa.Boolean(), default=False, nullable=False),
        sa.Column('language', sa.String(10), default='en', nullable=False),
        sa.Column('theme', sa.String(50), default='light', nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False)
    )

def downgrade() -> None:
    op.drop_table('user_settings')
    op.drop_table('activity_logs')
    op.drop_table('notifications')
    op.drop_table('reports')
    op.drop_table('sentiment_results')
    op.drop_table('uploaded_files')
    op.drop_table('analyses')
    op.drop_table('user_roles')
    op.drop_table('roles')
    op.drop_table('users')
