import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from './pages/Signup';
import Signin from './pages/Signin';

import StudentDashboard from './pages/StudentDashboard';
import StaffDashboard from './pages/StaffDashboard';
import PrivateRoute from './components/PrivateRoute';
import { Navigate, useNavigate } from 'react-router-dom';
import Admin from './pages/Admin';
import AdminStudents from './pages/AdminStudents';
import AdminStaffs from './pages/AdminStaffs';
import { getAuth } from './utils/auth';

function RoleRedirectDashboard() {
  const navigate = useNavigate();
  React.useEffect(() => {
    const user = getAuth();
    if (user?.role === 'student') navigate('/dashboard/student', { replace: true });
    else if (user?.role === 'staff') navigate('/dashboard/staff', { replace: true });
    else navigate('/admin', { replace: true });
  }, [navigate]);
  return null;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/dashboard" element={<PrivateRoute><RoleRedirectDashboard /></PrivateRoute>} />
        <Route path="/dashboard/student" element={<PrivateRoute><StudentDashboard /></PrivateRoute>} />
        <Route path="/dashboard/staff" element={<PrivateRoute><StaffDashboard /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
        <Route path="/admin/students" element={<PrivateRoute><AdminStudents /></PrivateRoute>} />
        <Route path="/admin/staffs" element={<PrivateRoute><AdminStaffs /></PrivateRoute>} />
        <Route path="/" element={<Navigate to="/signin" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
