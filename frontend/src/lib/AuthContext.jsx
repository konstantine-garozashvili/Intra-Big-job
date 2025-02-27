import { createContext, useContext, useState, useEffect } from 'react';
import { registerUser, loginUser, getUserInfo, logoutUser, isAuthenticated } from '../api/auth';
import { toast } from 'sonner';

// Create auth context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user on initial render if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (isAuthenticated()) {
        try {
          const userData = await getUserInfo();
          setUser(userData);
        } catch (err) {
          console.error('Error loading user:', err);
          logoutUser();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  // Register a new user
  const register = async (email, username, password) => {
    setError(null);
    setLoading(true);
    try {
      const data = await registerUser(email, username, password);
      setUser(data.user);
      toast.success('Inscription réussie ! Vous pouvez maintenant vous connecter.');
      return data;
    } catch (err) {
      setError(err.message);
      const errorMessage = err.message || 'Une erreur est survenue lors de l\'inscription';
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      const data = await loginUser(email, password);
      setUser(data.user);
      toast.success('Connexion réussie !');
      return data;
    } catch (err) {
      setError(err.message);
      const errorMessage = err.message || 'Identifiants incorrects';
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    logoutUser();
    setUser(null);
    toast.info('Vous avez été déconnecté');
  };

  // Check if user is authenticated
  const checkAuth = () => {
    return isAuthenticated();
  };

  // Context value
  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    isAuthenticated: checkAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
