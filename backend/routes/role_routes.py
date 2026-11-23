from fastapi import APIRouter, HTTPException, status, Depends, Query
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from auth import get_current_user, require_admin, require_super_admin, normalize_role, hash_password
from database import db
from nlp_engine import analyze_sentiment
import datetime

router = APIRouter(tags=["Role-Based Endpoints & RBAC"])

# -------------------------------------------------------------------------
# 1. ROLE-BASED DASHBOARD ENDPOINTS
# -------------------------------------------------------------------------

@router.get("/super-admin/dashboard")
def get_super_admin_dashboard(current_user: dict = Depends(require_super_admin)):
    """
    Super Admin Dashboard Data (Global Scope)
    """
    data = db.get_super_admin_dashboard_data()
    db.log_activity(current_user["id"], "VIEW_SUPER_ADMIN_DASHBOARD", "Accessed global analytics dashboard")
    return {
        "status": "success",
        "role": "Super Admin",
        "user": current_user["name"],
        "data": data
    }

@router.get("/admin/dashboard")
def get_admin_dashboard(current_user: dict = Depends(require_admin)):
    """
    Admin Dashboard Data (Management Scope)
    """
    data = db.get_admin_dashboard_data(current_user["id"])
    db.log_activity(current_user["id"], "VIEW_ADMIN_DASHBOARD", "Accessed admin operational dashboard")
    return {
        "status": "success",
        "role": current_user.get("role", "Admin"),
        "user": current_user["name"],
        "data": data
    }

@router.get("/user/dashboard")
def get_user_dashboard(current_user: dict = Depends(get_current_user)):
    """
    Standard User Dashboard Data (Personal Scope)
    """
    data = db.get_user_dashboard_data(current_user["id"])
    return {
        "status": "success",
        "role": current_user.get("role", "User"),
        "user": current_user["name"],
        "data": data
    }

# -------------------------------------------------------------------------
# 2. USERS MANAGEMENT API (RBAC Guarded)
# -------------------------------------------------------------------------

class CreateUserAdminRequest(BaseModel):
    name: str
    email: str
    phone: Optional[str] = ""
    password: str
    role: Optional[str] = "User"
    status: Optional[str] = "active"

class UpdateUserAdminRequest(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None

@router.get("/users")
def list_users(
    search: str = Query("", description="Search by name or email"),
    role: str = Query("", description="Filter by role"),
    status: str = Query("", description="Filter by status"),
    current_user: dict = Depends(require_admin)
):
    norm_role = current_user.get("norm_role") or normalize_role(current_user.get("role"))
    
    # Restriction: Admin can only view Standard Users; Super Admin can view all
    if norm_role == "ADMIN" and not role:
        role = "User"

    users_res = db.get_users_list(search=search, role=role, status=status)
    
    # If Admin, filter out any Super Admin accounts from view
    if norm_role == "ADMIN":
        users_res["items"] = [u for u in users_res["items"] if normalize_role(u["role"]) != "SUPER_ADMIN"]
        users_res["total"] = len(users_res["items"])

    return users_res

@router.post("/users")
def create_user_by_admin(req: CreateUserAdminRequest, current_user: dict = Depends(require_admin)):
    norm_admin = current_user.get("norm_role") or normalize_role(current_user.get("role"))
    target_role_norm = normalize_role(req.role)

    # Restriction: Admin cannot create Super Admin or Admin accounts
    if norm_admin == "ADMIN" and target_role_norm in ["SUPER_ADMIN", "ADMIN"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin accounts are only authorized to provision Standard Users."
        )

    existing = db.get_user_by_email(req.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    user_data = {
        "name": req.name,
        "email": req.email,
        "phone": req.phone or "",
        "password_hash": hash_password(req.password),
        "role": "Super Admin" if target_role_norm == "SUPER_ADMIN" else ("Admin" if target_role_norm == "ADMIN" else "User"),
        "status": req.status or "active",
        "avatar": f"https://api.dicebear.com/7.x/initials/svg?seed={req.name}",
        "is_verified": True
    }
    created = db.create_user(user_data)
    db.log_activity(current_user["id"], "ADMIN_CREATE_USER", f"Created account {created['email']} as {created['role']}")
    return {"status": "success", "user": created}

@router.put("/users/{user_id}")
def update_user_by_admin(user_id: str, req: UpdateUserAdminRequest, current_user: dict = Depends(require_admin)):
    norm_admin = current_user.get("norm_role") or normalize_role(current_user.get("role"))
    target_user = db.get_user_by_id(user_id)
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User account not found.")

    target_norm = normalize_role(target_user["role"])

    # Restrictions:
    # 1. Admin cannot edit, deactivate or downgrade a Super Admin
    if norm_admin == "ADMIN" and target_norm == "SUPER_ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized: Admin cannot modify Super Admin accounts."
        )

    # 2. Admin cannot promote anyone to Super Admin
    if req.role and norm_admin == "ADMIN" and normalize_role(req.role) in ["SUPER_ADMIN", "ADMIN"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized: Admin cannot assign privileged roles."
        )

    updates = {}
    if req.name is not None:
        updates["name"] = req.name
    if req.phone is not None:
        updates["phone"] = req.phone
    if req.status is not None:
        updates["status"] = req.status
    if req.role is not None:
        norm_r = normalize_role(req.role)
        updates["role"] = "Super Admin" if norm_r == "SUPER_ADMIN" else ("Admin" if norm_r == "ADMIN" else "User")

    updated = db.admin_update_user(user_id, updates)
    db.log_activity(current_user["id"], "ADMIN_UPDATE_USER", f"Updated account {user_id} ({updates})")
    return {"status": "success", "user": updated}

@router.delete("/users/{user_id}")
def delete_user_by_admin(user_id: str, current_user: dict = Depends(require_super_admin)):
    # Super Admin required to delete accounts permanently
    target_user = db.get_user_by_id(user_id)
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    if target_user["id"] == current_user["id"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete your own active Super Admin account.")

    success = db.admin_delete_user(user_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to delete user.")

    db.log_activity(current_user["id"], "SUPER_ADMIN_DELETE_USER", f"Permanently removed user {user_id} ({target_user['email']})")
    return {"status": "success", "message": f"User {target_user['email']} permanently removed."}

# -------------------------------------------------------------------------
# 3. ANALYSES REST API (Ownership & RBAC Enforced)
# -------------------------------------------------------------------------

class CreateAnalysisRequest(BaseModel):
    text: str
    source_name: Optional[str] = "Manual Text Input"

@router.get("/analyses")
def list_analyses(
    search: str = Query("", description="Search text or source"),
    sentiment: str = Query("", description="Filter by sentiment"),
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    current_user: dict = Depends(get_current_user)
):
    norm_role = current_user.get("norm_role") or normalize_role(current_user.get("role"))
    is_admin = norm_role in ["SUPER_ADMIN", "ADMIN"]
    
    # Ownership: Standard users can only fetch their own analyses; Admin/Super Admin can see broader scope
    res = db.get_analyses(
        user_id=current_user["id"],
        is_admin=is_admin,
        search=search,
        sentiment=sentiment,
        limit=limit,
        offset=offset
    )
    return res

@router.post("/analyses")
def create_analysis_record(req: CreateAnalysisRequest, current_user: dict = Depends(get_current_user)):
    if not req.text or not req.text.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Analysis text cannot be empty.")

    res = analyze_sentiment(req.text)
    record = {
        "user_id": current_user["id"],
        "input_type": "text",
        "source_name": req.source_name or "Manual Text Input",
        "text": req.text.strip(),
        "sentiment": res["sentiment"],
        "confidence": res["confidence"],
        "score": res["score"],
        "emotions": res["emotions"],
        "keywords": res["keywords"],
        "explanation": res["explanation"],
        "classification_details": res.get("classification_details", res.get("details", {}))
    }
    inserted = db.insert_analysis(record)
    db.log_activity(current_user["id"], "ANALYSIS_CREATE", f"Sentiment analyzed: {res['sentiment']} ({res['confidence']}%)")
    return {"status": "success", "analysis": inserted}

@router.get("/analyses/{analysis_id}")
def get_single_analysis(analysis_id: str, current_user: dict = Depends(get_current_user)):
    norm_role = current_user.get("norm_role") or normalize_role(current_user.get("role"))
    is_admin = norm_role in ["SUPER_ADMIN", "ADMIN"]

    analysis = db.get_analysis_by_id(analysis_id=analysis_id, user_id=current_user["id"], is_admin=is_admin)
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis record not found or access denied."
        )
    return analysis

@router.delete("/analyses/{analysis_id}")
def delete_single_analysis(analysis_id: str, current_user: dict = Depends(get_current_user)):
    norm_role = current_user.get("norm_role") or normalize_role(current_user.get("role"))
    is_admin = norm_role == "SUPER_ADMIN"

    success = db.delete_analysis(analysis_id=analysis_id, user_id=current_user["id"], is_admin=is_admin)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis record not found or permission denied."
        )
    db.log_activity(current_user["id"], "ANALYSIS_DELETE", f"Deleted analysis record {analysis_id}")
    return {"status": "success", "message": f"Analysis record {analysis_id} deleted."}
