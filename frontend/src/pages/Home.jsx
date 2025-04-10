import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useRolePermissions } from '@/features/roles/useRolePermissions';
import { Link } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';

// Import refactored components
import BackgroundAnimation from '@/components/home/BackgroundAnimation';
import CosmicBackground from '@/components/home/CosmicBackground';
import HeroSection from '@/components/home/HeroSection';
import ExploreModal from '@/components/home/ExploreModal';
import ConnectionModal from '@/components/ConnectionModal';
import RegistrationModal from '@/components/RegistrationModal';
import Planet3D from '@/components/home/Planet3D';
import Computer3D from '@/components/home/Computer3D';
import FeaturesSection from '@/components/home/FeaturesSection';

/**
 * Home page component with interactive elements and animations
 */
const Home = () => {
  const navigate = useNavigate();
  const { colorMode, toggleColorMode, currentTheme } = useTheme();
  
  // Animation mode state (cosmic or minimal)
  const [animationMode, setAnimationMode] = useState('cosmic');
  
  // Toggle animation mode
  const toggleAnimationMode = () => {
    setAnimationMode(prev => prev === 'cosmic' ? 'minimal' : 'cosmic');
  };
  
  // Modal states
  const [showExploreModal, setShowExploreModal] = useState(false);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  
  // Particles state for interactive animations
  const [particles, setParticles] = useState([]);
  
  // Handle explore button click
  const handleExploreClick = () => {
    setShowExploreModal(true);
  };
  
  // Handle connection button click
  const handleLoginClick = () => {
    setShowConnectionModal(true);
  };
  
  // Handle registration button click
  const handleRegisterClick = () => {
    setShowRegistrationModal(true);
  };

  // Particle animation for mode toggle buttons
  const createParticles = (x, y, color) => {
    const newParticles = [];
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 / 12) * i;
      const velocity = 2 + Math.random() * 2;
      newParticles.push({
        id: `p-${Date.now()}-${i}`,
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        size: 3 + Math.random() * 4,
        color,
        life: 1,
        opacity: 1
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  };

  // Update particles animation
  useEffect(() => {
    if (particles.length === 0) return;
    
    const interval = setInterval(() => {
      setParticles(prev => 
        prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            life: p.life - 0.02,
            opacity: p.life
          }))
          .filter(p => p.life > 0)
      );
    }, 16);
    
    return () => clearInterval(interval);
  }, [particles]);

  return (
    <div className={`min-h-screen overflow-hidden ${currentTheme.bg} text-white relative`}>
      {/* Unified cosmic background component */}
      <CosmicBackground colorMode={colorMode} animationMode={animationMode} />

      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 w-full z-40 transition-all duration-300">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            {/* Logo space - Tech Odyssey text removed */}
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Theme toggle icon */}
            <motion.button
              className="relative w-10 h-10 rounded-full overflow-hidden"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleColorMode}
            >
              <div className={`absolute inset-0 ${colorMode === 'navy' ? 'bg-gradient-to-br from-[#0a3c6e] to-[#001a38]' : 'bg-gradient-to-br from-gray-800 to-black'} rounded-full flex items-center justify-center shadow-lg ${currentTheme.shadow}`}>
                <AnimatePresence mode="wait">
                  {colorMode === 'navy' ? (
                    <motion.div
                      key="moon"
                      initial={{ rotate: -45, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 45, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="w-full h-full flex items-center justify-center"
                    >
                      <div className="w-6 h-6 bg-blue-200 rounded-full relative overflow-hidden">
                        <div className="absolute -right-2 top-0 w-5 h-5 bg-[#001a38] rounded-full"></div>
                        <div className="absolute w-1 h-1 bg-blue-100 rounded-full top-2 left-2 opacity-80"></div>
                        <div className="absolute w-1.5 h-1.5 bg-blue-100 rounded-full bottom-1 left-3 opacity-60"></div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="sun"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 1.5, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="w-full h-full flex items-center justify-center"
                    >
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.button>
            
            {/* Login/Register buttons with direct navigation */}
            <Link to="/login">
              <motion.button
                className={`py-2 px-6 ${currentTheme.navButtonBg} text-white rounded-full font-medium hover:bg-opacity-90 transition-colors shadow-lg ${currentTheme.shadow}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Connexion
              </motion.button>
            </Link>
            
            <Link to="/register">
              <motion.button
                className={`py-2 px-6 bg-transparent border ${currentTheme.navButtonBorder} ${currentTheme.textPrimary} rounded-full font-medium hover:bg-opacity-10 hover:bg-white hover:text-white transition-colors shadow-lg ${currentTheme.shadow}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Inscription
              </motion.button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main content container - all sections inside this container */}
      <div className="relative z-10">
        {/* Background Animation */}
        <BackgroundAnimation colorMode={colorMode} />

        {/* Hero Section */}
        <HeroSection 
          onExploreClick={handleExploreClick} 
        />
        
        {/* Featured Formations Section */}
        <section className="py-20 px-4 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-300 to-blue-500 text-transparent bg-clip-text">
                Formations Populaires
              </h2>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                Découvrez nos formations les plus suivies par notre communauté d'apprenants
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Formation Card 1 */}
              <motion.div 
                className="bg-gray-800 bg-opacity-40 backdrop-blur-sm rounded-xl overflow-hidden shadow-xl"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
              >
                <div className="h-40 bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center">
                  <span className="text-4xl">💻</span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">Développement Web</h3>
                  <p className="text-gray-300 mb-4">Maîtrisez HTML, CSS, JavaScript et les frameworks modernes.</p>
                  <Link to="/formations/web" className="text-blue-400 hover:text-blue-300 font-medium">
                    Découvrir →
                  </Link>
                </div>
              </motion.div>
              
              {/* Formation Card 2 */}
              <motion.div 
                className="bg-gray-800 bg-opacity-40 backdrop-blur-sm rounded-xl overflow-hidden shadow-xl"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
              >
                <div className="h-40 bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <span className="text-4xl">🤖</span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">Intelligence Artificielle</h3>
                  <p className="text-gray-300 mb-4">Découvrez le machine learning et ses applications pratiques.</p>
                  <Link to="/formations/ai" className="text-blue-400 hover:text-blue-300 font-medium">
                    Découvrir →
                  </Link>
                </div>
              </motion.div>
              
              {/* Formation Card 3 */}
              <motion.div 
                className="bg-gray-800 bg-opacity-40 backdrop-blur-sm rounded-xl overflow-hidden shadow-xl"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
              >
                <div className="h-40 bg-gradient-to-r from-green-500 to-emerald-400 flex items-center justify-center">
                  <span className="text-4xl">🔐</span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">Cybersécurité</h3>
                  <p className="text-gray-300 mb-4">Protégez les systèmes contre les menaces et vulnérabilités.</p>
                  <Link to="/formations/cybersecurity" className="text-blue-400 hover:text-blue-300 font-medium">
                    Découvrir →
                  </Link>
                </div>
              </motion.div>
            </div>
            
            <div className="text-center mt-12">
              <Link to="/all-formations">
                <motion.button
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-lg transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Voir toutes les formations
                </motion.button>
              </Link>
            </div>
          </div>
        </section>
        
        {/* Statistics Section */}
        <section className="py-20 px-4 relative">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <motion.div 
                className="bg-gray-800 bg-opacity-30 backdrop-blur-sm rounded-xl p-8 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <h3 className="text-4xl font-bold text-blue-400 mb-2">15+</h3>
                <p className="text-gray-300">Formations disponibles</p>
              </motion.div>
              
              <motion.div 
                className="bg-gray-800 bg-opacity-30 backdrop-blur-sm rounded-xl p-8 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <h3 className="text-4xl font-bold text-purple-400 mb-2">5000+</h3>
                <p className="text-gray-300">Étudiants actifs</p>
              </motion.div>
              
              <motion.div 
                className="bg-gray-800 bg-opacity-30 backdrop-blur-sm rounded-xl p-8 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <h3 className="text-4xl font-bold text-green-400 mb-2">50+</h3>
                <p className="text-gray-300">Instructeurs experts</p>
              </motion.div>
              
              <motion.div 
                className="bg-gray-800 bg-opacity-30 backdrop-blur-sm rounded-xl p-8 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <h3 className="text-4xl font-bold text-yellow-400 mb-2">98%</h3>
                <p className="text-gray-300">Taux de satisfaction</p>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Testimonials Section */}
        <section className="py-20 px-4 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-300 to-blue-500 text-transparent bg-clip-text">
                Ce que disent nos étudiants
              </h2>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                Découvrez les témoignages de ceux qui ont transformé leur carrière grâce à nos formations
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Testimonial 1 */}
              <motion.div 
                className="bg-gray-800 bg-opacity-30 backdrop-blur-sm rounded-xl p-8"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-xl font-bold mr-4">
                    SL
                  </div>
                  <div>
                    <h4 className="font-bold">Sophie Laurent</h4>
                    <p className="text-blue-400">Développeuse Web</p>
                  </div>
                </div>
                <p className="text-gray-300 italic">
                  "Grâce à la formation en développement web, j'ai pu changer complètement de carrière et trouver un emploi dans le domaine tech en seulement 6 mois. Les instructeurs sont incroyables et le contenu très pratique."
                </p>
              </motion.div>
              
              {/* Testimonial 2 */}
              <motion.div 
                className="bg-gray-800 bg-opacity-30 backdrop-blur-sm rounded-xl p-8"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-xl font-bold mr-4">
                    TM
                  </div>
                  <div>
                    <h4 className="font-bold">Thomas Martin</h4>
                    <p className="text-purple-400">Data Scientist</p>
                  </div>
                </div>
                <p className="text-gray-300 italic">
                  "La formation en science des données était exactement ce dont j'avais besoin pour me spécialiser. J'ai acquis des compétences concrètes que j'utilise quotidiennement dans mon nouveau poste. Je recommande vivement!"
                </p>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Interactive 3D Computer Section */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${currentTheme.gradientFrom} ${currentTheme.gradientVia} ${currentTheme.gradientTo} bg-clip-text text-transparent mb-4`}>
                Explorez l'Univers de l'Apprentissage Numérique
              </h2>
              <p className={`text-xl ${currentTheme.textSecondary} max-w-3xl mx-auto`}>
                Plongez dans l'univers du développement avec notre plateforme interactive et immersive.
              </p>
            </motion.div>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="md:w-1/2">
                <Computer3D colorMode={colorMode} />
              </div>
              <div className="md:w-1/2">
                <motion.div
                  className={`${currentTheme.cardBg} backdrop-blur-lg rounded-2xl p-8 border ${currentTheme.cardBorder} shadow-lg ${currentTheme.shadow}`}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                >
                  <h3 className={`text-2xl font-bold ${colorMode === 'navy' ? 'text-blue-300' : 'text-purple-300'} mb-4`}>Développez vos compétences</h3>
                  <p className={`${currentTheme.textSecondary} mb-6`}>
                    Notre plateforme vous offre un environnement de développement complet et interactif pour maîtriser les technologies les plus demandées sur le marché.
                  </p>
                  <ul className="space-y-3 mb-6">
                    {['Interfaces interactives', 'Projets pratiques', 'Mentorat personnalisé', 'Communauté active'].map((item, i) => (
                      <motion.li 
                        key={i}
                        className={`flex items-center ${currentTheme.textPrimary}`}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                      >
                        <span className={`mr-2 ${colorMode === 'navy' ? 'text-blue-300' : 'text-purple-300'}`}>✓</span> {item}
                      </motion.li>
                    ))}
                  </ul>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <motion.button
                      className={`px-6 py-3 bg-gradient-to-r ${currentTheme.buttonGradient} rounded-lg text-white font-medium shadow-md ${currentTheme.shadow}`}
                      whileHover={{ scale: 1.05, boxShadow: colorMode === 'navy' ? '0 0 20px rgba(10, 60, 110, 0.4)' : '0 0 20px rgba(0, 0, 0, 0.4)' }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate('/skill-assessment')}
                    >
                      Tester mon niveau
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section with 3D Cards */}
        <FeaturesSection colorMode={colorMode} />
        
        {/* Final CTA Section */}
        <section className="py-20 px-4 relative overflow-hidden">
          <div className="relative z-10 max-w-5xl mx-auto text-center">
            <motion.div
              className="mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${currentTheme.gradientFrom} ${currentTheme.gradientVia} ${currentTheme.gradientTo} bg-clip-text text-transparent mb-6`}>
                Embarquez pour un Voyage Éducatif Stellaire
              </h2>
              <p className={`text-xl ${currentTheme.textSecondary} max-w-3xl mx-auto`}>
                Notre plateforme vous ouvre les portes d'un monde où l'apprentissage devient une aventure captivante et enrichissante.
              </p>
              <motion.button
                className={`px-8 py-4 bg-gradient-to-r ${currentTheme.buttonGradient} rounded-lg text-white font-medium shadow-md ${currentTheme.shadow} mt-8`}
                whileHover={{ scale: 1.05, boxShadow: colorMode === 'navy' ? '0 0 20px rgba(10, 60, 110, 0.4)' : '0 0 20px rgba(0, 0, 0, 0.4)' }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExploreClick}
              >
                Explorer l'univers
              </motion.button>
            </motion.div>
            
            {/* Floating planets */}
            <div className="absolute top-1/4 -right-20 opacity-70 pointer-events-none">
              <Planet3D 
                color={colorMode === 'navy' ? "rgba(10, 60, 110, 0.8)" : "rgba(75, 0, 130, 0.8)"}
                size={120}
                orbitDuration={25}
                orbitDistance={30}
              >
                <div className={`w-full h-full ${colorMode === 'navy' ? 'bg-gradient-to-br from-[#0a3c6e] to-[#001a38]' : 'bg-gradient-to-br from-purple-900 to-black'}`} />
              </Planet3D>
            </div>
            
            <div className="absolute bottom-1/4 -left-10 opacity-70 pointer-events-none">
              <Planet3D 
                color={colorMode === 'navy' ? "rgba(10, 60, 110, 0.8)" : "rgba(75, 0, 130, 0.8)"}
                size={80}
                orbitDuration={20}
                orbitDistance={20}
              >
                <div className={`w-full h-full ${colorMode === 'navy' ? 'bg-gradient-to-br from-[#0a3c6e] to-[#001a38]' : 'bg-gradient-to-br from-purple-900 to-black'}`} />
              </Planet3D>
            </div>
          </div>
        </section>
      </div>
      
      {/* Modals */}
      <ConnectionModal 
        isOpen={showConnectionModal} 
        onClose={() => setShowConnectionModal(false)} 
        colorMode={colorMode}
      />
      
      <RegistrationModal 
        isOpen={showRegistrationModal} 
        onClose={() => setShowRegistrationModal(false)} 
        colorMode={colorMode}
      />
      
      <ExploreModal 
        isOpen={showExploreModal} 
        onClose={() => setShowExploreModal(false)} 
        colorMode={colorMode}
      />
    </div>
  );
};

export default Home;
