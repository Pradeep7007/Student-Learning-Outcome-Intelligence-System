import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const styles = `
    @media (max-width: 576px) {
      .signup-container {
        padding: 15px;
      }
      .brand-icon {
        width: 45px !important;
        height: 45px !important;
      }
      .card-body {
        padding: 20px !important;
      }
      .signup-title {
        font-size: 1.5rem;
      }
      .signup-subtitle {
        font-size: 0.85rem;
      }
      .form-label {
        font-size: 0.9rem;
        margin-bottom: 0.5rem;
      }
      .form-control, .form-select, .input-group-text {
        font-size: 0.95rem;
        padding: 0.5rem 0.75rem;
      }
      .btn {
        font-size: 0.95rem;
        padding: 0.5rem;
      }
    }

    @media (min-width: 577px) and (max-width: 991px) {
      .signup-container {
        padding: 20px;
      }
      .brand-icon {
        width: 55px !important;
        height: 55px !important;
      }
      .card-body {
        padding: 30px !important;
      }
      .signup-title {
        font-size: 1.8rem;
      }
      .signup-subtitle {
        font-size: 0.9rem;
      }
    }

    @media (min-width: 992px) {
      .signup-container {
        padding: 30px;
      }
      .brand-icon {
        width: 60px !important;
        height: 60px !important;
      }
      .card-body {
        padding: 40px !important;
      }
      .signup-title {
        font-size: 2rem;
      }
      .signup-subtitle {
        font-size: 0.95rem;
      }
    }

    .form-control:focus,
    .form-select:focus {
      border-color: #0d6efd;
      box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
    }

    .card {
      border-radius: 12px;
      overflow: hidden;
    }

    .input-group-text {
      border-color: #dee2e6;
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div
        className="min-vh-100 d-flex align-items-center justify-content-center signup-container"
        style={{
          background: "linear-gradient(135deg, #f6f7f8 0%, #e9ecef 100%)",
        }}
      >
        <div className="container-fluid">
          <div className="row justify-content-center">
            <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">

              {/* Brand Header */}
              <div className="text-center mb-4 mb-md-5">
                <div
                  className="d-inline-flex align-items-center justify-content-center rounded bg-primary text-white mb-3 brand-icon"
                  style={{ width: "60px", height: "60px" }}
                >
                  <i className="bi bi-mortarboard fs-4"></i>
                </div>
                <h2 className="fw-bold signup-title">SLOIS</h2>
                <p className="text-muted signup-subtitle">
                  Student Learning Outcome Intelligence System
                </p>
              </div>

              {/* Card */}
              <div className="card shadow-lg border-0">
                <div className="card-body p-4 p-md-5">
                  <h4 className="text-center mb-3 signup-title">Create an Account</h4>
                  <p className="text-center text-muted small mb-4 signup-subtitle">
                    Join the platform to analyze and improve academic outcomes.
                  </p>

                  <form>
                    {/* Full Name */}
                    <div className="mb-3">
                      <label className="form-label fw-bold">Full Name</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <i className="bi bi-person"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="John Doe"
                          required
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="mb-3">
                      <label className="form-label fw-bold">University Email</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <i className="bi bi-envelope"></i>
                        </span>
                        <input
                          type="email"
                          className="form-control"
                          placeholder="student@university.edu"
                          required
                        />
                      </div>
                    </div>

                    {/* Role */}
                    <div className="mb-3">
                      <label className="form-label fw-bold">Role</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <i className="bi bi-badge-ad"></i>
                        </span>
                        <select className="form-select" required>
                          <option value="">Select your role</option>
                          <option value="student">Student</option>
                          <option value="staff">Academic Staff</option>
                          <option value="admin">Administrator</option>
                        </select>
                      </div>
                    </div>

                    {/* Password */}
                    <div className="mb-3">
                      <label className="form-label fw-bold">Password</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <i className="bi bi-lock"></i>
                        </span>
                        <input
                          type={showPassword ? "text" : "password"}
                          className="form-control"
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          className="input-group-text bg-white"
                          onClick={togglePassword}
                        >
                          <i
                            className={`bi ${
                              showPassword ? "bi-eye" : "bi-eye-slash"
                            }`}
                          ></i>
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="mb-3 mb-md-4">
                      <label className="form-label fw-bold">Confirm Password</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <i className="bi bi-lock-fill"></i>
                        </span>
                        <input
                          type="password"
                          className="form-control"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                    </div>

                    {/* Submit */}
                    <div className="d-grid mt-4 mt-md-5">
                      <button 
                        type="submit" 
                        className="btn btn-primary fw-bold"
                        style={{ padding: "0.75rem" }}
                      >
                        Sign Up
                      </button>
                    </div>
                  </form>
                </div>

                {/* Footer */}
                <div className="card-footer text-center bg-light py-3">
                  <small className="text-muted">
                    Already have an account?{" "}
                    <a href="#" className="text-primary fw-bold text-decoration-none">
                      Log in
                    </a>
                  </small>
                </div>
              </div>

              {/* Bottom Footer */}
              <div className="text-center mt-4 small text-muted">
                <p className="mb-2">© 2024 University SLOIS Project. All rights reserved.</p>
                <div className="d-flex flex-wrap justify-content-center gap-2">
                  <a href="#" className="text-muted text-decoration-none">
                    Privacy Policy
                  </a>
                  <span>•</span>
                  <a href="#" className="text-muted text-decoration-none">
                    Terms of Service
                  </a>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;
