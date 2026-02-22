import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./Signup.css";
import { isAuthenticated } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: "",
    semester: "",
    department: "",
    rollno: "",
    dob: ""
  });
  const [message, setMessage] = useState("");

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const navigate = useNavigate();
  useEffect(() => {
    // if (isAuthenticated()) navigate('/dashboard');
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const { name, email, role, password, confirmPassword, semester, department, rollno, dob } = formData;

    if (!name || !email || !role || !password || !confirmPassword) {
      setMessage("All fields are required.");
      return;
    }
    if (role === 'student' && (!semester || !department || !rollno || !dob)) {
      setMessage("Semester, department, roll no, and date of birth are required for students.");
      return;
    }
    if (role === 'staff' && !department) {
      setMessage("Department is required for staff.");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }
    try {
      const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiBase}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role, password, semester, department, rollno, dob })
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message || 'Signup failed');
        return;
      }
      setMessage(data.message || 'Signup successful');
      setFormData({ name: "", email: "", role: "", password: "", confirmPassword: "", semester: "", department: "", rollno: "", dob: "" });
      navigate('/signin');
    } catch (err) {
      console.error(err);
      setMessage('Network error');
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        background: "linear-gradient(135deg, #f6f7f8 0%, #e9ecef 100%)",
      }}
    >
      <div className="col-11 col-sm-8 col-md-6 col-lg-4">
        <div className="text-center mb-4 mb-md-5">
          <div
            className="d-inline-flex align-items-center justify-content-center rounded bg-primary text-white mb-3"
            style={{ width: '60px', height: '60px' }}
          >
            <i className="bi bi-person-circle fs-4"></i>
          </div>
          <h2 className="fw-bold">SLOIS</h2>
        </div>
        <div className="card shadow-lg border-0">
          <div className="card-body p-4">
            <h4 className="text-center mb-4">Create an Account</h4>

            <form onSubmit={handleSubmit}>
              {/* Name */}
              <div className="mb-3">
                <label className="form-label fw-bold">Full Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              {/* Email */}
              <div className="mb-3">
                <label className="form-label fw-bold">Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="student@university.edu"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              {/* Role */}
              <div className="mb-3">
                <label className="form-label fw-bold">Role</label>
                <select
                  name="role"
                  className="form-select"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="">Select your role</option>
                  <option value="student">Student</option>
                  <option value="staff">Academic Staff</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              {/* Role-specific fields */}
              {(formData.role === 'student' || formData.role === 'staff') && (
                <>
                  {formData.role === 'student' && (
                    <div className="mb-3">
                      <label className="form-label fw-bold">Semester</label>
                      <select
                        name="semester"
                        className="form-select"
                        value={formData.semester}
                        onChange={handleChange}
                      >
                        <option value="">Select semester</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                      </select>
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label fw-bold">Department</label>
                    <select
                      name="department"
                      className="form-select"
                      value={formData.department}
                      onChange={handleChange}
                    >
                      <option value="">Select department</option>
                      <option value="AI & DS">AI & DS</option>
                      <option value="AI & ML">AI & ML</option>
                      <option value="CSE">CSE</option>
                      <option value="IT">IT</option>
                      <option value="ECE">ECE</option>
                      <option value="EEE">EEE</option>
                      <option value="EIE">EIE</option>
                      <option value="ME">ME</option>
                      <option value="ISE">ISE</option>
                      <option value="BT">BT</option>
                    </select>
                  </div>

                  {formData.role === 'student' && (
                    <>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Roll No</label>
                        <input
                          type="text"
                          name="rollno"
                          className="form-control"
                          placeholder="Enter roll number"
                          value={formData.rollno}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Date of Birth</label>
                        <input
                          type="date"
                          name="dob"
                          className="form-control"
                          value={formData.dob}
                          onChange={handleChange}
                        />
                      </div>
                    </>
                  )}
                </>
              )}

              {/* Password */}
              <div className="mb-3">
                <label className="form-label fw-bold">Password</label>
                <div className="input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={togglePassword}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="mb-3">
                <label className="form-label fw-bold">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-control"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>

              {/* Submit */}
              <div className="d-grid mt-4">
                <button type="submit" className="btn btn-primary fw-bold">
                  Sign Up
                </button>
              </div>

              {message && (
                <div className="alert alert-info mt-3 text-center">
                  {message}
                </div>
              )}
            </form>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
