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
          if (aRes.ok) {
            const aData = await aRes.json();
            setAcademic(aData);
          }

          const pRes = await fetch(`${apiBase}/api/user/my-prediction`, { headers });
          if (pRes.ok) {
              const pData = await pRes.json();
              setPrediction(pData);
          }
        }
      } catch (err) {
        console.error("Error fetching student data:", err);
      }
    };
    fetchData();
  }, []);

  const calculateGrade = (total) => {
    if (total >= 90) return 'O';
    if (total >= 80) return 'A+';
    if (total >= 70) return 'A';
    if (total >= 60) return 'B+';
    if (total >= 50) return 'B';
    return 'F';
  };

  const getSubjectCode = (name) => {
    // Simulated subject code based on name
    const words = name.split(' ');
    let code = words.map(w => w[0]).join('').toUpperCase();
    if (code.length < 2) code = name.substring(0, 3).toUpperCase();
    return `${code}${Math.floor(Math.random() * 100) + 100}`;
  };

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f9fafb' }}>
      <Navbar title="Student Dashboard" />
      
      <motion.div 
        className="container py-4"
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        {/* Unified Profile & Stats Box */}
        <div className="row g-4 mb-4">
          <div className="col-lg-8">
            <div className="bg-white rounded-4 border-0 shadow-sm overflow-hidden h-100">
              <div className="p-4 border-bottom bg-light bg-opacity-25">
                <h5 className="fw-bold mb-0 d-flex align-items-center">
                  <i className="bi bi-person-badge me-2 text-primary"></i>
                  Student Information
                </h5>
              </div>
              <div className="p-4">
                <div className="row align-items-center">
                  <div className="col-md-7 border-end">
                    <div className="d-flex align-items-center mb-4">
                      <div className="rounded-circle d-flex align-items-center justify-content-center text-white me-3" 
                           style={{ width: '64px', height: '64px', background: 'var(--gradient-primary)', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}>
                        <i className="bi bi-person-fill fs-2"></i>
                      </div>
                      <div>
                        <h4 className="fw-bold mb-0 text-dark">{user.name}</h4>
                        <p className="text-muted small mb-0">{user.email}</p>
                      </div>
                    </div>
                    <div className="row g-3">
                      <div className="col-6">
                        <label className="text-muted small text-uppercase fw-bold d-block mb-1">Roll Number</label>
                        <span className="fw-bold text-dark">{profile?.rollno || 'N/A'}</span>
                      </div>
                      <div className="col-6">
                        <label className="text-muted small text-uppercase fw-bold d-block mb-1">Department</label>
                        <span className="fw-bold text-dark">{profile?.department || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-5 ps-md-4 mt-4 mt-md-0">
                    <div className="mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <label className="text-muted small text-uppercase fw-bold">Attendance</label>
                        <span className={`fw-bold ${academic?.attendancePercentage < 75 ? 'text-danger' : 'text-success'}`}>
                          {academic ? `${academic.attendancePercentage}%` : '--'}
                        </span>
                      </div>
                      <div className="progress" style={{ height: '8px', borderRadius: '4px' }}>
                        <div className="progress-bar" role="progressbar" 
                             style={{ 
                               width: `${academic?.attendancePercentage || 0}%`, 
                               background: academic?.attendancePercentage < 75 ? '#ef4444' : 'linear-gradient(90deg, #10b981, #34d399)',
                               borderRadius: '4px' 
                             }}></div>
                      </div>
                    </div>
                    <div>
                      <label className="text-muted small text-uppercase fw-bold d-block mb-1">Previous CGPA</label>
                      <div className="d-flex align-items-baseline">
                        <h3 className="fw-bold mb-0 text-primary me-2">{academic?.previousSemCGPA || '--'}</h3>
                        <span className="text-muted small">Based on last semester</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div 
              className="p-4 rounded-4 h-100 d-flex flex-column justify-content-center text-center text-white"
              style={{ backgroundColor: 'blue' }}
            >
              <h4 className="fw-bold mb-3">Predicted Outcome</h4>
              <div className="text-center">
  <h1 className="display-1 fw-bold mb-0">
    {prediction?.predictedCGPA || "--"}
  </h1>
  <p className="mb-0">CGPA</p>
</div>
            </div>
          </div>
        </div>

        {/* Academic Details Table */}
        <div className="bg-white rounded-4 shadow-sm border-0 overflow-hidden">
          <div className="p-4 border-bottom bg-light bg-opacity-50">
            <h5 className="fw-bold mb-0">Subject-wise Academic Details</h5>
          </div>
          
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light bg-opacity-50">
                <tr>
                  <th className="px-4 py-3 fw-bold text-muted small text-uppercase" style={{ width: '30%' }}>Subject Name</th>
                  <th className="py-3 fw-bold text-muted small text-uppercase">Code</th>
                  <th className="text-center py-3 fw-bold text-muted small text-uppercase">Credits</th>
                  <th className="text-center py-3 fw-bold text-muted small text-uppercase">Marks</th>
                  <th className="text-center py-3 fw-bold text-muted small text-uppercase">Grade</th>
                  
                </tr>
              </thead>
              <tbody>
                {academic && academic.subjects && academic.subjects.length > 0 ? (
                  academic.subjects.map((sub, idx) => {
                    const total = (sub.internalMark || 0) + (sub.assignmentMark || 0) + (sub.practicalMark || 0);
                    return (
                      <tr key={idx}>
                        <td className="px-4 py-3">
                          <span className="fw-bold text-dark">{sub.name}</span>
                        </td>
                        <td className="py-3">
                          <span className="badge bg-light text-muted border">{getSubjectCode(sub.name)}</span>
                        </td>
                        <td className="text-center py-3">4</td>
                        <td className="text-center py-3">
                          <span className="fw-bold">{total} / 100</span>
                        </td>
                        <td className="text-center py-3">
                          <span className={`fw-bold ${total < 50 ? 'text-danger' : 'text-success'}`}>
                            {calculateGrade(total)}
                          </span>
                        </td>
                        
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <div className="text-muted">
                        <i className="bi bi-inbox fs-2 d-block mb-2"></i>
                        {academic ? 'No subject records found' : 'Academic records are being updated...'}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-4 p-3 rounded-3 bg-light text-muted small italic">
            <i className="bi bi-info-circle me-2"></i>
            Note: Passing grade is 'B' (50 marks). Credits are standard for core subjects. 
            Academic records are verified by the {academic?.staffName || 'Staff In-Charge'}.
        </div>
      </motion.div>
    </div>
  );
};

export default StudentDashboard;
