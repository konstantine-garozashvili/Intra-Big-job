import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AIArtistShowdown = ({ onComplete }) => {
  const [gameState, setGameState] = useState('intro'); // intro, playing, result
  const [score, setScore] = useState(0);
  
  // Start the game
  const startGame = () => {
    setGameState('playing');
    // Game logic would be implemented here
    
    // For demo purposes, we'll simulate completing the game after 5 seconds
    setTimeout(() => {
      setScore(88);
      setGameState('result');
    }, 5000);
  };
  
  // End the game and report results
  const finishGame = () => {
    // Calculate skill scores based on performance
    const skillScores = {
      creativity: 90,
      aiUnderstanding: 85,
      design: 80,
      innovation: 85
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
        🎨
      </motion.div>
      
      <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-rose-600 bg-clip-text text-transparent mb-4">
        AI Artist Showdown
      </h2>
      
      <p className="text-lg text-blue-200 mb-8">
        Créez de l'art avec l'intelligence artificielle et affinez vos prompts pour obtenir les meilleurs résultats!
      </p>
      
      <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 mb-8">
        <h3 className="text-xl font-bold text-white mb-4">Comment jouer</h3>
        
        <ul className="text-left text-blue-200 space-y-2 mb-4">
          <li className="flex items-start">
            <span className="text-pink-400 mr-2">✓</span>
            <span>Ajustez les paramètres pour générer des images IA</span>
          </li>
          <li className="flex items-start">
            <span className="text-pink-400 mr-2">✓</span>
            <span>Affinez vos prompts pour obtenir des résultats précis</span>
          </li>
          <li className="flex items-start">
            <span className="text-pink-400 mr-2">✓</span>
            <span>Combinez différents styles et thèmes</span>
          </li>
          <li className="flex items-start">
            <span className="text-pink-400 mr-2">✓</span>
            <span>Recevez des points basés sur l'originalité et la qualité</span>
          </li>
        </ul>
      </div>
      
      <motion.button
        className="px-8 py-4 bg-gradient-to-r from-pink-600 to-rose-600 rounded-lg text-white font-bold text-lg shadow-lg"
        whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(219, 39, 119, 0.5)' }}
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
      <h2 className="text-2xl font-bold text-white mb-4">Génération d'art IA en cours...</h2>
      <p className="text-blue-200 mb-8">
        Cette version de démonstration se terminera automatiquement dans quelques secondes.
      </p>
      
      <div className="w-16 h-16 border-t-4 border-pink-500 border-solid rounded-full animate-spin mx-auto"></div>
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
      
      <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-rose-600 bg-clip-text text-transparent mb-4">
        Chef-d'œuvre Créé!
      </h2>
      
      <p className="text-xl text-blue-200 mb-8">
        Votre score: <span className="font-bold text-white">{score}</span> points
      </p>
      
      <div className="bg-gradient-to-r from-pink-900 to-rose-900 rounded-xl p-6 shadow-lg mb-8">
        <p className="text-white mb-4">
          Vous avez un talent naturel pour la tech créative et l'IA générative!
        </p>
        
        <p className="text-blue-200">
          Continuez votre voyage pour découvrir d'autres compétences tech.
        </p>
      </div>
      
      <motion.button
        className="px-8 py-4 bg-gradient-to-r from-pink-600 to-rose-600 rounded-lg text-white font-bold text-lg shadow-lg"
        whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(219, 39, 119, 0.5)' }}
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

export default AIArtistShowdown;
