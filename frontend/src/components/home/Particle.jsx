import React from 'react';
import { motion } from 'framer-motion';

/**
 * Particle component for dynamic background animation
 */
const Particle = ({ size, color, top, left, delay, duration, amplitude }) => {
  return (
    <motion.div
      className="absolute rounded-full z-0"
      style={{
        top: `${top}%`,
        left: `${left}%`,
        width: `${size}px`,
        height: `${size}px`,
        background: color,
        boxShadow: `0 0 ${size * 2}px ${color}`
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: [0, 1, 0.8, 1, 0], 
        scale: [0, 1, 0.8, 1, 0],
        y: [`${-amplitude}px`, `${amplitude}px`, `${-amplitude}px`]
      }}
      transition={{ 
        repeat: Infinity, 
        duration: duration, 
        delay: delay,
        times: [0, 0.2, 0.5, 0.8, 1],
        y: {
          repeat: Infinity,
          duration: duration * 2,
          ease: "easeInOut"
        }
      }}
    />
  );
};

export default Particle;
