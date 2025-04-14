import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CodePulseRhythm = ({ onComplete }) => {
  // Game states
  const [gameState, setGameState] = useState('intro'); // intro, playing, result
  const [currentLevel, setCurrentLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds per level
  const [currentSequence, setCurrentSequence] = useState([]);
  const [playerSequence, setPlayerSequence] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [skillScores, setSkillScores] = useState({
    logicThinking: 0,
    patternRecognition: 0,
    attentionToDetail: 0,
    speedAccuracy: 0
  });
  
  // Refs
  const timerRef = useRef(null);
  const sequenceRef = useRef(null);
  
  // Game levels
  const levels = [
    {
      name: "Débutant",
      description: "Corrigez les erreurs de syntaxe simples",
      sequences: [
        {
          code: "console.log('Hello World')",
          error: "console.log('Hello World'",
          correctFix: ")",
          hint: "Il manque une parenthèse fermante"
        },
        {
          code: "let x = 5",
          error: "let x = 5,",
          correctFix: "",
          hint: "Il y a une virgule en trop"
        },
        {
          code: "if (x > 10) { return true; }",
          error: "if (x > 10) { return true: }",
          correctFix: ";",
          hint: "Les instructions se terminent par un point-virgule, pas par deux-points"
        },
        {
          code: "const name = 'John';",
          error: "const name = 'John",
          correctFix: "';",
          hint: "Il manque une apostrophe et un point-virgule"
        }
      ]
    },
    {
      name: "Intermédiaire",
      description: "Identifiez les erreurs logiques",
      sequences: [
        {
          code: "for (let i = 0; i < 10; i++) { console.log(i); }",
          error: "for (let i = 0; i <= 10; i++) { console.log(i); }",
          correctFix: "<",
          hint: "Cette boucle va jusqu'à 10 inclus, est-ce correct?"
        },
        {
          code: "if (x === 5) { return true; }",
          error: "if (x = 5) { return true; }",
          correctFix: "===",
          hint: "Assignation ou comparaison?"
        },
        {
          code: "const numbers = [1, 2, 3]; console.log(numbers[2]);",
          error: "const numbers = [1, 2, 3]; console.log(numbers[3]);",
          correctFix: "2",
          hint: "Les tableaux commencent à l'index 0"
        }
      ]
    },
    {
      name: "Avancé",
      description: "Corrigez les bugs complexes",
      sequences: [
        {
          code: "function sum(a, b) { return a + b; }",
          error: "function sum(a, b) { return a - b; }",
          correctFix: "+",
          hint: "Cette fonction devrait additionner, pas soustraire"
        },
        {
          code: "const getData = async () => { const response = await fetch('/api'); return response.json(); }",
          error: "const getData = async () => { const response = fetch('/api'); return response.json(); }",
          correctFix: "await",
          hint: "Comment attendre la résolution d'une promesse?"
        }
      ]
    }
  ];
  
  // Start the game
  const startGame = () => {
    setGameState('playing');
    setCurrentLevel(0);
    setScore(0);
    setTimeLeft(60);
    loadNextSequence();
    startTimer();
  };
  
  // Load the next sequence
  const loadNextSequence = () => {
    const level = levels[currentLevel];
    if (!level) {
      // No more levels, end the game
      endGame();
      return;
    }
    
    // Randomly select a sequence from the current level
    const randomIndex = Math.floor(Math.random() * level.sequences.length);
    const sequence = level.sequences[randomIndex];
    
    setCurrentSequence(sequence);
    setPlayerSequence([]);
    setIsListening(true);
    
    // Display the sequence with visual cues
    if (sequenceRef.current) {
      clearTimeout(sequenceRef.current);
    }
  };
  
  // Handle player input
  const handleKeyPress = (key) => {
    if (!isListening) return;
    
    // Add the key to player sequence
    setPlayerSequence(prev => [...prev, key]);
    
    // Check if the player's input matches the correct fix
    const correctFix = currentSequence.correctFix;
    const playerInput = [...playerSequence, key].join('');
    
    if (playerInput === correctFix) {
      // Correct fix!
      setIsListening(false);
      setFeedback({
        type: 'success',
        message: 'Correct! Bien joué!'
      });
      
      // Update score
      const timeBonus = Math.floor(timeLeft / 10);
      const pointsEarned = 10 + timeBonus;
      setScore(prev => prev + pointsEarned);
      
      // Update skill scores
      setSkillScores(prev => ({
        ...prev,
        logicThinking: prev.logicThinking + (currentLevel + 1) * 2,
        patternRecognition: prev.patternRecognition + (currentLevel + 1),
        attentionToDetail: prev.attentionToDetail + (currentLevel + 1) * 2,
        speedAccuracy: prev.speedAccuracy + timeBonus
      }));
      
      // Wait a moment before loading the next sequence
      setTimeout(() => {
        setFeedback(null);
        
        // Check if we should move to the next level
        const currentLevelSequences = levels[currentLevel].sequences;
        if (playerSequence.length >= currentLevelSequences.length - 1) {
          // Move to next level
          setCurrentLevel(prev => prev + 1);
          setTimeLeft(60); // Reset timer for new level
        }
        
        loadNextSequence();
      }, 1500);
    } else if (!correctFix.startsWith(playerInput)) {
      // Incorrect fix
      setIsListening(false);
      setFeedback({
        type: 'error',
        message: 'Pas tout à fait! Essayez encore.'
      });
      
      // Penalty
      setScore(prev => Math.max(0, prev - 5));
      
      // Wait a moment before allowing retry
      setTimeout(() => {
        setFeedback(null);
        setPlayerSequence([]);
        setIsListening(true);
      }, 1500);
    }
  };
  
  // Start the timer
  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time's up!
          clearInterval(timerRef.current);
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  // End the game
  const endGame = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setGameState('result');
    
    // Normalize skill scores to be out of 100
    const maxPossibleScore = 100;
    const normalizedSkills = Object.entries(skillScores).reduce((acc, [skill, value]) => {
      acc[skill] = Math.min(100, (value / maxPossibleScore) * 100);
      return acc;
    }, {});
    
    // Call the onComplete callback with the final score and skill scores
    onComplete(score, normalizedSkills);
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (sequenceRef.current) {
        clearTimeout(sequenceRef.current);
      }
    };
  }, []);
  
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
        initial={{ scale: 0.8, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 10 }}
      >
        🎵
      </motion.div>
      
      <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-4">
        CodePulse Rhythm
      </h2>
      
      <p className="text-lg text-blue-200 mb-8">
        Déboguez du code en suivant le rythme! Identifiez et corrigez les erreurs dans le code pour marquer des points.
      </p>
      
      <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 mb-8">
        <h3 className="text-xl font-bold text-white mb-4">Comment jouer</h3>
        
        <ul className="text-left text-blue-200 space-y-2 mb-4">
          <li className="flex items-start">
            <span className="text-green-400 mr-2">✓</span>
            <span>Observez le code et identifiez l'erreur</span>
          </li>
          <li className="flex items-start">
            <span className="text-green-400 mr-2">✓</span>
            <span>Tapez la correction exacte (peut être plusieurs caractères)</span>
          </li>
          <li className="flex items-start">
            <span className="text-green-400 mr-2">✓</span>
            <span>Plus vous êtes rapide, plus vous gagnez de points</span>
          </li>
          <li className="flex items-start">
            <span className="text-green-400 mr-2">✓</span>
            <span>Complétez tous les niveaux pour maximiser votre score</span>
          </li>
        </ul>
      </div>
      
      <motion.button
        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-bold text-lg shadow-lg"
        whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(79, 70, 229, 0.5)' }}
        whileTap={{ scale: 0.98 }}
        onClick={startGame}
      >
        Commencer
      </motion.button>
    </motion.div>
  );
  
  // Render the game screen
  const renderGameScreen = () => {
    if (!currentSequence) return null;
    
    return (
      <motion.div 
        className="max-w-4xl mx-auto py-8 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-white">Niveau: {levels[currentLevel]?.name}</h3>
            <p className="text-blue-300">{levels[currentLevel]?.description}</p>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <p className="text-sm text-blue-300">Score</p>
              <p className="text-2xl font-bold text-white">{score}</p>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-blue-300">Temps</p>
              <p className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-red-400' : 'text-white'}`}>
                {timeLeft}s
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 bg-opacity-70 rounded-xl p-6 mb-8">
          <div className="mb-4">
            <p className="text-sm text-blue-300 mb-1">Code original:</p>
            <div className="bg-gray-900 p-4 rounded-lg font-mono text-green-400">
              {currentSequence.code}
            </div>
          </div>
          
          <div className="mb-6">
            <p className="text-sm text-blue-300 mb-1">Code avec erreur:</p>
            <div className="bg-gray-900 p-4 rounded-lg font-mono text-red-400">
              {currentSequence.error}
            </div>
          </div>
          
          <div>
            <p className="text-sm text-blue-300 mb-1">Votre correction:</p>
            <div className="bg-gray-900 p-4 rounded-lg font-mono text-white flex items-center h-12">
              {playerSequence.join('')}
              <span className="border-r-2 border-blue-500 h-6 ml-1 animate-pulse"></span>
            </div>
          </div>
          
          {currentSequence.hint && (
            <button 
              className="mt-4 text-sm text-blue-400 hover:text-blue-300"
              onClick={() => {
                setFeedback({
                  type: 'hint',
                  message: currentSequence.hint
                });
                
                // Small penalty for using hint
                setScore(prev => Math.max(0, prev - 2));
              }}
            >
              Besoin d'un indice? (-2 points)
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-10 gap-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
            'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p',
            'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';',
            'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/',
            '(', ')', '{', '}', '[', ']', '<', '>', '=', '+',
            '-', '*', '/', '!', '@', '#', '$', '%', '^', '&'].map(key => (
            <motion.button
              key={key}
              className="py-3 bg-gray-700 rounded-md text-white font-medium hover:bg-gray-600"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleKeyPress(key)}
            >
              {key}
            </motion.button>
          ))}
        </div>
        
        <AnimatePresence>
          {feedback && (
            <motion.div
              className={`fixed bottom-10 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg ${
                feedback.type === 'success' ? 'bg-green-600' :
                feedback.type === 'error' ? 'bg-red-600' :
                'bg-blue-600'
              }`}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
            >
              <p className="text-white font-medium">{feedback.message}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };
  
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
      
      <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-4">
        Résultats
      </h2>
      
      <p className="text-xl text-blue-200 mb-8">
        Votre score final: <span className="font-bold text-white">{score}</span> points
      </p>
      
      <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 mb-8">
        <h3 className="text-xl font-bold text-white mb-4">Vos compétences</h3>
        
        <div className="space-y-4">
          {Object.entries(skillScores).map(([skill, value]) => {
            const skillNames = {
              logicThinking: 'Pensée logique',
              patternRecognition: 'Reconnaissance de patterns',
              attentionToDetail: 'Attention aux détails',
              speedAccuracy: 'Rapidité et précision'
            };
            
            return (
              <div key={skill} className="relative pt-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-sm font-semibold inline-block text-white">
                      {skillNames[skill]}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold inline-block text-white">
                      {Math.round((value / 100) * 100)}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-700">
                  <motion.div
                    style={{ width: `${Math.round((value / 100) * 100)}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round((value / 100) * 100)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  ></motion.div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-xl p-6 shadow-lg">
        <p className="text-white mb-4">
          Vous avez un talent naturel pour {score > 50 ? 'la programmation et le débogage' : 'l\'analyse de code'}!
        </p>
        
        <p className="text-blue-200">
          Continuez votre voyage pour découvrir d'autres compétences tech.
        </p>
      </div>
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

export default CodePulseRhythm;
