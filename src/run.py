"""
Run Script
This script trains the model and starts the API server.
"""
import os
import importlib
import subprocess
import sys

def main():
    print("Starting Smartphone Purchase Prediction System...")
    
    # Get the project root directory
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # Add project root to path
    sys.path.append(project_root)
    
    # Train model
    print("\n===== Training Model =====")
    try:
        from src import train_model
        importlib.reload(train_model)
        train_model.main()
        print("Model training completed successfully!")
    except Exception as e:
        print(f"Error during model training: {e}")
        print("Will try to continue with API startup...")
    
    # Start API server
    print("\n===== Starting API Server =====")
    try:
        from src import api
        print("API server is running at http://localhost:5000")
        print("Use Ctrl+C to stop the server")
        api.app.run(host='0.0.0.0', port=5000, debug=True)
    except Exception as e:
        print(f"Error starting API server: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
