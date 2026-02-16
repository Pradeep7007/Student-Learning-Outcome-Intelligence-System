import React from 'react';
import SignOutButton from '../components/SignOutButton';
import { getAuth } from '../utils/auth';

const StudentDashboard = () => {
  const user = getAuth();
  return (
    <div className="container p-2 position-relative">
      <SignOutButton />
      <h1>Student Dashboard</h1>
      <p>Welcome, {user?.name || 'Student'} ({user?.role || 'student'})</p>
      {/* Add student-specific content here */}
    </div>
  );
};

export default StudentDashboard;
