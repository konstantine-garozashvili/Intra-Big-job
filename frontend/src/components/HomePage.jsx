import { useEffect, useState, useRef, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '@/lib/services/authService';
import { useRolePermissions } from '@/features/roles/useRolePermissions';
import { useNavigate } from 'react-router-dom';

/**
 * Composant pour la page d'accueil qui redirige vers la page appropriée 
 * en fonction de l'état d'authentification de l'utilisateur
 */
const HomePage = () => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dashboardPath, setDashboardPath] = useState('/login');
  const permissions = useRolePermissions();
  const navigate = useNavigate();
  const isProcessingRef = useRef(false);
  const navigationTimeoutRef = useRef(null);
  const mountedRef = useRef(true);
  
  // Memoize the auth check function
  const checkAuth = useCallback(async () => {
    if (isProcessingRef.current || !mountedRef.current) return;
    
    isProcessingRef.current = true;
    try {
      const isLoggedIn = authService.isLoggedIn();
      
      if (!mountedRef.current) return;
      
      if (isLoggedIn) {
        const roleDashboardPath = permissions.getRoleDashboardPath();
        setDashboardPath(roleDashboardPath);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      if (mountedRef.current) {
        setIsAuthenticated(false);
      }
    } finally {
      if (mountedRef.current) {
        setIsChecking(false);
      }
      isProcessingRef.current = false;
    }
  }, [permissions]);

  // Initial auth check
  useEffect(() => {
    checkAuth();
    
    return () => {
      mountedRef.current = false;
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, [checkAuth]);

  // Handle navigation after auth check
  useEffect(() => {
    if (!isChecking && !isAuthenticated && mountedRef.current) {
      // Clear any pending navigation
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
      
      // Add a small delay before navigation to prevent rapid redirects
      navigationTimeoutRef.current = setTimeout(() => {
        if (mountedRef.current && window.location.pathname === '/') {
          navigate('/login', { replace: true });
        }
      }, 100);
      
      return () => {
        if (navigationTimeoutRef.current) {
          clearTimeout(navigationTimeoutRef.current);
        }
      };
    }
  }, [isChecking, isAuthenticated, navigate]);

  // Prevent rendering during processing
  if (isProcessingRef.current || isChecking) {
    return null;
  }

  // Only render Navigate component when we're sure about the auth state
  return isAuthenticated ? (
    <Navigate to={dashboardPath} replace />
  ) : (
    <Navigate to="/login" replace />
  );
};

export default HomePage; 