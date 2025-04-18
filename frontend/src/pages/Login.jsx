import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { AuthForm } from '@/components/AuthForm';
import QuickLoginButtons from '@/components/QuickLoginButtons';
import PageTransition from '@/components/PageTransition';
import CosmicBackground from '@/components/home/CosmicBackground';

const Login = () => {
  const { colorMode, currentTheme } = useTheme();
  const authFormRef = useRef();

  // Function to handle quick login and pass to the auth form
  const handleQuickLogin = (role) => {
    if (authFormRef.current && authFormRef.current.quickLogin) {
      authFormRef.current.quickLogin(role);
    }
  };

  return (
    <PageTransition>
      <div className={`min-h-screen ${currentTheme.bg} flex flex-col overflow-hidden relative`}>
        {/* Fond cosmique avec étoiles filantes horizontales (météorites) */}
        <CosmicBackground 
          colorMode={colorMode} 
          animationMode="cosmic" 
          shootingStarDirection="horizontal" 
        />
        
        {/* Main content */}
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <motion.div
              className="relative z-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
              />
              <div className="relative bg-gray-900/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-blue-500/30">
                <AuthForm ref={authFormRef} />
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* QuickLoginButtons component - will position itself */}
        <QuickLoginButtons onQuickLogin={handleQuickLogin} />
      </div>
    </PageTransition>
  );
};

export default Login;