import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { getAuth, getToken } from '../../utils/auth';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const user = getAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiBase}/api/user/stats`, {
          headers: { 'x-auth-token': getToken() }
        });
        const data = await res.json();
        if (res.ok) setStats(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-vh-100 bg-light">
      <Navbar title="Admin Dashboard" />
      <div className="container py-5">
        <h3 className="mb-4">Welcome, <span className="text-primary">{user.name}</span></h3>
        
        <div className="row g-3 mb-5">
          <div className="col-auto">
            <div className="card border-0 shadow-sm text-center p-2 px-4">
              <div className="card-body p-2">
                <h6 className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.7rem' }}>Admin ID</h6>
                <h6 className="fw-bold text-primary mb-0">{user.id.slice(-6).toUpperCase()}</h6>
              </div>
            </div>
          </div>
          <div className="col-auto">
            <div className="card border-0 shadow-sm text-center p-2 px-4">
              <div className="card-body p-2">
                <h6 className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.7rem' }}>Email</h6>
                <h6 className="fw-bold mb-0">{user.email}</h6>
              </div>
            </div>
          </div>
        </div>

        <hr className="my-5 opacity-10" />
        
        <h5 className="mb-4 fw-bold">System Overview</h5>
        <div className="row g-3">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm bg-dark text-white p-3 h-100">
               <h6 className="text-uppercase fw-bold opacity-75 mb-1" style={{ fontSize: '0.7rem' }}>Total Students</h6>
               <h2 className="fw-bold m-0">{stats?.totalStudents || 0}</h2>
            </div>
          </div>
          
          {stats?.deptStats?.map((dept, index) => (
            <div key={index} className="col-6 col-md-3 col-lg-2">
              <div className="card border-0 shadow-sm p-3 text-center h-100 bg-white">
                <h6 className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.65rem' }}>{dept._id}</h6>
                <h4 className="fw-bold text-primary m-0">{dept.count}</h4>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
