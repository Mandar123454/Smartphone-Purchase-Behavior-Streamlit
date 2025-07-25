import streamlit as st
import pandas as pd
import pickle
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import confusion_matrix, accuracy_score, roc_curve, auc
from sklearn.preprocessing import LabelEncoder
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
import shap

# Page Setup
st.set_page_config(page_title="Predictive Modeling For Smartphone Purchase Behavior Dashboard", layout="wide")
st.title("📱 Predictive Modeling For Smartphone Purchase Behavior Dashboard")
st.markdown("---")

# Load Data
@st.cache_data
def load_data():
    return pd.read_csv("smartphone_purchase_data.csv")

# Load the model
with open("model.pkl", "rb") as file:
    model = pickle.load(file)

# Load model columns
with open("model_columns.pkl", "rb") as f:
    model_cols = pickle.load(f)

# Load the model scaler
with open("scaler.pkl", "rb") as f:
    scaler = pickle.load(f)

# Load the preprocessed, numeric test data
X_test = pd.read_csv("X_test_scaled.csv")


df = load_data()

# Section 1: Project Overview
st.sidebar.title("📊 Dashboard Sections")
sections = st.sidebar.radio("Go to:", [
    "Project Overview",
    "Target Distribution",
    "Age & Income Analysis",
    "Correlation Heatmap",
    "Model Performance",
    "SHAP Feature Importance",
    "KMeans Clustering",
    "Phone Comparison Tool",
    "Developer & Footer"
])

# Section: Overview
if sections == "Project Overview":
    st.header("📌 Project Description")
    st.markdown("""
    This dashboard presents a predictive model to identify users who are likely to buy a new smartphone.  
    The process includes:
    - Exploratory Data Analysis  
    - Machine Learning Model Evaluation  
    - Feature Importance via SHAP  
    - Clustering  
    - An Interactive Tool to Compare Smartphone Options  
    """)


# Section: Target Distribution
elif sections == "Target Distribution":
    st.header("🎯 Target Variable Distribution")
    fig, ax = plt.subplots()
    sns.countplot(x='will_purchase', data=df, ax=ax)
    ax.set_title("Will Purchase Distribution")
    st.pyplot(fig)

# Section: Age & Income
elif sections == "Age & Income Analysis":
    st.header("👤 Age & 💰 Income Distribution")

    col1, col2 = st.columns(2)

    with col1:
        fig1, ax1 = plt.subplots()
        sns.histplot(df['age'], kde=True, ax=ax1)
        ax1.set_title("Age Distribution")
        st.pyplot(fig1)

    with col2:
        fig2, ax2 = plt.subplots()
        sns.boxplot(y='income', data=df, ax=ax2)
        ax2.set_title("Income Spread")
        st.pyplot(fig2)

# Section: Heatmap
elif sections == "Correlation Heatmap":
    st.header("📊 Correlation Heatmap")
    numeric_df = df.select_dtypes(include=[np.number])
    fig, ax = plt.subplots(figsize=(10, 6))
    sns.heatmap(numeric_df.corr(), annot=True, cmap='coolwarm', fmt=".2f", ax=ax)
    st.pyplot(fig)

# Section: Model Performance
elif sections == "Model Performance":
    st.header("⚙️ Model Performance")

    # Preprocess
    X = df.drop(['will_purchase', 'brand'], axis=1)
    y = df['will_purchase']

    le = LabelEncoder()
    for col in X.select_dtypes(include='object').columns:
        X[col] = le.fit_transform(X[col])

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model = RandomForestClassifier(random_state=42)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)

    st.metric("🎯 Accuracy", f"{acc * 100:.2f}%")

    # Confusion Matrix
    cm = confusion_matrix(y_test, y_pred)
    fig, ax = plt.subplots()
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', ax=ax)
    ax.set_title("Confusion Matrix")
    st.pyplot(fig)

    # ROC Curve
    y_proba = model.predict_proba(X_test)[:, 1]
    fpr, tpr, _ = roc_curve(y_test, y_proba)
    roc_auc = auc(fpr, tpr)

    fig2, ax2 = plt.subplots()
    ax2.plot(fpr, tpr, label=f"AUC = {roc_auc:.2f}")
    ax2.plot([0, 1], [0, 1], 'r--')
    ax2.set_title("ROC Curve")
    ax2.legend()
    st.pyplot(fig2)

# Section: SHAP

elif sections == "SHAP Feature Importance":
    st.header("📉 SHAP Feature Importance")

    # Load scaled, encoded X_test
    X_test = pd.read_csv("X_test_scaled.csv")

    # SHAP
    explainer = shap.Explainer(model, X_test)
    shap_values = explainer(X_test)

    # SHAP Summary Plot - Bar
    st.subheader("🔹 SHAP Summary Plot (Bar)")
    shap.summary_plot(shap_values, X_test, plot_type="bar")
    st.pyplot(plt.gcf())

    # SHAP Summary Plot - Beeswarm
    st.subheader("🔹 SHAP Summary Plot (Beeswarm)")
    shap.summary_plot(shap_values, X_test)
    st.pyplot(plt.gcf())



# Section: Clustering
elif sections == "KMeans Clustering":
    st.header("📊 KMeans Clustering")

    # Load the data
    df = pd.read_csv("X_test.csv")  # contains original features + Cluster

    # Drop the target
    X = df.drop("Cluster", axis=1)

    # Encode categorical columns (brand)
    X_encoded = pd.get_dummies(X, columns=["brand"], drop_first=True)

    # Optional: Scale the features (improves clustering)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X_encoded)

    # KMeans Clustering
    kmeans = KMeans(n_clusters=3, random_state=42)
    clusters = kmeans.fit_predict(X_scaled)

    df["cluster"] = clusters  # append cluster info to original df

    # Visualize
    fig, ax = plt.subplots()
    sns.scatterplot(data=df, x="age", y="income", hue="cluster", palette="Set2", ax=ax)
    ax.set_title("Customer Clusters based on Age & Income")
    st.pyplot(fig)


# Prepare features for prediction
def prepare_features(phone_name, df):
    row = df[df['brand'] == phone_name].copy()
    
    if 'buy' in row.columns:
        row = row.drop('buy', axis=1)
    
    row_encoded = pd.get_dummies(row, columns=['brand'], drop_first=True)
    
    for col in model_cols:
        if col not in row_encoded.columns:
            row_encoded[col] = 0
    
    row_encoded = row_encoded[model_cols]
    
    X_scaled = scaler.transform(row_encoded)
    return X_scaled


# Section: Phone Comparison Tool
if sections == "Phone Comparison Tool":
    st.header("🔍 Phone Comparison Tool")
    
    phone_1 = st.selectbox("Choose First Phone", df['brand'].unique())
    phone_2 = st.selectbox("Choose Second Phone", df['brand'].unique(), index=1)

    col1, col2 = st.columns(2)
    with col1:
        st.subheader(f"📱 {phone_1}")
        st.write(df[df['brand'] == phone_1].describe().T)

    with col2:
        st.subheader(f"📱 {phone_2}")
        st.write(df[df['brand'] == phone_2].describe().T)

    # Prepare features for both phones
    X1 = prepare_features(phone_1, df)
    X2 = prepare_features(phone_2, df)

    # Predict buy probabilities
    prob1 = model.predict_proba(X1)[0][1]
    prob2 = model.predict_proba(X2)[0][1]

    st.markdown("---")
    st.subheader("📊 Buy Probability Prediction")

    st.markdown(f"""
    - 📱 **Probability of buying {phone_1}**: <span style='color:green; font-weight:bold'>{prob1 * 100:.2f}%</span>  
    - 📱 **Probability of buying {phone_2}**: <span style='color:green; font-weight:bold'>{prob2 * 100:.2f}%</span>
    """, unsafe_allow_html=True)

    if prob1 > prob2:
        st.success(f"User is more likely to buy **{phone_1}** 📱⭐")
    elif prob2 > prob1:
        st.success(f"User is more likely to buy **{phone_2}** 📱⭐")
    else:
        st.info("User is equally likely to buy both phones.")





# Section: Footer
elif sections == "Developer & Footer":
    st.header("👨‍💻 Developer & Project Credits")
    st.markdown("""
    - Developed by: **Mandar Kajbaje**
    - Institution: BSc Computer Science, Final Year
    - Tools Used: Python, Pandas, Scikit-learn, SHAP, Streamlit, Seaborn, Matplotlib
    """)
    st.markdown("---")
    st.markdown("© 2025 Predictive Modeling For Smartphone Purchase Behavior | All Rights Reserved")
