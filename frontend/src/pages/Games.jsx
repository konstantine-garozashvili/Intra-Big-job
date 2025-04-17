import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import TechOdysseyFusion from '@/components/home/TechOdysseyFusion';
import CosmicBackground from '@/components/home/CosmicBackground';
import { usePublicTheme } from '@/contexts/theme/PublicThemeContext';

const SkillAssessment = () => {
  const { colorMode, toggleColorMode, currentTheme } = usePublicTheme();
  
  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <div className={`min-h-screen ${currentTheme.bg} text-white relative overflow-hidden`}>
      {/* Enhanced cosmic background with more elements */}
      <div className="absolute inset-0 z-0">
        <CosmicBackground />
        
        {/* Additional decorative elements */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 filter blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 left-1/5 w-96 h-96 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Floating geometric shapes */}
        <motion.div 
          className="absolute top-[15%] left-[10%] w-16 h-16 border border-blue-500/30 rounded-lg"
          animate={{ 
            rotate: 360,
            y: [0, -20, 0],
          }}
          transition={{ 
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            y: { duration: 5, repeat: Infinity, ease: "easeInOut" }
          }}
        />
        
        <motion.div 
          className="absolute top-[60%] right-[15%] w-24 h-24 border border-purple-500/30 rounded-full"
          animate={{ 
            rotate: -360,
            y: [0, 30, 0],
          }}
          transition={{ 
            rotate: { duration: 25, repeat: Infinity, ease: "linear" },
            y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
          }}
        />
        
        <motion.div 
          className="absolute bottom-[20%] left-[20%] w-20 h-20 border border-cyan-500/30 rotate-45"
          animate={{ 
            rotate: [45, 225, 45],
            y: [0, -25, 0],
          }}
          transition={{ 
            rotate: { duration: 15, repeat: Infinity, ease: "easeInOut" },
            y: { duration: 7, repeat: Infinity, ease: "easeInOut" }
          }}
        />
      </div>
      
      
      {/* Main content with enhanced animations and styling */}
      <div className="relative z-10 pt-28">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className={`text-4xl md:text-6xl font-bold mb-6`}>
              <span className={`bg-gradient-to-r ${colorMode === 'navy' ? 'from-blue-400 via-cyan-400 to-blue-500' : 'from-purple-400 via-pink-400 to-purple-500'} bg-clip-text text-transparent`}>
                Évaluez Vos Compétences Tech
              </span>
            </h1>
            
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '150px' }}
              transition={{ duration: 1, delay: 0.5 }}
              className={`h-1 mx-auto rounded-full ${colorMode === 'navy' ? 'bg-blue-500' : 'bg-purple-500'} mb-8`}
            />
            
            <p className={`text-xl ${colorMode === 'navy' ? 'text-blue-100' : 'text-purple-100'} max-w-3xl mx-auto mb-8 leading-relaxed`}>
              Découvrez votre niveau actuel et identifiez la formation idéale pour votre progression professionnelle dans le monde de la tech
            </p>
          </motion.div>
          
          {/* Game container with enhanced styling */}
          <motion.div 
            className="max-w-5xl mx-auto mb-16"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className={`bg-opacity-40 backdrop-blur-md rounded-2xl border shadow-2xl overflow-hidden`}
                style={{ 
                  backgroundColor: colorMode === 'navy' ? 'rgba(10, 60, 110, 0.2)' : 'rgba(30, 0, 60, 0.2)',
                  borderColor: colorMode === 'navy' ? 'rgba(0, 150, 255, 0.2)' : 'rgba(128, 0, 255, 0.2)',
                  boxShadow: colorMode === 'navy' 
                    ? '0 0 40px rgba(0, 150, 255, 0.15), inset 0 0 20px rgba(0, 150, 255, 0.05)' 
                    : '0 0 40px rgba(128, 0, 255, 0.15), inset 0 0 20px rgba(128, 0, 255, 0.05)'
                }}>
              <div className="game-container" style={{ height: 'auto', minHeight: '550px' }}>
                <TechOdysseyFusion />
              </div>
            </div>
          </motion.div>
          
          {/* Call to action section with enhanced styling */}
          <motion.div
            className="text-center mt-12 mb-20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className={`max-w-3xl mx-auto p-8 rounded-2xl backdrop-blur-md mb-10`} style={{ 
              backgroundColor: colorMode === 'navy' ? 'rgba(10, 60, 110, 0.2)' : 'rgba(30, 0, 60, 0.2)',
              borderColor: colorMode === 'navy' ? 'rgba(0, 150, 255, 0.2)' : 'rgba(128, 0, 255, 0.2)',
            }}>
              <p className={`text-lg ${colorMode === 'navy' ? 'text-blue-200' : 'text-purple-200'} max-w-3xl mx-auto mb-6 leading-relaxed`}>
                Après avoir complété cette évaluation, nous pourrons vous recommander le parcours de formation 
                le plus adapté à vos compétences actuelles et à vos objectifs professionnels.
              </p>
            </div>
            
            <Link to="/formation-finder">
              <motion.button
                className={`px-10 py-5 rounded-xl text-white font-medium text-lg shadow-xl relative overflow-hidden group`}
                style={{ 
                  background: colorMode === 'navy' 
                    ? 'linear-gradient(135deg, #0a4c95 0%, #0078e7 100%)' 
                    : 'linear-gradient(135deg, #6a11cb 0%, #8e44ad 100%)'
                }}
                whileHover={{ 
                  scale: 1.05, 
                  boxShadow: colorMode === 'navy' 
                    ? '0 0 30px rgba(0, 120, 255, 0.4)' 
                    : '0 0 30px rgba(138, 43, 226, 0.4)' 
                }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  Trouver ma formation idéale
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </span>
                <div className="absolute inset-0 w-full h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-in-out" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SkillAssessment;
