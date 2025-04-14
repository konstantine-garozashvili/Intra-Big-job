import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CyberEscapeRoom = ({ onComplete }) => {
  const [gameState, setGameState] = useState('intro'); // intro, playing, result
  const [score, setScore] = useState(0);
  
  // Start the game
  const startGame = () => {
    setGameState('playing');
    // Game logic would be implemented here
    
    // For demo purposes, we'll simulate completing the game after 5 seconds
    setTimeout(() => {
      setScore(75);
      setGameState('result');
    }, 5000);
  };
  
  // End the game and report results
  const finishGame = () => {
    // Calculate skill scores based on performance
    const skillScores = {
      analyticalThinking: 80,
      problemSolving: 75,
      securityAwareness: 85,
      attentionToDetail: 70
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
        🔐
      </motion.div>
      
      <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-teal-600 bg-clip-text text-transparent mb-4">
        Cyber Escape Room
      </h2>
      
      <p className="text-lg text-blue-200 mb-8">
        Identifiez les vulnérabilités et déchiffrez les codes pour vous échapper de la salle virtuelle!
      </p>
      
      <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 mb-8">
        <h3 className="text-xl font-bold text-white mb-4">Comment jouer</h3>
        
        <ul className="text-left text-blue-200 space-y-2 mb-4">
          <li className="flex items-start">
            <span className="text-green-400 mr-2">✓</span>
            <span>Explorez l'environnement virtuel pour trouver des indices</span>
          </li>
          <li className="flex items-start">
            <span className="text-green-400 mr-2">✓</span>
            <span>Identifiez les vulnérabilités de sécurité</span>
          </li>
          <li className="flex items-start">
            <span className="text-green-400 mr-2">✓</span>
            <span>Déchiffrez les codes pour débloquer de nouvelles zones</span>
          </li>
          <li className="flex items-start">
            <span className="text-green-400 mr-2">✓</span>
            <span>Échappez-vous avant la fin du temps imparti</span>
          </li>
        </ul>
      </div>
      
      <motion.button
        className="px-8 py-4 bg-gradient-to-r from-green-600 to-teal-600 rounded-lg text-white font-bold text-lg shadow-lg"
        whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(20, 184, 166, 0.5)' }}
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
      <h2 className="text-2xl font-bold text-white mb-4">Jeu en cours...</h2>
      <p className="text-blue-200 mb-8">
        Cette version de démonstration se terminera automatiquement dans quelques secondes.
      </p>
      
      <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
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
      
      <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-teal-600 bg-clip-text text-transparent mb-4">
        Mission Accomplie!
      </h2>
      
      <p className="text-xl text-blue-200 mb-8">
        Votre score: <span className="font-bold text-white">{score}</span> points
      </p>
      
      <div className="bg-gradient-to-r from-green-900 to-teal-900 rounded-xl p-6 shadow-lg mb-8">
        <p className="text-white mb-4">
          Vous avez un talent naturel pour la cybersécurité!
        </p>
        
        <p className="text-blue-200">
          Continuez votre voyage pour découvrir d'autres compétences tech.
        </p>
      </div>
      
      <motion.button
        className="px-8 py-4 bg-gradient-to-r from-green-600 to-teal-600 rounded-lg text-white font-bold text-lg shadow-lg"
        whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(20, 184, 166, 0.5)' }}
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

export default CyberEscapeRoom;
