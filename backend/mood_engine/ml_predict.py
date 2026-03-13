import os
import joblib
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from django.conf import settings

MODEL_FILE = os.path.join(settings.BASE_DIR, 'mood_engine', 'ml_models', 'mood_predictor.pkl')

def train_dummy_model():
    """
    Trains a dummy model that predicts tomorrow's mood score
    based on today's sleep hours, stress score, and current mood.
    In production, this would read from the Data Warehouse.
    """
    os.makedirs(os.path.dirname(MODEL_FILE), exist_ok=True)
    
    # Dummy data
    np.random.seed(42)
    data = {
        'sleep_hours': np.random.uniform(4, 10, 100),
        'stress_score': np.random.uniform(0, 100, 100),
        'current_mood': np.random.uniform(20, 100, 100)
    }
    df = pd.DataFrame(data)
    
    # Target: tomorrow's mood (Current + (sleep-7)*5 - stress/10)
    df['next_day_mood'] = df['current_mood'] + (df['sleep_hours'] - 7) * 5 - (df['stress_score'] / 10)
    df['next_day_mood'] = df['next_day_mood'].clip(0, 100)
    
    X = df[['sleep_hours', 'stress_score', 'current_mood']]
    y = df['next_day_mood']
    
    model = RandomForestRegressor(n_estimators=10, random_state=42)
    model.fit(X, y)
    
    joblib.dump(model, MODEL_FILE)
    print("Dummy model trained and saved.")

def predict_mood(sleep_hours, stress_score, current_mood):
    """
    Loads the model and predicts tomorrow's mood.
    """
    if not os.path.exists(MODEL_FILE):
        train_dummy_model()
        
    model = joblib.load(MODEL_FILE)
    
    # Prepare input
    X_new = pd.DataFrame({
        'sleep_hours': [sleep_hours],
        'stress_score': [stress_score],
        'current_mood': [current_mood]
    })
    
    prediction = model.predict(X_new)[0]
    return max(0, min(100, round(prediction, 2)))
