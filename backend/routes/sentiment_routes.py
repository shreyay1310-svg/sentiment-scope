import shutil
import uuid
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File, Form
from fastapi.responses import FileResponse
from pydantic import BaseModel
from auth import get_current_user
from database import db
from nlp_engine import analyze_sentiment, parse_and_analyze_file
from config import settings

router = APIRouter(prefix="/sentiment", tags=["Sentiment Analysis"])

class TextAnalysisRequest(BaseModel):
    text: str
    source_name: Optional[str] = "Manual Text Input"

@router.post("/analyze-text")
def analyze_text_endpoint(req: TextAnalysisRequest, current_user: dict = Depends(get_current_user)):
    if not req.text or not req.text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Text field cannot be empty."
        )

    result = analyze_sentiment(req.text)
    
    # Save record into database
    record = {
        "user_id": current_user["id"],
        "input_type": "text",
        "source_name": req.source_name or "Manual Text Input",
        "text": req.text.strip(),
        "sentiment": result["sentiment"],
        "confidence": result["confidence"],
        "score": result["score"],
        "emotions": result["emotions"],
        "keywords": result["keywords"],
        "explanation": result["explanation"],
        "classification_details": result["classification_details"]
    }
    saved = db.insert_analysis(record)
    
    # Add to live feed automatically
    db.insert_live_feed({
        "user_id": current_user["id"],
        "text": req.text[:120] + ("..." if len(req.text) > 120 else ""),
        "sentiment": result["sentiment"],
        "confidence": result["confidence"],
        "source": "User Analysis"
    })

    return {
        "status": "success",
        "id": saved["id"],
        "created_at": saved["created_at"],
        **result
    }

@router.post("/analyze-file")
async def analyze_file_endpoint(
    file: UploadFile = File(...),
    column_name: Optional[str] = Form(None),
    current_user: dict = Depends(get_current_user)
):
    valid_exts = [".csv", ".txt", ".pdf", ".xlsx", ".xls"]
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in valid_exts:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{file_ext}'. Allowed formats: CSV, TXT, PDF, XLSX."
        )

    file_id = f"file_{uuid.uuid4().hex[:10]}"
    saved_filename = f"{file_id}_{file.filename}"
    saved_path = settings.UPLOADS_DIR / saved_filename

    try:
        with open(saved_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Run batch analysis
        analysis_res = parse_and_analyze_file(saved_path, text_column=column_name)

        # Record dataset
        dataset_doc = {
            "user_id": current_user["id"],
            "file_name": file.filename,
            "file_type": file_ext.replace(".", "").upper(),
            "row_count": analysis_res["total_rows"],
            "positive_count": analysis_res["positive_count"],
            "negative_count": analysis_res["negative_count"],
            "neutral_count": analysis_res["neutral_count"],
            "file_path": str(saved_path),
            "analyzed_file_path": analysis_res["analyzed_file_path"]
        }
        saved_dataset = db.insert_dataset(dataset_doc)

        # Record top row as analysis entry in history for instant dashboard reflection
        primary_sentiment = "Positive" if analysis_res["positive_count"] >= max(analysis_res["negative_count"], analysis_res["neutral_count"]) else (
            "Negative" if analysis_res["negative_count"] >= analysis_res["neutral_count"] else "Neutral"
        )
        total = max(1, analysis_res["total_rows"])
        sentiment_pct = round((max(analysis_res["positive_count"], analysis_res["negative_count"], analysis_res["neutral_count"]) / total) * 100, 1)

        db.insert_analysis({
            "user_id": current_user["id"],
            "input_type": "file",
            "source_name": file.filename,
            "text": f"Batch file analysis of {file.filename} ({analysis_res['total_rows']} entries, column: '{analysis_res['target_column']}')",
            "sentiment": primary_sentiment,
            "confidence": sentiment_pct,
            "score": round((analysis_res["positive_count"] - analysis_res["negative_count"]) / total, 2),
            "emotions": {
                "Joy": round((analysis_res["positive_count"] / total) * 100, 1),
                "Anger": round((analysis_res["negative_count"] / total) * 100, 1),
                "Neutral": round((analysis_res["neutral_count"] / total) * 100, 1)
            },
            "keywords": [{"word": file.filename, "weight": analysis_res["total_rows"], "type": "neutral", "polarity": 0}],
            "explanation": f"Batch evaluated {analysis_res['total_rows']} rows. {analysis_res['positive_count']} Positive, {analysis_res['negative_count']} Negative, and {analysis_res['neutral_count']} Neutral rows identified.",
            "classification_details": {
                "positive": round((analysis_res["positive_count"] / total) * 100, 1),
                "neutral": round((analysis_res["neutral_count"] / total) * 100, 1),
                "negative": round((analysis_res["negative_count"] / total) * 100, 1),
                "compound": round((analysis_res["positive_count"] - analysis_res["negative_count"]) / total, 2)
            }
        })

        return {
            "status": "success",
            "dataset_id": saved_dataset["id"],
            "file_name": file.filename,
            "row_count": analysis_res["total_rows"],
            "target_column": analysis_res["target_column"],
            "available_columns": analysis_res["available_columns"],
            "positive_count": analysis_res["positive_count"],
            "negative_count": analysis_res["negative_count"],
            "neutral_count": analysis_res["neutral_count"],
            "preview": analysis_res["preview"],
            "download_url": f"/api/sentiment/download/{saved_dataset['id']}"
        }

    except Exception as e:
        if saved_path.exists():
            try:
                saved_path.unlink()
            except Exception:
                pass
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process file: {str(e)}"
        )

@router.get("/download/{dataset_id}")
def download_analyzed_file(dataset_id: str, current_user: dict = Depends(get_current_user)):
    datasets = db.get_datasets(current_user["id"], is_admin=(current_user.get("role") in ["Admin", "Super Admin"]))
    matched = next((d for d in datasets if d["id"] == dataset_id), None)
    if not matched:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found or access denied.")

    analyzed_file = Path(matched["analyzed_file_path"])
    if not analyzed_file.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Processed output file is no longer available.")

    filename = f"analyzed_{matched['file_name']}"
    if not filename.endswith(".csv") and not filename.endswith(".xlsx"):
        filename += ".csv"
        
    return FileResponse(
        path=str(analyzed_file),
        filename=filename,
        media_type="application/octet-stream"
    )
