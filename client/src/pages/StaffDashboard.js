import React from 'react';
import SignOutButton from '../components/SignOutButton';
import { getAuth } from '../utils/auth';

const StaffDashboard = () => {
  const user = getAuth();
  return (
    <div className="container p-2 position-relative">
      <SignOutButton />
      <h1>Staff Dashboard</h1>
      <p>Welcome, {user?.name || 'Staff'} ({user?.role || 'staff'})</p>
      {/* Add staff-specific content here */}
    </div>
  );
};

export default StaffDashboard;
