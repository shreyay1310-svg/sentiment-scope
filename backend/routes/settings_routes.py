from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
from auth import get_current_user, hash_password, verify_password
from database import db

router = APIRouter(prefix="/settings", tags=["Settings"])

class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    avatar: Optional[str] = None

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class NotificationPreferencesRequest(BaseModel):
    email_alerts: bool = True
    weekly_digest: bool = True
    high_negative_spike_alert: bool = True
    dark_mode: bool = False
    language: str = "en"

@router.put("/profile")
def update_profile(req: UpdateProfileRequest, current_user: dict = Depends(get_current_user)):
    updates = {}
    if req.name and req.name.strip():
        updates["name"] = req.name.strip()
    if req.avatar:
        updates["avatar"] = req.avatar

    if updates:
        db.update_user_profile(current_user["id"], updates)

    updated_user = db.get_user_by_id(current_user["id"])
    return {
        "status": "success",
        "message": "Profile updated successfully.",
        "user": {
            "id": updated_user["id"],
            "name": updated_user["name"],
            "email": updated_user["email"],
            "role": updated_user["role"],
            "avatar": updated_user.get("avatar", ""),
            "plan": "Pro Plan" if updated_user.get("role") in ["Super Admin", "Admin"] else "Starter Plan"
        }
    }

@router.put("/password")
def change_password(req: ChangePasswordRequest, current_user: dict = Depends(get_current_user)):
    user = db.get_user_by_id(current_user["id"])
    if not user or not verify_password(req.current_password, user["password_hash"]):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password incorrect.")

    if len(req.new_password) < 6:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="New password must be at least 6 characters.")

    db.update_user_password(current_user["id"], hash_password(req.new_password))
    return {"status": "success", "message": "Password updated successfully."}

@router.get("/export-data")
def export_user_data(current_user: dict = Depends(get_current_user)):
    is_admin = current_user.get("role") in ["Admin", "Super Admin"]
    analyses = db.get_analyses(current_user["id"], is_admin=is_admin, limit=5000)
    datasets = db.get_datasets(current_user["id"], is_admin=is_admin)
    
    return JSONResponse(content={
        "user_profile": {
            "id": current_user["id"],
            "name": current_user["name"],
            "email": current_user["email"],
            "role": current_user["role"]
        },
        "analyses_count": len(analyses["items"]),
        "analyses": analyses["items"],
        "datasets": datasets
    })
