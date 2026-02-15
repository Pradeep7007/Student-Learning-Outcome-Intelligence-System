import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from './pages/Signup';
import Signin from './pages/Signin';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import { Navigate } from 'react-router-dom';
import Admin from './pages/Admin';
import AdminStudents from './pages/AdminStudents';
import AdminStaffs from './pages/AdminStaffs';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
        <Route path="/admin/students" element={<PrivateRoute><AdminStudents /></PrivateRoute>} />
        <Route path="/admin/staffs" element={<PrivateRoute><AdminStaffs /></PrivateRoute>} />
        <Route path="/" element={<Navigate to="/signin" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
