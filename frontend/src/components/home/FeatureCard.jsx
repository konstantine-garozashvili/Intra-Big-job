import React from 'react';
import { motion } from 'framer-motion';
import Card3D from './Card3D';

/**
 * Feature Card component for displaying key features with interactive effects
 */
const FeatureCard = ({ icon, title, description, color, index }) => {
  return (
    <Card3D delay={index * 0.1}>
      <div className="bg-[#001a38]/80 backdrop-blur-lg border border-[#0a3c6e]/50 rounded-xl p-6 h-full shadow-lg shadow-[#001029]/20">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${color}`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <h3 className="text-xl font-bold text-blue-200 mb-2">{title}</h3>
        <p className="text-blue-100">{description}</p>
        
        <motion.button
          className="mt-4 text-blue-300 flex items-center text-sm font-medium"
          whileHover={{ x: 5 }}
        >
          En savoir plus
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </motion.button>
      </div>
    </Card3D>
  );
};

export default FeatureCard;
