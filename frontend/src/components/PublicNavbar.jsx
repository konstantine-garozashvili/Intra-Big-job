import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

const PublicNavbar = () => {
  const { colorMode, toggleColorMode, currentTheme } = useTheme();
  const location = useLocation();

  // Déterminer la page courante
  const isLoginPage = location.pathname === '/login';
  const isRegisterPage = location.pathname === '/register';

  return (
    <nav className="fixed top-0 left-0 w-full z-40 transition-all duration-300">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
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

        <div className="flex items-center space-x-4">
          {/* Theme toggle button with animation */}
          <motion.button
            className="relative w-10 h-10 rounded-full overflow-hidden"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleColorMode}
          >
            <div className={`absolute inset-0 ${colorMode === 'navy' ? 'bg-gradient-to-br from-[#0a3c6e] to-[#001a38]' : 'bg-gradient-to-br from-gray-800 to-black'} rounded-full flex items-center justify-center shadow-lg ${currentTheme.shadow}`}>
              <AnimatePresence mode="wait">
                {colorMode === 'navy' ? (
                  <motion.div
                    key="moon"
                    initial={{ rotate: -45, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 45, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full flex items-center justify-center"
                  >
                    <div className="w-6 h-6 bg-blue-200 rounded-full relative overflow-hidden">
                      <div className="absolute -right-2 top-0 w-5 h-5 bg-[#001a38] rounded-full"></div>
                      <div className="absolute w-1 h-1 bg-blue-100 rounded-full top-2 left-2 opacity-80"></div>
                      <div className="absolute w-1.5 h-1.5 bg-blue-100 rounded-full bottom-1 left-3 opacity-60"></div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="sun"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full flex items-center justify-center"
                  >
                    <div className="w-6 h-6 bg-yellow-300 rounded-full relative">
                      {[...Array(8)].map((_, i) => (
                        <div 
                          key={i} 
                          className="absolute w-1 h-2 bg-yellow-300 origin-bottom"
                          style={{ 
                            left: '50%', 
                            top: '-20%',
                            transform: `translateX(-50%) rotate(${i * 45}deg) translateY(-100%)` 
                          }}
                        ></div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.button>

          {/* Login button - hidden on login page */}
          {!isLoginPage && (
            <Link to="/login">
              <motion.button
                className={`py-2 px-6 ${currentTheme.navButtonBg} text-white rounded-full font-medium hover:bg-opacity-90 transition-colors shadow-lg ${currentTheme.shadow}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Connexion
              </motion.button>
            </Link>
          )}

          {/* Register button - hidden on register page */}
          {!isRegisterPage && (
            <Link to="/register">
              <motion.button
                className={`py-2 px-6 bg-transparent border ${currentTheme.navButtonBorder} ${currentTheme.textPrimary} rounded-full font-medium hover:bg-opacity-10 hover:bg-white hover:text-white transition-colors shadow-lg ${currentTheme.shadow}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Inscription
              </motion.button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default PublicNavbar; 