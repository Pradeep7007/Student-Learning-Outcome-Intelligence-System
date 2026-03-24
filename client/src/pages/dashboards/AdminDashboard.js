import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { getAuth, getToken } from '../../utils/auth';
import API_BASE_URL from '../../config';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('students'); // students, staff, admins
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    semester: '',
    department: '',
    rollno: '',
    dob: ''
  });
  
  const user = getAuth();

  useEffect(() => {
    fetchStats();
    fetchAllUsers();
  }, []);

  const apiBase = API_BASE_URL;

  const fetchStats = async () => {
    try {
      const res = await fetch(`${apiBase}/api/user/stats`, {
        headers: { 'x-auth-token': getToken() }
      });
      const data = await res.json();
      if (res.ok) setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/user/all-users`, {
        headers: { 'x-auth-token': getToken() }
      });
      const data = await res.json();
      if (res.ok) setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (u) => {
    setEditingUser(u);
    setFormData({
      name: u.name || '',
      email: u.email || '',
      semester: u.profile?.semester || '',
      department: u.profile?.department || '',
      rollno: u.profile?.rollno || '',
      dob: u.profile?.dob ? new Date(u.profile.dob).toISOString().split('T')[0] : ''
    });
    setShowEditModal(true);
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(`${apiBase}/api/user/delete/${id}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': getToken() }
      });
      if (res.ok) {
        alert('User deleted successfully');
        fetchAllUsers();
        fetchStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiBase}/api/user/update/${editingUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': getToken()
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert('User updated successfully');
        setShowEditModal(false);
        fetchAllUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiBase}/api/user/modify-password/${editingUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': getToken()
        },
        body: JSON.stringify({ password: newPassword })
      });
      if (res.ok) {
        alert('Password updated successfully');
        setShowPasswordModal(false);
        setNewPassword('');
      }
    } catch (err) {
      console.error(err);
    }
  };


  const filteredUsers = users.filter(u => {
    const matchesTab = activeTab === 'students' ? u.role === 'student' :
                       activeTab === 'staff' ? u.role === 'staff' :
                       activeTab === 'admins' ? u.role === 'admin' : true;
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-vh-100 bg-light">
      <Navbar title="Admin Dashboard" />
      <div className="container py-5">
        <div className="row align-items-center mb-4">
          <div className="col">
            <h3 className="m-0">Admin <span className="text-primary">Dashboard</span></h3>
          </div>
          <div className="col-auto">
             <span className="badge bg-primary p-2 px-3 rounded-pill text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>Global Access</span>
          </div>
        </div>
        
        <div className="row g-3 mb-5">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm p-4 h-100">
               <h6 className="text-muted text-uppercase fw-bold mb-3" style={{ fontSize: '0.75rem' }}>Active User</h6>
               <h4 className="fw-bold mb-1">{user.name}</h4>
               <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>{user.email}</p>
            </div>
          </div>
          <div className="col-md-8">
            <div className="card border-0 shadow-sm p-4 h-100">
               <h6 className="text-muted text-uppercase fw-bold mb-3" style={{ fontSize: '0.75rem' }}>System Overview</h6>
               <div className="row g-4">
                  <div className="col-auto me-4">
                    <h2 className="fw-bold m-0">{stats?.totalStudents || 0}</h2>
                    <h6 className="text-muted text-uppercase m-0" style={{ fontSize: '0.65rem' }}>Students</h6>
                  </div>
                  {stats?.deptStats?.map((dept, index) => (
                    <div key={index} className="col-auto border-start ps-4">
                      <h4 className="fw-bold m-0">{dept.count}</h4>
                      <h6 className="text-muted text-uppercase m-0" style={{ fontSize: '0.65rem' }}>{dept._id}</h6>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>


        {/* USER MANAGEMENT */}
        <div className="card border-0 shadow-sm overflow-hidden">
          <div className="card-header bg-white border-bottom-0 pt-4 px-4">
             <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
               <h5 className="mb-0 fw-bold">User Management</h5>
               <div className="d-flex flex-column flex-md-row gap-2">
                 <div className="position-relative">
                   <input 
                     type="text" 
                     className="form-control form-control-sm ps-4" 
                     placeholder="Search by name or email..." 
                     style={{ width: '250px' }}
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                   />
                   <i className="bi bi-search position-absolute start-0 top-50 translate-middle-y ms-2 text-muted" style={{ fontSize: '0.8rem' }}></i>
                 </div>
                 <div className="btn-group btn-group-sm">
                    <button className={`btn ${activeTab === 'students' ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setActiveTab('students')}>Students</button>
                    <button className={`btn ${activeTab === 'staff' ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setActiveTab('staff')}>Teachers</button>
                    <button className={`btn ${activeTab === 'admins' ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setActiveTab('admins')}>Admins</button>
                 </div>
               </div>
             </div>
          </div>
          <div className="card-body p-0 mt-3">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light">
                  <tr style={{ fontSize: '0.85rem' }}>
                    <th className="px-4 py-3">NAME & EMAIL</th>
                    {activeTab === 'students' && <th>ROLL NO</th>}
                    {activeTab === 'students' && <th>SEM / DEPT</th>}
                    {activeTab === 'staff' && <th>DEPARTMENT</th>}
                    <th className="text-end px-4">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="5" className="text-center py-5">Loading users...</td></tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr><td colSpan="5" className="text-center py-5">No users found</td></tr>
                  ) : filteredUsers.map((u) => (
                    <tr key={u._id}>
                      <td className="px-4 py-3">
                        <div className="fw-bold">{u.name}</div>
                        <div className="small text-muted">{u.email}</div>
                      </td>
                      {activeTab === 'students' && <td>{u.profile?.rollno || 'N/A'}</td>}
                      {activeTab === 'students' && (
                        <td>
                          <span className="badge bg-light text-dark border me-1">S{u.profile?.semester}</span>
                          <span className="badge bg-light text-dark border">{u.profile?.department}</span>
                        </td>
                      )}
                      {activeTab === 'staff' && <td>{u.profile?.department || 'N/A'}</td>}
                      <td className="text-end px-4">
                        <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEditClick(u)}>Edit</button>
                        <button className="btn btn-sm btn-outline-info me-2" onClick={() => { setEditingUser(u); setShowPasswordModal(true); }}>Password</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteUser(u._id)} disabled={u._id === user.id}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* EDIT MODAL */}
        {showEditModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg">
                <div className="modal-header bg-dark text-white border-0">
                  <h5 className="modal-title fw-bold">Edit User: {editingUser.name}</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowEditModal(false)}></button>
                </div>
                <div className="modal-body p-4">
                  <form onSubmit={handleUpdateUser}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">FullName</label>
                        <input type="text" className="form-control" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value.toUpperCase()})} required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Email</label>
                        <input type="email" className="form-control" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                      </div>
                      
                      {editingUser.role === 'student' && (
                        <>
                          <div className="col-md-4">
                            <label className="form-label small fw-bold">Semester</label>
                            <input type="text" className="form-control" value={formData.semester} onChange={(e) => setFormData({...formData, semester: e.target.value})} />
                          </div>
                          <div className="col-md-4">
                            <label className="form-label small fw-bold">Department</label>
                            <select className="form-select" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})}>
                              <option value="">Select Dept</option>
                              <option value="AI & DS">AI & DS</option>
                              <option value="AI & ML">AI & ML</option>
                              <option value="CSE">CSE</option>
                              <option value="IT">IT</option>
                              <option value="ECE">ECE</option>
                              <option value="EEE">EEE</option>
                            </select>
                          </div>
                          <div className="col-md-4">
                            <label className="form-label small fw-bold">Roll Number</label>
                            <input type="text" className="form-control" value={formData.rollno} onChange={(e) => setFormData({...formData, rollno: e.target.value})} />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label small fw-bold">Date of Birth</label>
                            <input type="date" className="form-control" value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} />
                          </div>
                        </>
                      )}

                      {editingUser.role === 'staff' && (
                        <div className="col-md-6">
                          <label className="form-label small fw-bold">Department</label>
                          <select className="form-select" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})}>
                            <option value="">Select Dept</option>
                            <option value="AI & DS">AI & DS</option>
                            <option value="AI & ML">AI & ML</option>
                            <option value="CSE">CSE</option>
                            <option value="IT">IT</option>
                            <option value="ECE">ECE</option>
                            <option value="EEE">EEE</option>
                          </select>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 text-end">
                      <button type="button" className="btn btn-secondary me-2" onClick={() => setShowEditModal(false)}>Cancel</button>
                      <button type="submit" className="btn btn-primary px-4">Save Changes</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PASSWORD MODAL */}
        {showPasswordModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg">
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-bold">Change Password</h5>
                  <button type="button" className="btn-close" onClick={() => setShowPasswordModal(false)}></button>
                </div>
                <div className="modal-body p-4">
                  <p className="text-muted small">Changing password for <span className="fw-bold text-dark">{editingUser.email}</span></p>
                  <form onSubmit={handlePasswordUpdate}>
                    <div className="mb-3">
                      <label className="form-label small fw-bold">New Password</label>
                      <input 
                        type="password" 
                        className="form-control" 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)} 
                        required 
                        minLength="1"
                      />
                    </div>
                    <div className="text-end">
                      <button type="button" className="btn btn-link text-muted me-2 text-decoration-none" onClick={() => setShowPasswordModal(false)}>Cancel</button>
                      <button type="submit" className="btn btn-dark px-4">Update Password</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
