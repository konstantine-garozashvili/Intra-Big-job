import { useEffect, useState, useRef, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '@/lib/services/authService';
import { useRolePermissions } from '@/features/roles/useRolePermissions';
import { useNavigate } from 'react-router-dom';

// Form Input component from AuthForm.jsx
const FormInput = React.memo(({ 
  id, 
  label, 
  type = "text", 
  value, 
  onChange, 
  error, 
  onBlur,
  ...props 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const actualType = type === "password" ? (showPassword ? "text" : "password") : type;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-200 mb-1">
        {label}
      </label>
      <div className="mt-1 relative">
        <input
          id={id}
          name={id}
          type={actualType}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className="appearance-none block w-full px-3 py-2 border border-gray-500 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#528eb2] focus:border-[#528eb2] sm:text-sm bg-gray-800 text-white"
          {...props}
        />
        {type === "password" && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        )}
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    </div>
  );
});

FormInput.displayName = "FormInput";

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