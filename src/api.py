"""
API for Smartphone Purchase Prediction
This script serves model predictions via a Flask API for the dashboard.
"""
import os
import pandas as pd
import numpy as np
import joblib
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Paths
MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models', 'model.pkl')
SCALER_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models', 'scaler.pkl')
ENCODER_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models', 'encoder.pkl')

# Load model and preprocessing objects
try:
    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    encoders = joblib.load(ENCODER_PATH)
    print("Model and preprocessing objects loaded successfully")
except Exception as e:
    print(f"Error loading model or preprocessing objects: {e}")
    print("API will train a new model on first request")
    model = None
    scaler = None
    encoders = None

def train_model_if_needed():
    """Train model if it doesn't exist"""
    global model, scaler, encoders
    
    if model is None:
        from sklearn.ensemble import RandomForestClassifier
        from sklearn.preprocessing import StandardScaler, LabelEncoder
        from sklearn.model_selection import train_test_split
        
        # Create models directory if it doesn't exist
        os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
        
        # Load data
        data_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'smartphone_purchase_data.csv')
        df = pd.read_csv(data_path)
        
        # Preprocess data
        if 'User_ID' in df.columns:
            df = df.drop('User_ID', axis=1)
        
        # Encode categorical variables
        encoders = {}
        for col in ['Brand_Preference', 'Preferred_OS']:
            if col in df.columns:
                le = LabelEncoder()
                df[col] = le.fit_transform(df[col])
                encoders[col] = le
        
        # Split data
        X = df.drop('Purchased', axis=1)
        y = df['Purchased'].astype(int)
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Scale features
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        
        # Train model
        model = RandomForestClassifier(n_estimators=100, random_state=42)
        model.fit(X_train_scaled, y_train)
        
        # Save model and preprocessing objects
        joblib.dump(model, MODEL_PATH)
        joblib.dump(scaler, SCALER_PATH)
        joblib.dump(encoders, ENCODER_PATH)
        
        print("Model trained and saved successfully")

@app.route('/api/predict', methods=['POST'])
def predict():
    """API endpoint for making predictions"""
    try:
        # Train model if it doesn't exist
        train_model_if_needed()
        
        # Get data from request
        data = request.json
        
        # Convert to DataFrame
        input_data = pd.DataFrame([data])
        
        # Encode categorical variables
        for col, encoder in encoders.items():
            if col in input_data.columns:
                try:
                    input_data[col] = encoder.transform(input_data[col])
                except:
                    # Handle unknown categories
                    input_data[col] = 0
        
        # Scale features
        input_scaled = scaler.transform(input_data)
        
        # Make prediction
        probability = model.predict_proba(input_scaled)[0, 1]
        prediction = int(probability >= 0.5)
        
        # Get feature importances for this prediction
        importances = []
        if hasattr(model, 'feature_importances_'):
            feature_importance = model.feature_importances_
            features = input_data.columns
            importances = [{"feature": feature, "importance": float(importance)} 
                         for feature, importance in zip(features, feature_importance)]
            importances = sorted(importances, key=lambda x: x["importance"], reverse=True)
        
        # Prepare response
        response = {
            'prediction': prediction,
            'probability': float(probability),
            'feature_importances': importances
        }
        
        return jsonify(response)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/feature_importance', methods=['GET'])
def feature_importance():
    """API endpoint for getting overall feature importance"""
    try:
        # Train model if it doesn't exist
        train_model_if_needed()
        
        # Get feature names
        data_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'smartphone_purchase_data.csv')
        df = pd.read_csv(data_path)
        features = df.drop(['User_ID', 'Purchased'], axis=1, errors='ignore').columns
        
        # Get feature importances
        importances = []
        if hasattr(model, 'feature_importances_'):
            feature_importance = model.feature_importances_
            importances = [{"feature": feature, "importance": float(importance)} 
                          for feature, importance in zip(features, feature_importance)]
            importances = sorted(importances, key=lambda x: x["importance"], reverse=True)
        
        return jsonify(importances)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/data_summary', methods=['GET'])
def data_summary():
    """API endpoint for getting data summary statistics"""
    try:
        # Load data
        data_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'smartphone_purchase_data.csv')
        df = pd.read_csv(data_path)
        
        # Calculate summary statistics
        summary = {
            'total_records': len(df),
            'purchase_rate': float(df['Purchased'].mean()),
            'age_distribution': {
                'mean': float(df['Age'].mean()),
                'min': int(df['Age'].min()),
                'max': int(df['Age'].max())
            },
            'brand_distribution': df['Brand_Preference'].value_counts().to_dict(),
            'os_distribution': df['Preferred_OS'].value_counts().to_dict(),
            'tech_savvy_rate': float(df['Tech_Savvy'].astype(int).mean())
        }
        
        return jsonify(summary)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
