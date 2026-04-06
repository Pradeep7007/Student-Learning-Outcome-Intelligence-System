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
                          <td>{student.rollno}</td>
                          <td className="fw-bold text-primary">{student.name}</td>
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
    </div>
  );
};

export default StaffDashboard;
