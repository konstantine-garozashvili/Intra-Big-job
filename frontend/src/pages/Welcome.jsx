import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../lib/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast, Toaster } from 'sonner';

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
    confirmPassword: ''
  });
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
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
    
    if (registerData.password !== registerData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    
    setRegisterLoading(true);
    try {
      await register(registerData.email, registerData.username, registerData.password);
      toast.success('Inscription réussie! Vous êtes maintenant connecté.');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Erreur lors de l\'inscription');
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Header */}
      <header className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">BigProject</h1>
          {isAuthenticated() ? (
            <Link to="/dashboard">
              <Button className="rounded-full px-6 bg-black text-white hover:bg-black/90">
                Mon espace
              </Button>
            </Link>
          ) : (
            <Button 
              onClick={() => setShowRegister(!showRegister)} 
              className="rounded-full px-6 bg-black text-white hover:bg-black/90"
            >
              {showRegister ? 'Se connecter' : 'S\'inscrire'}
            </Button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="w-full lg:w-1/2 mb-12 lg:mb-0">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6"
              >
                Apprenez. <br />
                Collaborez. <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                  Réussissez.
                </span>
              </motion.h2>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl text-gray-600 mb-8 max-w-lg"
              >
                Une plateforme éducative innovante pour gérer vos projets et suivre votre progression en temps réel.
              </motion.p>
              
              {!isAuthenticated() && !showRegister && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <Button 
                    onClick={() => setShowRegister(true)} 
                    className="rounded-full px-8 py-6 bg-blue-600 text-white hover:bg-blue-700 text-lg"
                  >
                    Commencer maintenant
                  </Button>
                </motion.div>
              )}
            </div>
            
            {/* Form Section */}
            <div className="w-full lg:w-1/2">
              <AnimatePresence mode="wait">
                {!isAuthenticated() && (
                  <motion.div 
                    key={showRegister ? 'register' : 'login'}
                    initial={{ opacity: 0, x: showRegister ? 100 : -100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: showRegister ? -100 : 100 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto"
                  >
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">
                      {showRegister ? 'Créer un compte' : 'Se connecter'}
                    </h3>
                    
                    <form onSubmit={showRegister ? handleRegisterSubmit : handleLoginSubmit} className="space-y-4">
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
                          className="rounded-lg border-gray-300"
                          placeholder="votreemail@exemple.com"
                        />
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
                            className="rounded-lg border-gray-300"
                            placeholder="johndoe"
                          />
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
                          className="rounded-lg border-gray-300"
                          placeholder="••••••••"
                        />
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
                            className="rounded-lg border-gray-300"
                            placeholder="••••••••"
                          />
                        </div>
                      )}
                      
                      <Button
                        type="submit"
                        disabled={showRegister ? registerLoading : loginLoading}
                        className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white py-2.5"
                      >
                        {showRegister ? (registerLoading ? 'Chargement...' : 'S\'inscrire') : (loginLoading ? 'Chargement...' : 'Se connecter')}
                      </Button>
                    </form>
                    
                    <div className="mt-6 text-center">
                      <button
                        onClick={() => setShowRegister(!showRegister)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {showRegister ? 'Déjà un compte? Se connecter' : 'Pas de compte? S\'inscrire'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Fonctionnalités principales</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                title: 'Apprentissage interactif',
                description: 'Des outils pédagogiques modernes pour un apprentissage efficace et engageant.',
                icon: '📚'
              },
              {
                title: 'Collaboration en temps réel',
                description: 'Travaillez ensemble sur des projets avec des outils de communication intégrés.',
                icon: '👥'
              },
              {
                title: 'Suivi de progression',
                description: 'Visualisez votre évolution et identifiez vos points forts et axes d\'amélioration.',
                icon: '📈'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-bold">BigProject</h2>
              <p className="text-gray-400 mt-2"> 2024 Tous droits réservés</p>
            </div>
            
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">À propos</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Confidentialité</a>
            </div>
          </div>
        </div>
      </footer>
      
      <Toaster />
    </div>
  );
};

export default Welcome;