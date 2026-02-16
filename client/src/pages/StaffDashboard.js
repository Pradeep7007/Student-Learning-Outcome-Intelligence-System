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

  const [formData, setFormData] = useState({
    studentId: '',
    rollNo: '',
    department: '',
    subject: '',
    subjectHours: 0,
    totalDaysPresent: 0,
    leaveDaysCount: 0
  });

  useEffect(() => {
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

    fetch(`${apiBase}/api/students`)
      .then(r => r.json())
      .then(d => setStudents(d || []));
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    fetch(`${apiBase}/api/staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
      .then(r => r.json())
      .then(() => {
        alert('Data inserted successfully');
        setShowForm(false);
        setFormData({
          studentId: '',
          rollNo: '',
          department: '',
          subject: '',
          subjectHours: 0,
          totalDaysPresent: 0,
          leaveDaysCount: 0
        });
      });
  };

  return (
    <div className="container p-2 position-relative">
      <SignOutButton />
      <h1>Staff Dashboard</h1>
      <p>
        Welcome, {user?.name || 'Staff'} ({user?.role || 'staff'})
      </p>

      {/* Stats Section */}
      <div className="row mb-4">
        <div className="col-12 col-md-4 mb-3">
          <div className="card text-center shadow">
            <div className="card-body">
              <h5>Total Students</h5>
              <p className="display-6">{totalStudents}</p>
            </div>
          </div>
        </div>

        {deptCounts.map(d => (
          <div className="col-12 col-md-4 mb-3" key={d._id}>
            <div className="card text-center shadow">
              <div className="card-body">
                <h6>{d._id || 'Unknown Dept'}</h6>
                <p className="display-6">{d.count}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Insert Box */}
      <div className="mb-4">
        <div
          className="card text-center shadow p-3"
          style={{ cursor: 'pointer' }}
          onClick={() => setShowForm(!showForm)}
        >
          <h5>
            <span style={{ fontSize: '24px', marginRight: '8px' }}>➕</span>
            Insert Student Data
          </h5>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card shadow p-3 mb-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label>Select Student</label>
              <select
                className="form-select"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                required
              >
                <option value="">-- Select Student --</option>
                {students.map(s => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.rollNo})
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label>Roll No</label>
              <input
                type="text"
                className="form-control"
                name="rollNo"
                value={formData.rollNo}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label>Department</label>
              <input
                type="text"
                className="form-control"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label>Subject</label>
              <select
                className="form-select"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
              >
                <option value="">-- Select Subject --</option>
                <option value="fundamentalsOfComputing">Fundamentals of Computing</option>
                <option value="dataStructuresI">Data Structures I</option>
                <option value="principlesOfProgramming">Principles of Programming</option>
                <option value="humanValuesAndEthics">Human Values & Ethics</option>
                <option value="softwareEngineering">Software Engineering</option>
                <option value="probabilityAndStatistics">Probability & Statistics</option>
              </select>
            </div>

            <div className="mb-3">
              <label>Subject Studied Hours</label>
              <input
                type="number"
                className="form-control"
                name="subjectHours"
                value={formData.subjectHours}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label>Total College Present Days</label>
              <input
                type="number"
                className="form-control"
                name="totalDaysPresent"
                value={formData.totalDaysPresent}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label>Leave Days</label>
              <input
                type="number"
                className="form-control"
                name="leaveDaysCount"
                value={formData.leaveDaysCount}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Save Data
            </button>
          </form>
        </div>
      )}

      {/* Records Section */}
      <h2 className="mt-4">Student Attendance Records</h2>
      <div className="row">
        {studentRecords.map(record => (
          <div className="col-12 col-md-6 mb-3" key={record._id}>
            <div className="card shadow">
              <div className="card-body">
                <h5>Student ID: {record.studentId}</h5>
                <p><strong>Total Days Present:</strong> {record.totalDaysPresent}</p>
                <p><strong>Leave Days:</strong> {record.leaveDaysCount}</p>

                <h6 className="mt-3">Subject Hours</h6>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item">
                    Fundamentals of Computing: {record.subjects?.fundamentalsOfComputing || 0}
                  </li>
                  <li className="list-group-item">
                    Data Structures I: {record.subjects?.dataStructuresI || 0}
                  </li>
                  <li className="list-group-item">
                    Principles of Programming: {record.subjects?.principlesOfProgramming || 0}
                  </li>
                  <li className="list-group-item">
                    Human Values & Ethics: {record.subjects?.humanValuesAndEthics || 0}
                  </li>
                  <li className="list-group-item">
                    Software Engineering: {record.subjects?.softwareEngineering || 0}
                  </li>
                  <li className="list-group-item">
                    Probability & Statistics: {record.subjects?.probabilityAndStatistics || 0}
                  </li>
                </ul>

              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StaffDashboard;
