import bcrypt
import jwt
import datetime
from typing import Optional, Dict, Any
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from config import settings

security = HTTPBearer(auto_error=False)

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False

def create_access_token(data: dict, expires_delta: Optional[datetime.timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.now(datetime.timezone.utc) + expires_delta
    else:
        expire = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.ALGORITHM)

def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.ALGORITHM])
        return payload
    except Exception:
        return None

def normalize_role(role: Optional[str]) -> str:
    r = (role or "").strip().upper().replace(" ", "_")
    if r in ["SUPER_ADMIN", "SUPERADMIN"]:
        return "SUPER_ADMIN"
    if r in ["ADMIN"]:
        return "ADMIN"
    return "USER"

def display_role(role: Optional[str]) -> str:
    norm = normalize_role(role)
    if norm == "SUPER_ADMIN":
        return "Super Admin"
    if norm == "ADMIN":
        return "Admin"
    return "Standard User"

def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Dict[str, Any]:
    from database import db
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id = payload["sub"]
    user = db.get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if user.get("status") in ["inactive", "suspended", "deactivated"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated or suspended. Please contact Super Admin."
        )
    user["norm_role"] = normalize_role(user.get("role"))
    return user

def require_admin(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    norm_role = current_user.get("norm_role") or normalize_role(current_user.get("role"))
    if norm_role not in ["ADMIN", "SUPER_ADMIN"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required for this operation"
        )
    return current_user

def require_super_admin(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    norm_role = current_user.get("norm_role") or normalize_role(current_user.get("role"))
    if norm_role != "SUPER_ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super Admin privileges required for this operation"
        )
    return current_user


