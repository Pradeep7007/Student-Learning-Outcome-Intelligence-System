import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { getAuth, getToken } from '../../utils/auth';
import { SUBJECTS_MAP } from '../../utils/subjects';
import API_BASE_URL from '../../config';

const StaffDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [marks, setMarks] = useState({});
  const [message, setMessage] = useState('');
  const [extraData, setExtraData] = useState({ cgpa: '', attendance: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [viewingStudent, setViewingStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null); // 'risk', 'medium', 'high'

  const user = getAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiBase = API_BASE_URL;
        const headers = { 'x-auth-token': getToken() };

        // Fetch Profile
        const pRes = await fetch(`${apiBase}/api/user/profile`, { headers });
        const pData = await pRes.json();
        if (pRes.ok) setProfile(pData.profile);

        // Fetch Stats
        const sRes = await fetch(`${apiBase}/api/user/stats`, { headers });
        const sData = await sRes.json();
        if (sRes.ok) setStats(sData);

        // Fetch Students in Department (all; we will filter in UI)
        const stRes = await fetch(`${apiBase}/api/user/students-in-dept`, {
          headers,
        });
        const stData = await stRes.json();
        if (stRes.ok) setStudents(stData);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  // Only students from the logged‑in staff's department
  const filteredStudents = React.useMemo(() => {
    return profile
      ? students.filter((s) => s.department === profile.department)
      : [];
  }, [profile, students]);

  const categorized = React.useMemo(() => {
    const risk = [];
    const medium = [];
    const high = [];

    filteredStudents.forEach((s) => {
      if (
        s.academicRecord &&
        s.academicRecord.subjects &&
        s.academicRecord.subjects.length > 0
      ) {
        const subjectTotals = s.academicRecord.subjects.map(
          (sub) => sub.internalMark + sub.assignmentMark + sub.practicalMark
        );

        // Rule: High Level (>= 85 in all subjects)
        if (subjectTotals.every((total) => total >= 85)) {
          high.push(s);
          return;
        }

        // Rule: Medium Level (>= 70 in all subjects)
        if (subjectTotals.every((total) => total >= 70)) {
          medium.push(s);
          return;
        }

        // Rule: At Risk (< 56 in all subjects)
        if (subjectTotals.every((total) => total < 56)) {
          risk.push(s);
          return;
        }
      }
    });

    return { risk, medium, high };
  }, [filteredStudents]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const processedStudents = React.useMemo(() => {
    let searchableStudents = [...filteredStudents];

    if (searchTerm) {
      searchableStudents = searchableStudents.filter((student) => 
        (student.name && student.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (student.rollno && String(student.rollno).toLowerCase().includes(searchTerm.toLowerCase())) ||
        (student.semester && String(student.semester).toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (sortConfig.key !== null) {
      searchableStudents.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        if (sortConfig.key === 'predictedCGPA') {
            aVal = aVal || 0;
            bVal = bVal || 0;
        } else {
            aVal = aVal ? String(aVal).toLowerCase() : '';
            bVal = bVal ? String(bVal).toLowerCase() : '';
        }

        if (aVal < bVal) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return searchableStudents;
  }, [filteredStudents, searchTerm, sortConfig]);

  const handleStudentSelect = (e) => {
    const studentId = e.target.value;
    const student =
      filteredStudents.find((s) => String(s._id) === String(studentId)) || null;

    setSelectedStudent(student);
    setMarks({});
    setMessage('');
    setExtraData({ cgpa: '', attendance: '' });
  };

  const handleMarkChange = (subject, field, value) => {
    setMarks((prev) => ({
      ...prev,
      [subject]: {
        ...(prev[subject] || {
          internalMark: 0,
          assignmentMark: 0,
          practicalMark: 0,
        }),
        [field]: value,
      },
    }));
  };

  const handleRollClick = async (rollno) => {
    setLoadingDetail(true);
    setShowModal(true);
    try {
      const headers = { 'x-auth-token': getToken() };
      const res = await fetch(`${API_BASE_URL}/api/user/student-academic/${rollno}`, {
        headers,
      });
      const data = await res.json();
      if (res.ok) {
        setViewingStudent(data);
      } else {
        alert(data.message || 'Failed to fetch student details');
        setShowModal(false);
      }
    } catch (err) {
      console.error(err);
      alert('Error fetching details');
      setShowModal(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleSubmitAcademic = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;

    try {
      const apiBase = API_BASE_URL;
      const semester = selectedStudent.semester;
      const dept = selectedStudent.department;
      const subjectsList = SUBJECTS_MAP[dept]?.[semester] || [];

      // Validation for all subjects
      for (const name of subjectsList) {
        const sMarks = marks[name];
        if (
          !sMarks ||
          sMarks.internalMark === undefined ||
          sMarks.internalMark === '' ||
          sMarks.assignmentMark === undefined ||
          sMarks.assignmentMark === '' ||
          sMarks.practicalMark === undefined ||
          sMarks.practicalMark === ''
        ) {
          setMessage(`Please fill all mark components for: ${name}`);
          return;
        }

        const iMark = Number(sMarks.internalMark);
        const aMark = Number(sMarks.assignmentMark);
        const pMark = Number(sMarks.practicalMark);

        if (iMark > 40) {
          setMessage(`Invalid Internals for ${name}: Must be <= 40.`);
          return;
        }
        if (aMark > 20) {
          setMessage(`Invalid Assignment for ${name}: Must be <= 20.`);
          return;
        }
        if (pMark > 40) {
          setMessage(`Invalid Practical for ${name}: Must be <= 40.`);
          return;
        }
      }

      // Extra fields validation
      if (extraData.cgpa === '' || extraData.attendance === '') {
        setMessage('CGPA and Attendance are required.');
        return;
      }

      const cgpaVal = Number(extraData.cgpa);
      const attendanceVal = Number(extraData.attendance);

      if (cgpaVal > 10.0) {
        setMessage('CGPA must be <= 10.0');
        return;
      }

      if (attendanceVal < 30 || attendanceVal > 100) {
        setMessage('Attendance must be between 30 and 100 (>= 30).');
        return;
      }

      const formattedSubjects = subjectsList.map((name) => ({
        name,
        internalMark: Number(marks[name].internalMark),
        assignmentMark: Number(marks[name].assignmentMark),
        practicalMark: Number(marks[name].practicalMark),
      }));

      const res = await fetch(`${apiBase}/api/user/academic-record`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': getToken(),
        },
        body: JSON.stringify({
          studentName: selectedStudent.name,
          rollno: selectedStudent.rollno,
          email: selectedStudent.email,
          semester,
          department: dept,
          subjects: formattedSubjects,
          previousSemCGPA: cgpaVal,
          attendancePercentage: attendanceVal,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Academic details saved successfully!');
      } else {
        setMessage(data.message || 'Failed to save details');
      }
    } catch (err) {
      console.error(err);
      setMessage('Error saving details');
    }
  };

  const subjects = selectedStudent
    ? SUBJECTS_MAP[selectedStudent.department]?.[selectedStudent.semester] || []
    : [];

  return (
    <div className="min-vh-100 bg-light">
      <Navbar title="Staff Dashboard" />
      <div className="container py-5">
        <h3 className="mb-4">
          Welcome, <span className="text-primary">{user.name}</span>
        </h3>

        <div className="row g-3 mb-5">
          <div className="col-auto">
            <div className="card border-0 shadow-sm text-center p-2 px-4">
              <div className="card-body p-2">
                <h6
                  className="text-muted text-uppercase fw-bold mb-1"
                  style={{ fontSize: '0.7rem' }}
                >
                  Department
                </h6>
                <h6 className="fw-bold text-primary mb-0">
                  {profile?.department || 'N/A'}
                </h6>
              </div>
            </div>
          </div>
          <div className="col-auto">
            <div className="card border-0 shadow-sm text-center p-2 px-4">
              <div className="card-body p-2">
                <h6
                  className="text-muted text-uppercase fw-bold mb-1"
                  style={{ fontSize: '0.7rem' }}
                >
                  Email
                </h6>
                <h6 className="fw-bold mb-0">{user.email}</h6>
              </div>
            </div>
          </div>
        </div>

        <hr className="my-5 opacity-10" />

        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm p-4">
              <h5 className="fw-bold mb-4">Student Academic Entry Form</h5>

              {/* Student dropdown (filtered by staff department) */}
              <div className="mb-4">
                <label className="form-label fw-bold">Select Student</label>
                <select
                  className="form-select w-auto"
                  onChange={handleStudentSelect}
                  value={selectedStudent?._id || ''}
                  disabled={!profile}
                >
                  <option value="">
                    {profile
                      ? `Choose a student from ${profile.department} department...`
                      : 'Loading students...'}
                  </option>
                  {filteredStudents.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.rollno})
                    </option>
                  ))}
                </select>
              </div>

              {selectedStudent && (
                <div className="mt-3">
                  <div className="table-responsive">
                    <table className="table table-bordered align-middle mb-4 shadow-sm">
                      <thead className="table-dark">
                        <tr>
                          <th>Roll No</th>
                          <th>Name</th>
                          <th>Semester</th>
                          <th>Department</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        <tr>
                          <td>{selectedStudent.rollno}</td>
                          <td className="fw-bold text-primary">
                            {selectedStudent.name}
                          </td>
                          <td>{selectedStudent.semester}</td>
                          <td>{selectedStudent.department}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <form onSubmit={handleSubmitAcademic}>
                    <h6 className="fw-bold mb-3 text-secondary">
                      Marks Entry (Subjects in Columns)
                    </h6>
                    <div className="table-responsive shadow-sm rounded mb-4">
                      <table className="table table-bordered bg-white mb-0 text-center align-middle">
                        <thead className="table-primary">
                          <tr>
                            <th
                              className="bg-light"
                              style={{ width: '150px' }}
                            >
                              Assessment
                            </th>
                            {subjects.map((sub, idx) => (
                              <th
                                key={idx}
                                className="small"
                                style={{ minWidth: '120px' }}
                              >
                                {sub}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="fw-bold bg-light small">
                              Internal Mark <br />
                              <span
                                className="badge bg-info text-dark"
                                style={{ fontSize: '0.6rem' }}
                              >
                                &le; 40
                              </span>
                            </td>
                            {subjects.map((sub, idx) => (
                              <td key={idx}>
                                <input
                                  type="number"
                                  className="form-control form-control-sm text-center"
                                  value={marks[sub]?.internalMark || ''}
                                  onChange={(e) =>
                                    handleMarkChange(
                                      sub,
                                      'internalMark',
                                      e.target.value
                                    )
                                  }
                                />
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="fw-bold bg-light small">
                              Assignment Mark <br />
                              <span
                                className="badge bg-info text-dark"
                                style={{ fontSize: '0.6rem' }}
                              >
                                &le; 20
                              </span>
                            </td>
                            {subjects.map((sub, idx) => (
                              <td key={idx}>
                                <input
                                  type="number"
                                  className="form-control form-control-sm text-center"
                                  value={marks[sub]?.assignmentMark || ''}
                                  onChange={(e) =>
                                    handleMarkChange(
                                      sub,
                                      'assignmentMark',
                                      e.target.value
                                    )
                                  }
                                />
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="fw-bold bg-light small">
                              Practical Mark <br />
                              <span
                                className="badge bg-info text-dark"
                                style={{ fontSize: '0.6rem' }}
                              >
                                &le; 40
                              </span>
                            </td>
                            {subjects.map((sub, idx) => (
                              <td key={idx}>
                                <input
                                  type="number"
                                  className="form-control form-control-sm text-center"
                                  value={marks[sub]?.practicalMark || ''}
                                  onChange={(e) =>
                                    handleMarkChange(
                                      sub,
                                      'practicalMark',
                                      e.target.value
                                    )
                                  }
                                />
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="row g-3 mb-4">
                      <div className="col-md-6 col-lg-3">
                        <div className="p-3 bg-white border rounded shadow-sm">
                          <label className="form-label fw-bold small text-muted text-uppercase mb-1">
                            Previous Sem CGPA
                          </label>
                          <div className="input-group input-group-sm">
                            <input
                              type="number"
                              step="0.01"
                              className="form-control fw-bold text-primary"
                              placeholder="&le; 10.0"
                              value={extraData.cgpa}
                              onChange={(e) =>
                                setExtraData({
                                  ...extraData,
                                  cgpa: e.target.value,
                                })
                              }
                            />
                            <span
                              className="input-group-text small"
                              style={{ fontSize: '0.7rem' }}
                            >
                              &le; 10.0
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6 col-lg-3">
                        <div className="p-3 bg-white border rounded shadow-sm">
                          <label className="form-label fw-bold small text-muted text-uppercase mb-1">
                            Attendance %
                          </label>
                          <div className="input-group input-group-sm">
                            <input
                              type="number"
                              className="form-control fw-bold text-primary"
                              placeholder="30-100"
                              value={extraData.attendance}
                              onChange={(e) =>
                                setExtraData({
                                  ...extraData,
                                  attendance: e.target.value,
                                })
                              }
                            />
                            <span
                              className="input-group-text small"
                              style={{ fontSize: '0.7rem' }}
                            >
                              &ge; 30
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-end d-flex justify-content-end gap-2">
                      <button
                        type="button"
                        className="btn btn-danger fw-bold px-4 py-2 shadow-sm rounded"
                        onClick={() => {
                          setSelectedStudent(null);
                          setMarks({});
                          setMessage('');
                          setExtraData({ cgpa: '', attendance: '' });
                        }}
                      >
                        <i className="bi bi-x-lg me-2"></i> Close Form
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary fw-bold px-5 py-2 shadow-sm rounded"
                        disabled={subjects.length === 0}
                      >
                        <i className="bi bi-cloud-upload me-2"></i> Save Academic
                        Record
                      </button>
                    </div>
                    {message && (
                      <div
                        className={`mt-3 alert ${
                          message.includes('success')
                            ? 'alert-success'
                            : 'alert-danger'
                        } py-2`}
                      >
                        {message}
                      </div>
                    )}
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>

        <hr className="my-5 opacity-10" />

        <div className="row mb-5">
          <div className="col-12">
            <div className="card border-0 shadow-sm p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0">Predicted CGPA (Department Students)</h5>
                <div className="input-group" style={{ maxWidth: '300px' }}>
                  <span className="input-group-text bg-white border-end-0">
                    <i className="bi bi-search text-muted"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 ps-0"
                    placeholder="Search by name, roll no, sem..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ cursor: 'pointer' }} onClick={() => handleSort('rollno')}>
                        Roll No {sortConfig.key === 'rollno' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th style={{ cursor: 'pointer' }} onClick={() => handleSort('name')}>
                        Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th style={{ cursor: 'pointer' }} onClick={() => handleSort('semester')}>
                        Semester {sortConfig.key === 'semester' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th>Department</th>
                      <th style={{ cursor: 'pointer' }} onClick={() => handleSort('predictedCGPA')}>
                        Predicted CGPA {sortConfig.key === 'predictedCGPA' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {processedStudents.length > 0 ? (
                      processedStudents.map((student) => (
                        <tr key={student._id}>
                          <td 
                            className="text-primary fw-bold" 
                            style={{ cursor: 'pointer', textDecoration: 'underline' }}
                            onClick={() => handleRollClick(student.rollno)}
                          >
                            {student.rollno}
                          </td>
                          <td className="fw-bold">{student.name}</td>
                          <td>{student.semester}</td>
                          <td>
                            <span className="badge bg-danger">
                              {student.department}
                            </span>
                          </td>
                          <td>
                            {student.predictedCGPA ? (
                              <span
                                className={`badge ${
                                  student.predictedCGPA >= 8.0
                                    ? 'bg-success'
                                    : student.predictedCGPA >= 6.0
                                    ? 'bg-warning text-dark'
                                    : 'bg-danger'
                                } px-3 py-2`}
                                style={{ fontSize: '0.85rem' }}
                              >
                                {Number(student.predictedCGPA).toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-muted small fst-italic">
                                Not Predicted
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-4 text-muted">
                          No students found in your department.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <hr className="my-5 opacity-10" />

        <div className="row g-4 mb-5">
          {/* At Risk Summary Card */}
          <div className="col-12 col-md-4">
            <div 
              className="card border-0 shadow-sm h-100 p-4 text-center" 
              style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
              onClick={() => { setActiveCategory('risk'); setShowCategoryModal(true); }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div className="rounded-circle bg-danger bg-opacity-10 text-danger mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                <i className="bi bi-exclamation-triangle-fill fs-3"></i>
              </div>
              <h5 className="fw-bold mb-1">At-Risk Students</h5>
              <h2 className="fw-bold text-danger mb-0">{categorized.risk.length}</h2>
              <small className="text-muted">Click to view list</small>
            </div>
          </div>

          {/* Medium Level Summary Card */}
          <div className="col-12 col-md-4">
            <div 
              className="card border-0 shadow-sm h-100 p-4 text-center" 
              style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
              onClick={() => { setActiveCategory('medium'); setShowCategoryModal(true); }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div className="rounded-circle bg-warning bg-opacity-10 text-warning mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                <i className="bi bi-graph-up fs-3"></i>
              </div>
              <h5 className="fw-bold mb-1">Medium Level</h5>
              <h2 className="fw-bold text-warning mb-0" style={{ filter: 'brightness(0.8)' }}>{categorized.medium.length}</h2>
              <small className="text-muted">Click to view list</small>
            </div>
          </div>

          {/* High Level Summary Card */}
          <div className="col-12 col-md-4">
            <div 
              className="card border-0 shadow-sm h-100 p-4 text-center" 
              style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
              onClick={() => { setActiveCategory('high'); setShowCategoryModal(true); }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div className="rounded-circle bg-success bg-opacity-10 text-success mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                <i className="bi bi-stars fs-3"></i>
              </div>
              <h5 className="fw-bold mb-1">High Level</h5>
              <h2 className="fw-bold text-success mb-0">{categorized.high.length}</h2>
              <small className="text-muted">Click to view list</small>
            </div>
          </div>
        </div>

        <hr className="my-5 opacity-10" />

        <h5 className="mb-4 fw-bold">Student Statistics</h5>
        <div className="row g-3">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm bg-primary text-white p-3 h-100">
              <h6
                className="text-uppercase fw-bold opacity-75 mb-1"
                style={{ fontSize: '0.7rem' }}
              >
                Total Students {profile?.department && `(${profile.department})`}
              </h6>
              <h2 className="fw-bold m-0">{stats?.totalStudents || 0}</h2>
            </div>
          </div>

          
        </div>
      </div>

      {/* Category Student List Modal */}
      {showCategoryModal && activeCategory && (
        <div 
          className="modal show d-block" 
          tabIndex="-1" 
          style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)', zIndex: 1045 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className={`modal-header py-3 text-white ${activeCategory === 'risk' ? 'bg-danger' : activeCategory === 'medium' ? 'bg-warning text-dark' : 'bg-success'}`}>
                <h5 className="modal-title fw-bold">
                  {activeCategory === 'risk' ? 'At-Risk Students' : activeCategory === 'medium' ? 'Medium Level Students' : 'High Level Students'}
                </h5>
                <button type="button" className={`btn-close ${activeCategory === 'medium' ? '' : 'btn-close-white'}`} onClick={() => setShowCategoryModal(false)}></button>
              </div>
              <div className="modal-body p-0">
                <div className="px-3 py-2 bg-light border-bottom small text-muted">
                  {activeCategory === 'risk' ? 'Total marks < 56 in ALL subjects' : activeCategory === 'medium' ? 'Total marks ≥ 70 in ALL subjects' : 'Total marks ≥ 85 in ALL subjects'}
                </div>
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <ul className="list-group list-group-flush">
                    {categorized[activeCategory].length > 0 ? (
                      categorized[activeCategory].map((s) => (
                        <li 
                          key={s._id} 
                          className="list-group-item list-group-item-action py-3 d-flex justify-content-between align-items-center"
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            handleRollClick(s.rollno);
                            // Keep category modal open or close it? 
                            // Usually better to keep it or handle z-index.
                          }}
                        >
                          <div>
                            <span className="fw-bold text-dark d-block">{s.name}</span>
                            <small className="text-primary fw-bold">{s.rollno}</small>
                          </div>
                          <div className="text-end">
                            <span className="badge bg-light text-dark border">
                              {s.predictedCGPA ? Number(s.predictedCGPA).toFixed(2) : 'N/A'} CGPA
                            </span>
                            <i className="bi bi-chevron-right ms-2 text-muted"></i>
                          </div>
                        </li>
                      ))
                    ) : (
                      <div className="p-5 text-center text-muted">
                        <i className="bi bi-person-dash fs-1 d-block mb-3"></i>
                        No students found in this category.
                      </div>
                    )}
                  </ul>
                </div>
              </div>
              <div className="modal-footer border-0 bg-light">
                <button type="button" className="btn btn-secondary px-4 fw-bold" onClick={() => setShowCategoryModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student Details Modal */}
      {showModal && (
        <div 
          className="modal show d-block" 
          tabIndex="-1" 
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1060 }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary text-white py-3">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-person-badge me-2"></i>
                  Student Academic Profile
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body p-4 bg-light">
                {loadingDetail ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted fw-bold">Fetching comprehensive records...</p>
                  </div>
                ) : viewingStudent ? (
                  <div>
                    {/* Header Info */}
                    <div className="card border-0 shadow-sm mb-4">
                      <div className="card-body p-3">
                        <div className="row text-center g-3">
                          <div className="col-md-3 border-end">
                            <small className="text-muted text-uppercase fw-bold d-block mb-1" style={{ fontSize: '0.65rem' }}>Full Name</small>
                            <span className="fw-bold text-dark">{viewingStudent.student?.name}</span>
                          </div>
                          <div className="col-md-3 border-end">
                            <small className="text-muted text-uppercase fw-bold d-block mb-1" style={{ fontSize: '0.65rem' }}>Roll Number</small>
                            <span className="fw-bold text-primary">{viewingStudent.student?.rollno}</span>
                          </div>
                          <div className="col-md-3 border-end">
                            <small className="text-muted text-uppercase fw-bold d-block mb-1" style={{ fontSize: '0.65rem' }}>Semester</small>
                            <span className="fw-bold text-dark">SEM {viewingStudent.student?.semester}</span>
                          </div>
                          <div className="col-md-3">
                            <small className="text-muted text-uppercase fw-bold d-block mb-1" style={{ fontSize: '0.65rem' }}>Department</small>
                            <span className="badge bg-danger">{viewingStudent.student?.department}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Academic Marks Table */}
                    <h6 className="fw-bold mb-3 text-secondary">
                      <i className="bi bi-table me-2"></i>
                      Subject-wise Performance
                    </h6>
                    <div className="table-responsive shadow-sm rounded mb-4 bg-white">
                      <table className="table table-bordered table-hover mb-0 text-center align-middle">
                        <thead className="table-dark">
                          <tr>
                            <th className="text-start ps-3">Subject Name</th>
                            <th>Internals (40)</th>
                            <th>Assignment (20)</th>
                            <th>Practical (40)</th>
                            <th className="table-primary text-primary fw-bold">Total (100)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {viewingStudent.record?.subjects?.map((sub, idx) => {
                            const total = sub.internalMark + sub.assignmentMark + sub.practicalMark;
                            return (
                              <tr key={idx}>
                                <td className="text-start ps-3 fw-bold small">{sub.name}</td>
                                <td>{sub.internalMark}</td>
                                <td>{sub.assignmentMark}</td>
                                <td>{sub.practicalMark}</td>
                                <td className="fw-bold text-primary bg-light">{total}</td>
                              </tr>
                            );
                          })}
                          {!viewingStudent.record?.subjects?.length && (
                            <tr>
                              <td colSpan="5" className="text-muted py-3">No academic marks recorded for this semester yet.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Summary Stats */}
                    <div className="row g-3">
                      <div className="col-md-4">
                        <div className="p-3 bg-white border rounded shadow-sm text-center">
                          <small className="text-muted text-uppercase fw-bold d-block mb-2" style={{ fontSize: '0.65rem' }}>Previous CGPA</small>
                          <h4 className="fw-bold text-dark mb-0">{viewingStudent.record?.previousSemCGPA || 'N/A'}</h4>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="p-3 bg-white border rounded shadow-sm text-center">
                          <small className="text-muted text-uppercase fw-bold d-block mb-2" style={{ fontSize: '0.65rem' }}>Attendance</small>
                          <h4 className="fw-bold text-info mb-0">{viewingStudent.record?.attendancePercentage ? `${viewingStudent.record.attendancePercentage}%` : 'N/A'}</h4>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="p-3 bg-white border rounded shadow-sm text-center" style={{ backgroundColor: '#f8f9ff !important', border: '1px solid #dee2ff !important' }}>
                          <small className="text-muted text-uppercase fw-bold d-block mb-2" style={{ fontSize: '0.65rem' }}>Predicted CGPA</small>
                          <h4 className={`fw-bold mb-0 ${viewingStudent.prediction?.predictedCGPA >= 8.0 ? 'text-success' : viewingStudent.prediction?.predictedCGPA >= 6.0 ? 'text-warning' : 'text-danger'}`}>
                            {viewingStudent.prediction?.predictedCGPA ? Number(viewingStudent.prediction.predictedCGPA).toFixed(2) : 'N/A'}
                          </h4>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <i className="bi bi-exclamation-circle text-muted mb-3" style={{ fontSize: '2rem' }}></i>
                    <p className="text-muted">No academic records found for this student.</p>
                  </div>
                )}
              </div>
              <div className="modal-footer bg-light border-0">
                <button 
                  type="button" 
                  className="btn btn-secondary fw-bold px-4" 
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;
