import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NetworkNinja = ({ onComplete }) => {
  const [gameState, setGameState] = useState('intro'); // intro, playing, result
  const [score, setScore] = useState(0);
  
  // Start the game
  const startGame = () => {
    setGameState('playing');
    // Game logic would be implemented here
    
    // For demo purposes, we'll simulate completing the game after 5 seconds
    setTimeout(() => {
      setScore(78);
      setGameState('result');
    }, 5000);
  };
  
  // End the game and report results
  const finishGame = () => {
    // Calculate skill scores based on performance
    const skillScores = {
      systemThinking: 80,
      optimization: 75,
      infrastructure: 85,
      problemSolving: 70
    };
    
    // Call the onComplete callback with the final score and skill scores
    onComplete(score, skillScores);
  };
  
  // Render intro screen
  const renderIntroScreen = () => (
    <motion.div 
      className="text-center max-w-3xl mx-auto py-12 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="text-6xl mb-6"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 10 }}
      >
        🌐
      </motion.div>
      
      <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-600 bg-clip-text text-transparent mb-4">
        Network Ninja
      </h2>
      
      <p className="text-lg text-blue-200 mb-8">
        Connectez des serveurs et optimisez votre infrastructure réseau pour maximiser les performances!
      </p>
      
      <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 mb-8">
        <h3 className="text-xl font-bold text-white mb-4">Comment jouer</h3>
        
        <ul className="text-left text-blue-200 space-y-2 mb-4">
          <li className="flex items-start">
            <span className="text-amber-400 mr-2">✓</span>
            <span>Placez et connectez des serveurs dans un réseau</span>
          </li>
          <li className="flex items-start">
            <span className="text-amber-400 mr-2">✓</span>
            <span>Équilibrez la charge entre les différents nœuds</span>
          </li>
          <li className="flex items-start">
            <span className="text-amber-400 mr-2">✓</span>
            <span>Optimisez les routes pour minimiser la latence</span>
          </li>
          <li className="flex items-start">
            <span className="text-amber-400 mr-2">✓</span>
            <span>Protégez votre réseau contre les attaques simulées</span>
          </li>
        </ul>
      </div>
      
      <motion.button
        className="px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 rounded-lg text-white font-bold text-lg shadow-lg"
        whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(217, 119, 6, 0.5)' }}
        whileTap={{ scale: 0.98 }}
        onClick={startGame}
      >
        Commencer
      </motion.button>
    </motion.div>
  );
  
  // Render the game screen (placeholder)
  const renderGameScreen = () => (
    <motion.div 
      className="max-w-4xl mx-auto py-12 px-4 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <h2 className="text-2xl font-bold text-white mb-4">Configuration du réseau en cours...</h2>
      <p className="text-blue-200 mb-8">
        Cette version de démonstration se terminera automatiquement dans quelques secondes.
      </p>
      
      <div className="w-16 h-16 border-t-4 border-amber-500 border-solid rounded-full animate-spin mx-auto"></div>
    </motion.div>
  );
  
  // Render result screen
  const renderResultScreen = () => (
    <motion.div 
      className="text-center max-w-3xl mx-auto py-12 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="text-6xl mb-6"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 10 }}
      >
        🏆
      </motion.div>
      
      <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-600 bg-clip-text text-transparent mb-4">
        Réseau Optimisé!
      </h2>
      
      <p className="text-xl text-blue-200 mb-8">
        Votre score: <span className="font-bold text-white">{score}</span> points
      </p>
      
      <div className="bg-gradient-to-r from-amber-900 to-orange-900 rounded-xl p-6 shadow-lg mb-8">
        <p className="text-white mb-4">
          Vous avez un talent naturel pour l'infrastructure et le DevOps!
        </p>
        
        <p className="text-blue-200">
          Continuez votre voyage pour découvrir d'autres compétences tech.
        </p>
      </div>
      
      <motion.button
        className="px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 rounded-lg text-white font-bold text-lg shadow-lg"
        whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(217, 119, 6, 0.5)' }}
        whileTap={{ scale: 0.98 }}
        onClick={finishGame}
      >
        Continuer
      </motion.button>
    </motion.div>
  );
  
  // Render the appropriate screen based on game state
  const renderScreen = () => {
    switch (gameState) {
      case 'intro':
        return renderIntroScreen();
      case 'playing':
        return renderGameScreen();
      case 'result':
        return renderResultScreen();
      default:
        return renderIntroScreen();
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="relative z-10 container mx-auto">
        <AnimatePresence mode="wait">
          {renderScreen()}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NetworkNinja;
