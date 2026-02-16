
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SignOutButton from '../components/SignOutButton';

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [editing, setEditing] = useState({});
  const [passwords, setPasswords] = useState({});
  const [message, setMessage] = useState('');
  const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${apiBase}/api/auth/students`).then(r=>r.json()).then(d=>setStudents(d.students||[])).catch(()=>{});
  }, [apiBase]);

  const toggleEdit = (id) => {
    setEditing(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleChange = (id, val) => {
    setPasswords(prev => ({ ...prev, [id]: val }));
  };

  const savePassword = async (id) => {
    const pw = passwords[id];
    if (!pw) return setMessage('Password required');
    try {
      const res = await fetch(`${apiBase}/api/auth/students/${id}/password`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ password: pw }) });
      const data = await res.json();
      setMessage(data.message || 'Updated');
      setEditing(prev => ({ ...prev, [id]: false }));
    } catch (e) { setMessage('Update failed'); }
  };

  return (
    <div className="container py-4 position-relative">
      <SignOutButton />
      <h4>Student Details</h4>
      <button className="btn btn-sm btn-secondary mb-3" onClick={() => navigate('/admin')}>Back</button>
      {students.length === 0 && <p className="text-muted">No students found.</p>}
      <div className="list-group">
        {students.map(s => (
          <div key={s._id} className="list-group-item">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div><strong>Name:</strong> {s.name}</div>
                <div><strong>Email:</strong> {s.email}</div>
                <div><strong>DOB:</strong> {s.dob || 'N/A'}</div>
              </div>
              <div className="text-end">
                {!editing[s._id] ? (
                  <button className="btn btn-sm btn-outline-primary" onClick={() => toggleEdit(s._id)}>Change Password</button>
                ) : (
                  <div className="d-flex gap-2">
                    <input className="form-control form-control-sm" type="password" placeholder="New password" value={passwords[s._id]||''} onChange={e=>handleChange(s._id, e.target.value)} />
                    <button className="btn btn-sm btn-primary" onClick={() => savePassword(s._id)}>Save</button>
                    <button className="btn btn-sm btn-secondary" onClick={() => toggleEdit(s._id)}>Cancel</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {message && <div className="alert alert-info mt-3">{message}</div>}
    </div>
  );
};

export default AdminStudents;
