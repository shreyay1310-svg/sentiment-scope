from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from typing import Optional
from auth import hash_password, verify_password, create_access_token, get_current_user
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

    assigned_role = req.role if req.role in ["User", "Admin", "Super Admin"] else "User"
    user_data = {
        "email": req.email,
        "name": req.name,
        "password_hash": hash_password(req.password),
        "role": assigned_role,
        "avatar": f"https://api.dicebear.com/7.x/initials/svg?seed={req.name}",
        "is_verified": 1,
        "created_at": datetime.datetime.now().isoformat()
    }
    created = db.create_user(user_data)
    token = create_access_token({"sub": created["id"], "email": created["email"], "role": created["role"]})
    
    return {
        "status": "success",
        "message": "Registration successful! Account activated.",
        "token": token,
        "user": {
            "id": created["id"],
            "email": created["email"],
            "name": created["name"],
            "role": created["role"],
            "avatar": created.get("avatar", ""),
            "plan": "Pro Plan"
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

    token = create_access_token({"sub": user["id"], "email": user["email"], "role": user["role"]})
    return {
        "status": "success",
        "token": token,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user["name"],
            "role": user["role"],
            "avatar": user.get("avatar", ""),
            "plan": "Pro Plan" if user["role"] in ["Super Admin", "Admin"] else "Starter Plan"
        }
    }

@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "id": current_user["id"],
        "email": current_user["email"],
        "name": current_user["name"],
        "role": current_user["role"],
        "avatar": current_user.get("avatar", ""),
        "plan": "Pro Plan" if current_user.get("role") in ["Super Admin", "Admin"] else "Starter Plan"
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
