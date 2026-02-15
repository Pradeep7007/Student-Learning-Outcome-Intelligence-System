import React from 'react';
import { getAuth, clearAuth } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const user = getAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate('/signin');
  };

  return (
    <div className="container py-5">
      <h1>Dashboard</h1>
      <p>Welcome, {user?.name || 'User'} ({user?.role || 'N/A'})</p>
      <button className="btn btn-secondary" onClick={handleLogout}>Sign Out</button>
    </div>
  );
};

export default Dashboard;
