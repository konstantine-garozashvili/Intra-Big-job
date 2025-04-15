import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { authService } from "@/lib/services/authService";
import { Loader2 } from "lucide-react";

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
      // Format user data for registration API
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        plainPassword: formData.password
      };
      
      console.log('Submitting registration data:', { ...userData, plainPassword: '***' });
      
      // Use authService for proper backend registration
      const response = await authService.register(userData);
      console.log('Registration response:', response);
      
      // Store email to use for login redirect
      localStorage.setItem('registeredEmail', formData.email);
      
      // Show success message
      toast.success("Compte créé avec succès!", {
        description: "Vous pouvez maintenant vous connecter."
      });
      
      // Close the modal and redirect to login page
      onClose();
      navigate("/login");
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.response) {
        const { data } = error.response;
        console.error('API error response:', data);
        
        if (data.message) {
          if (data.errors && Object.keys(data.errors).length > 0) {
            // Map API validation errors to form fields
            const apiErrors = {};
            Object.entries(data.errors).forEach(([key, value]) => {
              apiErrors[key] = Array.isArray(value) ? value[0] : value;
            });
            setErrors(apiErrors);
          } else {
            setErrors({ form: data.message });
          }
          
          toast.error("Erreur d'inscription", {
            description: data.message
          });
        } else {
          setErrors({ form: "Une erreur est survenue lors de l'inscription" });
          toast.error("Erreur d'inscription", {
            description: "Une erreur est survenue lors de l'inscription"
          });
        }
      } else {
        setErrors({ form: error.message || "Une erreur est survenue lors de l'inscription" });
        toast.error("Erreur d'inscription", {
          description: error.message || "Une erreur est survenue lors de l'inscription"
        });
      }
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
            duration: 0.5
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
            stiffness: 200,
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
            duration: 0.5
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

  // Render step 1 - Account Setup (Email & Password)
  const renderStep1 = () => {
    const variants = getFormVariants(1);
    
    return (
      <motion.div
        key="step1"
        className="space-y-4"
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
      >
        <motion.h3 className="text-2xl font-bold text-white mb-4" variants={itemVariants}>
          Créez votre compte
        </motion.h3>
        
        {errors.form && (
          <motion.div
            className="bg-red-500/20 border border-red-400 text-white p-3 rounded-md mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {errors.form}
          </motion.div>
        )}
        
        <motion.div variants={itemVariants}>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full p-2 rounded-md bg-gray-800 border ${errors.email ? 'border-red-400' : 'border-gray-700'} focus:outline-none focus:ring-2 focus:ring-blue-500 text-white`}
            placeholder="votre@email.com"
          />
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
            Mot de passe
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full p-2 rounded-md bg-gray-800 border ${errors.password ? 'border-red-400' : 'border-gray-700'} focus:outline-none focus:ring-2 focus:ring-blue-500 text-white`}
            placeholder="Minimum 8 caractères"
          />
          {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
            Confirmer le mot de passe
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`w-full p-2 rounded-md bg-gray-800 border ${errors.confirmPassword ? 'border-red-400' : 'border-gray-700'} focus:outline-none focus:ring-2 focus:ring-blue-500 text-white`}
            placeholder="Répétez votre mot de passe"
          />
          {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
        </motion.div>
        
        <motion.div variants={itemVariants} className="pt-4">
          <motion.button
            type="button"
            onClick={handleNextStep}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors"
            whileHover="hover"
            whileTap="tap"
            variants={itemVariants}
          >
            Continuer
          </motion.button>
        </motion.div>
      </motion.div>
    );
  };

  // Render step 2 - Personal Information
  const renderStep2 = () => {
    const variants = getFormVariants(2);
    
    return (
      <motion.div
        key="step2"
        className="space-y-4"
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
      >
        <motion.h3 className="text-2xl font-bold text-white mb-4" variants={itemVariants}>
          Informations personnelles
        </motion.h3>
        
        <motion.div variants={itemVariants}>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-1">
            Prénom
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className={`w-full p-2 rounded-md bg-gray-800 border ${errors.firstName ? 'border-red-400' : 'border-gray-700'} focus:outline-none focus:ring-2 focus:ring-blue-500 text-white`}
            placeholder="Votre prénom"
          />
          {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName}</p>}
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-1">
            Nom
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className={`w-full p-2 rounded-md bg-gray-800 border ${errors.lastName ? 'border-red-400' : 'border-gray-700'} focus:outline-none focus:ring-2 focus:ring-blue-500 text-white`}
            placeholder="Votre nom"
          />
          {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName}</p>}
        </motion.div>
        
        <div className="pt-4 flex justify-between">
          <motion.button
            type="button"
            onClick={handlePrevStep}
            className="py-2 px-4 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
            variants={itemVariants}
            whileHover="hover"
            whileTap="tap"
          >
            Retour
          </motion.button>
          
          <motion.button
            type="button"
            onClick={handleNextStep}
            className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors"
            variants={itemVariants}
            whileHover="hover"
            whileTap="tap"
          >
            Continuer
          </motion.button>
        </div>
      </motion.div>
    );
  };

  // Render step 3 - Terms and Submission
  const renderStep3 = () => {
    const variants = getFormVariants(3);
    
    return (
      <motion.div
        key="step3"
        className="space-y-4"
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
      >
        <motion.h3 className="text-2xl font-bold text-white mb-4" variants={itemVariants}>
          Finaliser l'inscription
        </motion.h3>
        
        <motion.div variants={itemVariants} className="p-4 bg-gray-800/50 rounded-md">
          <p className="text-sm text-gray-300 leading-relaxed">
            En créant un compte, vous acceptez les conditions générales d'utilisation et notre politique de confidentialité. 
            Nous ne partageons jamais vos données personnelles sans votre consentement.
          </p>
        </motion.div>
        
        <motion.div variants={itemVariants} className="flex items-center">
          <input
            type="checkbox"
            id="agreeTerms"
            name="agreeTerms"
            checked={formData.agreeTerms}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-600 text-blue-500 focus:ring-blue-500 bg-gray-700"
          />
          <label htmlFor="agreeTerms" className="ml-2 block text-sm text-gray-300">
            J'accepte les <a href="#" className="text-blue-400 hover:underline">conditions générales</a> et la <a href="#" className="text-blue-400 hover:underline">politique de confidentialité</a>
          </label>
        </motion.div>
        {errors.agreeTerms && <p className="text-red-400 text-xs">{errors.agreeTerms}</p>}
        
        <div className="pt-4 flex justify-between">
          <motion.button
            type="button"
            onClick={handlePrevStep}
            className="py-2 px-4 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
            variants={itemVariants}
            whileHover="hover"
            whileTap="tap"
          >
            Retour
          </motion.button>
          
          <motion.button
            type="submit"
            disabled={isLoading}
            className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors disabled:opacity-50"
            variants={itemVariants}
            whileHover="hover"
            whileTap="tap"
          >
            {isLoading ? (
              <span className="flex justify-center items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Inscription en cours...
              </span>
            ) : (
              "Créer mon compte"
            )}
          </motion.button>
        </div>
      </motion.div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ backdropFilter: "blur(3px)" }}
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/60" />
          
          <motion.div
            key="modal"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative z-10 w-full max-w-md max-h-[90vh] overflow-auto p-6 rounded-xl shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Background particles for visual effect */}
            <div className="absolute inset-0 overflow-hidden rounded-xl">
              {particles.map(particle => (
                <motion.div
                  key={`particle-${particle.id}`}
                  className="absolute rounded-full bg-blue-400"
                  initial={{
                    x: `${particle.x}%`,
                    y: `${particle.y}%`,
                    opacity: 0.3,
                    scale: 0.5
                  }}
                  animate={{
                    x: [`${particle.x}%`, `${(particle.x + 20) % 100}%`, `${(particle.x + 10) % 100}%`],
                    y: [`${particle.y}%`, `${(particle.y + 15) % 100}%`, `${(particle.y + 5) % 100}%`],
                    opacity: [0.3, 0.8, 0.3],
                    scale: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: particle.duration,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  style={{
                    width: `${particle.size}px`,
                    height: `${particle.size}px`
                  }}
                />
              ))}
            </div>
            
            <div className="relative">
              <motion.button
                onClick={onClose}
                className="absolute top-0 right-0 p-2 text-gray-300 hover:text-white focus:outline-none"
                whileHover="hover"
                whileTap="tap"
                variants={itemVariants}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
              
              <div className="mb-6 flex items-center justify-center">
                <div className="flex items-center space-x-2">
                  {[1, 2, 3].map((step) => (
                    <div key={step} className="flex items-center">
                      <div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          currentStep === step 
                            ? 'bg-blue-500 text-white'
                            : currentStep > step
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-700 text-gray-300'
                        }`}
                      >
                        {currentStep > step ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          step
                        )}
                      </div>
                      {step < 3 && (
                        <div className={`w-12 h-1 ${currentStep > step ? 'bg-green-500' : 'bg-gray-700'}`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <form onSubmit={handleSubmit}>
                <AnimatePresence mode="wait">
                  {currentStep === 1 && renderStep1()}
                  {currentStep === 2 && renderStep2()}
                  {currentStep === 3 && renderStep3()}
                </AnimatePresence>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RegistrationModal;
