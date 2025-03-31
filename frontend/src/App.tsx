import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes';

const App: React.FC = () => {
  return (
    <Router>
      <UserProvider>
        <Toaster position="top-right" />
        <AppRoutes />
      </UserProvider>
    </Router>
  );
};

export default App; 