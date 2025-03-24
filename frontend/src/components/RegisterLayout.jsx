import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { authService } from '@/lib/services/authService';

/**
 * Special layout for register page that shows navbar and footer
 * but still redirects authenticated users away from register
 */
const RegisterLayout = () => {
  const isAuthenticated = authService.isLoggedIn();
  
  // If the user is already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Show the register page with navbar and footer
  return <Outlet />;
};

export default RegisterLayout; 