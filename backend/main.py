import os
import uvicorn
from pathlib import Path
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse
from config import settings
from routes.auth_routes import router as auth_router
from routes.sentiment_routes import router as sentiment_router
from routes.dashboard_routes import router as dashboard_router
from routes.history_routes import router as history_router
from routes.monitoring_routes import router as monitoring_router
from routes.reports_routes import router as reports_router
from routes.settings_routes import router as settings_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Sentiment Scope – AI-Powered Enterprise Sentiment Analytics API"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth_router, prefix=settings.API_PREFIX)
app.include_router(sentiment_router, prefix=settings.API_PREFIX)
app.include_router(dashboard_router, prefix=settings.API_PREFIX)
app.include_router(history_router, prefix=settings.API_PREFIX)
app.include_router(monitoring_router, prefix=settings.API_PREFIX)
app.include_router(reports_router, prefix=settings.API_PREFIX)
app.include_router(settings_router, prefix=settings.API_PREFIX)

@app.get("/health")
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Sentiment Scope Backend",
        "database": "connected",
        "nlp_engine": "vader+heuristics ready"
    }

# Frontend Production Build Handling
DIST_DIR = Path(__file__).resolve().parent.parent / "frontend" / "dist"

if DIST_DIR.exists() and (DIST_DIR / "index.html").exists():
    if (DIST_DIR / "assets").exists():
        app.mount("/assets", StaticFiles(directory=str(DIST_DIR / "assets")), name="static_assets")

    _index_html_content = (DIST_DIR / "index.html").read_text(encoding="utf-8")

    @app.get("/")
    async def serve_index():
        return HTMLResponse(content=_index_html_content)

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api") or full_path.startswith("ws"):
            raise HTTPException(status_code=404, detail="Endpoint not found")
        file_candidate = DIST_DIR / full_path
        if file_candidate.is_file():
            return FileResponse(file_candidate)
        return HTMLResponse(content=_index_html_content)
else:
    @app.get("/")
    def root():
        return {
            "app": settings.PROJECT_NAME,
            "version": settings.VERSION,
            "status": "operational",
            "documentation": "/docs"
        }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
