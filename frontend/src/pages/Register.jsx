import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import PageTransition from '@/components/PageTransition';
import { RegisterProvider } from "@/components/register/RegisterContext";
import RegisterForm from "@/components/register/RegisterForm";

const Register = () => {
  const { colorMode, currentTheme } = useTheme();

  return (
    <PageTransition>
      <div className={`min-h-screen ${currentTheme.bg} flex flex-col md:flex-row w-full overflow-hidden relative`}>
        {/* Animated background elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Glowing orbs */}
          <div className="absolute top-1/4 left-1/5 w-80 h-80 bg-blue-500 rounded-full filter blur-3xl opacity-15 animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-60 h-60 bg-purple-500 rounded-full filter blur-3xl opacity-10 animate-pulse" style={{animationDelay: '1.5s'}}></div>
          <div className="absolute top-2/3 left-1/3 w-40 h-40 bg-cyan-500 rounded-full filter blur-3xl opacity-10 animate-pulse" style={{animationDelay: '2.2s'}}></div>
          
          {/* Stars */}
          {[...Array(30)].map((_, i) => (
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
        <div className="container mx-auto px-4 py-6 flex justify-between items-center z-10 absolute top-0 left-0 right-0">
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
        
        {/* Left column - Info */}
        <motion.div 
          className={`md:w-5/12 ${currentTheme.bg} text-white p-8 flex flex-col justify-center items-center relative z-10`}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="max-w-md mx-auto text-center">
            <motion.div 
              className="mb-10"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <svg
                className="w-32 h-32 mx-auto text-[#528eb2]"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 3L1 9L5 11.18V17.18L12 21L19 17.18V11.18L21 10.09V17H23V9L12 3Z"
                  fill="currentColor"
                />
                <path
                  d="M5 9H19V9L12 13L5 9Z"
                  fill="currentColor"
                  fillOpacity="0.5"
                />
              </svg>
            </motion.div>
            
            <motion.h1 
              className="mb-6 text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-indigo-400"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Rejoignez l'Aventure Spatiale
            </motion.h1>
            
            <motion.p 
              className="mb-8 text-xl text-blue-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              Créez votre compte en quelques étapes et commencez votre voyage
              éducatif avec nous.
            </motion.p>

            <div className="space-y-6 text-left">
              <motion.div 
                className="flex items-center"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <div className="flex-shrink-0 bg-[#528eb2]/20 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                  <svg
                    className="w-6 h-6 text-[#528eb2]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-white">
                    Vos données sont sécurisées
                  </h3>
                  <p className="text-sm text-blue-200">
                    Protection par cryptage avancé
                  </p>
                </div>
              </motion.div>

              <motion.div 
                className="flex items-center"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <div className="flex-shrink-0 bg-[#528eb2]/20 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                  <svg
                    className="w-6 h-6 text-[#528eb2]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-white">
                    Processus rapide
                  </h3>
                  <p className="text-sm text-blue-200">
                    Inscription en moins de 2 minutes
                  </p>
                </div>
              </motion.div>

              <motion.div 
                className="flex items-center"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <div className="flex-shrink-0 bg-[#528eb2]/20 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                  <svg
                    className="w-6 h-6 text-[#528eb2]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-white">
                    Accessible partout
                  </h3>
                  <p className="text-sm text-blue-200">
                    Sur tous vos appareils
                  </p>
                </div>
              </motion.div>
            </div>
            
            {/* Floating planet */}
            <motion.div
              className="absolute bottom-10 left-10 w-20 h-20 rounded-full bg-gradient-radial from-green-500 to-green-900 hidden md:block"
              style={{ 
                boxShadow: 'inset 2px -2px 10px rgba(0, 0, 0, 0.4), 0 0 15px rgba(52, 211, 153, 0.5)',
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 1 }}
            >
              {/* Surface details */}
              <div className="absolute w-8 h-3 bg-green-300 opacity-30 rounded-full" style={{ top: '30%', left: '20%' }}></div>
              <div className="absolute w-6 h-2 bg-green-400 opacity-20 rounded-full" style={{ top: '50%', left: '40%' }}></div>
            </motion.div>
          </div>
        </motion.div>

        {/* Right column - Form */}
        <motion.div 
          className={`md:w-7/12 ${currentTheme.bg} p-8 flex items-center justify-center relative z-10`}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="w-full max-w-xl">
            <RegisterProvider>
              <RegisterForm />
            </RegisterProvider>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default Register;
