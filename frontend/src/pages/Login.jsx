import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { AuthForm } from '@/components/AuthForm';
import PageTransition from '@/components/PageTransition';

const Login = () => {
  const { colorMode, currentTheme } = useTheme();

  return (
    <PageTransition>
      <div className={`min-h-screen ${currentTheme.bg} flex flex-col overflow-hidden relative`}>
        {/* Animated background elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Glowing orbs */}
          <div className="absolute top-1/4 left-1/5 w-60 h-60 bg-blue-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-500 rounded-full filter blur-3xl opacity-15 animate-pulse" style={{animationDelay: '1.5s'}}></div>
          <div className="absolute top-2/3 left-1/3 w-40 h-40 bg-cyan-500 rounded-full filter blur-3xl opacity-10 animate-pulse" style={{animationDelay: '2.2s'}}></div>
          
          {/* Stars */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-white rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 2 + 1}px`,
                height: `${Math.random() * 2 + 1}px`,
              }}
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0.2, 1, 0.2],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                delay: Math.random() * 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
          ))}
          
          {/* Shooting stars */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-0.5 bg-gradient-to-r from-transparent via-white to-transparent"
              style={{
                top: `${Math.random() * 70}%`,
                left: `-10%`,
                width: '10%',
                transform: `rotate(${15 + Math.random() * 30}deg)`,
              }}
              initial={{ left: '-10%', opacity: 0 }}
              animate={{ 
                left: '120%', 
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                delay: 2 + i * 5 + Math.random() * 7,
                repeat: Infinity,
                repeatDelay: 15 + Math.random() * 10
              }}
            />
          ))}
        </div>
        
        {/* Logo and navigation */}
        <div className="container mx-auto px-4 py-6 flex justify-between items-center z-10">
          <Link to="/" className="flex items-center">
            <motion.div
              className="text-2xl font-bold text-white"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-blue-400">Big</span>
              <span className="text-indigo-400">Project</span>
            </motion.div>
          </Link>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link to="/" className="text-gray-300 hover:text-white transition-colors">
              Retour à l'accueil
            </Link>
          </motion.div>
        </div>
        
        {/* Main content */}
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <motion.div
              className="relative z-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl blur-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
              />
              <div className="relative bg-gray-900/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-blue-500/30">
                <AuthForm />
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Floating planet */}
        <motion.div
          className="absolute bottom-10 right-10 w-40 h-40 md:w-60 md:h-60 rounded-full bg-gradient-radial from-blue-500 to-blue-900 hidden md:block"
          style={{ 
            boxShadow: 'inset 5px -5px 20px rgba(0, 0, 0, 0.4), 0 0 20px rgba(52, 152, 219, 0.5)',
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          {/* Continents */}
          <div className="absolute w-12 h-8 bg-green-600 opacity-60 rounded-full" style={{ top: '25%', left: '30%' }}></div>
          <div className="absolute w-10 h-16 bg-green-600 opacity-60 rounded-full" style={{ top: '40%', left: '65%' }}></div>
          <div className="absolute w-8 h-8 bg-green-600 opacity-60 rounded-full" style={{ top: '70%', left: '40%' }}></div>
          
          {/* Clouds */}
          <div className="absolute w-16 h-4 bg-white opacity-20 rounded-full" style={{ top: '20%', left: '10%' }}></div>
          <div className="absolute w-10 h-3 bg-white opacity-20 rounded-full" style={{ top: '30%', left: '60%' }}></div>
          <div className="absolute w-14 h-4 bg-white opacity-20 rounded-full" style={{ top: '60%', left: '35%' }}></div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default Login;