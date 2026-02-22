import streamlit as st
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import plotly.express as px
import sys
import os

# Add server directory to path for imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'server')))
from predict import get_prediction, predict_all_students

st.set_page_config(page_title="Student Outcome Intelligence", layout="wide")

st.title("🎓 Student CGPA Prediction System")
st.markdown("---")

# Automated Batch Processing Section
st.subheader("🤖 Automated Intelligence Operations")
if st.button("Run Automated Batch Prediction for All Students"):
    with st.spinner("Processing large-scale academic records..."):
        status = predict_all_students()
        if "Successfully" in status:
            st.success(status)
        else:
            st.error(status)
st.markdown("---")

# Sidebar for Input
st.sidebar.header("Enter Student Details")
name = st.sidebar.text_input("Full Name")
rollno = st.sidebar.text_input("Roll Number")
email = st.sidebar.text_input("Email Address")
semester = st.sidebar.selectbox("Semester", list(range(1, 9)))

st.sidebar.subheader("Academic Performance")
internal = st.sidebar.slider("Internal Marks Avg (0-40)", 0.0, 40.0, 25.0)
assignment = st.sidebar.slider("Assignment Marks Avg (0-20)", 0.0, 20.0, 15.0)
practical = st.sidebar.slider("Practical Marks Avg (0-40)", 0.0, 40.0, 30.0)
attendance = st.sidebar.slider("Attendance %", 30.0, 100.0, 75.0)
prev_cgpa = st.sidebar.number_input("Previous CGPA", 0.0, 10.0, 7.0)

# Main Application Logic
if st.sidebar.button("Predict Outcome"):
    if name and rollno and email:
        data = {
            "name": name,
            "rollno": rollno,
            "email": email,
            "semester": semester,
            "internal_avg": internal,
            "assignment_avg": assignment,
            "practical_avg": practical,
            "attendance": attendance,
            "prev_cgpa": prev_cgpa
        }
        
        prediction = get_prediction(data)
        
        if prediction:
            col1, col2 = st.columns(2)
            
            with col1:
                st.success(f"### Predicted CGPA: {prediction}")
                st.info("Data has been synced with the Academic Intelligence Database.")
                
            with col2:
                # Gauge Chart for Prediction
                fig = px.pie(values=[prediction, 10-prediction], names=['Predicted', 'Remaining'], 
                             hole=0.7, color_discrete_sequence=['#0d6efd', '#e9ecef'])
                fig.update_layout(showlegend=False, title="Outcome Probability")
                st.plotly_chart(fig)

            # Visualization Section
            st.subheader("Performance Analysis")
            metrics_df = pd.DataFrame({
                "Category": ["Internals", "Assignments", "Practicals", "Attendance"],
                "Score %": [(internal/40)*100, (assignment/20)*100, (practical/40)*100, attendance]
            })
            
            fig_bar = px.bar(metrics_df, x="Category", y="Score %", color="Category", 
                             title="Current Semester Strength Analysis")
            st.plotly_chart(fig_bar, use_container_width=True)
            
    else:
        st.error("Please fill in all identity fields (Name, Roll No, Email)")

# Dashboard Preview (Static Demo Data)
st.markdown("---")
st.subheader("Trend Analysis (Reference Data)")
# Generate some dummy data for demo charts
t = np.linspace(0, 10, 100)
y = np.sin(t) + 7
demo_df = pd.DataFrame({"Semester": np.random.randint(1, 8, 50), "CGPA": np.random.uniform(5, 10, 50)})

fig_scatter = px.scatter(demo_df, x="Semester", y="CGPA", trendline="ols", title="Historical Class Trends")
st.plotly_chart(fig_scatter, use_container_width=True)
