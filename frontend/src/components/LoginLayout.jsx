import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { authService } from '@/lib/services/authService';

/**
 * Special layout for login page that shows navbar and footer
 * but still redirects authenticated users away from login
 */
const LoginLayout = () => {
  // If the user is already authenticated, redirect to dashboard immediately
  if (authService.isLoggedIn()) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Show the login page without any loading state
  return <Outlet />;
};

export default LoginLayout; 