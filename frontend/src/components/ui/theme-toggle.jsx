import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useProtectedTheme } from '../../contexts/ProtectedThemeContext';

export function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useProtectedTheme();
  const isDark = theme === 'dark';

  return (
    <motion.button
      onClick={toggleTheme}
      className={`group relative w-10 h-10 rounded-full flex items-center justify-center bg-transparent transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-400 ${className}`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      type="button"
      whileTap={{ scale: 0.95 }}
      style={{ border: 'none', padding: 0, boxShadow: 'none' }}
    >
      {/* Fond rond semi-transparent au hover/focus */}
      <span
        className={`absolute inset-0 rounded-full pointer-events-none transition-colors duration-200
          group-hover:${isDark ? 'bg-[#232f47]/70' : 'bg-[#e5eaf3]/60'}
          group-focus-visible:${isDark ? 'bg-[#232f47]/70' : 'bg-[#e5eaf3]/60'}
        `}
      />
      <div className="relative w-6 h-6 flex items-center justify-center z-10">
        {/* Sun Icon with its own rotation */}
        <motion.div
          initial={false}
          animate={{
            opacity: isDark ? 0 : 1,
            scale: isDark ? 0 : 1,
            y: isDark ? -10 : 0,
            rotate: isDark ? 90 : 0,
          }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Sun className="w-6 h-6" strokeWidth={2} style={{ color: '#FFD600' }} />
        </motion.div>
        {/* Moon Icon with its own rotation */}
        <motion.div
          initial={false}
          animate={{
            opacity: isDark ? 1 : 0,
            scale: isDark ? 1 : 0,
            y: isDark ? 0 : 10,
            rotate: 0,
          }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Moon className="w-6 h-6 text-white" strokeWidth={1.5} />
        </motion.div>
      </div>
    </motion.button>
  );
} 