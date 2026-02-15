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

  const loadStudents = async () => {
    setMessage('');
    try {
      const res = await fetch(`${apiBase}/api/auth/students`);
      const data = await res.json();
      setStudents(data.students || []);
      setShowStudents(true);
      setShowStaffs(false);
    } catch (e) { setMessage('Failed to load students'); }
  };

  const loadStaffs = async () => {
    setMessage('');
    try {
      const res = await fetch(`${apiBase}/api/auth/staffs`);
      const data = await res.json();
      setStaffs(data.staffs || []);
      setShowStaffs(true);
      setShowStudents(false);
    } catch (e) { setMessage('Failed to load staffs'); }
  };

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

      <div className="row admin-row">
        <div className="col-12 col-md-6 mb-3">
          <div className="card p-3">
            <h6>Student Details</h6>
            <div className="details-list mt-2">
              {students.length === 0 && <p className="text-muted">No students loaded. Click 'View Student Details'.</p>}
              {students.map(s => (
                <div key={s._id} className="border rounded p-2 mb-2">
                  <div><strong>Name:</strong> {s.name}</div>
                  <div><strong>Email:</strong> {s.email}</div>
                  <div><strong>DOB:</strong> {s.dob || 'N/A'}</div>
                  <div className="mt-2 d-flex gap-2">
                    <input className="form-control form-control-sm" placeholder="New password" id={`stu-pw-${s._id}`} />
                    <button className="btn btn-sm btn-primary" onClick={() => updateStudentPassword(s._id, document.getElementById(`stu-pw-${s._id}`).value)}>Change</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 mb-3">
          <div className="card p-3">
            <h6>Staff Details</h6>
            <div className="details-list mt-2">
              {staffs.length === 0 && <p className="text-muted">No staff loaded. Click 'View Staff Details'.</p>}
              {staffs.map(s => (
                <div key={s._id} className="border rounded p-2 mb-2">
                  <div><strong>Name:</strong> {s.name}</div>
                  <div><strong>Email:</strong> {s.email}</div>
                  <div className="mt-2 d-flex gap-2">
                    <input className="form-control form-control-sm" placeholder="New password" id={`stf-pw-${s._id}`} />
                    <button className="btn btn-sm btn-primary" onClick={() => updateStaffPassword(s._id, document.getElementById(`stf-pw-${s._id}`).value)}>Change</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {message && <div className="alert alert-info">{message}</div>}
    </div>
  );
};

export default Admin;

