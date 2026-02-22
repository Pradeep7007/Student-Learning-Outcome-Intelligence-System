import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { getAuth, getToken } from '../../utils/auth';

const StudentDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [academic, setAcademic] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const user = getAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const headers = { 'x-auth-token': getToken() };
        
        const res = await fetch(`${apiBase}/api/user/profile`, { headers });
        const data = await res.json();
        if (res.ok) {
          setProfile(data.profile);
          // Fetch academic record
          const aRes = await fetch(`${apiBase}/api/user/my-academic-record`, { headers });
          const aData = await aRes.json();
          if (aRes.ok) setAcademic(aData);

          // Fetch ML Prediction
          const pRes = await fetch(`${apiBase}/api/user/my-prediction`, { headers });
          const pData = await pRes.json();
          if (pRes.ok) setPrediction(pData);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-vh-100 bg-light">
      <Navbar title="Student Dashboard" />
      <div className="container py-5">
        <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '15px' }}>
          <div className="row align-items-center">
            <div className="col-auto">
              <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                <i className="bi bi-person-badge-fill fs-2"></i>
              </div>
            </div>
            <div className="col">
              <h3 className="mb-0 fw-bold">Welcome, <span className="text-primary">{user.name}</span></h3>
              <p className="text-muted mb-0">{user.email}</p>
            </div>
          </div>
        </div>
        
        <div className="row g-4 mb-5">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '15px' }}>
              <h5 className="fw-bold mb-4 d-flex align-items-center">
                <i className="bi bi-info-circle-fill me-2 text-primary"></i>
                Academic Details
              </h5>
              <div className="row g-4">
                <div className="col-md-6 border-end">
                  <div className="mb-3">
                    <label className="text-muted text-uppercase fw-bold small mb-1">Roll Number</label>
                    <h6 className="fw-bold mb-0">{profile?.rollno || 'N/A'}</h6>
                  </div>
                  <div className="mb-3">
                    <label className="text-muted text-uppercase fw-bold small mb-1">Semester</label>
                    <h6 className="fw-bold mb-0">{profile?.semester || 'N/A'}</h6>
                  </div>
                  <div className="mb-0">
                    <label className="text-muted text-uppercase fw-bold small mb-1">Department</label>
                    <h6 className="fw-bold mb-0">{profile?.department || 'N/A'}</h6>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="text-muted text-uppercase fw-bold small mb-1">Attendance Percentage</label>
                    <h6 className={`fw-bold mb-0 ${academic?.attendancePercentage < 75 ? 'text-danger' : 'text-success'}`}>
                      {academic ? `${academic.attendancePercentage}%` : 'N/A'}
                    </h6>
                  </div>
                  <div className="mb-3">
                    <label className="text-muted text-uppercase fw-bold small mb-1">Previous SEM CGPA</label>
                    <h6 className="fw-bold mb-0 text-primary">{academic?.previousSemCGPA || 'N/A'}</h6>
                  </div>
                  <div className="mb-0">
                    <label className="text-muted text-uppercase fw-bold small mb-1">Staff In-Charge</label>
                    <h6 className="fw-bold mb-0 text-dark">{academic?.staffName || 'TBA'}</h6>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="d-flex flex-column gap-4 h-100">
              <div className="card border-0 shadow-sm p-4 flex-fill text-center d-flex flex-column justify-content-center" style={{ borderRadius: '15px', borderLeft: '5px solid #0d6efd' }}>
                <h6 className="text-muted text-uppercase fw-bold mb-2" style={{ fontSize: '0.8rem' }}>Student Outcome CGPA</h6>
                <h4 className="fw-bold text-primary mb-0">
                  {prediction ? prediction.predictedCGPA : 'TBA'}
                </h4>
              </div>
              <div className="card border-0 shadow-sm p-4 flex-fill text-center d-flex flex-column justify-content-center" style={{ borderRadius: '15px', borderLeft: '5px solid #198754' }}>
                <h6 className="text-muted text-uppercase fw-bold mb-2" style={{ fontSize: '0.8rem' }}>Manual Prediction</h6>
                <h4 className="fw-bold text-success mb-0">GRADUATE</h4>
              </div>
            </div>
          </div>
        </div>

        {academic && (
          <div className="row mt-2">
            <div className="col-12">
              <div className="card border-0 shadow-sm overflow-hidden" style={{ borderRadius: '15px' }}>
                <div className="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                  <h5 className="fw-bold m-0 text-dark">
                    <i className="bi bi-grid-3x3-gap-fill me-2 text-primary"></i>
                    Subject-wise Performance
                  </h5>
                  <div className="d-flex gap-2">
                    <span className="badge bg-light text-dark border px-3 py-2">
                      <i className="bi bi-calendar3 me-2 text-primary"></i>
                      Semester {profile?.semester}
                    </span>
                  </div>
                </div>
                
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light">
                      <tr className="text-secondary small text-uppercase fw-bold">
                        <th className="ps-4 py-3" style={{ width: '40%' }}>Subject & Information</th>
                        <th className="text-center">Internals (40)</th>
                        <th className="text-center">Assignment (20)</th>
                        <th className="text-center">Practical (40)</th>
                        <th className="text-center pe-4">Total (100)</th>
                      </tr>
                    </thead>
                    <tbody className="border-top-0">
                      {academic.subjects.map((sub, idx) => {
                        const total = sub.internalMark + sub.assignmentMark + sub.practicalMark;
                        return (
                          <tr key={idx} className="border-bottom">
                            <td className="ps-4 py-3">
                              <div className="d-flex align-items-center">
                                <div className="bg-primary bg-opacity-10 text-primary rounded h6 px-2 py-1 me-3 mb-0">
                                  {idx + 1}
                                </div>
                                <div>
                                  <h6 className="fw-bold mb-0 text-dark">{sub.name}</h6>
                                  <small className="text-muted">Core Subject</small>
                                </div>
                              </div>
                            </td>
                            <td className="text-center">
                              <span className={`fw-semibold ${sub.internalMark < 20 ? 'text-danger' : 'text-dark'}`}>
                                {sub.internalMark}
                              </span>
                            </td>
                            <td className="text-center">
                              <span className="fw-semibold text-dark">{sub.assignmentMark}</span>
                            </td>
                            <td className="text-center">
                              <span className="fw-semibold text-dark">{sub.practicalMark}</span>
                            </td>
                            <td className="text-center pe-4">
                              <div className="d-inline-flex align-items-center">
                                <div className={`badge ${total >= 80 ? 'bg-success' : total >= 50 ? 'bg-primary' : 'bg-danger'} rounded-pill px-3 py-2 fw-bold`}>
                                  {total}
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                <div className="card-footer bg-white border-0 py-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted italic">Note: Passing marks are 50% of the total in each subject.</small>
                    <div className="d-flex align-items-center gap-3">
                      <div className="d-flex align-items-center">
                        <span className="dot bg-success me-2"></span>
                        <small className="text-muted">Outstanding</small>
                      </div>
                      <div className="d-flex align-items-center">
                        <span className="dot bg-primary me-2"></span>
                        <small className="text-muted">Good</small>
                      </div>
                      <div className="d-flex align-items-center">
                        <span className="dot bg-danger me-2"></span>
                        <small className="text-muted">Needs Improvement</small>
                      </div>
                    </div>
                  </div>
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
