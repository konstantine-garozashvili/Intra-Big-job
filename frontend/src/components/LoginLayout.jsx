import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { authService } from '@/lib/services/authService';
import MainLayout from './MainLayout';

/**
 * Special layout for login page that shows navbar and footer
 * but still redirects authenticated users away from login
 */
const LoginLayout = () => {
  const isAuthenticated = authService.isLoggedIn();
  
  // If the user is already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Show the login page with navbar and footer
  return <Outlet />;
};

export default LoginLayout; 