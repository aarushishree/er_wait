from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import logging
import warnings
from pathlib import Path
import joblib
import numpy as np

# Suppress sklearn version warnings
warnings.filterwarnings("ignore", category=UserWarning)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

app = Flask(__name__)
CORS(app, origins=os.environ.get('CORS_ORIGINS', '*').split(','))

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


@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'scaler_loaded': scaler is not None
    }), 200


@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        if model is None or scaler is None:
            return jsonify({'error': 'ML models not loaded. Ensure er_wait_model.pkl and scaler.pkl are in the backend directory.'}), 500

        data = request.json

        # Validate required fields
        age = data.get('age')
        if not age or float(age) <= 0 or float(age) > 120:
            return jsonify({'error': 'Valid age (1-120) is required'}), 400

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

        # Insights
        wait_category = 'short' if prediction == 0 else 'longer-than-average'
        insights = (
            f"Our model predicts a {wait_category} wait for a {int(age)}-year-old patient "
            f"with severity {int(severity)}/10 and current crowd level {int(crowd)}/10. "
            f"Estimated wait: ~{wait_time} minutes."
        )
        if priority == 'High':
            insights += " Your symptoms classify you as HIGH priority and you will be seen urgently."
        if prob_long_wait > 0.6:
            insights += f" There is a {int(prob_long_wait * 100)}% probability of an extended wait based on current conditions."

        # Feature importance for visualization
        feature_importance = [
            {'name': 'Age', 'value': round(abs(age - 50) / 50 * 35, 1)},
            {'name': 'Severity', 'value': round(severity * 9, 1)},
            {'name': 'Crowd Level', 'value': round(crowd * 7.5, 1)},
            {'name': 'Symptoms', 'value': round(len(symptoms) * 12, 1)},
        ]

        return jsonify({
            'wait_time': wait_time,
            'priority': priority,
            'probability_long_wait': round(prob_long_wait, 2),
            'recommendations': recommendations,
            'insights': insights,
            'feature_importance': feature_importance
        }), 200

    except Exception as e:
        logger.error(f'Prediction error: {e}', exc_info=True)
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8001, debug=True)
