import React, { useEffect, useState } from 'react';
import SignOutButton from '../components/SignOutButton';
import { getAuth } from '../utils/auth';

const StudentDashboard = () => {
  const user = getAuth();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
        const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        fetch(`${apiBase}/api/staff/${user.id}`)
            .then(res => {
                if (!res.ok) {
                    if (res.status === 404) return null;
                    throw new Error('Failed to fetch');
                }
                return res.json();
            })
            .then(data => {
                setRecord(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    } else {
        setLoading(false);
    }
  }, [user]);

  return (
    <div className="container p-2 position-relative">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Student Dashboard</h1>
        <SignOutButton />
      </div>
      
      <p className="lead">
        Welcome, <span className="fw-bold">{user?.name?.toUpperCase() || 'STUDENT'}</span> 
        {record?.rollNo && <span className="ms-2">({record.rollNo})</span>}
        <span className="badge bg-secondary ms-2">{user?.role || 'student'}</span>
      </p>

      {loading ? (
          <p>Loading academic details...</p>
      ) : !record ? (
          <div className="alert alert-info">
              No academic records found for you yet. Please contact your staff advisor.
          </div>
      ) : (
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
                <h4 className="mb-0">Academic Performance</h4>
            </div>
            <div className="card-body">
                <div className="row mb-4 text-center">
                    <div className="col-md-3">
                        <div className="p-3 border rounded bg-light h-100">
                            <h5 className="text-muted">Total Days</h5>
                            <h2 className="display-6">120</h2>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="p-3 border rounded bg-light h-100">
                            <h5 className="text-success">Days Present</h5>
                            <h2 className="display-6 fw-bold">{record.totalDaysPresent}</h2>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="p-3 border rounded bg-light h-100">
                            <h5 className="text-danger">Leave Days</h5>
                            <h2 className="display-6 fw-bold">{record.leaveDaysCount}</h2>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="p-3 border rounded bg-light h-100">
                            <h5 className="text-primary">Overall Outcome</h5>
                            <h2 className="display-6 fw-bold">
                                {(() => {
                                    if (!record.subjects || record.subjects.length === 0) return '0%';
                                    const totalObtained = record.subjects.reduce((acc, sub) => acc + (sub.internalMarks || 0) + (sub.assignmentMarks || 0), 0);
                                    const totalMax = record.subjects.length * 200; 
                                    const percentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(1) : 0;
                                    return `${percentage}%`;
                                })()}
                            </h2>
                        </div>
                    </div>
                </div>

                <h5 className="border-bottom pb-2 mb-3">Subject Wise Attendance & Performance</h5>
                <div className="row g-3">
                    {record.subjects && record.subjects.map((sub, idx) => (
                        <div className="col-md-6 col-lg-4" key={idx}>
                            <div className="card h-100 border-0 shadow-sm">
                                <div className="card-body">
                                    <h6 className="card-title text-primary text-truncate" title={sub.name}>{sub.name}</h6>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="badge bg-success">Grade: {sub.predictedGrade || 'N/A'}</span>
                                        <small className="text-muted">Att: {sub.attendanceHours}h</small>
                                    </div>
                                    <div className="progress mb-2" style={{height: '5px'}}>
                                        <div className="progress-bar" role="progressbar" style={{width: `${(sub.attendanceHours/120)*100}%`}}></div>
                                    </div>
                                    <div className="d-flex justify-content-between small text-secondary">
                                        <span>Int: {sub.internalMarks}</span>
                                        <span>Ass: {sub.assignmentMarks}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {(!record.subjects || record.subjects.length === 0) && (
                        <p className="text-muted fst-italic">No subject records found.</p>
                    )}
                </div>
            </div>
            <div className="card-footer text-muted small">
                Last updated: {new Date(record.updatedAt).toLocaleDateString()}
            </div>
          </div>
      )}
    </div>
  );
};

export default StudentDashboard;
