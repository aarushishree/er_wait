from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
<<<<<<< HEAD
import json
import logging
import warnings
import math
from datetime import datetime
=======
import logging
import warnings
>>>>>>> 8b3e3d992bf1e0212d70afe2fd599366bdc77fa7
from pathlib import Path
import joblib
import numpy as np

<<<<<<< HEAD
warnings.filterwarnings("ignore")
=======
# Suppress sklearn version warnings
warnings.filterwarnings("ignore", category=UserWarning)
>>>>>>> 8b3e3d992bf1e0212d70afe2fd599366bdc77fa7

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

app = Flask(__name__)
CORS(app, origins=os.environ.get('CORS_ORIGINS', '*').split(','))

<<<<<<< HEAD
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load model config
try:
    with open(ROOT_DIR / 'model_config.json', 'r') as f:
        model_config = json.load(f)
    THRESHOLD_MIN    = model_config.get('threshold_min', 61.42)
    ENSEMBLE_WEIGHTS = model_config.get('ensemble_weights', {'rf': 0.3, 'xgb': 0.45, 'gbr': 0.25})
    NOISE_SIGMA      = model_config.get('noise_sigma', 8)
    logger.info(f'Model config loaded: threshold={THRESHOLD_MIN}')
except Exception as e:
    logger.error(f'Error loading model_config.json: {e}')
    model_config     = {}
    THRESHOLD_MIN    = 61.42
    ENSEMBLE_WEIGHTS = {'rf': 0.3, 'xgb': 0.45, 'gbr': 0.25}
    NOISE_SIGMA      = 8

# Load ensemble ML models
try:
    rf_model  = joblib.load(ROOT_DIR / 'rf_model.pkl')
    xgb_model = joblib.load(ROOT_DIR / 'xgb_model.pkl')
    gbr_model = joblib.load(ROOT_DIR / 'gbr_model.pkl')
    scaler    = joblib.load(ROOT_DIR / 'scaler.pkl')
    FEATURE_NAMES = list(scaler.feature_names_in_) if hasattr(scaler, 'feature_names_in_') else []
    logger.info(f'Models loaded. Features ({len(FEATURE_NAMES)}): {FEATURE_NAMES}')
    models_loaded = True
except Exception as e:
    logger.error(f'Error loading ML models: {e}')
    rf_model = xgb_model = gbr_model = scaler = None
    FEATURE_NAMES = []
    models_loaded = False


# ─── Label-encoding maps (must exactly match sklearn LabelEncoder on training data) ───
# Training CSV categorical columns sorted alphabetically give these codes:
#   Region       : Rural=0, Urban=1
#   Day of Week  : Friday=0, Monday=1, Saturday=2, Sunday=3, Thursday=4, Tuesday=5, Wednesday=6
#   Season       : Fall=0, Spring=1, Summer=2, Winter=3
#   Time of Day  : Afternoon=0, Early Morning=1, Evening=2, Late Morning=3, Night=4
#   Urgency Level: Critical=0, High=1, Low=2, Medium=3
#   Patient Out. : Admitted=0, Discharged=1, Left Without Being Seen=2

# Python weekday() (Mon=0…Sun=6) → label-encoded Day of Week
_DOW_MAP = {0: 1, 1: 5, 2: 6, 3: 4, 4: 0, 5: 2, 6: 3}

def get_season_encoded(month):
    """Fall=0, Spring=1, Summer=2, Winter=3"""
    if month in (3, 4, 5):  return 1
    if month in (6, 7, 8):  return 2
    if month in (9, 10, 11): return 0
    return 3

def get_time_of_day_encoded(hour):
    """Afternoon=0, Early Morning=1, Evening=2, Late Morning=3, Night=4"""
    if 0  <= hour < 6:  return 1  # Early Morning
    if 6  <= hour < 12: return 3  # Late Morning
    if 12 <= hour < 17: return 0  # Afternoon
    if 17 <= hour < 22: return 2  # Evening
    return 4                      # Night

def severity_to_urgency(severity):
    """Map 1-10 slider → label-encoded Urgency Level (Critical=0, High=1, Low=2, Medium=3)"""
    if severity >= 9: return 0  # Critical
    if severity >= 7: return 1  # High
    if severity >= 4: return 3  # Medium
    return 2                    # Low


def build_feature_vector(severity, crowd, satisfaction_score):
    """
    Build the 21-feature vector matching the scaler's training data exactly.
    Categorical values use the same label-encoding as training (alphabetical LabelEncoder).
    """
    now   = datetime.now()
    hour  = now.hour
    dow   = now.weekday()
    month = now.month

    # Correctly encoded categoricals
    region      = 1                              # Urban (most common in dataset, mean=0.6)
    dow_encoded = _DOW_MAP[dow]
    season      = get_season_encoded(month)
    tod         = get_time_of_day_encoded(hour)
    urgency     = severity_to_urgency(severity)

    # Temporal flags
    is_weekend = 1 if dow >= 5 else 0
    is_night   = 1 if (hour >= 22 or hour < 6) else 0

    # peak_pressure: 0/1/2 exactly as in training
    # = 1 if hour is peak + 1 if weekend  (can sum to 0, 1, or 2)
    peak_hours    = hour in (8, 9, 10, 17, 18, 19, 20)
    peak_pressure = int(peak_hours) + is_weekend

    # Cyclic encodings
    hour_sin = math.sin(2 * math.pi * hour / 24)
    hour_cos = math.cos(2 * math.pi * hour / 24)
    day_sin  = math.sin(2 * math.pi * dow  / 7)
    day_cos  = math.cos(2 * math.pi * dow  / 7)

    # Clinical defaults (training dataset means; range in brackets)
    nurse_ratio    = 3.0    # mean=3.24  [1-5]
    specialist     = 4.0    # mean=3.88  [0-10]
    facility_beds  = 87.0   # mean=87    [10-200]
    time_to_reg    = 12.0   # mean=11.7  [0-66]
    time_to_triage = 25.0   # mean=24.83 [1-163]
    # Proxy: higher urgency code = lower urgency (Critical=0 seen fastest)
    time_to_med    = (urgency * 10) + (crowd * 3)   # mean≈45 [2-233]

    patient_outcome = 1   # Discharged (most common, mean=0.68)

    return np.array([[
        float(region),
        float(dow_encoded),
        float(season),
        float(tod),
        float(urgency),
        nurse_ratio,
        specialist,
        facility_beds,
        time_to_reg,
        time_to_triage,
        float(time_to_med),
        float(patient_outcome),
        float(satisfaction_score),
        float(month),
        float(is_weekend),
        float(is_night),
        float(peak_pressure),
        hour_sin,
        hour_cos,
        day_sin,
        day_cos,
    ]], dtype=np.float64)


def ensemble_predict(features_scaled):
    w_rf  = ENSEMBLE_WEIGHTS['rf']
    w_xgb = ENSEMBLE_WEIGHTS['xgb']
    w_gbr = ENSEMBLE_WEIGHTS['gbr']

    pred_rf  = float(rf_model.predict(features_scaled)[0])
    pred_xgb = float(xgb_model.predict(features_scaled)[0])
    pred_gbr = float(gbr_model.predict(features_scaled)[0])

    weighted_wait = w_rf * pred_rf + w_xgb * pred_xgb + w_gbr * pred_gbr

    dist = (weighted_wait - THRESHOLD_MIN) / max(THRESHOLD_MIN * 0.3, 1)
    prob_long_soft = float(1 / (1 + np.exp(-dist)))

    return weighted_wait, prob_long_soft, pred_rf, pred_xgb, pred_gbr


def apply_clinical_adjustments(wait_time, severity, crowd, symptoms):
    severity_factor = 1.0 - (severity - 5) * 0.06
    wait_time *= max(0.4, min(1.4, severity_factor))
    crowd_factor = 1.0 + (crowd - 5) * 0.08
    wait_time *= max(0.7, min(1.5, crowd_factor))
    critical = {'Chest Pain', 'Difficulty Breathing', 'Unconsciousness', 'Bleeding'}
    if any(s in critical for s in symptoms):
        wait_time *= 0.6
    return max(5, int(wait_time))
=======
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load ML models
try:
    model = joblib.load(ROOT_DIR / 'er_wait_model.pkl')
    scaler = joblib.load(ROOT_DIR / 'scaler.pkl')
    FEATURE_NAMES = list(scaler.feature_names_in_)
    logger.info('ML models loaded successfully')
    logger.info(f'Feature names: {FEATURE_NAMES}')
except Exception as e:
    logger.error(f'Error loading ML models: {e}')
    model = None
    scaler = None
    FEATURE_NAMES = []


def encode_gender(gender_str):
    """Encode gender to numeric: Male=0, Female=1, Other=2"""
    mapping = {'male': 0, 'female': 1, 'other': 2, 'M': 0, 'F': 1}
    return mapping.get(gender_str.lower() if gender_str else 'other', 2)


def encode_race(race_str):
    """Encode race to numeric"""
    mapping = {
        'white': 0, 'black': 1, 'hispanic': 2,
        'asian': 3, 'native american': 4, 'pacific islander': 5, 'other': 6
    }
    return mapping.get(race_str.lower() if race_str else 'other', 6)


def encode_department(dept_str):
    """Encode department referral to numeric"""
    mapping = {
        'none': 0, 'general practice': 1, 'orthopedics': 2,
        'gastroenterology': 3, 'neurology': 4, 'renal': 5, 'physiotherapy': 6
    }
    return mapping.get(dept_str.lower() if dept_str else 'none', 0)


def get_wait_time_minutes(probability_long, severity, crowd, symptoms):
    """
    Derive a realistic wait time estimate in minutes from model output + inputs.
    The model predicts short (0) vs long (1) wait.
    """
    base_short = 25   # average short wait
    base_long = 90    # average long wait

    # Blend based on probability of long wait
    wait = base_short + (base_long - base_short) * probability_long

    # Adjust for severity (1-10 scale)
    severity_factor = 1.0 - (severity - 5) * 0.06  # high severity -> faster service
    wait *= max(0.4, min(1.4, severity_factor))

    # Adjust for crowd (1-10 scale)
    crowd_factor = 1.0 + (crowd - 5) * 0.08
    wait *= max(0.7, min(1.5, crowd_factor))

    # Critical symptoms reduce wait (treated urgently)
    critical = {'Chest Pain', 'Difficulty Breathing', 'Unconsciousness', 'Bleeding'}
    if any(s in critical for s in symptoms):
        wait *= 0.6

    return max(5, int(wait))
>>>>>>> 8b3e3d992bf1e0212d70afe2fd599366bdc77fa7


@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
<<<<<<< HEAD
        'models_loaded': models_loaded,
        'ensemble': {
            'rf':  rf_model  is not None,
            'xgb': xgb_model is not None,
            'gbr': gbr_model is not None,
        },
        'scaler_loaded': scaler is not None,
        'feature_count': len(FEATURE_NAMES),
        'features': FEATURE_NAMES,
        'model_performance': {
            'roc_auc':  model_config.get('roc_auc'),
            'accuracy': model_config.get('accuracy'),
            'mae':      model_config.get('mae'),
            'r2':       model_config.get('r2'),
        }
=======
        'model_loaded': model is not None,
        'scaler_loaded': scaler is not None
>>>>>>> 8b3e3d992bf1e0212d70afe2fd599366bdc77fa7
    }), 200


@app.route('/api/predict', methods=['POST'])
def predict():
    try:
<<<<<<< HEAD
        if not models_loaded:
            return jsonify({'error': 'Models not loaded. Check backend logs for details.'}), 500

        data = request.json
        if not data:
            return jsonify({'error': 'No JSON body received'}), 400

=======
        if model is None or scaler is None:
            return jsonify({'error': 'ML models not loaded. Ensure er_wait_model.pkl and scaler.pkl are in the backend directory.'}), 500

        data = request.json

        # Validate required fields
>>>>>>> 8b3e3d992bf1e0212d70afe2fd599366bdc77fa7
        age = data.get('age')
        if not age or float(age) <= 0 or float(age) > 120:
            return jsonify({'error': 'Valid age (1-120) is required'}), 400

<<<<<<< HEAD
        age               = float(age)
        severity          = float(data.get('severity', 5))
        crowd             = float(data.get('crowd', 5))
        symptoms          = data.get('symptoms', [])
        satisfaction_score = float(data.get('satisfaction_score', 3))

        logger.info(f'Predict: age={age}, severity={severity}, crowd={crowd}, symptoms={symptoms}')

        feature_array   = build_feature_vector(severity, crowd, satisfaction_score)
        features_scaled = scaler.transform(feature_array)

        raw_wait, prob_long_wait, pred_rf, pred_xgb, pred_gbr = ensemble_predict(features_scaled)
        wait_time = apply_clinical_adjustments(raw_wait, severity, crowd, symptoms)

        logger.info(f'Prediction: rf={pred_rf:.1f} xgb={pred_xgb:.1f} gbr={pred_gbr:.1f} '
                    f'weighted={raw_wait:.1f} adjusted={wait_time}')

        # Priority
=======
        age = float(age)
        severity = float(data.get('severity', 5))
        crowd = float(data.get('crowd', 5))
        symptoms = data.get('symptoms', [])
        gender = data.get('gender', 'other')
        satisfaction_score = float(data.get('satisfaction_score', 3))

        # Build feature vector matching model's training features:
        # ['Patient Id', 'Patient Admission Date', 'Patient First Inital',
        #  'Patient Last Name', 'Patient Gender', 'Patient Age', 'Patient Race',
        #  'Department Referral', 'Patient Admission Flag',
        #  'Patient Satisfaction Score', 'Patient Waittime']
        #
        # For real-time prediction we use sensible encodings:
        gender_encoded = encode_gender(gender)
        race_encoded = encode_race(data.get('race', 'other'))
        dept_encoded = encode_department(data.get('department', 'none'))

        # Patient Waittime in training is a known value - we use severity/crowd to estimate it
        # as a proxy (higher severity + crowd = likely longer wait in training data)
        wait_proxy = (severity * 4) + (crowd * 3)

        # Feature order must match scaler.feature_names_in_ exactly:
        # ['Patient Id', 'Patient Admission Date', 'Patient First Inital',
        #  'Patient Last Name', 'Patient Gender', 'Patient Age', 'Patient Race',
        #  'Department Referral', 'Patient Admission Flag',
        #  'Patient Satisfaction Score', 'Patient Waittime']
        feature_array = np.array([[
            9999.0,                          # Patient Id
            20250101.0,                      # Patient Admission Date
            1.0,                             # Patient First Inital
            1.0,                             # Patient Last Name
            float(gender_encoded),           # Patient Gender
            age,                             # Patient Age
            float(race_encoded),             # Patient Race
            float(dept_encoded),             # Department Referral
            1.0 if severity >= 6 else 0.0,  # Patient Admission Flag
            satisfaction_score,              # Patient Satisfaction Score
            float(wait_proxy),               # Patient Waittime
        ]], dtype=np.float64)

        features_scaled = scaler.transform(feature_array)

        prediction = model.predict(features_scaled)[0]
        probabilities = model.predict_proba(features_scaled)[0]
        prob_long_wait = float(probabilities[1])

        wait_time = get_wait_time_minutes(prob_long_wait, severity, crowd, symptoms)

        # Determine priority
>>>>>>> 8b3e3d992bf1e0212d70afe2fd599366bdc77fa7
        priority = 'Low'
        critical_symptoms = {'Unconsciousness', 'Difficulty Breathing', 'Chest Pain', 'Bleeding'}
        high_symptoms = set(symptoms) & critical_symptoms
        if severity >= 7 or high_symptoms:
            priority = 'High'
        elif severity >= 4 or 'Abdominal Pain' in symptoms or 'Severe Headache' in symptoms:
            priority = 'Medium'

        # Recommendations
        recommendations = []
        if priority == 'High':
            recommendations.append('Inform ER staff about your critical symptoms immediately')
            recommendations.append('Do not leave the waiting area under any circumstances')
            if 'Chest Pain' in symptoms:
                recommendations.append('Alert staff if chest pain worsens or spreads to your arm/jaw')
        elif priority == 'Medium':
            recommendations.append('Stay seated in the waiting area and monitor your symptoms')
            recommendations.append('Inform staff if your condition worsens')
            recommendations.append('Avoid eating or drinking until assessed')
        else:
            recommendations.append('Stay hydrated while you wait')
            recommendations.append('Relax and remain in the waiting area')
            recommendations.append('Update staff if new symptoms develop')

        if crowd >= 7:
            recommendations.append('High patient volume today — wait time estimates may vary')

<<<<<<< HEAD
        wait_category = 'longer-than-average' if raw_wait >= THRESHOLD_MIN else 'short'
        insights = (
            f"Our ensemble model (RF + XGB + GBR) predicts a {wait_category} wait for a "
            f"{int(age)}-year-old patient with severity {int(severity)}/10 and current crowd "
            f"level {int(crowd)}/10. Estimated wait: ~{wait_time} minutes."
=======
        # Insights
        wait_category = 'short' if prediction == 0 else 'longer-than-average'
        insights = (
            f"Our model predicts a {wait_category} wait for a {int(age)}-year-old patient "
            f"with severity {int(severity)}/10 and current crowd level {int(crowd)}/10. "
            f"Estimated wait: ~{wait_time} minutes."
>>>>>>> 8b3e3d992bf1e0212d70afe2fd599366bdc77fa7
        )
        if priority == 'High':
            insights += " Your symptoms classify you as HIGH priority and you will be seen urgently."
        if prob_long_wait > 0.6:
            insights += f" There is a {int(prob_long_wait * 100)}% probability of an extended wait based on current conditions."

<<<<<<< HEAD
        feature_importance = [
            {'name': 'Age',         'value': round(abs(age - 50) / 50 * 35, 1)},
            {'name': 'Severity',    'value': round(severity * 9, 1)},
            {'name': 'Crowd Level', 'value': round(crowd * 7.5, 1)},
            {'name': 'Symptoms',    'value': round(len(symptoms) * 12, 1)},
=======
        # Feature importance for visualization
        feature_importance = [
            {'name': 'Age', 'value': round(abs(age - 50) / 50 * 35, 1)},
            {'name': 'Severity', 'value': round(severity * 9, 1)},
            {'name': 'Crowd Level', 'value': round(crowd * 7.5, 1)},
            {'name': 'Symptoms', 'value': round(len(symptoms) * 12, 1)},
>>>>>>> 8b3e3d992bf1e0212d70afe2fd599366bdc77fa7
        ]

        return jsonify({
            'wait_time': wait_time,
            'priority': priority,
            'probability_long_wait': round(prob_long_wait, 2),
            'recommendations': recommendations,
            'insights': insights,
<<<<<<< HEAD
            'feature_importance': feature_importance,
            'ensemble_detail': {
                'rf_prediction':  round(pred_rf, 1),
                'xgb_prediction': round(pred_xgb, 1),
                'gbr_prediction': round(pred_gbr, 1),
                'weighted_raw':   round(raw_wait, 1),
                'threshold_min':  THRESHOLD_MIN,
            }
=======
            'feature_importance': feature_importance
>>>>>>> 8b3e3d992bf1e0212d70afe2fd599366bdc77fa7
        }), 200

    except Exception as e:
        logger.error(f'Prediction error: {e}', exc_info=True)
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
<<<<<<< HEAD
    app.run(host='0.0.0.0', port=8001, debug=True)
=======
    port = int(os.environ.get('PORT', 8001))
    app.run(host='0.0.0.0', port=port, debug=False)
>>>>>>> 8b3e3d992bf1e0212d70afe2fd599366bdc77fa7
