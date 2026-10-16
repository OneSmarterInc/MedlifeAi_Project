import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  // Check if access token or username exists in localStorage
  const isAuthenticated = localStorage.getItem('access_token') || localStorage.getItem('username');

  if (!isAuthenticated) {
    // Redirect unauthenticated users back to the login page
    return <Navigate to="/login" replace />;
  }

  return children;
}