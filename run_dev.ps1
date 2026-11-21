Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Starting Sentiment Scope Full-Stack Enterprise Platform  " -ForegroundColor Magenta
Write-Host "============================================================" -ForegroundColor Cyan

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "Services Dispatched:" -ForegroundColor Green
Write-Host "  • Backend API & WebSocket: http://localhost:8000" -ForegroundColor White
Write-Host "  • Interactive Swagger Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host "  • Frontend Web Application: http://localhost:5173" -ForegroundColor White
