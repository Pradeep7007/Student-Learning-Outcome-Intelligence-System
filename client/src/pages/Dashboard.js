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
    <div className="container p-2">
      <h1>Dashboard</h1>
      <p>Welcome, {user?.name || 'User'} ({user?.role || 'N/A'})</p>

      <div className='d-flex flex-wrap'>
        <div className='border border-primary border-2 p-2 rounded'>
          <p>mtebwrb</p>
        </div>

        </div>
      <button className="btn btn-secondary" onClick={handleLogout}>Sign Out</button>
    </div>
  );
};

export default Dashboard;
