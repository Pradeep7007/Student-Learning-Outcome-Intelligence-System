import joblib
import pandas as pd
import numpy as np
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB Connection
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/student-slo")
client = MongoClient(MONGO_URI)
db = client.get_database()
ml_collection = db['mlpredicts']

# Load Model
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'student_model.pkl')

def predict_all_students():
    """
    Automated process to fetch all academic records, predict outcomes, and store results.
    """
    try:
        # 1. Load the trained model
        if not os.path.exists(MODEL_PATH):
            return "Error: Trained model file (student_model.pkl) not found. Train the model first."
        
        model = joblib.load(MODEL_PATH)
        
        # 2. Fetch all academic records
        records = list(db['academicrecords'].find({}))
        if not records:
            return "No academic records found in database."

        count = 0
        for rec in records:
            # Map subjects to averages for model features
            subjects = rec.get('subjects', [])
            if not subjects: continue
            
            int_avg = sum(s.get('internalMark', 0) for s in subjects) / len(subjects)
            ass_avg = sum(s.get('assignmentMark', 0) for s in subjects) / len(subjects)
            prac_avg = sum(s.get('practicalMark', 0) for s in subjects) / len(subjects)
            
            # Prepare input features as a DataFrame to avoid feature name warnings
            feature_names = ['internal_avg', 'assignment_avg', 'practical_avg', 'attendance', 'prev_cgpa']
            features_df = pd.DataFrame([[
                int_avg, 
                ass_avg, 
                prac_avg, 
                rec.get('attendancePercentage', 0),
                rec.get('previousSemCGPA', 0)
            ]], columns=feature_names)
            
            # 3. Predict
            prediction = model.predict(features_df)[0]
            predicted_cgpa = round(float(prediction), 2)
            
            # 4. Store in mlpredicts schema
            result = {
                "studentName": rec.get('studentName'),
                "rollno": rec.get('rollno'),
                "email": rec.get('email'),
                "semester": rec.get('semester'),
                "predictedCGPA": predicted_cgpa
            }
            
            ml_collection.update_one(
                {"rollno": rec.get('rollno'), "semester": rec.get('semester')},
                {"$set": result},
                upsert=True
            )
            count += 1
            
        return f"Successfully processed and stored predictions for {count} students."
    except Exception as e:
        return f"Automation Error: {e}"

def get_prediction(data):
    # (Remains same for individual manual checks in Streamlit)
    try:
        model = joblib.load(MODEL_PATH)
        feature_names = ['internal_avg', 'assignment_avg', 'practical_avg', 'attendance', 'prev_cgpa']
        input_data = pd.DataFrame([[
            data['internal_avg'],
            data['assignment_avg'],
            data['practical_avg'],
            data['attendance'],
            data['prev_cgpa']
        ]], columns=feature_names)
        prediction = model.predict(input_data)[0]
        return round(float(prediction), 2)
    except Exception: return None

if __name__ == "__main__":
    print(predict_all_students())
