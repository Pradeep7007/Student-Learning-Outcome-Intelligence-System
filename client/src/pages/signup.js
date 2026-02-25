import React, { useState } from "react";
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './Signup.css';

const Signup = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "student",
        password: "",
        confirmPassword: "",
        semester: "",
        department: "",
        rollno: "",
        dob: ""
    });
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRoleChange = (role) => {
        setFormData({ ...formData, role });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        const { name, email, role, password, confirmPassword, semester, department, rollno, dob } = formData;

        if (password !== confirmPassword) {
            setMessage("Passwords do not match.");
            return;
        }

        setIsLoading(true);
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
            setMessage('Account created successfully!');
            setTimeout(() => navigate('/signin'), 1500);
        } catch (err) {
            console.error(err);
            setMessage('Network error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="signup-page">
            <div className="signup-bg-blobs">
                <div className="signup-blob blob-1"></div>
                <div className="signup-blob blob-2"></div>
            </div>

            <motion.div 
                className="signup-card glass-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="signup-header">
                    <div className="signup-logo">
                        <span className="logo-icon">S</span>
                    </div>
                    <h2>Create Account</h2>
                    <p className="text-muted">Join the next generation education platform</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Full Name</label>
                            <div className="position-relative">
                                <i className="bi bi-person input-icon"></i>
                                <input name="name" type="text" className="input-premium" placeholder="John Doe" value={formData.name} onChange={handleChange} required />
                            </div>
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Email Address</label>
                            <div className="position-relative">
                                <i className="bi bi-envelope input-icon"></i>
                                <input name="email" type="email" className="input-premium" placeholder="name@company.com" value={formData.email} onChange={handleChange} required />
                            </div>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="form-label">I am a</label>
                        <div className="role-selector">
                            {['student', 'staff', 'admin'].map(r => (
                                <div 
                                    key={r}
                                    className={`role-chip ${formData.role === r ? 'active' : ''}`}
                                    onClick={() => handleRoleChange(r)}
                                >
                                    {r.charAt(0).toUpperCase() + r.slice(1)}
                                </div>
                            ))}
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {(formData.role === 'student' || formData.role === 'staff') && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="row overflow-hidden"
                            >
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Department</label>
                                    <div className="position-relative">
                                        <i className="bi bi-building input-icon"></i>
                                        <select name="department" className="select-premium" value={formData.department} onChange={handleChange} required>
                                            <option value="">Select Dept</option>
                                            <option value="AI & DS">AI & DS</option>
                                            <option value="AI & ML">AI & ML</option>
                                            <option value="CSE">CSE</option>
                                            <option value="IT">IT</option>
                                            <option value="ECE">ECE</option>
                                            <option value="EEE">EEE</option>
                                        </select>
                                    </div>
                                </div>
                                {formData.role === 'student' && (
                                    <>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Semester</label>
                                            <div className="position-relative">
                                                <i className="bi bi-calendar-event input-icon"></i>
                                                <select name="semester" className="select-premium" value={formData.semester} onChange={handleChange} required>
                                                    <option value="">Select Sem</option>
                                                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Roll Number</label>
                                            <div className="position-relative">
                                                <i className="bi bi-card-text input-icon"></i>
                                                <input name="rollno" type="text" className="input-premium" placeholder="22XX01" value={formData.rollno} onChange={handleChange} required />
                                            </div>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Date of Birth</label>
                                            <div className="position-relative">
                                                <i className="bi bi-calendar input-icon"></i>
                                                <input name="dob" type="date" className="input-premium" value={formData.dob} onChange={handleChange} required />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Password</label>
                            <div className="position-relative">
                                <i className="bi bi-lock input-icon"></i>
                                <input name="password" type={showPassword ? "text" : "password"} className="input-premium" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
                            </div>
                        </div>
                        <div className="col-md-6 mb-4">
                            <label className="form-label">Confirm Password</label>
                            <div className="position-relative">
                                <i className="bi bi-shield-lock input-icon"></i>
                                <input name="confirmPassword" type="password" className="input-premium" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} required />
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="btn-premium w-100 mb-3" disabled={isLoading}>
                        {isLoading ? "Creating Account..." : "Create Account"}
                    </button>

                    {message && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`alert ${message.includes('success') ? 'alert-success' : 'alert-danger'} py-2 text-center small`}
                        >
                            {message}
                        </motion.div>
                    )}

                    <div className="signup-footer">
                        Already have an account? <Link to="/signin">Sign in</Link>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default Signup;
