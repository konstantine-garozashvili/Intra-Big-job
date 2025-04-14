import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TechStackFractal = ({ onComplete }) => {
  // Game states
  const [gameState, setGameState] = useState('intro'); // intro, playing, result
  const [level, setLevel] = useState(1);
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showQuestion, setShowQuestion] = useState(false);
  const [answeredCorrectly, setAnsweredCorrectly] = useState(0);
  
  // Refs
  const timerRef = useRef(null);
  
  // Tech stack data with levels
  const techStackData = {
    1: [
      { id: 'html1', name: 'HTML', emoji: '🌐', color: '#E34F26', textColor: '#fff', pair: 'html2', 
        questions: [
          { question: "Que signifie HTML?", options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyper Transfer Markup Language"], answer: 0 }
        ]
      },
      { id: 'html2', name: 'HTML', emoji: '📄', color: '#E34F26', textColor: '#fff', pair: 'html1' },
      { id: 'css1', name: 'CSS', emoji: '🎨', color: '#1572B6', textColor: '#fff', pair: 'css2',
        questions: [
          { question: "Que permet CSS?", options: ["Créer des bases de données", "Styler des pages web", "Programmer des applications"], answer: 1 }
        ]
      },
      { id: 'css2', name: 'CSS', emoji: '🖌️', color: '#1572B6', textColor: '#fff', pair: 'css1' },
      { id: 'js1', name: 'JavaScript', emoji: '📜', color: '#F7DF1E', textColor: '#000', pair: 'js2',
        questions: [
          { question: "JavaScript est un langage de programmation:", options: ["Compilé", "Interprété", "Assembleur"], answer: 1 }
        ]
      },
      { id: 'js2', name: 'JavaScript', emoji: '⚡', color: '#F7DF1E', textColor: '#000', pair: 'js1' },
    ],
    2: [
      { id: 'react1', name: 'React', emoji: '⚛️', color: '#61DAFB', textColor: '#000', pair: 'react2',
        questions: [
          { question: "React est développé par:", options: ["Google", "Facebook", "Microsoft"], answer: 1 }
        ]
      },
      { id: 'react2', name: 'React', emoji: '🔄', color: '#61DAFB', textColor: '#000', pair: 'react1' },
      { id: 'node1', name: 'Node.js', emoji: '🟢', color: '#339933', textColor: '#fff', pair: 'node2',
        questions: [
          { question: "Node.js utilise quel moteur JavaScript?", options: ["V8", "SpiderMonkey", "JavaScriptCore"], answer: 0 }
        ]
      },
      { id: 'node2', name: 'Node.js', emoji: '🖥️', color: '#339933', textColor: '#fff', pair: 'node1' },
      { id: 'php1', name: 'PHP', emoji: '🐘', color: '#777BB4', textColor: '#fff', pair: 'php2',
        questions: [
          { question: "PHP est principalement utilisé pour:", options: ["Le développement mobile", "Le développement backend", "L'animation 3D"], answer: 1 }
        ]
      },
      { id: 'php2', name: 'PHP', emoji: '🔄', color: '#777BB4', textColor: '#fff', pair: 'php1' },
      { id: 'mysql1', name: 'MySQL', emoji: '🗄️', color: '#4479A1', textColor: '#fff', pair: 'mysql2',
        questions: [
          { question: "MySQL est un système de:", options: ["Gestion de fichiers", "Base de données relationnelle", "Traitement d'images"], answer: 1 }
        ]
      },
      { id: 'mysql2', name: 'MySQL', emoji: '📊', color: '#4479A1', textColor: '#fff', pair: 'mysql1' },
    ],
    3: [
      { id: 'docker1', name: 'Docker', emoji: '🐳', color: '#2496ED', textColor: '#fff', pair: 'docker2',
        questions: [
          { question: "Docker utilise quelle technologie?", options: ["Virtualisation", "Conteneurisation", "Émulation"], answer: 1 }
        ]
      },
      { id: 'docker2', name: 'Docker', emoji: '📦', color: '#2496ED', textColor: '#fff', pair: 'docker1' },
      { id: 'aws1', name: 'AWS', emoji: '☁️', color: '#FF9900', textColor: '#000', pair: 'aws2',
        questions: [
          { question: "AWS est un service de:", options: ["Cloud computing", "Développement mobile", "Réseaux sociaux"], answer: 0 }
        ]
      },
      { id: 'aws2', name: 'AWS', emoji: '🌩️', color: '#FF9900', textColor: '#000', pair: 'aws1' },
      { id: 'git1', name: 'Git', emoji: '🔄', color: '#F05032', textColor: '#fff', pair: 'git2',
        questions: [
          { question: "Git est un système de:", options: ["Base de données", "Contrôle de version", "Gestion de projet"], answer: 1 }
        ]
      },
      { id: 'git2', name: 'Git', emoji: '📝', color: '#F05032', textColor: '#fff', pair: 'git1' },
      { id: 'python1', name: 'Python', emoji: '🐍', color: '#3776AB', textColor: '#fff', pair: 'python2',
        questions: [
          { question: "Python est connu pour:", options: ["Sa vitesse d'exécution", "Sa syntaxe complexe", "Sa lisibilité"], answer: 2 }
        ]
      },
      { id: 'python2', name: 'Python', emoji: '🧮', color: '#3776AB', textColor: '#fff', pair: 'python1' },
      { id: 'ai1', name: 'AI/ML', emoji: '🧠', color: '#9C27B0', textColor: '#fff', pair: 'ai2',
        questions: [
          { question: "Quel n'est PAS un domaine de l'IA?", options: ["Machine Learning", "Deep Learning", "Quantum Linking"], answer: 2 }
        ]
      },
      { id: 'ai2', name: 'AI/ML', emoji: '🤖', color: '#9C27B0', textColor: '#fff', pair: 'ai1' },
    ]
  };
  
  // Initialize game
  useEffect(() => {
    if (gameState === 'playing') {
      initializeLevel(level);
      setStartTime(Date.now());
      
      // Start timer
      timerRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState, level, startTime]);
  
  // Initialize level
  const initializeLevel = (level) => {
    let levelCards = [...techStackData[level]];
    
    // Shuffle cards
    for (let i = levelCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [levelCards[i], levelCards[j]] = [levelCards[j], levelCards[i]];
    }
    
    setCards(levelCards);
    setFlippedCards([]);
    setMatchedCards([]);
  };
  
  // Handle card click
  const handleCardClick = (id) => {
    // Don't allow more than 2 cards flipped at once
    if (flippedCards.length === 2) return;
    
    // Don't allow clicking already matched cards
    if (matchedCards.includes(id)) return;
    
    // Don't allow clicking already flipped card
    if (flippedCards.includes(id)) return;
    
    // Flip the card
    setFlippedCards([...flippedCards, id]);
    
    // If this is the second card
    if (flippedCards.length === 1) {
      // Get the first card
      const firstCard = cards.find(card => card.id === flippedCards[0]);
      // Get the second card
      const secondCard = cards.find(card => card.id === id);
      
      // Check if they match
      if (firstCard.pair === secondCard.id) {
        // They match!
        setMatchedCards([...matchedCards, firstCard.id, secondCard.id]);
        setFlippedCards([]);
        
        // Increase score
        const timeBonus = Math.max(0, 100 - elapsedTime);
        setScore(prev => prev + 10 + timeBonus);
        
        // Show question if available
        const cardWithQuestion = firstCard.questions ? firstCard : secondCard.questions ? secondCard : null;
        
        if (cardWithQuestion && cardWithQuestion.questions) {
          const randomQuestion = cardWithQuestion.questions[Math.floor(Math.random() * cardWithQuestion.questions.length)];
          setCurrentQuestion({
            ...randomQuestion,
            cardName: cardWithQuestion.name,
            cardColor: cardWithQuestion.color,
            cardTextColor: cardWithQuestion.textColor
          });
          setShowQuestion(true);
        }
      } else {
        // They don't match, flip them back after a delay
        setTimeout(() => {
          setFlippedCards([]);
        }, 1000);
      }
    }
  };
  
  // Handle question answer
  const handleQuestionAnswer = (answerIndex) => {
    if (currentQuestion.answer === answerIndex) {
      // Correct answer
      setScore(prev => prev + 20);
      setAnsweredCorrectly(prev => prev + 1);
    }
    
    setShowQuestion(false);
    setCurrentQuestion(null);
    
    // Check if level is complete
    if (matchedCards.length === cards.length) {
      if (level < 3) {
        // Go to next level
        setLevel(level + 1);
        initializeLevel(level + 1);
      } else {
        // Game complete
        setGameState('result');
        
        // Stop timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      }
    }
  };
  
  // Start game
  const startGame = () => {
    setGameState('playing');
    setLevel(1);
    setScore(0);
    setElapsedTime(0);
    setAnsweredCorrectly(0);
  };
  
  // Complete game and return to main flow
  const completeGame = () => {
    // Calculate skill scores based on performance
    const skillScores = {
      memory: Math.min(100, Math.round((matchedCards.length / cards.length) * 100)),
      speed: Math.min(100, Math.max(0, 100 - elapsedTime / 2)),
      knowledge: Math.min(100, Math.round((answeredCorrectly / 5) * 100))
    };
    
    onComplete(score, skillScores);
  };
  
  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Render card
  const renderCard = (card) => {
    const isFlipped = flippedCards.includes(card.id) || matchedCards.includes(card.id);
    
    return (
      <motion.div
        key={card.id}
        className="relative cursor-pointer h-40"
        initial={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => handleCardClick(card.id)}
      >
        <div 
          className={`w-full h-full transition-all duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
        >
          {/* Card back */}
          <div
            className="absolute inset-0 flex items-center justify-center rounded-xl shadow-lg backface-hidden bg-gray-800 border-2 border-gray-600"
          >
            <div className="text-5xl">?</div>
          </div>
          
          {/* Card front */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-xl shadow-lg backface-hidden rotate-y-180"
            style={{
              backgroundColor: card.color,
              color: card.textColor,
              border: '2px solid rgba(255,255,255,0.2)'
            }}
          >
            <div className="text-4xl mb-2">{card.emoji}</div>
            <div className="font-bold text-lg">{card.name}</div>
          </div>
        </div>
      </motion.div>
    );
  };
  
  // Render game state
  const renderGameState = () => {
    switch (gameState) {
      case 'intro':
        return (
          <div className="text-center max-w-4xl mx-auto px-4 pt-8">
            <motion.div
              className="text-6xl mb-6"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
            >
              🧠
            </motion.div>
            
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-6">
              Tech Stack Fractal
            </h1>
            
            <p className="text-lg text-blue-200 mb-8 max-w-2xl mx-auto">
              Testez votre mémoire et vos connaissances tech en trouvant les paires de cartes correspondantes
            </p>
            
            <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 mb-8 max-w-2xl mx-auto">
              <h2 className="text-xl font-bold text-white mb-4">Comment jouer:</h2>
              <ul className="text-left text-blue-200 space-y-2">
                <li className="flex items-start">
                  <span className="mr-2">1.</span>
                  <span>Retournez les cartes pour trouver les paires correspondantes</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">2.</span>
                  <span>Répondez aux questions pour gagner des points bonus</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">3.</span>
                  <span>Complétez les 3 niveaux pour terminer le jeu</span>
                </li>
              </ul>
            </div>
            
            <motion.button
              className="px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-lg text-white font-bold text-lg shadow-lg"
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(79, 70, 229, 0.5)' }}
              whileTap={{ scale: 0.98 }}
              onClick={startGame}
            >
              Commencer le jeu
            </motion.button>
          </div>
        );
        
      case 'playing':
        return (
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Niveau {level}: {level === 1 ? 'Bases' : level === 2 ? 'Intermédiaire' : 'Avancé'}</h2>
                <p className="text-blue-200 text-sm">Trouvez toutes les paires pour passer au niveau suivant</p>
              </div>
              
              <div className="flex space-x-6">
                <div className="text-center">
                  <div className="text-sm text-gray-400">Score</div>
                  <div className="text-2xl font-bold text-white">{score}</div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm text-gray-400">Temps</div>
                  <div className="text-2xl font-bold text-white">{formatTime(elapsedTime)}</div>
                </div>
              </div>
            </div>
            
            <div className={`grid gap-4 ${level === 1 ? 'grid-cols-3 grid-rows-2' : level === 2 ? 'grid-cols-4 grid-rows-2' : 'grid-cols-5 grid-rows-2'}`}>
              {cards.map(card => renderCard(card))}
            </div>
            
            {/* Question modal */}
            <AnimatePresence>
              {showQuestion && (
                <motion.div
                  className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70 p-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="bg-gray-800 rounded-xl p-6 max-w-md w-full"
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                  >
                    <div className="flex items-center mb-4">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center mr-4 text-2xl"
                        style={{ backgroundColor: currentQuestion.cardColor, color: currentQuestion.cardTextColor }}
                      >
                        {currentQuestion.cardName === 'HTML' ? '🌐' :
                         currentQuestion.cardName === 'CSS' ? '🎨' :
                         currentQuestion.cardName === 'JavaScript' ? '📜' :
                         currentQuestion.cardName === 'React' ? '⚛️' :
                         currentQuestion.cardName === 'Node.js' ? '🟢' :
                         currentQuestion.cardName === 'PHP' ? '🐘' :
                         currentQuestion.cardName === 'MySQL' ? '🗄️' :
                         currentQuestion.cardName === 'Docker' ? '🐳' :
                         currentQuestion.cardName === 'AWS' ? '☁️' :
                         currentQuestion.cardName === 'Git' ? '🔄' :
                         currentQuestion.cardName === 'Python' ? '🐍' :
                         currentQuestion.cardName === 'AI/ML' ? '🧠' : '❓'}
                      </div>
                      <h3 className="text-xl font-bold text-white">Question {currentQuestion.cardName}</h3>
                    </div>
                    
                    <p className="text-lg text-white mb-6">{currentQuestion.question}</p>
                    
                    <div className="space-y-3">
                      {currentQuestion.options.map((option, index) => (
                        <button
                          key={index}
                          className="w-full py-3 px-4 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-left transition-colors"
                          onClick={() => handleQuestionAnswer(index)}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
        
      case 'result':
        return (
          <div className="text-center max-w-4xl mx-auto px-4 py-8">
            <motion.div
              className="text-6xl mb-6"
              initial={{ scale: 0.8, rotate: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              transition={{ duration: 1 }}
            >
              🏆
            </motion.div>
            
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-6">
              Félicitations!
            </h1>
            
            <p className="text-lg text-blue-200 mb-8 max-w-2xl mx-auto">
              Vous avez complété tous les niveaux de Tech Stack Fractal!
            </p>
            
            <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 mb-8 max-w-md mx-auto">
              <h2 className="text-xl font-bold text-white mb-4">Résultats:</h2>
              
              <div className="flex justify-between items-center mb-4">
                <span className="text-blue-200">Score final:</span>
                <span className="text-2xl font-bold text-white">{score}</span>
              </div>
              
              <div className="flex justify-between items-center mb-4">
                <span className="text-blue-200">Temps total:</span>
                <span className="text-xl font-bold text-white">{formatTime(elapsedTime)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-blue-200">Niveau atteint:</span>
                <span className="text-xl font-bold text-white">3 / 3</span>
              </div>
            </div>
            
            <motion.button
              className="px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-lg text-white font-bold text-lg shadow-lg"
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(79, 70, 229, 0.5)' }}
              whileTap={{ scale: 0.98 }}
              onClick={completeGame}
            >
              Continuer l'aventure
            </motion.button>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen">
      {renderGameState()}
    </div>
  );
};

export default TechStackFractal;
