import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score
import joblib
import os

def train_student_model(csv_path=None):
    if csv_path is None:
        csv_path = os.path.join(os.path.dirname(__file__), 'pbl.csv')

    if not os.path.exists(csv_path):
        print(f"Error: {csv_path} not found. Please provide the dataset.")
        return

    # Load dataset
    print(f"Loading data from: {csv_path}")
    df = pd.read_csv(csv_path)
    
    # Selecting Features and Target based on user specific columns
    features = ['internal_avg', 'assignment_avg', 'practical_avg', 'attendance', 'prev_cgpa']
    target = 'target_cgpa'
    
    X = df[features]
    y = df[target]
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Initialize and train Model
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    # Evaluate
    predictions = model.predict(X_test)
    mse = mean_squared_error(y_test, predictions)
    r2 = r2_score(y_test, predictions)
    
    print(f"Model Training Complete.")
    print(f"Mean Squared Error: {mse:.4f}")
    print(f"R2 Score: {r2:.4f}")
    
    # Save Model
    model_save_path = os.path.join(os.path.dirname(__file__), 'student_model.pkl')
    joblib.dump(model, model_save_path)
    print(f"Model saved at: {model_save_path}")

if __name__ == "__main__":
    train_student_model( )
