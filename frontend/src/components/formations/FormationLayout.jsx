import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

/**
 * FormationLayout - A shared layout for all formation pages
 * Provides consistent styling and navigation for formation content
 */
const FormationLayout = ({ 
  children, 
  title, 
  subtitle, 
  color = 'blue', 
  icon, 
  colorMode = 'navy'
}) => {
  const navigate = useNavigate();
  
  // Color mapping for different formation types
  const colorMap = {
    blue: {
      gradient: 'from-blue-500 to-cyan-400',
      button: 'bg-blue-600 hover:bg-blue-700',
      accent: 'bg-blue-500',
      light: 'text-blue-300',
      border: 'border-blue-500/30'
    },
    purple: {
      gradient: 'from-purple-500 to-pink-500',
      button: 'bg-purple-600 hover:bg-purple-700',
      accent: 'bg-purple-500',
      light: 'text-purple-300',
      border: 'border-purple-500/30'
    },
    green: {
      gradient: 'from-green-500 to-emerald-400',
      button: 'bg-green-600 hover:bg-green-700',
      accent: 'bg-green-500',
      light: 'text-green-300',
      border: 'border-green-500/30'
    },
    yellow: {
      gradient: 'from-yellow-500 to-orange-500',
      button: 'bg-yellow-600 hover:bg-yellow-700',
      accent: 'bg-yellow-500',
      light: 'text-yellow-300',
      border: 'border-yellow-500/30'
    },
    pink: {
      gradient: 'from-pink-500 to-red-500',
      button: 'bg-pink-600 hover:bg-pink-700',
      accent: 'bg-pink-500',
      light: 'text-pink-300',
      border: 'border-pink-500/30'
    },
    indigo: {
      gradient: 'from-indigo-500 to-blue-600',
      button: 'bg-indigo-600 hover:bg-indigo-700',
      accent: 'bg-indigo-500',
      light: 'text-indigo-300',
      border: 'border-indigo-500/30'
    }
  };
  
  const colors = colorMap[color] || colorMap.blue;
  
  
  // Animation variants
  const headerVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.8, 
        ease: "easeOut" 
      }
    }
  };
  
  const contentVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        delay: 0.3
      }
    }
  };
  
  return (
    <div className="min-h-screen relative overflow-hidden">
      
      {/* Header Section */}
      <header className="pt-32 pb-20 px-4 relative">

        
        <div className="container mx-auto relative z-10">
          <motion.div
            variants={headerVariants}
            initial="hidden"
            animate="visible"
            className="text-center max-w-4xl mx-auto"
          >
            <div className="flex items-center justify-center mb-8">
              <Link to="/formations-catalogue" className="mr-4">
                <motion.button
                  className={`py-2 px-4 rounded-lg ${colors.light} hover:bg-opacity-10 hover:bg-white`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Toutes les formations
                </motion.button>
              </Link>
            </div>
            
            <div className={`w-20 h-20 ${colors.accent} rounded-full mx-auto flex items-center justify-center mb-6`}>
              <span className="text-4xl">{icon}</span>
            </div>
            
            <h1 className={`text-4xl md:text-5xl font-bold bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent mb-4`}>
              {title}
            </h1>
            
            <p className={`text-xl ${colorMode === 'navy' ? 'text-blue-100' : 'text-gray-300'} max-w-3xl mx-auto`}>
              {subtitle}
            </p>
            
            <div className="flex justify-center mt-10 space-x-4">
              <Link to="/register">
                <motion.button
                  className={`px-8 py-3 ${colors.button} text-white rounded-lg font-medium shadow-lg`}
                  whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(0, 0, 0, 0.3)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  Commencer maintenant
                </motion.button>
              </Link>
              
              <motion.button
                className={`px-8 py-3 bg-opacity-10 bg-white text-white rounded-lg font-medium border ${colors.border}`}
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                whileTap={{ scale: 0.98 }}
              >
                En savoir plus
              </motion.button>
            </div>
          </motion.div>
        </div>
      </header>
      
      {/* Main Content */}
      <motion.main
        variants={contentVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto px-4 pb-20 relative z-10"
      >
        {children}
      </motion.main>
      
      {/* Footer */}
      <footer className={`py-10 ${colorMode === 'navy' ? 'bg-[#001a38]/80' : 'bg-gray-900/80'} backdrop-blur-lg border-t ${colorMode === 'navy' ? 'border-[#0a3c6e]/30' : 'border-gray-800/30'}`}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className={`${colorMode === 'navy' ? 'text-blue-200' : 'text-gray-300'} text-center md:text-left`}>
              {new Date().getFullYear()} Tech Odyssey Academy. Tous droits réservés.
            </p>
            
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className={`${colorMode === 'navy' ? 'text-blue-300' : 'text-purple-300'} hover:text-white transition-colors`}>
                Conditions d'utilisation
              </a>
              <a href="#" className={`${colorMode === 'navy' ? 'text-blue-300' : 'text-purple-300'} hover:text-white transition-colors`}>
                Politique de confidentialité
              </a>
              <a href="#" className={`${colorMode === 'navy' ? 'text-blue-300' : 'text-purple-300'} hover:text-white transition-colors`}>
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FormationLayout;
