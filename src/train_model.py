"""
Model Training Script
This script trains the model and saves it to the models directory.
"""
import os
import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import classification_report, accuracy_score, roc_auc_score
import matplotlib.pyplot as plt
import seaborn as sns

def main():
    print("Starting model training...")
    
    # Create models directory if it doesn't exist
    models_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models')
    os.makedirs(models_dir, exist_ok=True)
    
    # Load data
    data_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'smartphone_purchase_data.csv')
    # Skip comment lines and properly parse the CSV
    df = pd.read_csv(data_path, comment='#')
    print(f"Loaded dataset with shape: {df.shape}")
    print(f"Columns found: {df.columns.tolist()}")
    
    # Preprocess data
    if 'User_ID' in df.columns:
        df = df.drop('User_ID', axis=1)
    
    # Encode categorical variables
    encoders = {}
    for col in ['Brand_Preference', 'Preferred_OS']:
        if col in df.columns:
            print(f"Encoding {col}...")
            le = LabelEncoder()
            df[col] = le.fit_transform(df[col])
            encoders[col] = le
    
    # Split data
    X = df.drop('Purchased', axis=1)
    y = df['Purchased'].astype(int)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    print(f"Training set: {X_train.shape}, Test set: {X_test.shape}")
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    print("Training RandomForest model...")
    # Define parameter grid for hyperparameter tuning
    param_grid = {
        'n_estimators': [50, 100, 200],
        'max_depth': [None, 10, 20],
        'min_samples_split': [2, 5, 10],
        'min_samples_leaf': [1, 2, 4]
    }
    
    # Perform grid search (uncomment for hyperparameter tuning)
    # rf = RandomForestClassifier(random_state=42)
    # grid_search = GridSearchCV(estimator=rf, param_grid=param_grid, cv=5, n_jobs=-1, verbose=1, scoring='roc_auc')
    # grid_search.fit(X_train_scaled, y_train)
    # best_params = grid_search.best_params_
    # print(f"Best parameters: {best_params}")
    # model = grid_search.best_estimator_
    
    # Train final model
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train_scaled, y_train)
    
    # Evaluate model
    y_pred = model.predict(X_test_scaled)
    y_proba = model.predict_proba(X_test_scaled)[:, 1]
    
    print("\nModel Evaluation:")
    print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")
    print(f"ROC-AUC: {roc_auc_score(y_test, y_proba):.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    # Feature importance
    feature_importance = pd.DataFrame({
        'feature': X.columns,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    print("\nFeature Importance:")
    print(feature_importance.head(10))
    
    # Save model and preprocessing objects
    joblib.dump(model, os.path.join(models_dir, 'model.pkl'))
    joblib.dump(scaler, os.path.join(models_dir, 'scaler.pkl'))
    joblib.dump(encoders, os.path.join(models_dir, 'encoder.pkl'))
    
    print("\nModel and preprocessing objects saved successfully!")

if __name__ == "__main__":
    main()
