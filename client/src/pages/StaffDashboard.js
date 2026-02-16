import React, { useEffect, useState, useCallback } from 'react';
import SignOutButton from '../components/SignOutButton';
import { getAuth } from '../utils/auth';

const StaffDashboard = () => {
  const user = getAuth();
  const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const [totalStudents, setTotalStudents] = useState(0);
  const [deptCounts, setDeptCounts] = useState([]);
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [searchRoll, setSearchRoll] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  const SUBJECTS_LIST = [
    { key: 'fundamentalsOfComputing', name: 'Fundamentals of Computing' },
    { key: 'dataStructuresI', name: 'Data Structures I' },
    { key: 'principlesOfProgramming', name: 'Principles of Programming' },
    { key: 'humanValuesAndEthics', name: 'Human Values & Ethics' },
    { key: 'softwareEngineering', name: 'Software Engineering' },
    { key: 'probabilityAndStatistics', name: 'Probability & Statistics' }
  ];

  const initialSubjectState = { attendanceHours: '', internalMarks: '', assignmentMarks: '' };

  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [department, setDepartment] = useState('');
  const [subjectData, setSubjectData] = useState(
    SUBJECTS_LIST.reduce((acc, sub) => {
      acc[sub.key] = { ...initialSubjectState };
      return acc;
    }, {})
  );

  // fetch all data
  const fetchData = useCallback(async () => {
    try {
      // 1️⃣ Total students
      const totalRes = await fetch(`${apiBase}/api/stats/students/count`);
      const totalData = await totalRes.json();
      setTotalStudents(totalData.count || 0);

      // 2️⃣ Department counts
      const deptRes = await fetch(`${apiBase}/api/stats/students/department-count`);
      const deptData = await deptRes.json();
      setDeptCounts(deptData.departments || []);

      // 3️⃣ Students list
      const studentsRes = await fetch(`${apiBase}/api/auth/students`);
      const studentsData = await studentsRes.json();
      setStudents(studentsData.students || []);

      // 4️⃣ Records (with populated studentId)
      const recordsRes = await fetch(`${apiBase}/api/staff`);
      const recordsData = await recordsRes.json();
      setRecords(recordsData || []);
    } catch (err) {
      console.error(err);
      setTotalStudents(0);
      setDeptCounts([]);
      setStudents([]);
      setRecords([]);
    }
  }, [apiBase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleStudentSelect = e => {
    const sId = e.target.value;
    setSelectedStudentId(sId);
    const student = students.find(s => s._id === sId);
    setRollNo(student?.rollno || '');
    setDepartment(student?.department || '');
  };

  const handleSubjectChange = (key, field, value) => {
    setSubjectData(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  };

  const isFormValid = () =>
    selectedStudentId && SUBJECTS_LIST.every(sub => {
      const d = subjectData[sub.key];
      return d.attendanceHours && d.internalMarks && d.assignmentMarks;
    });

  const handleSubmit = async e => {
    e.preventDefault();
    if (!isFormValid()) return alert('Please fill all fields.');

    const payload = {
      studentId: selectedStudentId,
      rollNo,
      department,
      subjects: SUBJECTS_LIST.map(sub => ({
        name: sub.name,
        code: sub.key,
        attendanceHours: parseInt(subjectData[sub.key].attendanceHours),
        internalMarks: parseInt(subjectData[sub.key].internalMarks),
        assignmentMarks: parseInt(subjectData[sub.key].assignmentMarks)
      }))
    };

    try {
      await fetch(`${apiBase}/api/staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // reset form
      setShowForm(false);
      setSelectedStudentId('');
      setRollNo('');
      setDepartment('');
      setSubjectData(SUBJECTS_LIST.reduce((acc, sub) => { acc[sub.key] = { ...initialSubjectState }; return acc; }, {}));

      fetchData(); // refresh records immediately
    } catch {
      alert('Error saving data');
    }
  };

  const filteredAndSortedRecords = records
    .filter(r => r.studentId?.rollno?.toLowerCase().includes(searchRoll.toLowerCase()))
    .sort((a, b) => {
      const rollA = a.studentId?.rollno || '';
      const rollB = b.studentId?.rollno || '';
      return sortOrder === 'asc' ? rollA.localeCompare(rollB) : rollB.localeCompare(rollA);
    });

  return (
    <div className="container p-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Staff Dashboard</h1>
        <SignOutButton />
      </div>

      <p className="lead">Welcome, {user?.name || 'Staff'} <span className="badge bg-secondary">{user?.role || 'staff'}</span></p>

      {/* Stats */}
      <div className="row mb-4">
        <div className="col-12 col-md-3 mb-3">
          <div className="card text-center shadow h-100 border-primary">
            <div className="card-header bg-primary text-white">Total Students</div>
            <div className="card-body"><h2 className="fw-bold">{totalStudents}</h2></div>
          </div>
        </div>
        {deptCounts.map(d => (
          <div className="col-12 col-md-3 mb-3" key={d._id}>
            <div className="card text-center shadow h-100 border-info">
              <div className="card-header bg-info text-white">Dept: {d._id || 'Unknown'}</div>
              <div className="card-body"><h2 className="fw-bold">{d.count}</h2></div>
            </div>
          </div>
        ))}
      </div>

      {/* Insert Academic Record */}
      <div className="mb-4 text-center">
        <button className="btn btn-success btn-lg" onClick={() => setShowForm(!showForm)}>Insert Student Academic Record</button>
      </div>

      {showForm && (
        <div className="card p-4 mb-5 bg-light">
          <form onSubmit={handleSubmit}>
            <div className="row mb-3">
              <div className="col-md-6">
                <label>Select Student</label>
                <select className="form-select" value={selectedStudentId} onChange={handleStudentSelect} required>
                  <option value="">-- Select Student --</option>
                  {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.rollno})</option>)}
                </select>
              </div>
              <div className="col-md-3">
                <label>Roll No</label>
                <input className="form-control" value={rollNo} readOnly />
              </div>
              <div className="col-md-3">
                <label>Department</label>
                <input className="form-control" value={department} readOnly />
              </div>
            </div>

            <table className="table table-bordered">
              <thead className="table-dark">
                <tr>
                  <th>Subject</th>
                  <th>Attendance (Max 120)</th>
                  <th>Internal Marks (Max 100)</th>
                  <th>Assignment Marks (Max 100)</th>
                </tr>
              </thead>
              <tbody>
                {SUBJECTS_LIST.map(sub => (
                  <tr key={sub.key}>
                    <td>{sub.name}</td>
                    <td><input type="number" min="0" max="120" className="form-control"
                      value={subjectData[sub.key].attendanceHours}
                      onChange={e => handleSubjectChange(sub.key, 'attendanceHours', e.target.value)}
                      required
                    /></td>
                    <td><input type="number" min="0" max="100" className="form-control"
                      value={subjectData[sub.key].internalMarks}
                      onChange={e => handleSubjectChange(sub.key, 'internalMarks', e.target.value)}
                      required
                    /></td>
                    <td><input type="number" min="0" max="100" className="form-control"
                      value={subjectData[sub.key].assignmentMarks}
                      onChange={e => handleSubjectChange(sub.key, 'assignmentMarks', e.target.value)}
                      required
                    /></td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button type="submit" className="btn btn-primary mt-3" disabled={!isFormValid()}>Save & Predict Grades</button>
          </form>
        </div>
      )}

      {/* Student Records */}
      <hr />
      <h3>Student Records</h3>
      <div className="row mb-3">
        <div className="col-md-4">
          <input type="text" className="form-control" placeholder="Search by Roll No..." value={searchRoll} onChange={e => setSearchRoll(e.target.value)} />
        </div>
        <div className="col-md-3">
          <select className="form-select" value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
            <option value="asc">Sort Roll No (A → Z)</option>
            <option value="desc">Sort Roll No (Z → A)</option>
          </select>
        </div>
      </div>

      <table className="table table-bordered">
        <thead className="table-dark">
          <tr>
            <th>Name</th>
            <th>Roll No</th>
            <th>Department</th>
            <th>Overall Outcome (%)</th>
          </tr>
        </thead>
        <tbody>
          {filteredAndSortedRecords.length === 0
            ? <tr><td colSpan="4" className="text-center">No records found</td></tr>
            : filteredAndSortedRecords.map(r => {
              const totalObtained = r.subjects?.reduce((acc, s) => acc + (s.internalMarks || 0) + (s.assignmentMarks || 0), 0) || 0;
              const totalMax = (r.subjects?.length || 0) * 200;
              const percentage = totalMax ? ((totalObtained / totalMax) * 100).toFixed(1) : '0.0';
              return (
                <tr key={r._id}>
                  <td>{r.studentId?.name || 'N/A'}</td>
                  <td>{r.studentId?.rollno || 'N/A'}</td>
                  <td>{r.studentId?.department || 'N/A'}</td>
                  <td>{percentage}%</td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
};

export default StaffDashboard;
