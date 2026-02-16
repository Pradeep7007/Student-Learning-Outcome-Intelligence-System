import React from 'react';
import { clearAuth, getAuth } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

const SignOutButton = () => {
  const navigate = useNavigate();
  const user = getAuth();
  if (!user) return null;
  return (
    <button
      className="btn btn-outline-danger ms-auto"
      style={{ position: 'absolute', top: 16, right: 16, zIndex: 100 }}
      onClick={() => {
        clearAuth();
        navigate('/signin');
      }}
    >
      Sign Out
    </button>
  );
};

export default SignOutButton;
