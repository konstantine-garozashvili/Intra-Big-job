import React, { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Enhanced 3D Planet component with orbit animation
 */
const Planet3D = ({ className, color, size, orbitDuration, orbitDistance, hoverScale = 1.1, onClick, children }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div 
      className={`absolute ${className}`}
      animate={{
        rotateZ: [0, 360],
      }}
      transition={{
        rotateZ: {
          repeat: Infinity,
          duration: orbitDuration,
          ease: "linear"
        }
      }}
    >
      <motion.div
        className="relative"
        style={{ 
          transform: `translateX(${orbitDistance}px)`,
        }}
        whileHover={{ scale: hoverScale }}
        animate={{ rotateZ: [0, -360] }}
        transition={{ rotateZ: { repeat: Infinity, duration: orbitDuration, ease: "linear" } }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={onClick}
      >
        <div 
          className="rounded-full relative overflow-hidden cursor-pointer"
          style={{ 
            width: `${size}px`, 
            height: `${size}px`,
            boxShadow: `0 0 ${size/4}px ${color}`,
            transform: 'perspective(1000px) rotateY(20deg) rotateX(10deg)',
          }}
        >
          {children}
        </div>
        
        {/* Orbit path */}
        <div 
          className="absolute rounded-full border border-white border-opacity-10"
          style={{ 
            width: `${orbitDistance * 2 + size}px`, 
            height: `${orbitDistance * 2 + size}px`,
            top: `${-orbitDistance + size/2}px`,
            left: `${-orbitDistance + size/2}px`,
          }}
        />
      </motion.div>
    </motion.div>
  );
};

export default Planet3D;
