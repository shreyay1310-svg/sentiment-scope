import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

class Settings:
    PROJECT_NAME: str = "Sentiment Scope"
    VERSION: str = "2.0.0"
    API_PREFIX: str = "/api"
    
    # Security & JWT
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super-secret-sentiment-scope-jwt-key-2026-very-secure")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # MongoDB or SQLite Persistent Storage
    MONGODB_URI: str = os.getenv("MONGODB_URI", "") # e.g. "mongodb://localhost:27017"
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "sentiment_scope_db")
    STORAGE_DIR: Path = BASE_DIR / "data"
    UPLOADS_DIR: Path = BASE_DIR / "uploads"
    REPORTS_DIR: Path = BASE_DIR / "reports"
    
    # CORS
    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8000",
        "*"
    ]

settings = Settings()
settings.STORAGE_DIR.mkdir(parents=True, exist_ok=True)
settings.UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
settings.REPORTS_DIR.mkdir(parents=True, exist_ok=True)
