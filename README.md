# 🏥 Emergency Room Wait Time Predictor

<<<<<<< HEAD
A full-stack ML web app that predicts ER wait times using a trained **Ensemble Model (Random Forest + XGBoost + Gradient Boosting)** with ROC-AUC 0.9956 and R² 0.984.
=======
A full-stack ML web app that predicts ER wait times using a trained **Random Forest Classifier**.
>>>>>>> 8b3e3d992bf1e0212d70afe2fd599366bdc77fa7

---

## Project Structure

```
er-wait-predictor/
├── backend/
│   ├── server.py              # Flask API
│   ├── er_wait_model.pkl      # Trained RandomForestClassifier (11 features)
│   ├── scaler.pkl             # StandardScaler fitted on training data
│   ├── requirements.txt
│   └── .env
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── App.js
    │   ├── index.js
    │   ├── index.css
    │   ├── lib/utils.js
    │   ├── pages/
    │   │   ├── LandingPage.js
    │   │   └── PredictorPage.js
    │   └── components/
    │       ├── InputForm.js
    │       ├── LoadingState.js
    │       ├── ErrorState.js
    │       └── ResultDashboard.js
    ├── package.json
    ├── tailwind.config.js
    ├── postcss.config.js
    └── .env
```

---

## Prerequisites

| Tool | Version |
|------|---------|
| Python | 3.9 – 3.12 |
| Node.js | 16+ |
| npm / yarn | any recent |

---

## Quick Start

### 1. Clone / unzip into a folder

### 2. Backend setup

```bash
cd backend

# Create and activate a virtual environment (recommended)
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the Flask server
python server.py
```

Backend runs at **http://localhost:8001**

### 3. Frontend setup

Open a **new terminal**:

```bash
cd frontend
npm install          # or: yarn install
npm start            # or: yarn start
```

Frontend runs at **http://localhost:3000**

---

## API Endpoints

### `GET /api/health`
Returns model load status.

```json
{ "status": "healthy", "model_loaded": true, "scaler_loaded": true }
```

### `POST /api/predict`

**Request body:**
```json
{
  "age": 35,
  "gender": "Male",
  "race": "Other",
  "department": "None",
  "severity": 6,
  "crowd": 7,
  "satisfaction_score": 3,
  "symptoms": ["Chest Pain", "Fever"]
}
```

**Response:**
```json
{
  "wait_time": 42,
  "priority": "Medium",
  "probability_long_wait": 0.34,
  "recommendations": ["Stay in waiting area", "..."],
  "insights": "Our model predicts a short wait for...",
  "feature_importance": [
    { "name": "Age", "value": 14.0 },
    { "name": "Severity", "value": 54.0 },
    { "name": "Crowd Level", "value": 52.5 },
    { "name": "Symptoms", "value": 24.0 }
  ]
}
```

---

## ML Model Details

<<<<<<< HEAD
=======
Datase : https://www.kaggle.com/datasets/xavierberge/hospital-emergency-dataset

>>>>>>> 8b3e3d992bf1e0212d70afe2fd599366bdc77fa7
| Property | Value |
|----------|-------|
| Model type | `RandomForestClassifier` (scikit-learn 1.6.1) |
| Task | Binary classification: Short (0) vs Long (1) wait |
| Features | 11 (Patient Id, Age, Gender, Race, Dept. Referral, Admission Flag, Satisfaction Score, Waittime proxy, etc.) |
| Scaler | `StandardScaler` with named features |

> **Note:** The model was trained with scikit-learn 1.6.1. If you see `InconsistentVersionWarning` messages, the model still works — they are suppressed in production.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| ML | scikit-learn, pandas, numpy, joblib |
| Backend | Flask, flask-cors |
| Frontend | React 18, Tailwind CSS, Recharts |
| Theming | next-themes (light/dark) |
| Icons | lucide-react |
| Routing | react-router-dom v6 |

---

## Troubleshooting

**Backend won't start:**
- Make sure you're in the `backend/` directory and your virtual env is activated.
- Run `pip install -r requirements.txt` again.

**Frontend can't reach backend:**
- Confirm backend is running on port 8001.
- Check `frontend/.env` — `REACT_APP_BACKEND_URL` must be `http://localhost:8001`.

**sklearn version warning:**
- Safe to ignore. The models were saved with sklearn 1.6.1 — they still predict correctly on 1.8.x.
