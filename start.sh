#!/bin/bash
<<<<<<< HEAD
set -e

echo "Starting ER Wait Time Predictor..."

# Backend
echo "[1/2] Starting Flask backend on http://localhost:8001"
cd backend
python3 -m venv venv 2>/dev/null || true
source venv/bin/activate
pip install -r requirements.txt -q
python3 server.py &
BACKEND_PID=$!
cd ..

echo "Waiting for backend to initialise..."
sleep 5

# Quick health check
if curl -sf http://localhost:8001/api/health > /dev/null 2>&1; then
    echo "Backend is healthy."
else
    echo "Warning: backend health check failed — it may still be loading."
fi

# Frontend
echo "[2/2] Starting React frontend on http://localhost:3000"
=======
# start.sh — launches both backend and frontend in separate terminals

echo "🏥 Starting ER Wait Time Predictor..."

# Backend
echo "→ Starting Flask backend on http://localhost:8001"
cd backend
python -m venv venv 2>/dev/null || true
source venv/bin/activate
pip install -r requirements.txt -q
python server.py &
BACKEND_PID=$!
cd ..

sleep 2

# Frontend
echo "→ Starting React frontend on http://localhost:3000"
>>>>>>> 8b3e3d992bf1e0212d70afe2fd599366bdc77fa7
cd frontend
npm install -q
npm start &
FRONTEND_PID=$!
cd ..

echo ""
<<<<<<< HEAD
echo "=================================================="
echo "  Both servers started!"
echo "  Backend:  http://localhost:8001/api/health"
echo "  Frontend: http://localhost:3000"
echo "=================================================="
echo ""
echo "Press Ctrl+C to stop both."

trap "echo 'Stopping...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
=======
echo "✅ Both servers started!"
echo "   Backend:  http://localhost:8001"
echo "   Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
>>>>>>> 8b3e3d992bf1e0212d70afe2fd599366bdc77fa7
wait
