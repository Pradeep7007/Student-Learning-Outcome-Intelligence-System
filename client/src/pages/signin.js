import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setAuth } from '../utils/auth';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './Signin.css';

const Signin = () => {
  const [role, setRole] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Forgot / reset
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const togglePassword = () => setShowPassword(prev => !prev);

  // redirect if already logged in
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('slois_user');
      if (stored) navigate('/dashboard');
    } catch (e) {}
  }, [navigate]);

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center signin-container"
      style={{ background: 'linear-gradient(135deg, #f6f7f8 0%, #e9ecef 100%)' }}
    >
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">

            {/* Brand Header */}
            <div className="text-center mb-4 mb-md-5">
              <div
                className="d-inline-flex align-items-center justify-content-center rounded bg-primary text-white mb-3"
                style={{ width: '60px', height: '60px' }}
              >
                <i className="bi bi-person-circle fs-4"></i>
              </div>
              <h2 className="fw-bold">SLOIS</h2>
              <p className="text-muted">Sign in to your account</p>
            </div>

            {/* Card */}
            <div className="card shadow-lg border-0">
              <div className="card-body p-4 p-md-5">
                <h4 className="text-center mb-3">Sign In</h4>
                <p className="text-center text-muted small mb-4">
                  Access your dashboard based on your role.
                </p>

                {/* Role */}
                <div className="mb-3">
                  <label className="form-label fw-bold">Role</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <i className="bi bi-person-badge"></i>
                    </span>
                    <select
                      className="form-select"
                      value={role}
                      onChange={e => setRole(e.target.value)}
                    >
                      <option value="">Select your role</option>
                      <option value="student">Student</option>
                      <option value="staff">Academic Staff</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                </div>

                {/* Email */}
                <div className="mb-3">
                  <label className="form-label fw-bold">Email</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <i className="bi bi-envelope"></i>
                    </span>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="your@email.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="mb-4">
                  <label className="form-label fw-bold">Password</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <i className="bi bi-lock"></i>
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control"
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="input-group-text bg-white"
                      onClick={togglePassword}
                    >
                      <i className={`bi ${showPassword ? 'bi-eye' : 'bi-eye-slash'}`}></i>
                    </button>
                  </div>
                </div>

                {/* Sign In Button */}
                <div className="d-grid mt-4">
                    <button type="button" className="btn btn-primary fw-bold" onClick={async () => {
                      setMessage('');
                      try {
                        const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000';
                        const res = await fetch(`${apiBase}/api/auth/login`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ email, password, role })
                        });
                        const data = await res.json();
                        if (!res.ok) {
                          setMessage(data.message || 'Login failed');
                          return;
                        }
                        // Check if the selected role matches the user's actual role
                        if (data.user && data.user.role !== role) {
                          setMessage(`You are registered as a ${data.user.role}. Please select the correct role to sign in.`);
                          return;
                        }
                        // store user and navigate according to role
                        if (data.user) setAuth(data.user);
                        setMessage(data.message || 'Login successful');
                        if (data.user && data.user.role === 'admin') {
                          navigate('/admin');
                        } else {
                          navigate('/dashboard');
                        }
                      } catch (err) {
                        console.error(err);
                        setMessage('Network error');
                      }
                    }}>
                      Sign In
                    </button>
                </div>
                
                {/* Forgot password toggle */}
                <div className="text-center mt-3">
                  <button type="button" className="btn btn-link p-0" onClick={() => setShowForgot(s => !s)}>
                    Forgot password?
                  </button>
                </div>

                {showForgot && (
                  <div className="mt-3 p-3 border rounded bg-light">
                    <h6>Forgot Password</h6>
                    <div className="mb-2">
                      <input className="form-control" placeholder="Enter your email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} />
                    </div>
                    <div className="d-flex gap-2">
                      <button className="btn btn-sm btn-primary" onClick={async () => {
                        setMessage('');
                        try {
                          const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000';
                          const res = await fetch(`${apiBase}/api/auth/forgot-password`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email: forgotEmail })
                          });
                          const data = await res.json();
                          if (!res.ok) { setMessage(data.message || 'Error'); return; }
                          // show token to user (no email configured)
                          setResetToken(data.token || '');
                          setMessage('Reset token generated (shown below)');
                        } catch (err) { console.error(err); setMessage('Network error'); }
                      }}>Generate Token</button>
                      <button className="btn btn-sm btn-secondary" onClick={() => { setForgotEmail(''); setResetToken(''); setNewPassword(''); setMessage(''); }}>Clear</button>
                    </div>

                    {resetToken && (
                      <div className="mt-2">
                        <label className="form-label small">Reset Token (copy to reset form)</label>
                        <input className="form-control" readOnly value={resetToken} />
                      </div>
                    )}

                    <div className="mt-3">
                      <h6>Reset Password</h6>
                      <input className="form-control mb-2" placeholder="Reset token" value={resetToken} onChange={e => setResetToken(e.target.value)} />
                      <input className="form-control mb-2" type="password" placeholder="New password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                      <div className="d-grid">
                        <button className="btn btn-success btn-sm" onClick={async () => {
                          setMessage('');
                          try {
                            const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000';
                            const res = await fetch(`${apiBase}/api/auth/reset-password`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ token: resetToken, password: newPassword })
                            });
                            const data = await res.json();
                            if (!res.ok) { setMessage(data.message || 'Reset failed'); return; }
                            setMessage(data.message || 'Password reset successful');
                            setShowForgot(false);
                            setForgotEmail(''); setResetToken(''); setNewPassword('');
                          } catch (err) { console.error(err); setMessage('Network error'); }
                        }}>Reset Password</button>
                      </div>
                    </div>
                  </div>
                )}

                {message && (<div className="alert alert-info mt-3 text-center">{message}</div>)}
              </div>

              {/* Card Footer */}
              <div className="card-footer text-center bg-light py-3">
                <small className="text-muted">
                  Don't have an account?{' '}
                  <a
                    href="/signup"
                    className="text-primary fw-bold text-decoration-none"
                  >
                    Sign up
                  </a>
                </small>
              </div>
            </div>

            {/* Bottom Footer */}
            <div className="text-center mt-4 small text-muted">
              <p className="mb-2">
                © 2024 University SLOIS Project. All rights reserved.
              </p>

              <div className="d-flex flex-wrap justify-content-center gap-2">
                <button
                  type="button"
                  className="btn btn-link text-muted p-0 text-decoration-none"
                >
                  Privacy Policy
                </button>

                <span>•</span>

                <button
                  type="button"
                  className="btn btn-link text-muted p-0 text-decoration-none"
                >
                  Terms of Service
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Signin;
