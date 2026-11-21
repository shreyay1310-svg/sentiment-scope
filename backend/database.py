import logging
import uuid
import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy import create_engine, select, func, or_, text
from sqlalchemy.orm import sessionmaker, Session
from config import settings
from models import (
    Base,
    User,
    Role,
    UserRole,
    Analysis,
    UploadedFile,
    SentimentResult,
    Report,
    Notification,
    ActivityLog,
    UserSetting
)

logger = logging.getLogger("sentiment_scope.database")

_is_mysql_active = False
_engine = None
_SessionLocal = None
_connection_error = None

def init_db_engine():
    global _engine, _SessionLocal, _is_mysql_active, _connection_error
    
    # Try connecting to MySQL Server first
    mysql_url = settings.mysql_url
    try:
        connect_args = {}
        if settings.DB_SSL:
            connect_args["ssl"] = {"ssl_mode": "REQUIRED"}

        candidate_engine = create_engine(
            mysql_url,
            pool_pre_ping=True,
            pool_recycle=3600,
            pool_size=10,
            max_overflow=20,
            connect_args=connect_args
        )
        # Test connection actively
        with candidate_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        
        _engine = candidate_engine
        _is_mysql_active = True
        _connection_error = None
        logger.info("Successfully connected to MySQL Server: %s on %s:%d", settings.DB_NAME, settings.DB_HOST, settings.DB_PORT)
    except Exception as e:
        _connection_error = str(e)
        logger.warning(
            "MySQL Server connection failed (%s). Using fallback engine.",
            e
        )
        sqlite_file = settings.STORAGE_DIR / "sentiment_scope_v2.db"
        _engine = create_engine(
            f"sqlite:///{sqlite_file}",
            connect_args={"check_same_thread": False, "timeout": 30.0}
        )
        _is_mysql_active = False

    # Create all 10 tables
    Base.metadata.create_all(_engine)
    _SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_engine)
    seed_roles_and_default_users()

def get_db_session() -> Session:
    return _SessionLocal()

def check_mysql_connection() -> Dict[str, Any]:
    try:
        test_engine = create_engine(
            settings.mysql_url,
            pool_pre_ping=True,
            connect_args={"connect_timeout": 3}
        )
        with test_engine.connect() as conn:
            res = conn.execute(text("SELECT VERSION()")).fetchone()
            version = res[0] if res else "Unknown"
        return {
            "connected": True,
            "host": settings.DB_HOST,
            "port": settings.DB_PORT,
            "database": settings.DB_NAME,
            "user": settings.DB_USER,
            "server_version": str(version),
            "status": "Operational"
        }
    except Exception as e:
        return {
            "connected": False,
            "host": settings.DB_HOST,
            "port": settings.DB_PORT,
            "database": settings.DB_NAME,
            "user": settings.DB_USER,
            "error": str(e),
            "status": "Connection Refused / Offline"
        }

def seed_roles_and_default_users():
    session = _SessionLocal()
    try:
        # Seed default roles
        role_names = ["Super Admin", "Admin", "User"]
        role_map = {}
        for r_name in role_names:
            role_obj = session.query(Role).filter_by(name=r_name).first()
            if not role_obj:
                role_obj = Role(
                    id=f"role_{r_name.lower().replace(' ', '_')}",
                    name=r_name,
                    description=f"{r_name} role with standard privileges"
                )
                session.add(role_obj)
                session.commit()
            role_map[r_name] = role_obj.id

        # Seed default user Shreya Yadav if not existing
        from auth import hash_password
        default_shreya = session.query(User).filter_by(email="shreya@sentimentscope.com").first()
        if not default_shreya:
            user_id = "usr_shreya_primary"
            new_user = User(
                id=user_id,
                email="shreya@sentimentscope.com",
                name="Shreya Yadav",
                password_hash=hash_password("Password123!"),
                avatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256",
                is_verified=True
            )
            session.add(new_user)
            session.commit()

            # Attach Super Admin role
            user_role = UserRole(
                id=f"ur_{uuid.uuid4().hex[:8]}",
                user_id=user_id,
                role_id=role_map["Super Admin"]
            )
            session.add(user_role)

            # Initialize settings
            settings_obj = UserSetting(
                id=f"set_{uuid.uuid4().hex[:8]}",
                user_id=user_id,
                email_alerts=True,
                weekly_digest=True,
                high_negative_spike_alert=True
            )
            session.add(settings_obj)
            session.commit()

        # Seed Admin user
        admin_user = session.query(User).filter_by(email="admin@sentimentscope.com").first()
        if not admin_user:
            admin_id = "usr_admin_alex"
            new_admin = User(
                id=admin_id,
                email="admin@sentimentscope.com",
                name="Alex Vance (Admin)",
                password_hash=hash_password("AdminPassword123!"),
                avatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256",
                is_verified=True
            )
            session.add(new_admin)
            session.commit()
            session.add(UserRole(id=f"ur_{uuid.uuid4().hex[:8]}", user_id=admin_id, role_id=role_map["Admin"]))
            session.add(UserSetting(id=f"set_{uuid.uuid4().hex[:8]}", user_id=admin_id))
            session.commit()

        # Seed Demo User
        std_user = session.query(User).filter_by(email="user@sentimentscope.com").first()
        if not std_user:
            std_id = "usr_demo_user"
            new_std = User(
                id=std_id,
                email="user@sentimentscope.com",
                name="Demo Analyst",
                password_hash=hash_password("UserPassword123!"),
                avatar="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256",
                is_verified=True
            )
            session.add(new_std)
            session.commit()
            session.add(UserRole(id=f"ur_{uuid.uuid4().hex[:8]}", user_id=std_id, role_id=role_map["User"]))
            session.add(UserSetting(id=f"set_{uuid.uuid4().hex[:8]}", user_id=std_id))
            session.commit()

    except Exception as e:
        session.rollback()
        logger.error("Error seeding roles and default users: %s", e)
    finally:
        session.close()

# Initialize DB on import
init_db_engine()

# --- DATABASE ADAPTER CLASS FOR APPLICATION OPERATIONS ---
class DatabaseAdapter:
    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        session = get_db_session()
        try:
            user = session.query(User).filter(func.lower(User.email) == func.lower(email)).first()
            if not user:
                return None
            role_name = user.user_roles[0].role.name if user.user_roles else "User"
            return {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "password_hash": user.password_hash,
                "avatar": user.avatar,
                "role": role_name,
                "is_verified": user.is_verified,
                "created_at": user.created_at.isoformat()
            }
        finally:
            session.close()

    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        session = get_db_session()
        try:
            user = session.query(User).filter_by(id=user_id).first()
            if not user:
                return None
            role_name = user.user_roles[0].role.name if user.user_roles else "User"
            return {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "password_hash": user.password_hash,
                "avatar": user.avatar,
                "role": role_name,
                "is_verified": user.is_verified,
                "created_at": user.created_at.isoformat()
            }
        finally:
            session.close()

    def create_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        session = get_db_session()
        try:
            u_id = user_data.get("id") or f"usr_{uuid.uuid4().hex[:12]}"
            new_user = User(
                id=u_id,
                email=user_data["email"].lower(),
                name=user_data["name"],
                password_hash=user_data["password_hash"],
                avatar=user_data.get("avatar", ""),
                is_verified=bool(user_data.get("is_verified", True))
            )
            session.add(new_user)
            session.flush()

            # Assign role
            req_role = user_data.get("role", "User")
            role_obj = session.query(Role).filter_by(name=req_role).first()
            if not role_obj:
                role_obj = session.query(Role).filter_by(name="User").first()
            
            if role_obj:
                user_role = UserRole(
                    id=f"ur_{uuid.uuid4().hex[:8]}",
                    user_id=u_id,
                    role_id=role_obj.id
                )
                session.add(user_role)

            # Assign settings
            user_setting = UserSetting(
                id=f"set_{uuid.uuid4().hex[:8]}",
                user_id=u_id
            )
            session.add(user_setting)
            session.commit()

            user_data["id"] = u_id
            user_data["role"] = req_role
            return user_data
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()

    def update_user_password(self, user_id: str, new_hash: str):
        session = get_db_session()
        try:
            user = session.query(User).filter_by(id=user_id).first()
            if user:
                user.password_hash = new_hash
                session.commit()
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()

    def update_user_profile(self, user_id: str, updates: Dict[str, Any]):
        session = get_db_session()
        try:
            user = session.query(User).filter_by(id=user_id).first()
            if user:
                if "name" in updates:
                    user.name = updates["name"]
                if "avatar" in updates:
                    user.avatar = updates["avatar"]
                session.commit()
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()

    # --- ANALYSES ---
    def insert_analysis(self, record: Dict[str, Any]) -> Dict[str, Any]:
        session = get_db_session()
        try:
            anl_id = record.get("id") or f"ANL-{uuid.uuid4().hex[:8].upper()}"
            analysis = Analysis(
                id=anl_id,
                user_id=record["user_id"],
                input_type=record.get("input_type", "text"),
                source_name=record.get("source_name", "Manual Input"),
                text=record["text"],
                sentiment=record["sentiment"],
                confidence=float(record.get("confidence", 0.0)),
                score=float(record.get("score", 0.0)),
                emotions=record.get("emotions", {}),
                keywords=record.get("keywords", []),
                explanation=record.get("explanation", ""),
                classification_details=record.get("classification_details", {})
            )
            session.merge(analysis)
            session.commit()
            record["id"] = anl_id
            record["created_at"] = datetime.datetime.now().isoformat()
            return record
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()

    def get_analyses(self, user_id: str, is_admin: bool = False, search: str = "", sentiment: str = "", limit: int = 50, offset: int = 0) -> Dict[str, Any]:
        session = get_db_session()
        try:
            query = session.query(Analysis)
            if not is_admin:
                query = query.filter_by(user_id=user_id)
            if search:
                s = f"%{search}%"
                query = query.filter(or_(Analysis.text.like(s), Analysis.source_name.like(s), Analysis.id.like(s)))
            if sentiment and sentiment.lower() != "all":
                query = query.filter(func.lower(Analysis.sentiment) == sentiment.lower())

            total = query.count()
            items_orm = query.order_by(Analysis.created_at.desc()).offset(offset).limit(limit).all()

            items = []
            for a in items_orm:
                items.append({
                    "id": a.id,
                    "user_id": a.user_id,
                    "input_type": a.input_type,
                    "source_name": a.source_name,
                    "text": a.text,
                    "sentiment": a.sentiment,
                    "confidence": a.confidence,
                    "score": a.score,
                    "emotions": a.emotions,
                    "keywords": a.keywords,
                    "explanation": a.explanation,
                    "classification_details": a.classification_details,
                    "created_at": a.created_at.isoformat() if a.created_at else ""
                })
            return {"items": items, "total": total}
        finally:
            session.close()

    def get_analysis_by_id(self, analysis_id: str, user_id: str, is_admin: bool = False) -> Optional[Dict[str, Any]]:
        session = get_db_session()
        try:
            query = session.query(Analysis).filter_by(id=analysis_id)
            if not is_admin:
                query = query.filter_by(user_id=user_id)
            a = query.first()
            if not a:
                return None
            return {
                "id": a.id,
                "user_id": a.user_id,
                "input_type": a.input_type,
                "source_name": a.source_name,
                "text": a.text,
                "sentiment": a.sentiment,
                "confidence": a.confidence,
                "score": a.score,
                "emotions": a.emotions,
                "keywords": a.keywords,
                "explanation": a.explanation,
                "classification_details": a.classification_details,
                "created_at": a.created_at.isoformat() if a.created_at else ""
            }
        finally:
            session.close()

    def delete_analysis(self, analysis_id: str, user_id: str, is_admin: bool = False) -> bool:
        session = get_db_session()
        try:
            query = session.query(Analysis).filter_by(id=analysis_id)
            if not is_admin:
                query = query.filter_by(user_id=user_id)
            a = query.first()
            if a:
                session.delete(a)
                session.commit()
                return True
            return False
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()

    # --- UPLOADED FILES & DATASETS ---
    def insert_uploaded_file(self, file_data: Dict[str, Any]) -> Dict[str, Any]:
        session = get_db_session()
        try:
            f_id = file_data.get("id") or f"FILE-{uuid.uuid4().hex[:8].upper()}"
            up_file = UploadedFile(
                id=f_id,
                user_id=file_data["user_id"],
                file_name=file_data["file_name"],
                file_type=file_data["file_type"],
                file_size=file_data.get("file_size", 0),
                file_path=file_data["file_path"],
                status=file_data.get("status", "completed")
            )
            session.add(up_file)
            session.commit()
            file_data["id"] = f_id
            return file_data
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()

    def insert_dataset(self, dataset: Dict[str, Any]) -> Dict[str, Any]:
        # Maps dataset to uploaded_files
        return self.insert_uploaded_file({
            "id": dataset.get("id"),
            "user_id": dataset["user_id"],
            "file_name": dataset["file_name"],
            "file_type": dataset["file_type"],
            "file_size": dataset.get("row_count", 0),
            "file_path": dataset.get("analyzed_file_path", dataset.get("file_path", "")),
            "status": "analyzed"
        })

    def get_datasets(self, user_id: str, is_admin: bool = False) -> List[Dict[str, Any]]:
        session = get_db_session()
        try:
            query = session.query(UploadedFile)
            if not is_admin:
                query = query.filter_by(user_id=user_id)
            files = query.order_by(UploadedFile.created_at.desc()).all()
            return [{
                "id": f.id,
                "user_id": f.user_id,
                "file_name": f.file_name,
                "file_type": f.file_type,
                "row_count": f.file_size,
                "file_path": f.file_path,
                "analyzed_file_path": f.file_path,
                "created_at": f.created_at.isoformat() if f.created_at else ""
            } for f in files]
        finally:
            session.close()

    # --- REPORTS ---
    def insert_report(self, rep_data: Dict[str, Any]) -> Dict[str, Any]:
        session = get_db_session()
        try:
            r_id = rep_data.get("id") or f"REP-{uuid.uuid4().hex[:8].upper()}"
            rep = Report(
                id=r_id,
                user_id=rep_data["user_id"],
                title=rep_data.get("title", "Executive Sentiment Report"),
                period=rep_data.get("period", "weekly"),
                total_analyzed=rep_data.get("total_analyzed", 0),
                positive_percentage=float(rep_data.get("positive_percentage", 0.0)),
                neutral_percentage=float(rep_data.get("neutral_percentage", 0.0)),
                negative_percentage=float(rep_data.get("negative_percentage", 0.0)),
                file_path=rep_data.get("file_path", ""),
                report_data=rep_data.get("report_data", {})
            )
            session.add(rep)
            session.commit()
            rep_data["id"] = r_id
            return rep_data
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()

    # --- NOTIFICATIONS ---
    def get_notifications(self, user_id: str) -> List[Dict[str, Any]]:
        session = get_db_session()
        try:
            notifs = session.query(Notification).filter_by(user_id=user_id).order_by(Notification.created_at.desc()).all()
            return [{
                "id": n.id,
                "title": n.title,
                "message": n.message,
                "is_read": n.is_read,
                "type": n.type,
                "created_at": n.created_at.isoformat() if n.created_at else ""
            } for n in notifs]
        finally:
            session.close()

    # --- SETTINGS ---
    def get_user_settings(self, user_id: str) -> Dict[str, Any]:
        session = get_db_session()
        try:
            s = session.query(UserSetting).filter_by(user_id=user_id).first()
            if not s:
                return {
                    "email_alerts": True,
                    "weekly_digest": True,
                    "high_negative_spike_alert": True,
                    "dark_mode": False,
                    "language": "en",
                    "theme": "light"
                }
            return {
                "email_alerts": s.email_alerts,
                "weekly_digest": s.weekly_digest,
                "high_negative_spike_alert": s.high_negative_spike_alert,
                "dark_mode": s.dark_mode,
                "language": s.language,
                "theme": s.theme
            }
        finally:
            session.close()

    def update_user_settings(self, user_id: str, new_settings: Dict[str, Any]):
        session = get_db_session()
        try:
            s = session.query(UserSetting).filter_by(user_id=user_id).first()
            if not s:
                s = UserSetting(id=f"set_{uuid.uuid4().hex[:8]}", user_id=user_id)
                session.add(s)
            
            for k, v in new_settings.items():
                if hasattr(s, k):
                    setattr(s, k, v)
            session.commit()
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()

    # --- ACTIVITY LOGS ---
    def log_activity(self, user_id: Optional[str], action: str, details: str = "", ip: str = ""):
        session = get_db_session()
        try:
            log_entry = ActivityLog(
                id=f"act_{uuid.uuid4().hex[:10]}",
                user_id=user_id,
                action=action,
                details=details,
                ip_address=ip
            )
            session.add(log_entry)
            session.commit()
        except Exception:
            session.rollback()
        finally:
            session.close()

    # --- LIVE FEED ---
    def insert_live_feed(self, item: Dict[str, Any]):
        # Keep ephemeral/live stream in memory or logs
        return item

    def get_live_feed(self, limit: int = 50) -> List[Dict[str, Any]]:
        # Returns latest analyses formatted for real-time monitoring
        analyses_res = self.get_analyses(user_id="", is_admin=True, limit=limit)
        feed = []
        for a in analyses_res["items"]:
            feed.append({
                "id": a["id"],
                "text": a["text"],
                "sentiment": a["sentiment"],
                "confidence": a["confidence"],
                "source": a.get("source_name", "Live Feed"),
                "created_at": a.get("created_at")
            })
        return feed

db = DatabaseAdapter()
