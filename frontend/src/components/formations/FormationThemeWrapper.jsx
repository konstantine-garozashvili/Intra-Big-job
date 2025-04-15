import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

/**
 * A wrapper component that provides theme context to formation pages
 */
const FormationThemeWrapper = ({ children, Component }) => {
  const { colorMode, toggleColorMode } = useTheme();
  
  return (
    <div className="relative">
      {/* Theme toggle button */}
      <div className="fixed top-4 right-4 z-50">
        <motion.button
          className="relative w-10 h-10 rounded-full overflow-hidden"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleColorMode}
        >
          <div className={`absolute inset-0 ${colorMode === 'navy' ? 'bg-gradient-to-br from-[#0a3c6e] to-[#001a38]' : 'bg-gradient-to-br from-gray-800 to-black'} rounded-full flex items-center justify-center shadow-lg`}>
            {colorMode === 'navy' ? (
              <div className="w-6 h-6 bg-blue-200 rounded-full relative overflow-hidden">
                <div className="absolute -right-2 top-0 w-5 h-5 bg-[#001a38] rounded-full"></div>
              </div>
            ) : (
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
            )}
          </div>
        </motion.button>
      </div>
      
      {/* Render the formation component with colorMode */}
      <Component colorMode={colorMode} />
    </div>
  );
};

export default FormationThemeWrapper;
