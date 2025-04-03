import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TechStackShowcase = () => {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  
  // Define the tech stack with questions
  const techStack = [
    { 
      id: 'js', 
      name: 'JavaScript', 
      emoji: '📜', 
      color: '#F7DF1E', 
      textColor: '#000',
      questions: [
        { question: "Which keyword declares a variable that can be reassigned?", options: ["const", "let", "both"], answer: "let" },
        { question: "JavaScript is a _____ language?", options: ["compiled", "interpreted", "assembly"], answer: "interpreted" }
      ]
    },
    { 
      id: 'html', 
      name: 'HTML', 
      emoji: '🌐', 
      color: '#E34F26', 
      textColor: '#fff',
      questions: [
        { question: "What does HTML stand for?", options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hybrid Text Meta Language"], answer: "Hyper Text Markup Language" },
        { question: "Which tag is used for creating a hyperlink?", options: ["<link>", "<a>", "<href>"], answer: "<a>" }
      ]
    },
    { 
      id: 'css', 
      name: 'CSS', 
      emoji: '🎨', 
      color: '#1572B6', 
      textColor: '#fff',
      questions: [
        { question: "Which property is used to change the background color?", options: ["color", "background-color", "bgcolor"], answer: "background-color" },
        { question: "CSS stands for:", options: ["Cascading Style Sheets", "Creative Style System", "Computer Style Syntax"], answer: "Cascading Style Sheets" }
      ]
    },
    { 
      id: 'react', 
      name: 'React', 
      emoji: '⚛️', 
      color: '#61DAFB', 
      textColor: '#000',
      questions: [
        { question: "React is maintained by:", options: ["Google", "Facebook", "Microsoft"], answer: "Facebook" },
        { question: "What is the virtual DOM in React?", options: ["A copy of the real DOM", "A browser feature", "A plugin"], answer: "A copy of the real DOM" }
      ]
    },
    { 
      id: 'symfony', 
      name: 'Symfony', 
      emoji: '🔷', 
      color: '#000000', 
      textColor: '#fff',
      questions: [
        { question: "Symfony is a PHP:", options: ["Library", "Framework", "Database"], answer: "Framework" },
        { question: "Which component is NOT part of Symfony?", options: ["Twig", "Doctrine", "Angular"], answer: "Angular" }
      ]
    },
    { 
      id: 'mysql', 
      name: 'MySQL', 
      emoji: '🐬', 
      color: '#4479A1', 
      textColor: '#fff',
      questions: [
        { question: "MySQL is a:", options: ["NoSQL Database", "Relational Database", "Graph Database"], answer: "Relational Database" },
        { question: "Which SQL command is used to retrieve data?", options: ["GET", "FETCH", "SELECT"], answer: "SELECT" }
      ]
    },
    { 
      id: 'docker', 
      name: 'Docker', 
      emoji: '🐳', 
      color: '#2496ED', 
      textColor: '#fff',
      questions: [
        { question: "Docker containers include:", options: ["Full OS", "Application & dependencies", "Hardware virtualization"], answer: "Application & dependencies" },
        { question: "Docker images are stored in:", options: ["Repositories", "Containers", "Volumes"], answer: "Repositories" }
      ]
    },
    { 
      id: 'php', 
      name: 'PHP', 
      emoji: '🐘', 
      color: '#777BB4', 
      textColor: '#fff',
      questions: [
        { question: "PHP is a:", options: ["Client-side language", "Server-side language", "Database language"], answer: "Server-side language" },
        { question: "Which symbol is used before PHP variables?", options: ["#", "$", "@"], answer: "$" }
      ]
    },
    { 
      id: 'tailwind', 
      name: 'Tailwind', 
      emoji: '🌊', 
      color: '#38B2AC', 
      textColor: '#fff',
      questions: [
        { question: "Tailwind CSS is a:", options: ["Component library", "Utility-first framework", "CSS preprocessor"], answer: "Utility-first framework" },
        { question: "Tailwind uses what approach to styling?", options: ["Inline", "Utility classes", "CSS-in-JS"], answer: "Utility classes" }
      ]
    }
  ];

  // Initialize the game
  useEffect(() => {
    initializeGame();
  }, []);
  
  // Setup the game cards
  const initializeGame = () => {
    // Create pairs of cards
    const cardPairs = techStack.map(tech => [
      { ...tech, id: `${tech.id}-1` },
      { ...tech, id: `${tech.id}-2` }
    ]).flat();
    
    // Shuffle the cards
    const shuffledCards = shuffleArray(cardPairs);
    
    setCards(shuffledCards);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setGameComplete(false);
    setCurrentQuestion(null);
    setQuestionsAnswered(0);
    setCorrectAnswers(0);
    setFeedbackMessage(null);
  };
  
  // Fisher-Yates shuffle algorithm
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };
  
  // Handle card click
  const handleCardClick = (id) => {
    // Prevent clicking if game is disabled or card is already flipped/matched
    if (disabled || flipped.includes(id) || matched.includes(id) || currentQuestion) return;
    
    // Add card to flipped cards
    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);
    
    // If this is the second card flipped
    if (newFlipped.length === 2) {
      setDisabled(true);
      setMoves(moves + 1);
      
      // Check if the cards match
      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find(card => card.id === firstId);
      const secondCard = cards.find(card => card.id === secondId);
      
      if (firstCard.name === secondCard.name) {
        // Cards match - show a question
        const tech = techStack.find(t => t.id === firstCard.id.split('-')[0]);
        const randomQuestionIndex = Math.floor(Math.random() * tech.questions.length);
        setCurrentQuestion({
          ...tech.questions[randomQuestionIndex],
          techId: tech.id,
          techName: tech.name
        });
        
        // Add to matched cards
        setMatched([...matched, firstId, secondId]);
        setFlipped([]);
      } else {
        // Cards don't match, flip them back after a delay
        setTimeout(() => {
          setFlipped([]);
          setDisabled(false);
        }, 1000);
      }
    }
  };
  
  // Handle answering a question
  const handleAnswerQuestion = (selectedAnswer) => {
    const isCorrect = selectedAnswer === currentQuestion.answer;
    setQuestionsAnswered(questionsAnswered + 1);
    
    if (isCorrect) {
      setCorrectAnswers(correctAnswers + 1);
      setFeedbackMessage({
        text: "Correct! Well done!",
        type: "success"
      });
    } else {
      setFeedbackMessage({
        text: `Incorrect. The correct answer is: ${currentQuestion.answer}`,
        type: "error"
      });
    }
    
    // Clear feedback after 2 seconds
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 2000);
    
    // Check if game is complete
    const newMatchedCount = matched.length / 2;
    if (newMatchedCount === techStack.length) {
      setTimeout(() => {
        setGameComplete(true);
      }, 1000);
    }
    
    // Reset for next move
    setCurrentQuestion(null);
    setDisabled(false);
  };
  
  // Restart the game
  const handleRestartGame = () => {
    initializeGame();
  };
  
  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-purple-400 mb-2">MY TECHSTACK</h2>
          <p className="text-blue-200 mb-4">Match the cards to discover my tech skills!</p>
          
          <div className="flex justify-center items-center space-x-6 text-sm text-blue-300">
            <div>Moves: {moves}</div>
            <div>Questions: {questionsAnswered}/{matched.length/2}</div>
            <div>Correct: {correctAnswers}</div>
            
            <button 
              onClick={handleRestartGame}
              className="bg-blue-600 text-white px-4 py-1 rounded-md hover:bg-blue-700 transition-colors"
            >
              Restart Game
            </button>
          </div>
        </div>
        
        {/* Feedback message */}
        <AnimatePresence>
          {feedbackMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg ${
                feedbackMessage.type === 'success' ? 'bg-green-600' : 'bg-red-600'
              } text-white font-medium`}
            >
              {feedbackMessage.text}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Game completion modal */}
        <AnimatePresence>
          {gameComplete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
              onClick={() => setGameComplete(false)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4 text-center"
                onClick={e => e.stopPropagation()}
              >
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold text-blue-400 mb-4">Congratulations!</h3>
                <p className="text-blue-200 mb-6">You've completed the tech stack memory game!</p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="text-xl font-bold text-white">{moves}</div>
                    <div className="text-blue-300 text-sm">Total Moves</div>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="text-xl font-bold text-white">{correctAnswers}/{questionsAnswered}</div>
                    <div className="text-blue-300 text-sm">Correct Answers</div>
                  </div>
                </div>
                
                <button
                  onClick={handleRestartGame}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Play Again
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Question modal */}
        <AnimatePresence>
          {currentQuestion && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4"
              >
                <h3 className="text-xl font-bold text-blue-400 mb-2">{currentQuestion.techName} Question</h3>
                <p className="text-white mb-4">{currentQuestion.question}</p>
                
                <div className="space-y-2">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerQuestion(option)}
                      className="w-full text-left px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Memory game grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 max-w-5xl mx-auto">
          {cards.map(card => (
            <motion.div
              key={card.id}
              className={`relative h-40 w-full cursor-pointer rounded-xl perspective-1000 ${
                matched.includes(card.id) ? 'opacity-80' : 'opacity-100'
              }`}
              onClick={() => handleCardClick(card.id)}
              whileHover={{ scale: flipped.includes(card.id) || matched.includes(card.id) ? 1 : 1.05 }}
            >
              <motion.div
                className="absolute w-full h-full rounded-xl preserve-3d transition-all duration-500"
                style={{
                  rotateY: flipped.includes(card.id) || matched.includes(card.id) ? 180 : 0
                }}
              >
                {/* Card Back */}
                <div 
                  className="absolute w-full h-full backface-hidden rounded-xl bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center border-2 border-blue-700 shadow-lg"
                >
                  <span className="text-4xl">?</span>
                </div>
                
                {/* Card Front */}
                <div 
                  className="absolute w-full h-full backface-hidden rounded-xl rotate-y-180 flex flex-col items-center justify-center p-4 shadow-lg"
                  style={{ 
                    backgroundColor: card.color,
                    color: card.textColor
                  }}
                >
                  <div className="text-4xl mb-2">{card.emoji}</div>
                  <div className="font-bold text-center">{card.name}</div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Custom CSS for 3D card effect */}
      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </section>
  );
};

export default TechStackShowcase;
