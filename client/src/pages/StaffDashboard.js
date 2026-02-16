import React, { useEffect, useState } from 'react';
import SignOutButton from '../components/SignOutButton';
import { getAuth } from '../utils/auth';

const StaffDashboard = () => {
  const user = getAuth();
  const [totalStudents, setTotalStudents] = useState(0);
  const [deptCounts, setDeptCounts] = useState([]);
  const [studentRecords, setStudentRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [showForm, setShowForm] = useState(false);

  // Constants
  const SUBJECTS_LIST = [
    { key: 'fundamentalsOfComputing', name: 'Fundamentals of Computing' },
    { key: 'dataStructuresI', name: 'Data Structures I' },
    { key: 'principlesOfProgramming', name: 'Principles of Programming' },
    { key: 'humanValuesAndEthics', name: 'Human Values & Ethics' },
    { key: 'softwareEngineering', name: 'Software Engineering' },
    { key: 'probabilityAndStatistics', name: 'Probability & Statistics' }
  ];

  // Initial state for one subject
  const initialSubjectState = {
      attendanceHours: '', // user input
      internalMarks: '',
      assignmentMarks: ''
  };

  // State for form
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [department, setDepartment] = useState('');
  
  // Map of subjectKey -> object { attendance, internal, assignment }
  const [subjectData, setSubjectData] = useState(
      SUBJECTS_LIST.reduce((acc, sub) => ({ ...acc, [sub.key]: { ...initialSubjectState } }), {})
  );

  const fetchData = () => {
    const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    fetch(`${apiBase}/api/stats/students/count`)
      .then(r => r.json())
      .then(d => setTotalStudents(d.count || 0));

    fetch(`${apiBase}/api/stats/students/department-count`)
      .then(r => r.json())
      .then(d => setDeptCounts(d.departments || []));

    fetch(`${apiBase}/api/staff`)
      .then(r => r.json())
      .then(d => setStudentRecords(d || []));

    fetch(`${apiBase}/api/auth/students`)
      .then(r => r.json())
      .then(d => setStudents(d.students || []));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStudentSelect = e => {
      const sId = e.target.value;
      setSelectedStudentId(sId);
      const student = students.find(s => s._id === sId);
      setRollNo(student?.rollno || '');
      setDepartment(student?.department || '');
  }

  const handleSubjectChange = (key, field, value) => {
      setSubjectData(prev => ({
          ...prev,
          [key]: {
              ...prev[key],
              [field]: value
          }
      }));
  };

  const isFormValid = () => {
      if (!selectedStudentId) return false;
      // Check all subjects have values
      for (const sub of SUBJECTS_LIST) {
          const data = subjectData[sub.key];
          if (!data.attendanceHours || !data.internalMarks || !data.assignmentMarks) {
              return false;
          }
          // Optional: Add range checks (e.g. attendance <= 120) here
      }
      return true;
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!isFormValid()) {
        alert('Please fill all fields for all 6 subjects.');
        return;
    }

    const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    // Prepare payload
    const subjectsPayload = SUBJECTS_LIST.map(sub => ({
        name: sub.name,
        code: sub.key,
        attendanceHours: parseInt(subjectData[sub.key].attendanceHours),
        internalMarks: parseInt(subjectData[sub.key].internalMarks),
        assignmentMarks: parseInt(subjectData[sub.key].assignmentMarks)
    }));

    const payload = {
        studentId: selectedStudentId,
        rollNo,
        department,
        subjects: subjectsPayload
    };

    fetch(`${apiBase}/api/staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(r => r.json())
      .then((res) => {
        if(res.message) alert(res.message);
        setShowForm(false);
        // Reset
        setSelectedStudentId('');
        setRollNo('');
        setDepartment('');
        setSubjectData(SUBJECTS_LIST.reduce((acc, sub) => ({ ...acc, [sub.key]: { ...initialSubjectState } }), {}));
        fetchData();
      })
      .catch(err => alert('Error saving data'));
  };

  return (
    <div className="container p-2 position-relative">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Staff Dashboard</h1>
        <SignOutButton />
      </div>
      
      <p className="lead">
        Welcome, {user?.name || 'Staff'} <span className="badge bg-secondary">{user?.role || 'staff'}</span>
      </p>

      {/* Stats Section */}
      <div className="row mb-4">
        <div className="col-12 col-md-4 mb-3">
          <div className="card text-center shadow h-100 border-primary">
            <div className="card-header bg-primary text-white">Total Students</div>
            <div className="card-body d-flex align-items-center justify-content-center">
              <h2 className="display-4 fw-bold">{totalStudents}</h2>
            </div>
          </div>
        </div>

        {deptCounts.map(d => (
          <div className="col-12 col-md-4 mb-3" key={d._id}>
            <div className="card text-center shadow h-100 border-info">
              <div className="card-header bg-info text-white">Dept: {d._id || 'Unknown'}</div>
              <div className="card-body d-flex align-items-center justify-content-center">
                 <h2 className="display-4 fw-bold">{d.count}</h2>
              </div>
            </div>
          </div>
        ))}
      </div>

      <hr />

      {/* Insert Box */}
      <div className="mb-4 text-center">
        <button 
            className="btn btn-success btn-lg shadow"
            onClick={() => setShowForm(!showForm)}
        >
            <span className="me-2 fs-4">➕</span> Insert Student Academic Record
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card shadow p-4 mb-5 border-0 bg-light">
          <h4 className="mb-3">Enter Academic Details (All Subjects Mandatory)</h4>
          
          <div className="alert alert-info py-2">
              <strong>Note:</strong> Total Days (120) and Total Hours (720) are fixed and calculated automatically.
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Select Student</label>
                  <select
                    className="form-select"
                    value={selectedStudentId}
                    onChange={handleStudentSelect}
                    required
                  >
                    <option value="">-- Select Student --</option>
                    {students.map(s => (
                      <option key={s._id} value={s._id}>
                        {s.name} ({s.rollno})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label">Roll No</label>
                  <input type="text" className="form-control" value={rollNo} readOnly />
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label">Department</label>
                  <input type="text" className="form-control" value={department} readOnly />
                </div>
            </div>
            
            <div className="table-responsive">
                <table className="table table-bordered table-striped bg-white">
                    <thead className="table-light">
                        <tr>
                            <th>Subject</th>
                            <th>Attendance (Max 120 hrs)</th>
                            <th>Internal Marks (Max 100)</th>
                            <th>Assignment Marks (Max 100)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {SUBJECTS_LIST.map(sub => (
                            <tr key={sub.key}>
                                <td>{sub.name}</td>
                                <td>
                                    <input 
                                        type="number" 
                                        className="form-control"
                                        min="0" max="120"
                                        value={subjectData[sub.key].attendanceHours}
                                        onChange={(e) => handleSubjectChange(sub.key, 'attendanceHours', e.target.value)}
                                        required
                                    />
                                </td>
                                <td>
                                    <input 
                                        type="number" 
                                        className="form-control"
                                        min="0" max="100"
                                        value={subjectData[sub.key].internalMarks}
                                        onChange={(e) => handleSubjectChange(sub.key, 'internalMarks', e.target.value)}
                                        required
                                    />
                                </td>
                                <td>
                                    <input 
                                        type="number" 
                                        className="form-control"
                                        min="0" max="100"
                                        value={subjectData[sub.key].assignmentMarks}
                                        onChange={(e) => handleSubjectChange(sub.key, 'assignmentMarks', e.target.value)}
                                        required
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="d-grid gap-2 mt-3">
                <button type="submit" className="btn btn-primary btn-lg" disabled={!isFormValid()}>
                    Save & Predict Grades
                </button>
            </div>
          </form>
        </div>
      )}

      {/* Records Section */}
      <h2 className="mt-4 mb-3 border-bottom pb-2">Students Records</h2>
      {studentRecords.length === 0 ? (
          <p className="text-muted">No records found.</p>
      ) : (
          <div className="row">
            {studentRecords.map(record => (
              <div className="col-12 mb-3" key={record._id}>
                <div className="card shadow-sm">
                  <div className="card-header d-flex justify-content-between">
                     <span className="fw-bold">{record.studentId?.name} ({record.rollNo})</span>
                     <span className="text-muted">{record.department}</span>
                  </div>
                  <div className="card-body">
                      <div className="row">
                          {record.subjects && record.subjects.map((sub, idx) => (
                              <div className="col-6 col-md-4 col-lg-2 mb-2" key={idx}>
                                  <div className="border rounded p-2 text-center h-100 bg-light">
                                      <small className="d-block text-truncate fw-bold mb-1" title={sub.name}>{sub.name}</small>
                                      <div className="badge bg-success mb-1">Grade: {sub.predictedGrade || '-'}</div>
                                      <div style={{fontSize: '0.8rem'}}>
                                          <div>Att: {sub.attendanceHours}h</div>
                                          <div>Int: {sub.internalMarks}</div>
                                          <div>Ass: {sub.assignmentMarks}</div>
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
      )}
    </div>
  );
};

export default StaffDashboard;
