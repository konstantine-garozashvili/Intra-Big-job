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
      
      // Use authService for proper backend registration
      const response = await authService.register(userData);
      
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
            className={`w-full p-2 rounded-md bg-gray-800 border ${errors.firstName ? 'border-red-400' : 'border-gray-700'} focus:outline-none focus:ring-2 focus:ring-blue-500 text-white`