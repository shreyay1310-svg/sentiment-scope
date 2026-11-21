from fastapi import APIRouter, HTTPException, status, Depends, Query
from auth import get_current_user
from database import db
from typing import Optional

router = APIRouter(prefix="/history", tags=["History"])

@router.get("")
def list_history(
    search: Optional[str] = Query(None),
    sentiment: Optional[str] = Query("all"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["id"]
    is_admin = current_user.get("role") in ["Admin", "Super Admin"]
    offset = (page - 1) * limit
    
    res = db.get_analyses(
        user_id=user_id,
        is_admin=is_admin,
        search=search or "",
        sentiment=sentiment or "",
        limit=limit,
        offset=offset
    )
    
    total_pages = max(1, (res["total"] + limit - 1) // limit)
    return {
        "items": res["items"],
        "total": res["total"],
        "page": page,
        "limit": limit,
        "total_pages": total_pages
    }

@router.get("/{analysis_id}")
def get_analysis_detail(analysis_id: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    is_admin = current_user.get("role") in ["Admin", "Super Admin"]
    item = db.get_analysis_by_id(analysis_id, user_id=user_id, is_admin=is_admin)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis record not found.")
    return item

@router.delete("/{analysis_id}")
def delete_analysis_record(analysis_id: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    is_admin = current_user.get("role") in ["Admin", "Super Admin"]
    deleted = db.delete_analysis(analysis_id, user_id=user_id, is_admin=is_admin)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record not found or already deleted.")
    return {"status": "success", "message": f"Analysis {analysis_id} deleted successfully."}
