import datetime
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
    BigInteger,
    JSON,
    UniqueConstraint,
    Index
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

def utcnow():
    return datetime.datetime.now(datetime.timezone.utc)

# 1. users
class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True, default="")
    status = Column(String(20), default="active", nullable=False) # 'active', 'inactive', 'suspended'
    password_hash = Column(String(255), nullable=False)
    avatar = Column(Text, nullable=True)
    is_verified = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=utcnow, nullable=False)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)

    @property
    def full_name(self) -> str:
        return self.name

    # Relationships
    user_roles = relationship("UserRole", back_populates="user", cascade="all, delete-orphan")
    analyses = relationship("Analysis", back_populates="user", cascade="all, delete-orphan")
    uploaded_files = relationship("UploadedFile", back_populates="user", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    settings = relationship("UserSetting", back_populates="user", uselist=False, cascade="all, delete-orphan")

# 2. roles
class Role(Base):
    __tablename__ = "roles"

    id = Column(String(36), primary_key=True)
    name = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=utcnow, nullable=False)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)

    @property
    def role_name(self) -> str:
        return self.name

    user_roles = relationship("UserRole", back_populates="role")


# 3. user_roles
class UserRole(Base):
    __tablename__ = "user_roles"

    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    role_id = Column(String(36), ForeignKey("roles.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime, default=utcnow, nullable=False)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)

    __table_args__ = (UniqueConstraint("user_id", "role_id", name="uq_user_role"),)

    user = relationship("User", back_populates="user_roles")
    role = relationship("Role", back_populates="user_roles")

# 4. analyses
class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    input_type = Column(String(20), nullable=False, default="text") # 'text', 'file'
    source_name = Column(String(255), nullable=False)
    text = Column(Text, nullable=False)
    sentiment = Column(String(20), nullable=False, index=True) # 'Positive', 'Negative', 'Neutral'
    confidence = Column(Float, nullable=False)
    score = Column(Float, nullable=False)
    emotions = Column(JSON, nullable=False)
    keywords = Column(JSON, nullable=False)
    explanation = Column(Text, nullable=False)
    classification_details = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)

    user = relationship("User", back_populates="analyses")

# 5. uploaded_files
class UploadedFile(Base):
    __tablename__ = "uploaded_files"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    file_name = Column(String(255), nullable=False)
    file_type = Column(String(20), nullable=False)
    file_size = Column(BigInteger, default=0, nullable=False)
    file_path = Column(String(500), nullable=False)
    status = Column(String(50), default="completed", nullable=False)
    created_at = Column(DateTime, default=utcnow, nullable=False)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)

    user = relationship("User", back_populates="uploaded_files")
    sentiment_results = relationship("SentimentResult", back_populates="file", cascade="all, delete-orphan")

# 6. sentiment_results
class SentimentResult(Base):
    __tablename__ = "sentiment_results"

    id = Column(String(36), primary_key=True, index=True)
    file_id = Column(String(36), ForeignKey("uploaded_files.id", ondelete="CASCADE"), nullable=False, index=True)
    row_index = Column(Integer, nullable=False)
    row_text = Column(Text, nullable=False)
    sentiment = Column(String(20), nullable=False, index=True)
    confidence = Column(Float, nullable=False)
    score = Column(Float, nullable=False)
    created_at = Column(DateTime, default=utcnow, nullable=False)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)

    file = relationship("UploadedFile", back_populates="sentiment_results")

# 7. reports
class Report(Base):
    __tablename__ = "reports"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    period = Column(String(20), nullable=False) # 'daily', 'weekly', 'monthly', 'custom'
    total_analyzed = Column(Integer, default=0, nullable=False)
    positive_percentage = Column(Float, default=0.0, nullable=False)
    neutral_percentage = Column(Float, default=0.0, nullable=False)
    negative_percentage = Column(Float, default=0.0, nullable=False)
    file_path = Column(String(500), nullable=True)
    report_data = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=utcnow, nullable=False)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)

    user = relationship("User", back_populates="reports")

# 8. notifications
class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    type = Column(String(50), default="info", nullable=False)
    created_at = Column(DateTime, default=utcnow, nullable=False)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)

    user = relationship("User", back_populates="notifications")

# 9. activity_logs
class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    action = Column(String(100), nullable=False)
    details = Column(Text, nullable=True)
    ip_address = Column(String(45), nullable=True)
    created_at = Column(DateTime, default=utcnow, nullable=False, index=True)

# 10. user_settings
class UserSetting(Base):
    __tablename__ = "user_settings"

    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    email_alerts = Column(Boolean, default=True, nullable=False)
    weekly_digest = Column(Boolean, default=True, nullable=False)
    high_negative_spike_alert = Column(Boolean, default=True, nullable=False)
    dark_mode = Column(Boolean, default=False, nullable=False)
    language = Column(String(10), default="en", nullable=False)
    theme = Column(String(50), default="light", nullable=False)
    created_at = Column(DateTime, default=utcnow, nullable=False)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)

    user = relationship("User", back_populates="settings")
