import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { toast } from 'sonner';
import { authService } from '@/lib/services/authService';
import { useRolePermissions } from '@/features/roles/useRolePermissions';
import { Loader2 } from "lucide-react";
import { useRoles } from '@/features/roles/roleContext';

const ConnectionModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Check for stored email for "remember me" feature
  useEffect(() => {
    const storedEmail = localStorage.getItem('rememberedEmail');
    if (storedEmail) {
      setEmail(storedEmail);
      setRememberMe(true);
    }
    
    // Check if coming from registration
    const registeredEmail = localStorage.getItem('registeredEmail');
    if (registeredEmail) {
      setEmail(registeredEmail);
      localStorage.removeItem('registeredEmail'); // Clean up after using it
      toast.info("Inscription réussie", {
        description: "Veuillez vous connecter avec vos identifiants."
      });
    }
  }, [isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setPassword("");
        setErrors({});
        // Don't reset email if rememberMe is enabled
        if (!rememberMe) {
          setEmail("");
        }
      }, 300);
    }
  }, [isOpen, rememberMe]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = "Email obligatoire";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Format d'email invalide";
    }
    
    if (!password) {
      newErrors.password = "Mot de passe obligatoire";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      // Handle remember me preference
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      
      // Call authentication service
      const response = await authService.login(email, password);
      
      // Show success notification
      toast.success("Connexion réussie!", {
        description: "Vous êtes maintenant connecté."
      });
      
      // Close modal and redirect based on user role
      onClose();
      
      // Use the decoded token info for redirection
      const decoded = authService.getDecodedToken();
      if (decoded && decoded.role) {
        // Redirect based on user role
        if (decoded.role.includes('ROLE_ADMIN')) {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      if (error.response) {
        const { data, status } = error.response;
        
        // Handle different error scenarios
        if (status === 401) {
          setErrors({ form: "Email ou mot de passe incorrect" });
          toast.error("Échec de connexion", {
            description: "Email ou mot de passe incorrect"
          });
        } else if (status === 403) {
          setErrors({ form: "Votre compte n'est pas vérifié. Veuillez vérifier votre email." });
          toast.error("Compte non vérifié", { 
            description: "Veuillez vérifier votre email pour activer votre compte."
          });
        } else if (data && data.message) {
          setErrors({ form: data.message });
          toast.error("Erreur de connexion", {
            description: data.message
          });
        } else {
          setErrors({ form: "Une erreur est survenue lors de la connexion" });
          toast.error("Erreur de connexion", {
            description: "Une erreur est survenue lors de la connexion"
          });
        }
      } else {
        setErrors({ form: "Une erreur est survenue lors de la connexion" });
        toast.error("Erreur de connexion", {
          description: "Une erreur est survenue lors de la connexion"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Page and element animations
  const pageVariants = {
    initial: { 
      opacity: 0,
      x: 100,
      background: "linear-gradient(135deg, #02284f 0%, #011627 100%)",
    },
    animate: {
      opacity: 1,
      x: 0,
      background: "linear-gradient(135deg, #02284f 0%, #011627 100%)",
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 120,
        duration: 0.3
      }
    },
    exit: {
      opacity: 0,
      x: -100,
      background: "linear-gradient(135deg, #02284f 0%, #011627 100%)",
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 120,
        duration: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    },
    exit: { y: -20, opacity: 0 },
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
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <motion.h3 className="text-2xl font-bold text-white mb-6" variants={itemVariants}>
                  Connexion
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full p-2 rounded-md bg-gray-800 border ${errors.password ? 'border-red-400' : 'border-gray-700'} focus:outline-none focus:ring-2 focus:ring-blue-500 text-white`}
                    placeholder="••••••••"
                  />
                  {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                </motion.div>
                
                <motion.div variants={itemVariants} className="flex items-center">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-600 text-blue-500 focus:ring-blue-500 bg-gray-700"
                  />
                  <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-300">
                    Se souvenir de moi
                  </label>
                </motion.div>
                
                <motion.div variants={itemVariants} className="pt-4">
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors disabled:opacity-50"
                    whileHover="hover"
                    whileTap="tap"
                    variants={itemVariants}
                  >
                    {isLoading ? (
                      <span className="flex justify-center items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connexion en cours...
                      </span>
                    ) : (
                      "Se connecter"
                    )}
                  </motion.button>
                </motion.div>
                
                <motion.div variants={itemVariants} className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate("/register");
                    }}
                    className="text-sm text-blue-400 hover:text-blue-300 focus:outline-none"
                  >
                    Pas encore de compte ? S'inscrire
                  </button>
                </motion.div>
                
                <motion.div variants={itemVariants} className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate("/forgot-password");
                    }}
                    className="text-sm text-gray-400 hover:text-gray-300 focus:outline-none"
                  >
                    Mot de passe oublié ?
                  </button>
                </motion.div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConnectionModal;
