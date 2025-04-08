import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * Enhanced 3D Card component for features with interactive hover effects
 */
const Card3D = ({ children, delay = 0 }) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const cardRef = useRef(null);
  
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const cardCenterX = rect.left + rect.width / 2;
    const cardCenterY = rect.top + rect.height / 2;
    
    // Calculate rotation based on mouse position relative to card center
    const rotateYValue = -((e.clientX - cardCenterX) / (rect.width / 2)) * 15;
    const rotateXValue = ((e.clientY - cardCenterY) / (rect.height / 2)) * 15;
    
    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };
  
  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };
  
  return (
    <motion.div
      ref={cardRef}
      className="relative group perspective-1000"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <motion.div
        className="preserve-3d rounded-xl transition-all duration-500 w-full"
        whileHover={{ rotateY: 15, rotateX: -10, scale: 1.05 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

export default Card3D;
