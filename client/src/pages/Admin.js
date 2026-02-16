import React, { useEffect, useState } from 'react';
import './Admin.css';

const Admin = () => {
  const [studentCount, setStudentCount] = useState(0);
  const [students, setStudents] = useState([]);
  const [staffs, setStaffs] = useState([]);
  const [showStudents, setShowStudents] = useState(false);
  const [showStaffs, setShowStaffs] = useState(false);
  const [message, setMessage] = useState('');

  const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetch(`${apiBase}/api/auth/students/count`).then(r=>r.json()).then(d=>setStudentCount(d.count||0)).catch(()=>{});
  }, []);

  const navigate = (path) => window.location.href = path;
  const loadStudents = () => navigate('/admin/students');
  const loadStaffs = () => navigate('/admin/staffs');

  const updateStudentPassword = async (id, password) => {
    if (!password) return setMessage('Password required');
    try {
      const res = await fetch(`${apiBase}/api/auth/students/${id}/password`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ password }) });
      const data = await res.json();
      setMessage(data.message || 'Updated');
    } catch (e) { setMessage('Update failed'); }
  };

  const updateStaffPassword = async (id, password) => {
    if (!password) return setMessage('Password required');
    try {
      const res = await fetch(`${apiBase}/api/auth/staffs/${id}/password`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ password }) });
      const data = await res.json();
      setMessage(data.message || 'Updated');
    } catch (e) { setMessage('Update failed'); }
  };

  return (
    <div className="container py-4">
      <h3 className="mb-4">Admin Dashboard</h3>

      <div className="row admin-row">
        <div className="col-12 col-md-6 mb-3">
          <div className="card admin-card p-3">
            <h5>Students</h5>
            <p className="display-6">{studentCount}</p>
            <button className="btn btn-sm btn-primary" onClick={loadStudents}>View Student Details</button>
          </div>
        </div>
        <div className="col-12 col-md-6 mb-3">
          <div className="card admin-card p-3">
            <h5>Other Info</h5>
            <p className="text-muted">Quick actions and stats</p>
            <button className="btn btn-sm btn-secondary" onClick={loadStaffs}>View Staff Details</button>
          </div>
        </div>
      </div>

      

      {message && <div className="alert alert-info">{message}</div>}
    </div>
  );
};

export default Admin;

