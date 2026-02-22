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
    <nav className="navbar navbar-dark bg-primary shadow-sm px-4 sticky-top">
      <span className="navbar-brand mb-0 h1 fw-bold">{title || 'SLOIS Dashboard'}</span>
      <button className="btn btn-outline-light btn-sm fw-bold border-2" onClick={handleLogout}>
        <i className="bi bi-box-arrow-right me-1"></i> Logout
      </button>
    </nav>
  );
};

export default Navbar;
