import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder

def preprocess_data(df):
    # Remove User_ID if present
    if 'User_ID' in df.columns:
        df = df.drop('User_ID', axis=1)
    # Fill missing values
    df = df.fillna(method='ffill')
    # Encode categorical variables (Brand_Preference, Preferred_OS)
    for col in ['Brand_Preference', 'Preferred_OS']:
        if col in df.columns:
            le = LabelEncoder()
            df[col] = le.fit_transform(df[col])
    return df

def split_data(df, target_column):
    X = df.drop(target_column, axis=1)
    y = df[target_column]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    scaler = StandardScaler()
    X_train = scaler.fit_transform(X_train)
    X_test = scaler.transform(X_test)
    return X_train, X_test, y_train, y_test

if __name__ == '__main__':
    df = pd.read_csv('data/smartphone_purchase_data.csv')
    df = preprocess_data(df)
    X_train, X_test, y_train, y_test = split_data(df, target_column='Purchased')
    print('Train shape:', X_train.shape)
    print('Test shape:', X_test.shape)
