import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

class Settings:
    PROJECT_NAME: str = "Sentiment Scope"
    VERSION: str = "2.1.0"
    API_PREFIX: str = "/api"
    
    # Security & JWT
    JWT_SECRET: str = os.getenv("JWT_SECRET", "sentiment-scope-jwt-secret-mysql-production-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # MySQL Database Configuration
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: int = int(os.getenv("DB_PORT", "3306"))
    DB_NAME: str = os.getenv("DB_NAME", "sentiment_scope_db")
    DB_USER: str = os.getenv("DB_USER", "root")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "")
    DB_SSL: bool = os.getenv("DB_SSL", "false").lower() in ["true", "1", "yes"]

    # Storage paths
    STORAGE_DIR: Path = BASE_DIR / "data"
    UPLOADS_DIR: Path = BASE_DIR / "uploads"
    REPORTS_DIR: Path = BASE_DIR / "reports"
    
    # CORS
    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8088",
        "http://127.0.0.1:8088",
        "https://frontend-ecru-nine-35.vercel.app",
        "https://frontend-ift5bnjzv-shreyas-projects-182e8d54.vercel.app",
        "*"
    ]

    @property
    def mysql_url(self) -> str:
        # Handles optional password
        pwd_part = f":{self.DB_PASSWORD}" if self.DB_PASSWORD else ""
        return f"mysql+pymysql://{self.DB_USER}{pwd_part}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}?charset=utf8mb4"

settings = Settings()
settings.STORAGE_DIR.mkdir(parents=True, exist_ok=True)
settings.UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
settings.REPORTS_DIR.mkdir(parents=True, exist_ok=True)
