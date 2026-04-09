@echo off
echo Starting ER Wait Time Predictor...
<<<<<<< HEAD
echo.

echo [1/2] Starting Flask backend on http://localhost:8001
start "ER Backend" cmd /k "cd backend && python -m venv venv && venv\Scripts\activate && pip install -r requirements.txt && python server.py"

echo Waiting for backend to start...
timeout /t 6 /nobreak > NUL

echo [2/2] Starting React frontend on http://localhost:3000
start "ER Frontend" cmd /k "cd frontend && npm install && npm start"

echo.
echo ====================================================
echo  Both servers starting...
echo    Backend:  http://localhost:8001/api/health
echo    Frontend: http://localhost:3000
echo ====================================================
=======

echo Starting Flask backend on http://localhost:8001
start "ER Backend" cmd /k "cd backend && python -m venv venv && venv\Scripts\activate && pip install -r requirements.txt && python server.py"

timeout /t 3 /nobreak > NUL

echo Starting React frontend on http://localhost:3000
start "ER Frontend" cmd /k "cd frontend && npm install && npm start"

echo.
echo Both servers starting...
echo   Backend:  http://localhost:8001
echo   Frontend: http://localhost:3000
>>>>>>> 8b3e3d992bf1e0212d70afe2fd599366bdc77fa7
echo.
echo Close the opened terminal windows to stop the servers.
pause
