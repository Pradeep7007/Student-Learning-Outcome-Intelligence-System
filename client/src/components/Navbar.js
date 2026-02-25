import React from 'react';
import { useNavigate } from 'react-router-dom';
import { clearAuth } from '../utils/auth';

const Navbar = ({ title }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate('/signin');
  };

  return (
    <nav className="navbar navbar-premium glass-card px-4 sticky-top border-0">
      <div className="container-fluid d-flex justify-content-between align-items-center">
        <span className="navbar-logo">
          <span className="logo-icon">S</span>
          <span className="logo-text ms-2">{title || 'Dashboard'}</span>
        </span>
        <button className="btn-premium-outline btn-sm py-1 px-3" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right me-1"></i> Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
