import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LeadCapturePortal = ({ userProfile, onComplete }) => {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  // Animation state
  const [blackHoleActive, setBlackHoleActive] = useState(false);
  const [particlesActive, setParticlesActive] = useState(false);
  
  // Refs for animations
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  // Get recommended domain based on user profile
  const getRecommendedDomain = () => {
    const profileEntries = Object.entries(userProfile);
    profileEntries.sort((a, b) => b[1] - a[1]);
    
    const [topDomain, topScore] = profileEntries[0];
    
    const domainInfo = {
      creative: {
        title: 'Designer Tech Créatif',
        description: 'Votre créativité et votre sens de l\'esthétique vous permettent d\'innover à l\'intersection de l\'art et de la technologie.',
        icon: '✨',
        color: 'from-pink-600 to-purple-600'
      },
      analytical: {
        title: 'Développeur Full-Stack',
        description: 'Votre esprit analytique et votre logique vous permettent d\'exceller dans la création d\'applications complètes.',
        icon: '💻',
        color: 'from-blue-600 to-indigo-600'
      },
      security: {
        title: 'Expert en Cybersécurité',
        description: 'Votre attention aux détails et votre esprit critique font de vous un gardien idéal contre les menaces numériques.',
        icon: '🛡️',
        color: 'from-green-600 to-teal-600'
      },
      dataScience: {
        title: 'Data Scientist',
        description: 'Vous excellez dans l\'analyse et l\'interprétation des données pour en extraire des insights précieux.',
        icon: '📊',
        color: 'from-indigo-600 to-blue-600'
      },
      devOps: {
        title: 'Ingénieur DevOps',
        description: 'Vous avez un talent pour optimiser les infrastructures et automatiser les processus de développement.',
        icon: '⚙️',
        color: 'from-amber-600 to-orange-600'
      }
    };
    
    return {
      domain: topDomain,
      score: Math.round(topScore),
      ...domainInfo[topDomain]
    };
  };
  
  // Initialize black hole animation
  useEffect(() => {
    if (blackHoleActive && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const width = canvas.width = window.innerWidth;
      const height = canvas.height = window.innerHeight;
      
      // Particles for the black hole effect
      const particles = [];
      const particleCount = 1000;
      
      // Create particles
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 2 + 1,
          speedX: Math.random() * 3 - 1.5,
          speedY: Math.random() * 3 - 1.5,
          color: `hsl(${Math.random() * 60 + 220}, 100%, 50%)`
        });
      }
      
      // Animation function
      const animate = () => {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, width, height);
        
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Draw black hole
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 200);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
        gradient.addColorStop(0.5, 'rgba(30, 30, 70, 0.8)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, 200, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Update and draw particles
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          
          // Calculate distance to center
          const dx = p.x - centerX;
          const dy = p.y - centerY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Apply gravitational force
          const force = Math.min(10, 500 / (distance * distance));
          const angle = Math.atan2(dy, dx);
          
          p.speedX -= Math.cos(angle) * force * 0.05;
          p.speedY -= Math.sin(angle) * force * 0.05;
          
          // Apply speed limits
          const maxSpeed = 10;
          const speed = Math.sqrt(p.speedX * p.speedX + p.speedY * p.speedY);
          if (speed > maxSpeed) {
            p.speedX = (p.speedX / speed) * maxSpeed;
            p.speedY = (p.speedY / speed) * maxSpeed;
          }
          
          // Update position
          p.x += p.speedX;
          p.y += p.speedY;
          
          // Reset particles that go into the black hole
          if (distance < 50) {
            p.x = Math.random() * width;
            p.y = Math.random() * height;
            p.speedX = Math.random() * 3 - 1.5;
            p.speedY = Math.random() * 3 - 1.5;
          }
          
          // Draw particle
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
        }
        
        animationFrameRef.current = requestAnimationFrame(animate);
      };
      
      animate();
      
      // Cleanup
      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [blackHoleActive]);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
    
    // Add particle effect when typing
    if (!particlesActive) {
      setParticlesActive(true);
    }
  };
  
  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = "Votre nom est requis";
    }
    
    if (!formData.email.trim()) {
      errors.email = "Votre email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Format d'email invalide";
    }
    
    if (!formData.phone.trim()) {
      errors.phone = "Votre téléphone est requis";
    } else if (!/^[0-9+\s()-]{8,15}$/.test(formData.phone)) {
      errors.phone = "Format de téléphone invalide";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      setBlackHoleActive(true);
      
      // Simulate API call
      setTimeout(() => {
        setIsSubmitting(false);
        setIsSubmitted(true);
        
        // Call onComplete after animation
        setTimeout(() => {
          onComplete(formData);
        }, 3000);
      }, 2000);
    }
  };
  
  // Get recommended domain
  const recommendedDomain = getRecommendedDomain();
  
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Black hole animation canvas */}
      {blackHoleActive && (
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 w-full h-full z-0"
          width={window.innerWidth}
          height={window.innerHeight}
        />
      )}
      
      <div className="relative z-10 max-w-4xl mx-auto py-12 px-4">
        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -50 }}
              className="text-center"
            >
              <motion.div
                className="text-7xl mb-8 mx-auto"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
              >
                {recommendedDomain.icon}
              </motion.div>
              
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">
                Votre Profil Tech Révélé
              </h2>
              
              <p className="text-xl text-blue-200 mb-6">
                Basé sur vos performances, vous êtes un...
              </p>
              
              <div className={`bg-gradient-to-r ${recommendedDomain.color} text-white font-bold text-3xl py-3 px-6 rounded-lg inline-block mb-4`}>
                {recommendedDomain.title} ({recommendedDomain.score}%)
              </div>
              
              <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-10">
                {recommendedDomain.description}
              </p>
              
              <div className="bg-gray-800 bg-opacity-50 rounded-xl p-8 mb-10 max-w-2xl mx-auto">
                <h3 className="text-xl font-bold text-white mb-4">Votre profil complet</h3>
                
                <div className="space-y-4">
                  {Object.entries(userProfile)
                    .sort(([, a], [, b]) => b - a)
                    .map(([domain, score]) => {
                      const domainNames = {
                        creative: 'Créativité',
                        analytical: 'Analyse',
                        security: 'Sécurité',
                        dataScience: 'Data Science',
                        devOps: 'DevOps'
                      };
                      
                      const domainColors = {
                        creative: 'bg-pink-500',
                        analytical: 'bg-blue-500',
                        security: 'bg-green-500',
                        dataScience: 'bg-indigo-500',
                        devOps: 'bg-amber-500'
                      };
                      
                      const normalizedScore = Math.min(100, Math.round(score));
                      
                      return (
                        <div key={domain} className="relative pt-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <span className="text-sm font-semibold inline-block text-white">
                                {domainNames[domain]}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-semibold inline-block text-white">
                                {normalizedScore}%
                              </span>
                            </div>
                          </div>
                          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-700">
                            <motion.div
                              style={{ width: `${normalizedScore}%` }}
                              className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${domainColors[domain]}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${normalizedScore}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                            ></motion.div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-xl p-8 shadow-xl border border-blue-700 max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold text-white mb-4">Débloquez votre portail galactique</h3>
                
                <p className="text-blue-200 mb-6">
                  Pour recevoir votre rapport Tech DNA détaillé et être mis en relation avec l'un de nos mentors, transmettez vos coordonnées:
                </p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-blue-300 mb-1">Identifiant Galactique (Nom)</label>
                    <motion.div
                      initial={{ x: 0 }}
                      animate={{ x: formErrors.name ? [0, -10, 10, -10, 10, 0] : 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <input
                        type="text"
                        id="name"
                        name="name"
                        className={`w-full px-4 py-2 bg-gray-800 bg-opacity-50 border ${formErrors.name ? 'border-red-500' : 'border-blue-700'} rounded-lg text-white`}
                        placeholder="Votre nom"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                      />
                      {formErrors.name && (
                        <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                      )}
                    </motion.div>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-blue-300 mb-1">Fréquence de Communication (Email)</label>
                    <motion.div
                      initial={{ x: 0 }}
                      animate={{ x: formErrors.email ? [0, -10, 10, -10, 10, 0] : 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className={`w-full px-4 py-2 bg-gray-800 bg-opacity-50 border ${formErrors.email ? 'border-red-500' : 'border-blue-700'} rounded-lg text-white`}
                        placeholder="votre.email@exemple.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                      />
                      {formErrors.email && (
                        <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
                      )}
                    </motion.div>
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-blue-300 mb-1">Balise de Téléportation (Téléphone)</label>
                    <motion.div
                      initial={{ x: 0 }}
                      animate={{ x: formErrors.phone ? [0, -10, 10, -10, 10, 0] : 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        className={`w-full px-4 py-2 bg-gray-800 bg-opacity-50 border ${formErrors.phone ? 'border-red-500' : 'border-blue-700'} rounded-lg text-white`}
                        placeholder="Votre numéro de téléphone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                      />
                      {formErrors.phone && (
                        <p className="mt-1 text-sm text-red-500">{formErrors.phone}</p>
                      )}
                    </motion.div>
                  </div>
                  
                  <motion.button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-lg text-white font-bold shadow-lg hover:shadow-xl transition-all"
                    whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(79, 70, 229, 0.5)' }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Transmission en cours...
                      </span>
                    ) : (
                      "Activer le portail galactique"
                    )}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <motion.div
                className="text-8xl mb-8"
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, 15, -15, 0] }}
                transition={{ duration: 0.6, type: "spring" }}
              >
                ✨
              </motion.div>
              
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">
                Transmission Reçue
              </h2>
              
              <p className="text-xl text-blue-200 mb-10">
                Préparez-vous pour l'ascension, {formData.name}!
              </p>
              
              <div className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-xl p-8 shadow-xl border border-blue-700 max-w-2xl mx-auto">
                <p className="text-white mb-6">
                  Votre voyage tech commence maintenant. Un de nos mentors vous contactera bientôt pour vous guider vers votre destinée cosmique.
                </p>
                
                <div className="animate-pulse">
                  <p className="text-blue-300">Préparation du portail de téléportation...</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LeadCapturePortal;
