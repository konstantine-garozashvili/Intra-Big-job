import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { AuthForm } from '@/components/AuthForm';
import QuickLoginButtons from '@/components/QuickLoginButtons';
import PageTransition from '@/components/PageTransition';

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
        {/* Animated background elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Glowing orbs */}
          <div className="absolute top-1/4 left-1/5 w-60 h-60 bg-blue-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-500 rounded-full filter blur-3xl opacity-15 animate-pulse" style={{animationDelay: '1.5s'}}></div>
          <div className="absolute top-2/3 left-1/3 w-40 h-40 bg-cyan-500 rounded-full filter blur-3xl opacity-10 animate-pulse" style={{animationDelay: '2.2s'}}></div>
          
          {/* Stars */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-white rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 2 + 1}px`,
                height: `${Math.random() * 2 + 1}px`,
              }}
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0.2, 1, 0.2],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                delay: Math.random() * 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
          ))}
          
          {/* Shooting stars */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-0.5 bg-gradient-to-r from-transparent via-white to-transparent"
              style={{
                top: `${Math.random() * 70}%`,
                left: `-10%`,
                width: '10%',
                transform: `rotate(${15 + Math.random() * 30}deg)`,
              }}
              initial={{ left: '-10%', opacity: 0 }}
              animate={{ 
                left: '120%', 
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                delay: 2 + i * 5 + Math.random() * 7,
                repeat: Infinity,
                repeatDelay: 15 + Math.random() * 10
              }}
            />
          ))}
        </div>
        
        {/* Logo and navigation */}
        <div className="container mx-auto px-4 py-6 flex justify-between items-center z-10">
          <Link to="/" className="flex items-center">
            <motion.div
              className="text-2xl font-bold text-white"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              Big<span className="text-[#528eb2]">Project</span>
            </motion.div>
          </Link>
        </div>
        
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