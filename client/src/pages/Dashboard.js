import React from 'react';
import { getAuth } from '../utils/auth';
import StudentDashboard from './dashboards/StudentDashboard';
import StaffDashboard from './dashboards/StaffDashboard';
import AdminDashboard from './dashboards/AdminDashboard';

const Dashboard = () => {
  const user = getAuth();

  if (!user) return null;

  switch (user.role) {
    case 'student':
      return <StudentDashboard />;
    case 'staff':
      return <StaffDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return (
        <div className="p-5 text-center">
          <h3>No dashboard found for role: {user.role}</h3>
        </div>
      );
  }
};

export default Dashboard;
