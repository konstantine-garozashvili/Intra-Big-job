import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const ConnectionModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });
  const [errors, setErrors] = useState({});

  // Pre-defined credentials for quick login (similar to QuickLoginButtons component)
  const credentials = {
    admin: { email: 'admin@bigproject.com', password: 'Password123@' },
    superadmin: { email: 'superadmin@bigproject.com', password: 'Password123@' },
    teacher: { email: 'teacher@bigproject.com', password: 'Password123@' },
    student: { email: 'student@bigproject.com', password: 'Password123@' },
    hr: { email: 'hr@bigproject.com', password: 'Password123@' },
    guest: { email: 'guest@bigproject.com', password: 'Password123@' },
    recruiter: { email: 'recruiter@bigproject.com', password: 'Password123@' }
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setFormData({
          email: "",
          password: "",
          rememberMe: false
        });
        setErrors({});
      }, 300);
    }
  }, [isOpen]);

  const quickLogin = (role) => {
    if (credentials[role]) {
      setFormData(prev => ({
        ...prev,
        email: credentials[role].email,
        password: credentials[role].password
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) newErrors.email = "Email obligatoire";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Format d'email invalide";
    
    if (!formData.password) newErrors.password = "Mot de passe obligatoire";
    
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      // Simulate API call with mock authentication
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store auth token in localStorage to persist login
      localStorage.setItem('authToken', 'mock-auth-token-' + Date.now());
      localStorage.setItem('userRole', formData.email.split('@')[0]); // Extract role from email
      
      toast.success("Connexion réussie!");
      onClose();
      navigate("/dashboard");
    } catch (error) {
      toast.error("Email ou mot de passe incorrect.");
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

  // Get animation variants for form effects
  const formVariants = {
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
                        Connexion
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
                  
                  <form onSubmit={handleSubmit}>
                    <motion.div
                      key="login-form"
                      variants={formVariants}
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
                      
                      <motion.div variants={itemVariants} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <input
                            id="rememberMe"
                            name="rememberMe"
                            type="checkbox"
                            checked={formData.rememberMe}
                            onChange={handleChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded"
                          />
                          <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-300">
                            Se souvenir de moi
                          </label>
                        </div>
                        <div className="text-sm">
                          <a href="#" className="font-medium text-blue-400 hover:text-blue-300">
                            Mot de passe oublié?
                          </a>
                        </div>
                      </motion.div>
                      
                      <motion.div variants={itemVariants}>
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-lg text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 disabled:opacity-50 transition-all"
                          style={{
                            boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)",
                          }}
                          whileHover={{ 
                            scale: 1.02, 
                            boxShadow: "0 0 25px rgba(59, 130, 246, 0.5)" 
                          }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {isLoading ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Connexion en cours...
                            </span>
                          ) : (
                            "Se connecter"
                          )}
                        </button>
                      </motion.div>
                    </motion.div>
                  </form>
                  
                  <motion.div 
                    className="mt-8 pt-6 border-t border-gray-700"
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <h3 className="text-base font-medium text-gray-300 mb-4">Connexion rapide</h3>
                    <div className="mb-6 grid grid-cols-3 gap-2">
                      <motion.button
                        type="button"
                        variants={itemVariants}
                        whileHover="hover"
                        whileTap="tap"
                        className="text-xs bg-blue-600/20 p-2 rounded text-white hover:bg-blue-600/30 transition-colors"
                        onClick={() => quickLogin('admin')}
                      >
                        Admin
                      </motion.button>
                      <motion.button
                        type="button" 
                        variants={itemVariants}
                        whileHover="hover"
                        whileTap="tap"
                        className="text-xs bg-blue-600/20 p-2 rounded text-white hover:bg-blue-600/30 transition-colors"
                        onClick={() => quickLogin('student')}
                      >
                        Étudiant
                      </motion.button>
                      <motion.button
                        type="button"
                        variants={itemVariants}
                        whileHover="hover"
                        whileTap="tap"
                        className="text-xs bg-blue-600/20 p-2 rounded text-white hover:bg-blue-600/30 transition-colors"
                        onClick={() => quickLogin('teacher')}
                      >
                        Professeur
                      </motion.button>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="mt-6 text-center"
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <p className="text-sm text-gray-400">
                      Vous n'avez pas de compte?{" "}
                      <a href="#" className="text-blue-400 hover:text-blue-300 font-medium">
                        Créer un compte
                      </a>
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConnectionModal;
