import React from 'react';
import { motion } from 'framer-motion';

/**
 * Star component for background animation
 */
const Star = ({ top, left, size, delay }) => {
  return (
    <motion.div
      className="absolute rounded-full bg-white"
      style={{
        top: `${top}%`,
        left: `${left}%`,
        width: `${size}px`,
        height: `${size}px`,
      }}
      animate={{
        opacity: [0.1, 0.8, 0.1],
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration: Math.random() * 2 + 2,
        delay: delay,
        repeat: Infinity,
        repeatType: "reverse"
      }}
    />
  );
};

export default Star;
