import React from 'react';
import { motion } from 'framer-motion';

/**
 * Floating Element component for creating smooth floating animations
 */
const FloatingElement = ({ children, baseX = 0, baseY = 0, amplitude = 10, duration = 5 }) => {
  return (
    <motion.div
      className="relative inline-block"
      animate={{
        y: [baseY, baseY - amplitude, baseY],
        x: [baseX, baseX + (amplitude/2), baseX]
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut'
      }}
    >
      {children}
    </motion.div>
  );
};

export default FloatingElement;
