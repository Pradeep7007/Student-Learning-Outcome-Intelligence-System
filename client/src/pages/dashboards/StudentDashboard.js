import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { getAuth, getToken } from '../../utils/auth';

const StudentDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [academic, setAcademic] = useState(null);
  const user = getAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const headers = { 'x-auth-token': getToken() };
        
        const res = await fetch(`${apiBase}/api/user/profile`, { headers });
        const data = await res.json();
        if (res.ok) {
          setProfile(data.profile);
          // Fetch academic record once profile is loaded
          const aRes = await fetch(`${apiBase}/api/user/my-academic-record`, { headers });
          const aData = await aRes.json();
          if (aRes.ok) setAcademic(aData);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  return (
    <div className="min-vh-100 bg-light">
      <Navbar title="Student Dashboard" />
      <div className="container py-5">
        <h3 className="mb-4">Welcome, <span className="text-primary">{user.name}</span></h3>
        
        <div className="row row-cols-2 row-cols-md-3 row-cols-lg-5 g-3 mb-5">
          <div className="col">
            <div className="card border-0 shadow-sm h-100 text-center p-2">
              <div className="card-body p-2">
                <h6 className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.7rem' }}>Email</h6>
                <h6 className="fw-bold mb-0 text-truncate" title={user.email}>{user.email}</h6>
              </div>
            </div>
          </div>
          
          {profile && (
            <>
              <div className="col">
                <div className="card border-0 shadow-sm h-100 text-center p-2" style={{ borderTop: '3px solid #0d6efd' }}>
                  <div className="card-body p-2">
                    <h6 className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.7rem' }}>Semester</h6>
                    <h5 className="fw-bold text-primary mb-0">{profile.semester}</h5>
                  </div>
                </div>
              </div>
              <div className="col">
                <div className="card border-0 shadow-sm h-100 text-center p-2">
                  <div className="card-body p-2">
                    <h6 className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.7rem' }}>Department</h6>
                    <h6 className="fw-bold mb-0">{profile.department}</h6>
                  </div>
                </div>
              </div>
              <div className="col">
                <div className="card border-0 shadow-sm h-100 text-center p-2">
                  <div className="card-body p-2">
                    <h6 className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.7rem' }}>Roll Number</h6>
                    <h6 className="fw-bold mb-0">{profile.rollno}</h6>
                  </div>
                </div>
              </div>
              {academic && (
                <div className="col">
                  <div className="card border-0 shadow-sm h-100 text-center p-2 bg-success text-white">
                    <div className="card-body p-2">
                      <h6 className="text-uppercase fw-bold mb-1 opacity-75" style={{ fontSize: '0.7rem' }}>Attendance</h6>
                      <h5 className="fw-bold mb-0">{academic.attendancePercentage}%</h5>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {academic && (
          <div className="row mt-4">
            <div className="col-12">
              <div className="card border-0 shadow-sm p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold m-0"><i className="bi bi-journal-text me-2 text-primary"></i>Academic Performance - Semester {profile.semester}</h5>
                  <span className="badge bg-primary px-3 py-2 fs-6">Prev Sem CGPA: {academic.previousSemCGPA}</span>
                </div>
                
                <div className="table-responsive">
                  <table className="table table-hover table-bordered align-middle text-center">
                    <thead className="table-light">
                      <tr>
                        <th className="text-start">Subject Name</th>
                        <th>Internal Marks</th>
                        <th>Assignment Marks</th>
                        <th>Practical Marks</th>
                        <th className="table-primary">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {academic.subjects.map((sub, idx) => (
                        <tr key={idx}>
                          <td className="text-start fw-bold small">{sub.name}</td>
                          <td>{sub.internalMark}</td>
                          <td>{sub.assignmentMark}</td>
                          <td>{sub.practicalMark}</td>
                          <td className="fw-bold text-primary">
                            {sub.internalMark + sub.assignmentMark + sub.practicalMark}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {!academic && profile && (
          <div className="alert alert-info border-0 shadow-sm py-4 text-center mt-5">
            <i className="bi bi-info-circle fs-2 mb-2 d-block"></i>
            <h5>Assessment Records Not Found</h5>
            <p className="mb-0 text-muted">Your academic details for the current semester haven't been uploaded by the staff yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
