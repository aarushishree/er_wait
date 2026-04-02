@echo off
echo Starting ER Wait Time Predictor...

echo Starting Flask backend on http://localhost:8001
start "ER Backend" cmd /k "cd backend && python -m venv venv && venv\Scripts\activate && pip install -r requirements.txt && python server.py"

timeout /t 3 /nobreak > NUL

echo Starting React frontend on http://localhost:3000
start "ER Frontend" cmd /k "cd frontend && npm install && npm start"

echo.
echo Both servers starting...
echo   Backend:  http://localhost:8001
echo   Frontend: http://localhost:3000
echo.
echo Close the opened terminal windows to stop the servers.
pause
