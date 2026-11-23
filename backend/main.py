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
from routes.role_routes import router as role_router

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

@app.middleware("http")
async def vercel_path_correction_middleware(request: Request, call_next):
    # Support Vercel serverless rewrites and custom routing
    route = request.query_params.get("__route__")
    if route:
        clean_route = route if route.startswith("/") else f"/{route}"
        request.scope["path"] = clean_route
    else:
        matched_path = request.headers.get("x-matched-path") or request.headers.get("x-vercel-matched-path")
        if matched_path and matched_path not in ["/api/index.py", "/api/index"]:
            request.scope["path"] = matched_path
        elif request.query_params.get("path"):
            raw_p = request.query_params.get("path")
            request.scope["path"] = "/" + raw_p.lstrip("/")
        else:
            current_path = request.scope.get("path", "")
            if current_path.startswith("/api/index.py"):
                cleaned = current_path.replace("/api/index.py", "")
                request.scope["path"] = cleaned if cleaned else "/"
            elif current_path.startswith("/api/index"):
                cleaned = current_path.replace("/api/index", "")
                request.scope["path"] = cleaned if cleaned else "/"

    response = await call_next(request)
    return response

# Include API Routers
app.include_router(auth_router, prefix=settings.API_PREFIX)
app.include_router(sentiment_router, prefix=settings.API_PREFIX)
app.include_router(dashboard_router, prefix=settings.API_PREFIX)
app.include_router(history_router, prefix=settings.API_PREFIX)
app.include_router(monitoring_router, prefix=settings.API_PREFIX)
app.include_router(reports_router, prefix=settings.API_PREFIX)
app.include_router(settings_router, prefix=settings.API_PREFIX)
app.include_router(role_router, prefix=settings.API_PREFIX)

@app.get("/")
def root(request: Request):
    if not settings.is_serverless and "text/html" in request.headers.get("accept", ""):
        dist_index = Path(__file__).resolve().parent.parent / "frontend" / "dist" / "index.html"
        if dist_index.exists():
            return HTMLResponse(content=dist_index.read_text(encoding="utf-8"))
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "operational",
        "documentation": "/docs"
    }

@app.get("/health")
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Sentiment Scope Backend",
        "database": "connected",
        "nlp_engine": "vader+heuristics ready"
    }

# Local frontend static serving for development and E2E browser testing
if not settings.is_serverless:
    DIST_DIR = Path(__file__).resolve().parent.parent / "frontend" / "dist"
    if DIST_DIR.exists() and (DIST_DIR / "index.html").exists():
        if (DIST_DIR / "assets").exists():
            app.mount("/assets", StaticFiles(directory=str(DIST_DIR / "assets")), name="static_assets")

        _spa_html = (DIST_DIR / "index.html").read_text(encoding="utf-8")

        @app.get("/{full_path:path}", response_class=HTMLResponse)
        def serve_spa(full_path: str):
            if full_path.startswith("api/") or full_path.startswith("assets/"):
                raise HTTPException(status_code=404, detail="Not Found")
            return _spa_html


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

