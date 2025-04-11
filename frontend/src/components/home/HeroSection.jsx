import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import FloatingElement from './FloatingElement';
import Planet3D from './Planet3D';

/**
 * Hero Section component for the home page with animated elements
 */
const HeroSection = ({ onExploreClick }) => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20 overflow-hidden">
      {/* Main content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <motion.h1 
          className="text-4xl md:text-6xl font-bold text-white mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="block">Explorez l'Univers de</span>
          <span className="bg-gradient-to-r from-blue-300 via-blue-400 to-blue-500 text-transparent bg-clip-text">
            l'Apprentissage Numérique
          </span>
        </motion.h1>
        
        <motion.p 
          className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Découvrez une nouvelle dimension de l'éducation en ligne avec notre plateforme
          interactive et immersive. Apprenez à votre rythme, explorez des technologies
          de pointe et rejoignez une communauté passionnée.
        </motion.p>
        
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Link to="/formation-finder">
            <motion.button
              className="px-8 py-4 bg-gradient-to-r from-[#001a38] to-[#0a3c6e] rounded-full text-white font-medium text-lg shadow-lg"
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(10, 60, 110, 0.5)' }}
              whileTap={{ scale: 0.98 }}
            >
              Trouver ma formation
            </motion.button>
          </Link>
          
          <Link to="/register">
            <motion.button
              className="px-8 py-4 bg-[#001a38]/60 backdrop-blur-sm rounded-full text-white font-medium text-lg border border-[#0a3c6e]/50 hover:border-blue-400"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              Rejoindre l'aventure
            </motion.button>
          </Link>
        </motion.div>
      </div>
      
      {/* Decorative planets */}
      <FloatingElement amplitude={15} duration={7}>
        <Planet3D 
          className="top-1/4 -right-20 md:right-10"
          color="rgba(10, 60, 110, 0.8)"
          size={100}
          orbitDuration={20}
          orbitDistance={30}
          onClick={onExploreClick}
        >
          <div className="w-full h-full bg-gradient-to-br from-[#0a3c6e] to-[#001a38]" />
        </Planet3D>
      </FloatingElement>
      
      <FloatingElement amplitude={20} duration={8}>
        <Planet3D 
          className="bottom-1/4 -left-10 md:left-20"
          color="rgba(0, 26, 56, 0.8)"
          size={80}
          orbitDuration={25}
          orbitDistance={20}
          onClick={onExploreClick}
        >
          <div className="w-full h-full bg-gradient-to-br from-[#0a3c6e] to-[#002147]" />
        </Planet3D>
      </FloatingElement>
      
      <FloatingElement amplitude={12} duration={6}>
        <Planet3D 
          className="top-1/3 left-1/4"
          color="rgba(0, 51, 102, 0.7)"
          size={60}
          orbitDuration={15}
          orbitDistance={15}
          onClick={onExploreClick}
        >
          <div className="w-full h-full bg-gradient-to-br from-[#003366] to-[#001a38]" />
        </Planet3D>
      </FloatingElement>
    </section>
  );
};

export default HeroSection;
