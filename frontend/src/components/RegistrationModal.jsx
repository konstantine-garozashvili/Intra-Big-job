import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const RegistrationModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
          agreeTerms: false
        });
        setCurrentStep(1);
        setErrors({});
      }, 300);
    }
  }, [isOpen]);

  const validateStep = () => {
    const newErrors = {};
    
    if (currentStep === 1) {
      if (!formData.email) newErrors.email = "Email obligatoire";
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Format d'email invalide";
      
      if (!formData.password) newErrors.password = "Mot de passe obligatoire";
      else if (formData.password.length < 8) newErrors.password = "Au moins 8 caractères";
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
      }
    } else if (currentStep === 2) {
      if (!formData.firstName) newErrors.firstName = "Prénom obligatoire";
      if (!formData.lastName) newErrors.lastName = "Nom obligatoire";
    } else if (currentStep === 3) {
      if (!formData.agreeTerms) newErrors.agreeTerms = "Vous devez accepter les conditions";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleNextStep = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep()) return;
    
    setIsLoading(true);
    try {
      // Simulate API call with mock registration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store temporary registration data
      localStorage.setItem('registeredEmail', formData.email);
      
      toast.success("Compte créé avec succès!");
      onClose();
      navigate("/login");
    } catch (error) {
      toast.error("Une erreur est survenue lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  // Page transition variants for full-page slide effect
  const pageVariants = {
    initial: { 
      x: "100%",
      opacity: 0,
      background: "linear-gradient(135deg, #02284f 0%, #011627 100%)",
    },
    animate: {
      x: 0,
      opacity: 1,
      background: "linear-gradient(135deg, #02284f 0%, #011627 100%)",
      transition: {
        type: "spring",
        damping: 30,
        stiffness: 200,
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.8
      }
    },
    exit: {
      x: "-100%",
      opacity: 0,
      background: "linear-gradient(135deg, #02284f 0%, #011627 100%)",
      transition: {
        type: "spring",
        damping: 30,
        stiffness: 200,
        when: "afterChildren",
        staggerChildren: 0.05,
        staggerDirection: -1,
        duration: 0.6
      }
    }
  };

  // Get animation variants based on current step
  const getFormVariants = (step) => {
    if (step === 1) {
      // First step: right to left (default)
      return {
        enter: { 
          x: "100vw",
          opacity: 0,
          scale: 0.8,
          rotateY: 30
        },
        center: {
          x: 0,
          opacity: 1,
          scale: 1,
          rotateY: 0,
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 25,
            duration: 0.6
          }
        },
        exit: { 
          x: "-100vw",
          opacity: 0,
          scale: 0.8,
          rotateY: -30,
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 30,
            duration: 0.5
          }
        }
      };
    } else if (step === 2) {
      // Second step: top to bottom
      return {
        enter: { 
          y: "-100vh",
          opacity: 0,
          scale: 0.8,
          rotateX: -30
        },
        center: {
          y: 0,
          opacity: 1,
          scale: 1,
          rotateX: 0,
          transition: {
            type: "spring",
            stiffness: 200,
            damping: 25,
            duration: 0.7
          }
        },
        exit: { 
          y: "100vh",
          opacity: 0,
          scale: 0.8,
          rotateX: 30,
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 30,
            duration: 0.6
          }
        }
      };
    } else {
      // Third step: bottom to right
      return {
        enter: { 
          y: "100vh",
          opacity: 0,
          scale: 0.8,
          rotateX: 30
        },
        center: {
          y: 0,
          opacity: 1,
          scale: 1,
          rotateX: 0,
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 25,
            duration: 0.7
          }
        },
        exit: { 
          x: "100vw",
          opacity: 0,
          scale: 0.8,
          rotateY: 30,
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 30,
            duration: 0.6
          }
        }
      };
    }
  };

  // Individual element animations
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30
      }
    },
    exit: { 
      y: -20, 
      opacity: 0,
      transition: {
        duration: 0.2
      }
    },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };

  // Particle animation for background
  const generateParticles = (count) => {
    const particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 1,
        duration: Math.random() * (8 - 3) + 3
      });
    }
    return particles;
  };

  const particles = generateParticles(30);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center perspective-1000"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            
            <motion.div
              className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              key={`registration-step-${currentStep}`}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Background particles */}
              {particles.map((particle) => (
                <motion.div
                  key={particle.id}
                  className="absolute rounded-full bg-blue-400 opacity-20"
                  style={{
                    width: `${particle.size}px`,
                    height: `${particle.size}px`,
                    top: `${particle.y}%`,
                    left: `${particle.x}%`,
                    boxShadow: `0 0 ${particle.size * 2}px rgba(59, 130, 246, 0.6)`
                  }}
                  animate={{
                    y: [0, -20, 0, 20, 0],
                    x: [0, 10, 0, -10, 0],
                    opacity: [0.2, 0.3, 0.2, 0.3, 0.2],
                  }}
                  transition={{
                    duration: particle.duration,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              ))}
              
              {/* Stone texture overlay */}
              <div 
                className="absolute inset-0 opacity-10 pointer-events-none" 
                style={{ 
                  backgroundImage: 'url("/assets/images/stone-texture.png")',
                  backgroundSize: '400px',
                  mixBlendMode: 'overlay'
                }}
              />
              
              <div className="relative w-full max-w-3xl mx-auto px-4 text-white">
                <motion.div
                  className="relative w-full bg-opacity-80 bg-blue-900 backdrop-filter backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-blue-700"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.div
                    className="absolute top-0 right-0 w-full h-1"
                    initial={{ scaleX: 0 }}
                    animate={{ 
                      scaleX: 1,
                      background: [
                        "linear-gradient(90deg, #3b82f6, #8b5cf6)",
                        "linear-gradient(90deg, #8b5cf6, #ec4899)",
                        "linear-gradient(90deg, #ec4899, #3b82f6)"
                      ]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                    style={{ transformOrigin: "left" }}
                  />
                  
                  <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                      <motion.h2 
                        className="text-3xl font-bold text-white"
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-400">
                          Créer un compte
                        </span>
                      </motion.h2>
                      <motion.button 
                        onClick={onClose}
                        className="text-gray-300 hover:text-white transition-colors"
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </motion.button>
                    </div>
                    
                    <motion.div 
                      className="relative mb-10"
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <div className="flex items-center">
                        {[1, 2, 3].map((step) => (
                          <div key={step} className="flex-1 flex flex-col items-center">
                            <div 
                              className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg mb-2 transition-all ${
                                currentStep === step
                                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/50"
                                  : currentStep > step
                                  ? "bg-green-500 text-white shadow-lg shadow-green-500/50"
                                  : "bg-gray-700 text-gray-300"
                              }`}
                            >
                              {currentStep > step ? (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                step
                              )}
                            </div>
                            <div className="text-sm text-gray-300 font-medium">
                              {step === 1 ? "Identité" : step === 2 ? "Détails" : "Finalisation"}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-4 flex w-full">
                        <div className={`h-1.5 flex-1 rounded-l-full ${currentStep >= 2 ? "bg-blue-600" : "bg-gray-700"}`} />
                        <div className={`h-1.5 flex-1 rounded-r-full ${currentStep >= 3 ? "bg-blue-600" : "bg-gray-700"}`} />
                      </div>
                    </motion.div>
                    
                    <form onSubmit={handleSubmit}>
                      <AnimatePresence mode="wait" initial={false}>
                        {currentStep === 1 && (
                          <motion.div
                            key="step1"
                            variants={getFormVariants(1)}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className="space-y-6"
                          >
                            <motion.div variants={itemVariants}>
                              <label htmlFor="email" className="block text-base font-medium text-gray-200 mb-2">
                                Email
                              </label>
                              <input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`appearance-none block w-full px-4 py-3 border ${
                                  errors.email ? "border-red-400" : "border-gray-600"
                                } rounded-md shadow-sm placeholder-gray-500 bg-gray-800 bg-opacity-50 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-all`}
                                placeholder="votre@email.com"
                              />
                              {errors.email && (
                                <p className="mt-2 text-sm text-red-400">{errors.email}</p>
                              )}
                            </motion.div>
                            
                            <motion.div variants={itemVariants}>
                              <label htmlFor="password" className="block text-base font-medium text-gray-200 mb-2">
                                Mot de passe
                              </label>
                              <input
                                id="password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`appearance-none block w-full px-4 py-3 border ${
                                  errors.password ? "border-red-400" : "border-gray-600"
                                } rounded-md shadow-sm placeholder-gray-500 bg-gray-800 bg-opacity-50 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-all`}
                                placeholder="••••••••"
                              />
                              {errors.password && (
                                <p className="mt-2 text-sm text-red-400">{errors.password}</p>
                              )}
                            </motion.div>
                            
                            <motion.div variants={itemVariants}>
                              <label htmlFor="confirmPassword" className="block text-base font-medium text-gray-200 mb-2">
                                Confirmer le mot de passe
                              </label>
                              <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={`appearance-none block w-full px-4 py-3 border ${
                                  errors.confirmPassword ? "border-red-400" : "border-gray-600"
                                } rounded-md shadow-sm placeholder-gray-500 bg-gray-800 bg-opacity-50 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-all`}
                                placeholder="••••••••"
                              />
                              {errors.confirmPassword && (
                                <p className="mt-2 text-sm text-red-400">{errors.confirmPassword}</p>
                              )}
                            </motion.div>
                          </motion.div>
                        )}
                        
                        {currentStep === 2 && (
                          <motion.div
                            key="step2"
                            variants={getFormVariants(2)}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className="space-y-6"
                          >
                            <motion.div variants={itemVariants}>
                              <label htmlFor="firstName" className="block text-base font-medium text-gray-200 mb-2">
                                Prénom
                              </label>
                              <input
                                id="firstName"
                                name="firstName"
                                type="text"
                                value={formData.firstName}
                                onChange={handleChange}
                                className={`appearance-none block w-full px-4 py-3 border ${
                                  errors.firstName ? "border-red-400" : "border-gray-600"
                                } rounded-md shadow-sm placeholder-gray-500 bg-gray-800 bg-opacity-50 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-all`}
                                placeholder="John"
                              />
                              {errors.firstName && (
                                <p className="mt-2 text-sm text-red-400">{errors.firstName}</p>
                              )}
                            </motion.div>
                            
                            <motion.div variants={itemVariants}>
                              <label htmlFor="lastName" className="block text-base font-medium text-gray-200 mb-2">
                                Nom
                              </label>
                              <input
                                id="lastName"
                                name="lastName"
                                type="text"
                                value={formData.lastName}
                                onChange={handleChange}
                                className={`appearance-none block w-full px-4 py-3 border ${
                                  errors.lastName ? "border-red-400" : "border-gray-600"
                                } rounded-md shadow-sm placeholder-gray-500 bg-gray-800 bg-opacity-50 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-all`}
                                placeholder="Doe"
                              />
                              {errors.lastName && (
                                <p className="mt-2 text-sm text-red-400">{errors.lastName}</p>
                              )}
                            </motion.div>
                          </motion.div>
                        )}
                        
                        {currentStep === 3 && (
                          <motion.div
                            key="step3"
                            variants={getFormVariants(3)}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className="space-y-6"
                          >
                            <motion.div variants={itemVariants} className="space-y-6">
                              <div className="rounded-lg bg-blue-900 bg-opacity-50 p-6 border border-blue-700">
                                <div className="flex">
                                  <div className="flex-shrink-0">
                                    <svg className="h-6 w-6 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" />
                                    </svg>
                                  </div>
                                  <div className="ml-3">
                                    <h3 className="text-lg font-medium text-blue-200">Informations de compte</h3>
                                    <div className="mt-4 text-base text-blue-100 space-y-2">
                                      <p><span className="text-gray-400">Email:</span> {formData.email}</p>
                                      <p><span className="text-gray-400">Nom:</span> {formData.lastName}</p>
                                      <p><span className="text-gray-400">Prénom:</span> {formData.firstName}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center">
                                <input
                                  id="agreeTerms"
                                  name="agreeTerms"
                                  type="checkbox"
                                  checked={formData.agreeTerms}
                                  onChange={handleChange}
                                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-600 rounded"
                                />
                                <label htmlFor="agreeTerms" className="ml-3 block text-sm text-gray-200">
                                  J'accepte les <a href="#" className="text-blue-400 hover:text-blue-300">conditions d'utilisation</a> et la <a href="#" className="text-blue-400 hover:text-blue-300">politique de confidentialité</a>
                                </label>
                              </div>
                              {errors.agreeTerms && (
                                <p className="mt-2 text-sm text-red-400">{errors.agreeTerms}</p>
                              )}
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      
                      <motion.div 
                        className="mt-10 flex justify-between"
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        {currentStep > 1 ? (
                          <motion.button
                            type="button"
                            onClick={handlePrevStep}
                            className="inline-flex items-center px-6 py-3 border border-gray-600 shadow-lg text-base font-medium rounded-md text-gray-200 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 transition-all"
                            variants={itemVariants}
                            whileHover="hover"
                            whileTap="tap"
                          >
                            <svg className="mr-2 -ml-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                            Précédent
                          </motion.button>
                        ) : (
                          <div></div>
                        )}
                        
                        {currentStep < 3 ? (
                          <motion.button
                            type="button"
                            onClick={handleNextStep}
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 transition-all"
                            variants={itemVariants}
                            whileHover="hover"
                            whileTap="tap"
                          >
                            Suivant
                            <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                          </motion.button>
                        ) : (
                          <motion.button
                            type="submit"
                            disabled={isLoading}
                            className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 disabled:opacity-50 transition-all"
                            variants={itemVariants}
                            whileHover="hover"
                            whileTap="tap"
                          >
                            {isLoading ? (
                              <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Création en cours...
                              </span>
                            ) : (
                              <>
                                Créer mon compte
                                <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                              </>
                            )}
                          </motion.button>
                        )}
                      </motion.div>
                    </form>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default RegistrationModal;
