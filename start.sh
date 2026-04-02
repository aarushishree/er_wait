#!/bin/bash
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
cd frontend
npm install -q
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Both servers started!"
echo "   Backend:  http://localhost:8001"
echo "   Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait
