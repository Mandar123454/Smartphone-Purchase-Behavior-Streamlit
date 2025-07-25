# 📱 Smartphone Purchase Prediction ML Project

A full-stack machine learning web application built with **Streamlit** and **Scikit-Learn**, focused on predicting whether a person will buy a new smartphone based on their demographics and behavior. This project includes classification models, SHAP explainability, clustering, and an interactive brand comparison tool.

---

## 📂 Dataset Overview

📄 **File Used**: `smartphone_purchase_data.csv`

| Feature         | Description                                             |
|-----------------|---------------------------------------------------------|
| `Age`           | Age of the customer                                     |
| `Income`        | Monthly income in INR                                   |
| `Brand`         | Interested phone brand                                  |
| `Time_Spent`    | Minutes spent on phone-related websites                 |
| `Phone_Age`     | Current phone age                                       |
| `Will_Purchase` | Target variable (1 = Buy, 0 = Not Buy)                  |

✅ No missing values  
✅ Clean and well-structured data

---

## 🧠 Step-by-Step Project Workflow

### ✅ Step 1: Import Libraries & Load Dataset
- Imported essential libraries: `pandas`, `numpy`, `matplotlib`, `seaborn`, `sklearn`
- Loaded the dataset and viewed shape, column names, types, and basic summary

### 🔎 Step 2: Understand the Data
- Used `.info()`, `.describe()` and `.isnull().sum()` for dataset insights
- Checked target balance and categorical/numerical distribution

### 📊 Step 3: Exploratory Data Analysis (EDA)
- **Histograms** for Age, Income, and Phone Age
- **Boxplots** to detect outliers
- **Countplots** to analyze categorical distributions
- Key Findings:
  - Younger individuals with higher income are more likely to buy
  - More time spent online browsing phones = higher buying tendency

### 📏 Step 4: Preprocessing
- Applied One-Hot Encoding on `Brand`
- Scaled numerical columns using `StandardScaler`
- Split into `X_train`, `X_test`, `y_train`, `y_test` with 80:20 ratio
- Addressed target imbalance using **SMOTE**

---

## 🤖 Step 5: Model Building & Evaluation

### 📘 Models Used:
- Logistic Regression
- Random Forest Classifier
- Support Vector Machine (SVM)

### 📈 Evaluation Metrics:
- Accuracy, Precision, Recall, F1 Score
- Confusion Matrix for visual performance comparison

| Model              | Accuracy | Precision | Recall | F1 Score |
|--------------------|----------|-----------|--------|----------|
| Logistic Regression| 82%      | 0.81      | 0.79   | 0.80     |
| Random Forest      | 89%      | 0.87      | 0.88   | 0.87     |
| SVM                | 85%      | 0.84      | 0.83   | 0.83     |

✅ **Random Forest performed best** in classification.

---

## 🌟 SHAP Feature Importance

📌 Used SHAP values to interpret Random Forest output  
📌 Visualized feature impact on each prediction  

---

## 🔵 KMeans Clustering

- Clustered users into groups based on Age, Income, Time Spent
- Optimal `k=3` chosen using the Elbow Method
- Helped in segmenting marketing targets

| Cluster | Description                              |
|---------|------------------------------------------|
| 0       | Low income, older users                  |
| 1       | Young users with moderate interest       |
| 2       | High-income, tech-savvy users            |

📊 Visualized using PCA plots and colored clusters.

---

## 🔧 Streamlit App Development (VS Code)

### 💻 Main Features:

- 📍 **Home Page**: Overview with sections and usage
- 🧪 **Model Prediction**: Enter user data and get prediction
- 📈 **SHAP Explainability**: Shows how features impact predictions
- 🔍 **KMeans Clustering**: View clusters on interactive plot
- 📊 **Phone Comparison Tool**:
  - Compare 2 brands 
  - Table, Probability of buying phone, recommendation among 2 (most likely to buy)

---

## 📌 Target Distribution

```python
sns.countplot(df['Will_Purchase'])
plt.title("Target Class Distribution")
```

## 📊 Age & Income Analysis
- Age groups 25–35 showed highest purchase intent
- Income above ₹40,000 showed stronger likelihood of buying

## 🔥 Correlation Heatmap
```python
sns.heatmap(df.corr(), annot=True, cmap='coolwarm')
```
🧠 Key Correlations:
- Income ↔ Will Purchase = Strong
- Time Spent ↔ Will Purchase = Moderate

## 📚 Learnings & Challenges
##💡 Learnings:
- Real-world classification with SMOTE balancing
- SHAP for explainable AI
- Deployment with Streamlit
- Clustering insights using KMeans

##❗ Challenges:
- Balancing data without overfitting
- Integrating SHAP into the app
- Designing a clean, interactive UI

## 🖥️ Tech Stack Used

| Tool               | Purpose                        |
| ------------------ | ------------------------------ |
| Python             | Core ML & scripting            |
| Pandas             | Data handling                  |
| Sklearn            | Model building & preprocessing |
| Matplotlib/Seaborn | Data visualization             |
| SHAP               | Model explainability           |
| Streamlit          | Web app framework              |
| VS Code            | Local development              |


## 📝 Final Notes
- ✅ Models Trained
- ✅ App Deployed
- ✅ EDA Visualized
- ✅ SHAP Integrated
- ✅ Clusters Identified
- ✅ Phones Compared

## 👨‍💻 Developer Info & Footer
👤 Developed By: Mandar Kajbaje
