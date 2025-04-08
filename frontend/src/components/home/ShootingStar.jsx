import React from 'react';
import { motion } from 'framer-motion';

/**
 * Shooting Star component for dynamic background animation
 */
const ShootingStar = ({ delay = 0, duration = 2, top, left, size = 2, angle = 45 }) => {
  const distance = 100; // Distance the shooting star will travel
  
  // Calculate end position based on angle
  const endX = distance * Math.cos(angle * Math.PI / 180);
  const endY = distance * Math.sin(angle * Math.PI / 180);
  
  return (
    <motion.div
      className="absolute z-0"
      style={{
        top: `${top}%`,
        left: `${left}%`,
        width: `${size}px`,
        height: `${size}px`,
      }}
      initial={{ opacity: 0, x: 0, y: 0 }}
      animate={{
        opacity: [0, 1, 0],
        x: [0, endX],
        y: [0, endY],
      }}
      transition={{
        duration: duration,
        delay: delay,
        repeat: Infinity,
        repeatDelay: Math.random() * 15 + 10,
      }}
    >
      <div 
        className="w-full h-full rounded-full bg-white"
        style={{
          boxShadow: `0 0 ${size * 2}px ${size/2}px rgba(255, 255, 255, 0.8), 
                      0 0 ${size * 6}px ${size}px rgba(70, 131, 255, 0.4)`,
        }}
      />
      <div 
        className="absolute top-0 left-0 w-full"
        style={{
          height: `${size}px`,
          background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)',
          transform: `translateX(-${size * 10}px)`,
          opacity: 0.6,
        }}
      />
    </motion.div>
  );
};

export default ShootingStar;
