import React from 'react';
import { motion } from 'framer-motion';

/**
 * An elegant loading animation component that exactly matches the provided screenshot
 * Features a white center dot with glow, static dots around a dashed circle
 */
const LoadingAnimation = ({ showText = true }) => {
  // Soft blue colors from the screenshot
  const dotColors = [
    "#02284f", // Dark blue
    "#528eb2", // Primary blue
    "#7baac5", // Medium blue
    "#a0b4c3", // Light blue
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <div className="relative w-32 h-32">
        {/* Subtle background glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#f0f4f8] to-[#e6edf5] blur-xl opacity-70" />
        
        {/* Dashed circle - matches the screenshot */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#d0dbe6"
            strokeWidth="1"
            strokeDasharray="3,3"
            strokeLinecap="round"
          />
        </svg>
        
        {/* Static dots around the circle - exactly as in screenshot */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          const radius = 40;
          const x = 50 + Math.cos(angle) * radius;
          const y = 50 + Math.sin(angle) * radius;
          const size = i % 3 === 0 ? 3.5 : i % 3 === 1 ? 3 : 2.5;
          const colorIndex = i % 4;
          
          return (
            <svg
              key={i}
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 100 100"
            >
              <circle
                cx={x}
                cy={y}
                r={size}
                fill={dotColors[colorIndex]}
                opacity={i % 2 === 0 ? 0.9 : 0.7}
              />
            </svg>
          );
        })}
        
        {/* Center white dot with glow - exactly as in screenshot */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full"
          style={{ 
            boxShadow: '0 0 15px 5px rgba(255, 255, 255, 0.6), 0 0 20px 10px rgba(255, 255, 255, 0.3)' 
          }}
        />
        
        {/* Thin circle outline as shown in screenshot */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full border border-[#d0dbe6]/30"
        />
      </div>
      
      {/* Loading text with subtle fade animation - only shown if showText is true */}
      {showText && (
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.p
            className="text-base font-medium text-[#a0b4c3]"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: "easeInOut",
            }}
          >
            Chargement en cours
          </motion.p>
        </motion.div>
      )}
    </div>
  );
};

// Export a version without text for use in App.jsx and other places
export const LoadingAnimationNoText = () => <LoadingAnimation showText={false} />;

export default LoadingAnimation; 