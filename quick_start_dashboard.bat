@echo off
echo.
echo =====================================================
echo      Running the Dashboard (Quick Start Mode)
echo =====================================================
echo.
echo This script will:
echo 1. Generate new sample data
echo 2. Start the dashboard server
echo.
echo Press any key to continue...
pause > nul

:: Generate sample data
echo.
echo Generating fresh sample data...

:: Create Python script to generate sample data
echo import pandas as pd > temp_generate_data.py
echo import numpy as np >> temp_generate_data.py
echo import random >> temp_generate_data.py
echo import os >> temp_generate_data.py
echo. >> temp_generate_data.py
echo # Create data directory if it doesn't exist >> temp_generate_data.py
echo os.makedirs('data', exist_ok=True) >> temp_generate_data.py
echo. >> temp_generate_data.py
echo # Set seed for reproducibility >> temp_generate_data.py
echo np.random.seed(42) >> temp_generate_data.py
echo random.seed(42) >> temp_generate_data.py
echo. >> temp_generate_data.py
echo # Generate 100 random samples >> temp_generate_data.py
echo n_samples = 100 >> temp_generate_data.py
echo. >> temp_generate_data.py
echo # Generate data >> temp_generate_data.py
echo data = { >> temp_generate_data.py
echo     'User_ID': range(1, n_samples + 1), >> temp_generate_data.py
echo     'Age': [random.randint(18, 65) for _ in range(n_samples)], >> temp_generate_data.py
echo     'Salary': [random.randint(25000, 150000) for _ in range(n_samples)], >> temp_generate_data.py
echo     'Brand_Preference': [random.choice(['Apple', 'Samsung', 'Xiaomi', 'OnePlus', 'Google']) for _ in range(n_samples)], >> temp_generate_data.py
echo     'Online_Activity_Score': [random.randint(10, 100) for _ in range(n_samples)], >> temp_generate_data.py
echo     'Tech_Savvy': [random.choice(['0', '1']) for _ in range(n_samples)], >> temp_generate_data.py
echo     'Previous_Purchases': [random.randint(0, 10) for _ in range(n_samples)], >> temp_generate_data.py
echo     'Preferred_OS': [random.choice(['Android', 'iOS']) for _ in range(n_samples)], >> temp_generate_data.py
echo     'Loyalty_Score': [random.randint(1, 10) for _ in range(n_samples)], >> temp_generate_data.py
echo     'Avg_Session_Time': [round(random.uniform(0.5, 5.0), 1) for _ in range(n_samples)], >> temp_generate_data.py
echo     'Social_Media_Influence': [random.randint(10, 100) for _ in range(n_samples)], >> temp_generate_data.py
echo     'Warranty_Interest': [random.choice(['0', '1']) for _ in range(n_samples)], >> temp_generate_data.py
echo } >> temp_generate_data.py
echo. >> temp_generate_data.py
echo # Calculate purchase probability based on features >> temp_generate_data.py
echo def calculate_purchase_prob(row): >> temp_generate_data.py
echo     prob = 0.3 >> temp_generate_data.py
echo     if row['Age'] < 30: prob += 0.1 >> temp_generate_data.py
echo     if row['Salary'] > 70000: prob += 0.15 >> temp_generate_data.py
echo     if row['Online_Activity_Score'] > 70: prob += 0.1 >> temp_generate_data.py
echo     if row['Tech_Savvy'] == '1': prob += 0.2 >> temp_generate_data.py
echo     if row['Previous_Purchases'] > 2: prob += 0.1 >> temp_generate_data.py
echo     if row['Loyalty_Score'] > 7: prob += 0.15 >> temp_generate_data.py
echo     return prob >> temp_generate_data.py
echo. >> temp_generate_data.py
echo # Create DataFrame >> temp_generate_data.py
echo df = pd.DataFrame(data) >> temp_generate_data.py
echo. >> temp_generate_data.py
echo # Add purchase decision based on features >> temp_generate_data.py
echo df['purchase_prob'] = df.apply(calculate_purchase_prob, axis=1) >> temp_generate_data.py
echo df['Purchased'] = df['purchase_prob'].apply(lambda x: '1' if random.random() < x else '0') >> temp_generate_data.py
echo. >> temp_generate_data.py
echo # Add header comment >> temp_generate_data.py
echo with open('data/smartphone_purchase_data.csv', 'w') as f: >> temp_generate_data.py
echo     f.write("# Extended sample data with features for smartphone purchase prediction\\n") >> temp_generate_data.py
echo. >> temp_generate_data.py
echo # Save to CSV (append to file with header comment) >> temp_generate_data.py
echo df.drop('purchase_prob', axis=1).to_csv('data/smartphone_purchase_data.csv', index=False, mode='a') >> temp_generate_data.py
echo. >> temp_generate_data.py
echo print(f"Generated {n_samples} samples with {df['Purchased'].astype(int).sum()} purchases") >> temp_generate_data.py

:: Run the script to generate data
python temp_generate_data.py
del temp_generate_data.py

:: Start dashboard directly (without training the model)
echo.
echo Starting dashboard...
echo.
cd dashboard
echo Access the dashboard at: http://localhost:8000
echo Press Ctrl+C to stop the server when done.
echo.
start http://localhost:8000
python -m http.server
