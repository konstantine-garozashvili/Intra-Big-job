import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import TechOdysseyFusion from '@/components/home/TechOdysseyFusion';
import CosmicBackground from '@/components/home/CosmicBackground';
import { useTheme } from '@/context/ThemeContext';

const Games = () => {
  const { colorMode, toggleColorMode, currentTheme } = useTheme();
  
  return (
    <div className={`min-h-screen overflow-hidden ${currentTheme.bg} text-white relative`}>
      {/* Cosmic background */}
      <CosmicBackground />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-40 transition-all duration-300">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/">
              <motion.button
                className={`px-4 py-2 ${currentTheme.buttonAlt} rounded-lg`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ← Retour
              </motion.button>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Theme toggle */}
            <motion.button
              className="relative w-10 h-10 rounded-full overflow-hidden"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleColorMode}
            >
              <div className={`absolute inset-0 ${colorMode === 'navy' ? 'bg-gradient-to-br from-[#0a3c6e] to-[#001a38]' : 'bg-gradient-to-br from-gray-800 to-black'} rounded-full flex items-center justify-center shadow-lg`}>
                {colorMode === 'navy' ? (
                  <div className="w-6 h-6 bg-blue-200 rounded-full relative overflow-hidden">
                    <div className="absolute -right-2 top-0 w-5 h-5 bg-[#001a38] rounded-full"></div>
                  </div>
                ) : (
                  <div className="w-6 h-6 bg-yellow-300 rounded-full relative">
                    {[...Array(8)].map((_, i) => (
                      <div 
                        key={i} 
                        className="absolute w-1 h-2 bg-yellow-300 origin-bottom"
                        style={{ 
                          left: '50%', 
                          top: '-20%',
                          transform: `translateX(-50%) rotate(${i * 45}deg) translateY(-100%)` 
                        }}
                      ></div>
                    ))}
                  </div>
                )}
              </div>
            </motion.button>
          </div>
        </div>
      </nav>
      
      {/* Main content */}
      <div className="relative z-10 pt-20">
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 to-purple-900/10 z-0"></div>
          <div className="absolute inset-0 z-0">
            <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500 rounded-full filter blur-3xl opacity-10 animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-500 rounded-full filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-pink-500 rounded-full filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-4">
                Trouvez Votre Formation Idéale
              </h2>
              <p className="text-xl text-blue-200 max-w-3xl mx-auto mb-8">
                Embarquez pour un voyage cosmique à travers l'univers tech et découvrez votre potentiel caché
              </p>
            </motion.div>
            
            {/* Game Display */}
            <div>
              <TechOdysseyFusion />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Games;
