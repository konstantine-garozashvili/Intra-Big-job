import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// Register a new user
export const registerUser = async (email, username, password) => {
  try {
    const response = await axios.post(`${API_URL}/register`, {
      email,
      username,
      password
    });
    
    if (response.data.success) {
      // After registration, automatically log in the user
      const loginResponse = await loginUser(email, password);
      return loginResponse;
    }
    
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Erreur lors de l\'inscription');
    }
    throw new Error('Erreur de connexion au serveur');
  }
};

// Login user and get JWT token
export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login_check`, {
      username: email, // API expects username field but we use email
      password
    });
    
    if (response.data.token) {
      // Store token in localStorage
      localStorage.setItem('token', response.data.token);
      
      // Get user info
      const userInfo = await getUserInfo();
      return { token: response.data.token, user: userInfo };
    }
    
    throw new Error('Authentification échouée');
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Identifiants invalides');
    }
    throw new Error('Erreur de connexion au serveur');
  }
};

// Get current user info
export const getUserInfo = async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Non authentifié');
    }
    
    const response = await axios.get(`${API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      // Clear invalid token
      localStorage.removeItem('token');
    }
    throw error;
  }
};

// Logout user
export const logoutUser = () => {
  localStorage.removeItem('token');
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

export default {
  registerUser,
  loginUser,
  getUserInfo,
  logoutUser,
  isAuthenticated
};
