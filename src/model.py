import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
from preprocessing import preprocess_data, split_data

def train_model(X_train, y_train):
    model = RandomForestClassifier(random_state=42)
    model.fit(X_train, y_train)
    return model

def evaluate_model(model, X_test, y_test):
    y_pred = model.predict(X_test)
    print('Accuracy:', accuracy_score(y_test, y_pred))
    print(classification_report(y_test, y_pred))

if __name__ == '__main__':
    df = pd.read_csv('data/smartphone_purchase_data.csv')
    df = preprocess_data(df)
    X_train, X_test, y_train, y_test = split_data(df, target_column='Purchased')
    model = train_model(X_train, y_train)
    evaluate_model(model, X_test, y_test)
