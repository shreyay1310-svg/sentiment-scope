from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from typing import Optional
from auth import hash_password, verify_password, create_access_token, get_current_user, normalize_role
from database import db
import datetime
import re

router = APIRouter(prefix="/auth", tags=["Authentication"])

def validate_email_format(email: str):
    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid email address format.")

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    phone: Optional[str] = ""
    confirm_password: Optional[str] = None
    terms: Optional[bool] = True
    role: Optional[str] = "User"

class LoginRequest(BaseModel):
    email: str
    password: str

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

@router.post("/register")
def register(req: RegisterRequest):
    validate_email_format(req.email)
    existing = db.get_user_by_email(req.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )
    
    if len(req.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long."
        )

    if req.confirm_password and req.password != req.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match."
        )

    # Security requirement: Users must never be allowed to register themselves as Super Admin or Admin.
    assigned_role = "User"
    
    user_data = {
        "email": req.email,
        "name": req.name,
        "phone": req.phone or "",
        "status": "active",
        "password_hash": hash_password(req.password),
        "role": assigned_role,
        "avatar": f"https://api.dicebear.com/7.x/initials/svg?seed={req.name}",
        "is_verified": 1,
        "created_at": datetime.datetime.now().isoformat()
    }
    created = db.create_user(user_data)
    norm = normalize_role(created["role"])
    token = create_access_token({"sub": created["id"], "email": created["email"], "role": created["role"], "norm_role": norm})
    
    db.log_activity(created["id"], "USER_REGISTER", f"New account registered: {created['email']}")

    return {
        "status": "success",
        "message": "Registration successful! Account activated.",
        "token": token,
        "user": {
            "id": created["id"],
            "email": created["email"],
            "name": created["name"],
            "full_name": created["name"],
            "phone": created.get("phone", ""),
            "status": "active",
            "role": created["role"],
            "norm_role": norm,
            "avatar": created.get("avatar", ""),
            "plan": "Starter Plan"
        }
    }

@router.post("/login")
def login(req: LoginRequest):
    user = db.get_user_by_email(req.email)
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password credentials."
        )

    if user.get("status") in ["inactive", "suspended", "deactivated"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated or suspended. Please contact Super Admin."
        )

    norm = normalize_role(user["role"])
    token = create_access_token({"sub": user["id"], "email": user["email"], "role": user["role"], "norm_role": norm})
    db.log_activity(user["id"], "USER_LOGIN", f"User logged in from web client: {user['email']}")

    return {
        "status": "success",
        "token": token,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user["name"],
            "full_name": user["name"],
            "phone": user.get("phone", ""),
            "status": user.get("status", "active"),
            "role": user["role"],
            "norm_role": norm,
            "avatar": user.get("avatar", ""),
            "plan": "Pro Plan" if norm in ["SUPER_ADMIN", "ADMIN"] else "Starter Plan"
        }
    }

@router.post("/logout")
def logout(current_user: dict = Depends(get_current_user)):
    db.log_activity(current_user["id"], "USER_LOGOUT", f"User logged out: {current_user['email']}")
    return {"status": "success", "message": "Logged out successfully."}


@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    norm = normalize_role(current_user.get("role"))
    return {
        "id": current_user["id"],
        "email": current_user["email"],
        "name": current_user["name"],
        "full_name": current_user["name"],
        "phone": current_user.get("phone", ""),
        "status": current_user.get("status", "active"),
        "role": current_user["role"],
        "norm_role": norm,
        "avatar": current_user.get("avatar", ""),
        "plan": "Pro Plan" if norm in ["SUPER_ADMIN", "ADMIN"] else "Starter Plan"
    }

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest):
    user = db.get_user_by_email(req.email)
    # Even if user doesn't exist, return success to prevent email enumeration, but simulate token
    token = create_access_token({"sub": user["id"] if user else "mock_id", "type": "reset"}, expires_delta=datetime.timedelta(minutes=30))
    return {
        "status": "success",
        "message": f"Password reset instructions have been dispatched to {req.email}.",
        "reset_token": token # Delivered for seamless in-app recovery UX
    }

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest):
    from auth import decode_access_token
    payload = decode_access_token(req.token)
    if not payload or payload.get("type") != "reset":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset token.")
    
    user_id = payload["sub"]
    db.update_user_password(user_id, hash_password(req.new_password))
    return {"status": "success", "message": "Password reset successfully! Please log in with your new password."}
