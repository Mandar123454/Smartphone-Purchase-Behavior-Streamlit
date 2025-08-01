import pandas as pd
import numpy as np

def load_data(path='data/smartphone_purchase_data.csv'):
    return pd.read_csv(path)

def explore_data(df):
    print('Shape:', df.shape)
    print('Columns:', df.columns.tolist())
    print(df.head())
    print(df.describe())
    print(df.info())
    # Visualize new features
    import matplotlib.pyplot as plt
    import seaborn as sns
    plt.figure(figsize=(8,4))
    sns.histplot(df['Online_Activity_Score'], kde=True)
    plt.title('Distribution of Online Activity Score')
    plt.show()
    plt.figure(figsize=(8,4))
    sns.countplot(x='Tech_Savvy', data=df)
    plt.title('Tech Savvy Distribution')
    plt.show()

if __name__ == '__main__':
    df = load_data()
    explore_data(df)
