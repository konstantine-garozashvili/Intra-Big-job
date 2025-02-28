import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../lib/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast, Toaster } from 'sonner';
import { useEffect } from 'react';

const Welcome = () => {
  const { isAuthenticated, login, register } = useAuth();
  const navigate = useNavigate();
  const [showRegister, setShowRegister] = useState(false);
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [registerData, setRegisterData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    address: '',
    postalCode: '',
    city: '',
    phone: '',
    birthDate: '',
    nationality: '',
    educationLevel: ''
  });
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [registrationStep, setRegistrationStep] = useState(1);

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
    
    // Clear error for this field when user types
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: null
      });
    }
  };

  const validateBasicRegisterData = () => {
    const newErrors = {};
    
    // Basic validation for first step
    if (!registerData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(registerData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }
    
    if (!registerData.username) {
      newErrors.username = 'Le nom d\'utilisateur est requis';
    }
    
    if (!registerData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (registerData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    
    if (registerData.password !== registerData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    
    return newErrors;
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    
    // Validate first step
    const validationErrors = validateBasicRegisterData();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Veuillez corriger les erreurs dans le formulaire');
      return;
    }
    
    // Clear errors and move to next step
    setErrors({});
    setRegistrationStep(2);
  };

  const validateRegisterData = () => {
    const newErrors = {};
    
    // Basic validation
    if (!registerData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(registerData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }
    
    if (!registerData.username) {
      newErrors.username = 'Le nom d\'utilisateur est requis';
    }
    
    if (!registerData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (registerData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    
    if (registerData.password !== registerData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    
    // These fields are optional, only validate if they have content
    if (registerData.firstName && !registerData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis';
    }
    
    if (registerData.lastName && !registerData.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis';
    }
    
    if (registerData.address && !registerData.address.trim()) {
      newErrors.address = 'L\'adresse est requise';
    }
    
    if (registerData.postalCode && !/^\d{5}$/.test(registerData.postalCode)) {
      newErrors.postalCode = 'Le code postal doit contenir 5 chiffres';
    }
    
    if (registerData.city && !registerData.city.trim()) {
      newErrors.city = 'La ville est requise';
    }
    
    if (registerData.phone && !/^(0|\+33)[1-9]([-. ]?[0-9]{2}){4}$/.test(registerData.phone)) {
      newErrors.phone = 'Format de téléphone invalide';
    }
    
    // Don't use trim() on date objects
    if (registerData.birthDate && !registerData.birthDate) {
      newErrors.birthDate = 'La date de naissance est requise';
    }
    
    if (registerData.nationality && !registerData.nationality.trim()) {
      newErrors.nationality = 'La nationalité est requise';
    }
    
    if (registerData.educationLevel && !registerData.educationLevel.trim()) {
      newErrors.educationLevel = 'Le niveau d\'études est requis';
    }
    
    return newErrors;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    
    try {
      await login(loginData.email, loginData.password);
      toast.success('Connexion réussie!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Identifiants incorrects');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateRegisterData();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Veuillez corriger les erreurs dans le formulaire');
      return;
    }
    
    setRegisterLoading(true);
    try {
      await register(
        registerData.email, 
        registerData.username, 
        registerData.password,
        registerData.firstName || null,
        registerData.lastName || null,
        registerData.address || null,
        registerData.postalCode || null,
        registerData.city || null,
        registerData.phone || null,
        registerData.birthDate || null,
        registerData.nationality || null,
        registerData.educationLevel || null
      );
      toast.success('Inscription réussie! Vous êtes maintenant connecté.');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Erreur lors de l\'inscription');
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleToggleRegister = () => {
    setShowRegister(!showRegister);
    setErrors({});
    setRegistrationStep(1); // Reset to step 1 when toggling
  };

  useEffect(() => {
    if (!showRegister) {
      setRegistrationStep(1);
    }
  }, [showRegister]);

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <Toaster position="top-center" />
      
      {/* Header */}
      <header className="sticky w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">BigProject</h1>
          {isAuthenticated() ? (
            <Button 
              onClick={() => navigate('/dashboard')}
              className="rounded-full px-6 bg-black text-white hover:bg-black/90"
            >
              Mon espace
            </Button>
          ) : (
            <Button 
              onClick={handleToggleRegister} 
              className="rounded-full px-6 bg-black text-white hover:bg-black/90"
            >
              {showRegister ? 'Se connecter' : 'S\'inscrire'}
            </Button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="sticky top-24 lg:max-w-xl">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl md:text-6xl font-bold text-gray-900 mb-8 flex flex-col items-start leading-tight"
              >
                <motion.span 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="my-1"
                >
                  Apprenez
                </motion.span>
                <motion.span 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="my-1 ml-12"
                >
                  Collaborez
                </motion.span>
                <motion.span 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="my-1 ml-24 text-blue-600"
                >
                  Réussez
                </motion.span>
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-lg text-gray-600 mb-8"
              >
                Découvrez une nouvelle façon de collaborer, d'apprendre et de partager avec notre communauté.
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {!showRegister && (
                  <Button 
                    onClick={() => setShowRegister(true)}
                    className="rounded-full px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white text-lg"
                  >
                    Commencer maintenant
                  </Button>
                )}
              </motion.div>
            </div>
            
            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={showRegister ? 'register' : 'login'}
                  initial={{ opacity: 0, x: showRegister ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: showRegister ? -20 : 20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl shadow-xl p-8 max-w-md mx-auto transition-all duration-300"
                >
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                    {showRegister ? 'Créer un compte' : 'Se connecter'}
                  </h3>
                  
                  <div>
                    <form onSubmit={showRegister ? (registrationStep === 1 ? handleNextStep : handleRegisterSubmit) : handleLoginSubmit} className="space-y-4">
                      {/* Form container with overflow hidden to contain the sliding animation */}
                      <div className="relative overflow-hidden transition-all duration-300">
                        {/* Step 1 form fields */}
                        <div className={`space-y-4 transition-all duration-300 ${registrationStep === 1 ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 absolute top-0 left-0 w-full'}`}>
                          <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                              Email
                            </label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              value={showRegister ? registerData.email : loginData.email}
                              onChange={showRegister ? handleRegisterChange : handleLoginChange}
                              required
                              className={`rounded-lg border-gray-300 ${errors.email ? 'border-red-500' : ''}`}
                              placeholder="votreemail@exemple.com"
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                          </div>
                          
                          {showRegister && (
                            <div>
                              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                                Nom d'utilisateur
                              </label>
                              <Input
                                id="username"
                                name="username"
                                type="text"
                                value={registerData.username}
                                onChange={handleRegisterChange}
                                required
                                className={`rounded-lg border-gray-300 ${errors.username ? 'border-red-500' : ''}`}
                                placeholder="johndoe"
                              />
                              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
                            </div>
                          )}
                          
                          <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                              Mot de passe
                            </label>
                            <Input
                              id="password"
                              name="password"
                              type="password"
                              value={showRegister ? registerData.password : loginData.password}
                              onChange={showRegister ? handleRegisterChange : handleLoginChange}
                              required
                              className={`rounded-lg border-gray-300 ${errors.password ? 'border-red-500' : ''}`}
                              placeholder="••••••••"
                            />
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                          </div>
                          
                          {showRegister && (
                            <div>
                              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                Confirmer le mot de passe
                              </label>
                              <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                value={registerData.confirmPassword}
                                onChange={handleRegisterChange}
                                required
                                className={`rounded-lg border-gray-300 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                                placeholder="••••••••"
                              />
                              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                            </div>
                          )}
                        </div>
                        
                        {/* Step 2 form fields - slide in from the right */}
                        {showRegister && (
                          <div className={`space-y-4 transition-all duration-300 ${registrationStep === 2 ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 absolute top-0 left-0 w-full'}`}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                                  Prénom
                                </label>
                                <Input
                                  id="firstName"
                                  name="firstName"
                                  type="text"
                                  value={registerData.firstName}
                                  onChange={handleRegisterChange}
                                  className={`rounded-lg border-gray-300 ${errors.firstName ? 'border-red-500' : ''}`}
                                  placeholder="Jean"
                                />
                                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                              </div>
                              <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                                  Nom
                                </label>
                                <Input
                                  id="lastName"
                                  name="lastName"
                                  type="text"
                                  value={registerData.lastName}
                                  onChange={handleRegisterChange}
                                  className={`rounded-lg border-gray-300 ${errors.lastName ? 'border-red-500' : ''}`}
                                  placeholder="Dupont"
                                />
                                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                              </div>
                            </div>

                            <div>
                              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                                Adresse
                              </label>
                              <Input
                                id="address"
                                name="address"
                                type="text"
                                value={registerData.address}
                                onChange={handleRegisterChange}
                                className={`rounded-lg border-gray-300 ${errors.address ? 'border-red-500' : ''}`}
                                placeholder="123 rue de Paris"
                              />
                              {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                                  Code postal
                                </label>
                                <Input
                                  id="postalCode"
                                  name="postalCode"
                                  type="text"
                                  value={registerData.postalCode}
                                  onChange={handleRegisterChange}
                                  className={`rounded-lg border-gray-300 ${errors.postalCode ? 'border-red-500' : ''}`}
                                  placeholder="75001"
                                />
                                {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>}
                              </div>
                              <div>
                                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                                  Ville
                                </label>
                                <Input
                                  id="city"
                                  name="city"
                                  type="text"
                                  value={registerData.city}
                                  onChange={handleRegisterChange}
                                  className={`rounded-lg border-gray-300 ${errors.city ? 'border-red-500' : ''}`}
                                  placeholder="Paris"
                                />
                                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                              </div>
                            </div>

                            <div>
                              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                Téléphone
                              </label>
                              <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                value={registerData.phone}
                                onChange={handleRegisterChange}
                                className={`rounded-lg border-gray-300 ${errors.phone ? 'border-red-500' : ''}`}
                                placeholder="06 12 34 56 78"
                              />
                              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
                                  Date de naissance
                                </label>
                                <Input
                                  id="birthDate"
                                  name="birthDate"
                                  type="date"
                                  value={registerData.birthDate}
                                  onChange={handleRegisterChange}
                                  className={`rounded-lg border-gray-300 ${errors.birthDate ? 'border-red-500' : ''}`}
                                />
                                {errors.birthDate && <p className="text-red-500 text-xs mt-1">{errors.birthDate}</p>}
                              </div>
                              <div>
                                <label htmlFor="nationality" className="block text-sm font-medium text-gray-700 mb-1">
                                  Nationalité
                                </label>
                                <Input
                                  id="nationality"
                                  name="nationality"
                                  type="text"
                                  value={registerData.nationality}
                                  onChange={handleRegisterChange}
                                  className={`rounded-lg border-gray-300 ${errors.nationality ? 'border-red-500' : ''}`}
                                  placeholder="Française"
                                />
                                {errors.nationality && <p className="text-red-500 text-xs mt-1">{errors.nationality}</p>}
                              </div>
                            </div>

                            <div>
                              <label htmlFor="educationLevel" className="block text-sm font-medium text-gray-700 mb-1">
                                Niveau d'études
                              </label>
                              <select
                                id="educationLevel"
                                name="educationLevel"
                                value={registerData.educationLevel}
                                onChange={handleRegisterChange}
                                className={`w-full rounded-lg border-gray-300 ${errors.educationLevel ? 'border-red-500' : ''} h-9 px-3`}
                              >
                                <option value="">Sélectionnez un niveau</option>
                                <option value="Bac">Bac</option>
                                <option value="Bac+2">Bac+2</option>
                                <option value="Bac+3">Bac+3</option>
                                <option value="Bac+5">Bac+5</option>
                                <option value="Bac+8">Bac+8</option>
                              </select>
                              {errors.educationLevel && <p className="text-red-500 text-xs mt-1">{errors.educationLevel}</p>}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <Button
                        type="submit"
                        disabled={showRegister ? registerLoading : loginLoading}
                        className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white py-2.5 mt-4"
                      >
                        {showRegister 
                          ? (registrationStep === 1 
                              ? 'Suivant' 
                              : (registerLoading ? 'Chargement...' : 'S\'inscrire'))
                          : (loginLoading ? 'Chargement...' : 'Se connecter')}
                      </Button>

                      {showRegister && registrationStep === 2 && (
                        <Button
                          type="button"
                          onClick={() => setRegistrationStep(1)}
                          className="w-full rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 py-2.5 mt-2"
                        >
                          Retour
                        </Button>
                      )}
                    </form>
                    <div className="mt-4 text-center">
                      <button
                        onClick={handleToggleRegister}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {showRegister ? 'Déjà un compte? Se connecter' : 'Pas de compte? S\'inscrire'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 px-6">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Nos fonctionnalités</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-lg p-6 shadow-md"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Facile à utiliser</h3>
              <p className="text-gray-600">Interface intuitive conçue pour une expérience utilisateur optimale.</p>
            </motion.div>
            
            {/* Feature 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-lg p-6 shadow-md"
            >
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Rapide et efficace</h3>
              <p className="text-gray-600">Optimisé pour des performances exceptionnelles et une réactivité maximale.</p>
            </motion.div>
            
            {/* Feature 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-lg p-6 shadow-md"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Sécurisé</h3>
              <p className="text-gray-600">Protection avancée de vos données avec les dernières technologies de sécurité.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-900 text-white px-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="mb-4 md:mb-0">&copy; 2025 BigProject. Tous droits réservés.</p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-blue-400 transition-colors">Conditions d'utilisation</a>
              <a href="#" className="hover:text-blue-400 transition-colors">Politique de confidentialité</a>
              <a href="#" className="hover:text-blue-400 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Welcome;