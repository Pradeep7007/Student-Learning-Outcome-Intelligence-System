import React from 'react';
import SignOutButton from '../components/SignOutButton';
import { getAuth } from '../utils/auth';


import { useEffect, useState } from 'react';

const StaffDashboard = () => {
  const user = getAuth();
  const [totalStudents, setTotalStudents] = useState(0);
  const [deptCounts, setDeptCounts] = useState([]);

  useEffect(() => {
    const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    fetch(`${apiBase}/api/stats/students/count`).then(r=>r.json()).then(d=>setTotalStudents(d.count||0));
    fetch(`${apiBase}/api/stats/students/department-count`).then(r=>r.json()).then(d=>setDeptCounts(d.departments||[]));
  }, []);

  return (
    <div className="container p-2 position-relative">
      <SignOutButton />
      <h1>Staff Dashboard</h1>
      <p>Welcome, {user?.name || 'Staff'} ({user?.role || 'staff'})</p>
      <div className="row mb-4">
        <div className="col-12 col-md-4 mb-3">
          <div className="card text-center shadow">
            <div className="card-body">
              <h5 className="card-title">Total Students</h5>
              <p className="display-6">{totalStudents}</p>
            </div>
          </div>
        </div>
        {deptCounts.map(d => (
          <div className="col-12 col-md-4 mb-3" key={d._id}>
            <div className="card text-center shadow">
              <div className="card-body">
                <h6 className="card-title">{d._id || 'Unknown Dept'}</h6>
                <p className="display-6">{d.count}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Add staff-specific content here */}
    </div>
  );
};

export default StaffDashboard;
