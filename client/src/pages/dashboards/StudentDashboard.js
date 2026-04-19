import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { getAuth, getToken } from '../../utils/auth';
import { motion } from 'framer-motion';
import API_BASE_URL from '../../config';

const StudentDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [academic, setAcademic] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [queries, setQueries] = useState([]);
  const [showQueryModal, setShowQueryModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [queryForm, setQueryForm] = useState({
    issueType: 'Internal',
    expectedMarks: '',
    studentComment: ''
  });
  const [queryMessage, setQueryMessage] = useState('');
  const user = getAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiBase = API_BASE_URL;
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

          const qRes = await fetch(`${apiBase}/api/query/my-queries`, { headers });
          if (qRes.ok) {
              const qData = await qRes.json();
              setQueries(qData);
          }
        }
      } catch (err) {
        console.error("Error fetching student data:", err);
      }
    };
    fetchData();
  }, []);

  const fetchQueries = async () => {
    try {
      const headers = { 'x-auth-token': getToken() };
      const res = await fetch(`${API_BASE_URL}/api/query/my-queries`, { headers });
      if (res.ok) {
        const data = await res.json();
        setQueries(data);
      }
    } catch (err) {
      console.error("Error fetching queries:", err);
    }
  };

  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    if (!selectedSubject) return;

    try {
      const headers = { 
        'Content-Type': 'application/json',
        'x-auth-token': getToken() 
      };
      
      const payload = {
        subjectName: selectedSubject.name,
        issueType: queryForm.issueType,
        currentMarks: queryForm.issueType === 'Internal' ? selectedSubject.internalMark : 
                     queryForm.issueType === 'Assignment' ? selectedSubject.assignmentMark : 
                     selectedSubject.practicalMark,
        expectedMarks: Number(queryForm.expectedMarks),
        studentComment: queryForm.studentComment
      };

      const res = await fetch(`${API_BASE_URL}/api/query/create`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setQueryMessage('Query submitted successfully!');
        fetchQueries();
        setTimeout(() => {
          setShowQueryModal(false);
          setQueryMessage('');
          setQueryForm({ issueType: 'Internal', expectedMarks: '', studentComment: '' });
        }, 2000);
      } else {
        const data = await res.json();
        setQueryMessage(data.message || 'Failed to submit query');
      }
    } catch (err) {
      console.error(err);
      setQueryMessage('Error submitting query');
    }
  };

  const calculateGrade = (total) => {
    if (total >= 90) return 'O';
    if (total >= 80) return 'A+';
    if (total >= 70) return 'A';
    if (total >= 60) return 'B+';
    if (total >= 50) return 'B';
    return 'RA';
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
              style={{ backgroundColor: '#323273'}}
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
                  <th className="text-center py-3 fw-bold text-muted small text-uppercase">Action</th>
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
                        <td className="text-center py-3">
                          <button 
                            className="btn btn-sm btn-outline-primary rounded-pill px-3"
                            onClick={() => {
                              setSelectedSubject(sub);
                              setShowQueryModal(true);
                            }}
                          >
                            <i className="bi bi-question-circle me-1"></i> Doubt?
                          </button>
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

        {/* Queries Status Section */}
        <div className="mt-5 bg-white rounded-4 shadow-sm border-0 overflow-hidden mb-5">
            <div className="p-4 border-bottom bg-light bg-opacity-50 d-flex justify-content-between align-items-center">
                <h5 className="fw-bold mb-0">My Discrepancy Queries</h5>
                <span className="badge bg-primary rounded-pill">{queries.length} Total</span>
            </div>
            <div className="p-0">
                {queries.length > 0 ? (
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light bg-opacity-50">
                                <tr>
                                    <th className="px-4 py-3 fw-bold text-muted small text-uppercase">Subject / Issue</th>
                                    <th className="text-center py-3 fw-bold text-muted small text-uppercase">Marks (Current/Exp)</th>
                                    <th className="text-center py-3 fw-bold text-muted small text-uppercase">Status</th>
                                    <th className="px-4 py-3 fw-bold text-muted small text-uppercase">Resolution Info</th>
                                    <th className="text-center py-3 fw-bold text-muted small text-uppercase">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {queries.map((q, idx) => (
                                    <tr key={idx}>
                                        <td className="px-4 py-3">
                                            <div className="fw-bold text-dark">{q.subjectName}</div>
                                            <div className="text-muted small">{q.issueType} Concern</div>
                                        </td>
                                        <td className="text-center py-3">
                                            <span className="text-danger small fw-bold">{q.currentMarks}</span>
                                            <i className="bi bi-arrow-right mx-2 text-muted"></i>
                                            <span className="text-success small fw-bold">{q.expectedMarks}</span>
                                        </td>
                                        <td className="text-center py-3">
                                            <span className={`badge rounded-pill px-3 py-2 ${
                                                q.status === 'Pending' ? 'bg-warning text-dark' :
                                                q.status === 'Reviewed' ? 'bg-info text-white' :
                                                q.status === 'Resolved' ? 'bg-success' : 'bg-danger'
                                            }`}>
                                                {q.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {q.staffComment ? (
                                                <div className="small">
                                                    <span className="fw-bold text-primary">Staff: </span>
                                                    {q.staffComment}
                                                </div>
                                            ) : (
                                                <span className="text-muted small italic">Awaiting staff review...</span>
                                            )}
                                        </td>
                                        <td className="text-center py-3 text-muted small">
                                            {new Date(q.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-5 text-center text-muted">
                        <i className="bi bi-chat-left-quote fs-2 d-block mb-3 opacity-25"></i>
                        No queries raised yet. You can raise a discrepancy using the 'Doubt?' button in the marks table.
                    </div>
                )}
            </div>
        </div>

      </motion.div>

      {/* Query Modal */}
      {showQueryModal && selectedSubject && (
        <div 
          className="modal show d-block" 
          tabIndex="-1" 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header bg-primary text-white border-0 py-3">
                <h5 className="modal-title fw-bold">Raise Mark Discrepancy</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowQueryModal(false)}></button>
              </div>
              <form onSubmit={handleQuerySubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-bold text-uppercase">Subject</label>
                    <div className="form-control bg-light border-0 fw-bold">{selectedSubject.name}</div>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-bold text-uppercase">Issue Type</label>
                      <select 
                        className="form-select border-0 bg-light fw-bold"
                        value={queryForm.issueType}
                        onChange={(e) => setQueryForm({ ...queryForm, issueType: e.target.value })}
                        required
                      >
                        <option value="Internal">Internal Marks</option>
                        <option value="Assignment">Assignment Marks</option>
                        <option value="Practical">Practical Marks</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-bold text-uppercase">Expected Marks</label>
                      <input 
                        type="number" 
                        className="form-control border-0 bg-light fw-bold text-success"
                        placeholder="Out of 100"
                        value={queryForm.expectedMarks}
                        onChange={(e) => setQueryForm({ ...queryForm, expectedMarks: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-muted small fw-bold text-uppercase">Describe Discrepancy</label>
                    <textarea 
                      className="form-control border-0 bg-light"
                      rows="3"
                      placeholder="Explain why you think the marks are incorrect..."
                      value={queryForm.studentComment}
                      onChange={(e) => setQueryForm({ ...queryForm, studentComment: e.target.value })}
                      required
                    ></textarea>
                  </div>

                  {queryMessage && (
                    <div className={`alert ${queryMessage.includes('success') ? 'alert-success' : 'alert-danger'} py-2 mb-0`}>
                      {queryMessage}
                    </div>
                  )}
                </div>
                <div className="modal-footer border-0 p-4 pt-0">
                  <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowQueryModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4 fw-bold">Submit Query</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
