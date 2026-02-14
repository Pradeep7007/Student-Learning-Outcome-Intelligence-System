
import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './Signin.css';

const Signin = () => {
  const [role, setRole] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => setShowPassword((prev) => !prev);


  return (
    <>
      <div className="min-vh-100 d-flex align-items-center justify-content-center signin-container" style={{ background: 'linear-gradient(135deg, #f6f7f8 0%, #e9ecef 100%)' }}>
        <div className="container-fluid">
          <div className="row justify-content-center">
            <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
              {/* Brand Header */}
              <div className="text-center mb-4 mb-md-5">
                <div className="d-inline-flex align-items-center justify-content-center rounded bg-primary text-white mb-3 brand-icon" style={{ width: '60px', height: '60px' }}>
                  <i className="bi bi-person-circle fs-4"></i>
                </div>
                <h2 className="fw-bold signin-title">SLOIS</h2>
                <p className="text-muted signin-subtitle">Sign in to your account</p>
              </div>
              {/* Card */}
              <div className="card shadow-lg border-0">
                <div className="card-body p-4 p-md-5">
                  <h4 className="text-center mb-3 signin-title">Sign In</h4>
                  <p className="text-center text-muted small mb-4 signin-subtitle">Access your dashboard based on your role.</p>
                  <form>
                    {/* Role */}
                    <div className="mb-3">
                      <label className="form-label fw-bold">Role</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light"><i className="bi bi-person-badge"></i></span>
                        <select className="form-select" required value={role} onChange={e => setRole(e.target.value)}>
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
                        <span className="input-group-text bg-light"><i className="bi bi-envelope"></i></span>
                        <input type="email" className="form-control" placeholder="your@email.com" required />
                      </div>
                    </div>
                    {/* Password */}
                    <div className="mb-3 mb-md-4">
                      <label className="form-label fw-bold">Password</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light"><i className="bi bi-lock"></i></span>
                        <input type={showPassword ? 'text' : 'password'} className="form-control" placeholder="••••••••" required />
                        <button type="button" className="input-group-text bg-white" onClick={togglePassword} tabIndex={-1}>
                          <i className={`bi ${showPassword ? 'bi-eye' : 'bi-eye-slash'}`}></i>
                        </button>
                      </div>
                    </div>
                    {/* Submit */}
                    <div className="d-grid mt-4 mt-md-5">
                      <button type="submit" className="btn btn-primary fw-bold" style={{ padding: '0.75rem' }}>Sign In</button>
                    </div>
                  </form>
                </div>
                {/* Footer */}
                <div className="card-footer text-center bg-light py-3">
                  <small className="text-muted">Don't have an account?{' '}<a href="/signup" className="text-primary fw-bold text-decoration-none">Sign up</a></small>
                </div>
              </div>
              {/* Bottom Footer */}
              <div className="text-center mt-4 small text-muted">
                <p className="mb-2">© 2024 University SLOIS Project. All rights reserved.</p>
                <div className="d-flex flex-wrap justify-content-center gap-2">
                  <a href="#" className="text-muted text-decoration-none">Privacy Policy</a>
                  <span>•</span>
                  <a href="#" className="text-muted text-decoration-none">Terms of Service</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signin;
