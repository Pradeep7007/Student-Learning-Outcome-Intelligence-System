import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { getAuth, getToken } from '../../utils/auth';
import { motion } from 'framer-motion';

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
          const aRes = await fetch(`${apiBase}/api/user/my-academic-record`, { headers });
          const aData = await aRes.json();
          if (aRes.ok) setAcademic(aData);

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

  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, staggerChildren: 0.1 } }
  };

  const cardHover = {
    whileHover: { y: -5, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }
  };

  return (
    <div className="min-vh-100 pb-5" style={{ background: 'var(--gradient-soft)' }}>
      <Navbar title="Student Dashboard" />
      
      <motion.div 
        className="container py-5"
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        <motion.div 
            className="glass-card p-4 mb-4" 
            style={{ borderRadius: 'var(--radius-lg)' }}
            variants={containerVariants}
        >
          <div className="row align-items-center">
            <div className="col-auto">
              <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '64px', height: '64px', background: 'var(--gradient-primary)' }}>
                <i className="bi bi-person-badge-fill fs-3"></i>
              </div>
            </div>
            <div className="col">
              <h2 className="mb-0 fw-bold">Welcome back, <span className="text-gradient">{user.name}</span></h2>
              <p className="text-muted mb-0">{user.email}</p>
            </div>
          </div>
        </motion.div>
        
        <div className="row g-4 mb-5">
          <div className="col-lg-8">
            <motion.div 
                className="glass-card p-4 h-100" 
                style={{ borderRadius: 'var(--radius-lg)' }}
                {...cardHover}
            >
              <h5 className="fw-bold mb-4 d-flex align-items-center">
                <i className="bi bi-info-circle-fill me-2" style={{ color: 'var(--primary)' }}></i>
                Academic Record
              </h5>
              <div className="row g-4">
                <div className="col-md-6 border-end">
                  <div className="mb-4">
                    <label className="text-muted text-uppercase fw-bold small mb-1">Roll Number</label>
                    <h5 className="fw-bold mb-0">{profile?.rollno || 'N/A'}</h5>
                  </div>
                  <div className="mb-4">
                    <label className="text-muted text-uppercase fw-bold small mb-1">Semester</label>
                    <h5 className="fw-bold mb-0">{profile?.semester || 'N/A'}</h5>
                  </div>
                  <div className="mb-0">
                    <label className="text-muted text-uppercase fw-bold small mb-1">Department</label>
                    <h5 className="fw-bold mb-0">{profile?.department || 'N/A'}</h5>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-4">
                    <label className="text-muted text-uppercase fw-bold small mb-1">Attendance</label>
                    <h4 className={`fw-bold mb-0 ${academic?.attendancePercentage < 75 ? 'text-danger' : 'text-success'}`}>
                      {academic ? `${academic.attendancePercentage}%` : 'N/A'}
                    </h4>
                  </div>
                  <div className="mb-4">
                    <label className="text-muted text-uppercase fw-bold small mb-1">Current CGPA</label>
                    <h4 className="fw-bold mb-0 text-gradient" >{academic?.previousSemCGPA || 'N/A'}</h4>
                  </div>
                  <div className="mb-0">
                    <label className="text-muted text-uppercase fw-bold small mb-1">Advisor</label>
                    <h6 className="fw-bold mb-0 text-dark">{academic?.staffName || 'Assigning...'}</h6>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="col-lg-4">
            <div className="d-flex flex-column gap-4 h-100">
              <motion.div 
                className="glass-card p-4 flex-fill text-center d-flex flex-column justify-content-center overflow-hidden position-relative" 
                style={{ borderRadius: 'var(--radius-lg)' }}
                {...cardHover}
              >
                <div className="position-absolute top-0 start-0 w-100 h-1 bg-primary" style={{ height: '4px', background: 'var(--gradient-primary)' }}></div>
                <h6 className="text-muted text-uppercase fw-bold mb-2">Predicted CGPA</h6>
                <h2 className="fw-bold mb-0 text-gradient">
                  {prediction ? prediction.predictedCGPA : 'Calculating...'}
                </h2>
              </motion.div>
              <motion.div 
                className="glass-card p-4 flex-fill text-center d-flex flex-column justify-content-center position-relative" 
                style={{ borderRadius: 'var(--radius-lg)' }}
                {...cardHover}
              >
                <div className="position-absolute top-0 start-0 w-100 h-1" style={{ height: '4px', background: 'var(--secondary)' }}></div>
                <h6 className="text-muted text-uppercase fw-bold mb-2">Graduation Status</h6>
                <h3 className="fw-bold text-success mb-0">ON TRACK</h3>
              </motion.div>
            </div>
          </div>
        </div>

        {academic && (
          <motion.div 
            className="row mt-2"
            variants={containerVariants}
          >
            <div className="col-12">
              <div className="glass-card overflow-hidden" style={{ borderRadius: 'var(--radius-lg)' }}>
                <div className="card-header bg-transparent border-0 py-4 d-flex justify-content-between align-items-center">
                  <h5 className="fw-bold m-0 text-dark">
                    <i className="bi bi-grid-3x3-gap-fill me-2" style={{ color: 'var(--primary)' }}></i>
                    Subject-wise Grades
                  </h5>
                  <div className="d-flex gap-2">
                    <span className="badge-premium">
                      Semester {profile?.semester}
                    </span>
                  </div>
                </div>
                
                <div className="table-responsive px-4 pb-4">
                  <table className="table align-middle mb-0">
                    <thead>
                      <tr className="text-muted small text-uppercase">
                        <th className="py-3">Subject</th>
                        <th className="text-center">Internals</th>
                        <th className="text-center">Assignment</th>
                        <th className="text-center">Practical</th>
                        <th className="text-center">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {academic.subjects.map((sub, idx) => {
                        const total = sub.internalMark + sub.assignmentMark + sub.practicalMark;
                        return (
                          <tr key={idx} className="border-bottom">
                            <td className="py-3">
                              <div className="d-flex align-items-center">
                                <div className="text-muted me-3">{idx + 1}.</div>
                                <div>
                                  <h6 className="fw-bold mb-0">{sub.name}</h6>
                                  <small className="text-muted">Core</small>
                                </div>
                              </div>
                            </td>
                            <td className="text-center fw-semibold">{sub.internalMark}</td>
                            <td className="text-center fw-semibold">{sub.assignmentMark}</td>
                            <td className="text-center fw-semibold">{sub.practicalMark}</td>
                            <td className="text-center">
                              <span className={`badge ${total >= 80 ? 'bg-success' : total >= 50 ? 'bg-primary' : 'bg-danger'} rounded-pill px-3 py-2 fw-bold`} style={{ background: total >= 80 ? '' : total >= 50 ? 'var(--gradient-primary)' : '' }}>
                                {total}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {!academic && profile && (
          <motion.div 
            className="alert glass-card py-5 text-center mt-5"
            variants={containerVariants}
          >
            <i className="bi bi-cloud-snow fs-1 mb-3 d-block text-muted"></i>
            <h4 className="fw-bold">No Records Yet</h4>
            <p className="text-muted">Academic data for the current semester is being processed.</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default StudentDashboard;
