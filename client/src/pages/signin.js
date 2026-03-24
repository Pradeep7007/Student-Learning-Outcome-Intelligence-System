import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { setAuth } from '../utils/auth';
import { motion } from 'framer-motion';
import './Signin.css';
import API_BASE_URL from '../config';

// Fallback if API_BASE_URL is not properly configured
const API_URL = API_BASE_URL || 'http://localhost:5000';

const Signin = () => {
    const [role, setRole] = useState('student');
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Forgot / reset
    const [showForgot, setShowForgot] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!role) { 
            setMessage('Please select a role'); 
            return; 
        }
        if (!email || !password) {
            setMessage('Please enter both email and password');
            return;
        }
        
        setIsLoading(true);
        setMessage('');
        
        try {
            const url = `${API_URL}/api/auth/login`;
            console.log('Attempting login to:', url);
            
            const res = await fetch(url, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email, password, role })
            });
            
            // Check if response is JSON
            const contentType = res.headers.get('content-type');
            let data;
            
            if (contentType && contentType.includes('application/json')) {
                data = await res.json();
            } else {
                const text = await res.text();
                console.error('Non-JSON response:', text);
                data = { message: 'Server returned invalid response format' };
            }
            
            if (!res.ok) {
                console.error('Login failed:', data);
                setMessage(data.message || `Login failed with status ${res.status}`);
                setIsLoading(false);
                return;
            }
            
            // Validate role match
            if (data.user && data.user.role !== role) {
                setMessage(`You are registered as a ${data.user.role}. Please select the correct role.`);
                setIsLoading(false);
                return;
            }
            
            // Save auth data
            if (data.token) {
                setAuth(data);
                setMessage('Login successful! Redirecting...');
                setTimeout(() => navigate('/dashboard'), 1000);
            } else {
                setMessage('Login successful but no token received');
                setIsLoading(false);
            }
            
        } catch (err) {
            console.error('Network error details:', err);
            
            // Provide more specific error messages
            if (err.message.includes('Failed to fetch')) {
                setMessage('Cannot connect to server. Please ensure the backend is running at ' + API_URL);
            } else if (err.message.includes('CORS')) {
                setMessage('CORS error. Please check backend CORS configuration.');
            } else {
                setMessage('Network error: ' + (err.message || 'Unable to connect to server'));
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateToken = async () => {
        if (!forgotEmail) {
            setMessage('Please enter your email');
            return;
        }
        
        try {
            const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email: forgotEmail })
            });
            
            const contentType = res.headers.get('content-type');
            let data;
            
            if (contentType && contentType.includes('application/json')) {
                data = await res.json();
            } else {
                data = { message: 'Invalid server response' };
            }
            
            if (res.ok) {
                setResetToken(data.token || '');
                setMessage('Reset token generated! Check your email.');
            } else {
                setMessage(data.message || 'Failed to generate token');
            }
        } catch (err) {
            console.error('Token generation error:', err);
            setMessage('Network error: Cannot connect to server');
        }
    };

    const handleResetPassword = async () => {
        if (!resetToken || !newPassword) {
            setMessage('Please enter both token and new password');
            return;
        }
        
        try {
            const res = await fetch(`${API_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ 
                    token: resetToken, 
                    password: newPassword 
                })
            });
            
            const contentType = res.headers.get('content-type');
            let data;
            
            if (contentType && contentType.includes('application/json')) {
                data = await res.json();
            } else {
                data = { message: 'Invalid server response' };
            }
            
            if (res.ok) {
                setMessage('Password reset successful! Please login.');
                setShowForgot(false);
                setResetToken('');
                setNewPassword('');
                setForgotEmail('');
            } else {
                setMessage(data.message || 'Failed to reset password');
            }
        } catch (err) {
            console.error('Password reset error:', err);
            setMessage('Network error: Cannot connect to server');
        }
    };

    return (
        <div className="signin-page">
            <div className="signin-bg-blobs">
                <div className="signin-blob blob-1"></div>
                <div className="signin-blob blob-2"></div>
            </div>

            <motion.div 
                className="signin-card glass-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="signin-header">
                    <div className="signin-logo">
                        <span className="logo-icon">S</span>
                    </div>
                    <h2>Welcome Back</h2>
                    <p className="text-muted">Enter your credentials to access your account</p>
                </div>

                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label className="form-label">Sign in as</label>
                        <div className="role-selector">
                            {['student', 'staff', 'admin'].map(r => (
                                <div 
                                    key={r}
                                    className={`role-chip ${role === r ? 'active' : ''}`}
                                    onClick={() => setRole(r)}
                                >
                                    {r.charAt(0).toUpperCase() + r.slice(1)}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="input-group-premium">
                        <label className="form-label">Email Address</label>
                        <div className="position-relative">
                            <i className="bi bi-envelope input-icon"></i>
                            <input 
                                type="email" 
                                className="input-premium" 
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group-premium">
                        <label className="form-label">Password</label>
                        <div className="position-relative">
                            <i className="bi bi-lock input-icon"></i>
                            <input 
                                type={showPassword ? "text" : "password"} 
                                className="input-premium" 
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button 
                                type="button" 
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                            </button>
                        </div>
                    </div>

                    <Link to="#" className="forgot-link" onClick={() => setShowForgot(!showForgot)}>
                        Forgot password?
                    </Link>

                    <button type="submit" className="btn-premium w-100 mb-3" disabled={isLoading}>
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>

                    {message && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className={`alert ${message.includes('successful') || message.includes('generated') ? 'alert-success' : 'alert-danger'} py-2 text-center small`}
                        >
                            {message}
                        </motion.div>
                    )}
                </form>

                {showForgot && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-4 p-3 border rounded bg-light small"
                    >
                        <h6 className="fw-bold">Forgot Password?</h6>
                        <div className="mb-2">
                            <input 
                                className="form-control form-control-sm" 
                                placeholder="Registered email" 
                                value={forgotEmail} 
                                onChange={e => setForgotEmail(e.target.value)} 
                            />
                        </div>
                        <div className="d-flex gap-2 mb-3">
                            <button 
                                className="btn btn-sm btn-primary flex-grow-1" 
                                onClick={handleGenerateToken}
                            >
                                Generate Token
                            </button>
                        </div>

                        {resetToken && (
                            <div className="mt-3">
                               <label className="form-label small">Reset Token</label>
                                <input 
                                    className="form-control form-control-sm mb-2" 
                                    readOnly 
                                    value={resetToken} 
                                />
                                <input 
                                    className="form-control form-control-sm mb-2" 
                                    type="password" 
                                    placeholder="New password" 
                                    value={newPassword} 
                                    onChange={e => setNewPassword(e.target.value)} 
                                />
                                <button 
                                    className="btn btn-sm btn-success w-100" 
                                    onClick={handleResetPassword}
                                >
                                    Reset Password
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}

                <div className="signin-footer">
                    Don't have an account? <Link to="/signup">Sign up</Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Signin;
