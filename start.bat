@echo off
echo ============================================================
echo   Starting Sentiment Scope (Backend + Frontend)
echo ============================================================

start cmd /k "cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 8088 --reload"
start cmd /k "cd frontend && npm run dev"

echo Backend running on http://localhost:8088
echo Frontend running on http://localhost:5173
echo.
pause
