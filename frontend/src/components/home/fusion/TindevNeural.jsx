import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';

const TindevNeural = ({ onComplete }) => {
  // State for the current question index
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  // State for tracking swipe results
  const [swipeResults, setSwipeResults] = useState({
    creative: 0,
    analytical: 0,
    security: 0,
    dataScience: 0,
    devOps: 0
  });
  // State for animation
  const [exitX, setExitX] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Motion values for the drag
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5]);
  
  // Questions with neural mapping
  const questions = [
    {
      id: 1,
      text: "Préférez-vous créer un chef-d'œuvre ou résoudre une énigme?",
      leftOption: "Résoudre une énigme",
      rightOption: "Créer un chef-d'œuvre",
      leftMapping: { analytical: 15, security: 10 },
      rightMapping: { creative: 20, dataScience: 5 },
      leftAnimation: "🔍",
      rightAnimation: "🎨"
    },
    {
      id: 2,
      text: "Une API ressemble-t-elle plus à un serveur 🧑‍🍳 ou à un plan 📐?",
      leftOption: "Un serveur",
      rightOption: "Un plan",
      leftMapping: { devOps: 15, security: 5 },
      rightMapping: { analytical: 15, dataScience: 10 },
      leftAnimation: "🧑‍🍳",
      rightAnimation: "📐"
    },
    {
      id: 3,
      text: "Le site d'une banque plante en pleine transaction. Vous: 🔍 Enquêtez ou 🎨 Redesignez?",
      leftOption: "Enquêter",
      rightOption: "Redesigner",
      leftMapping: { security: 20, analytical: 10 },
      rightMapping: { creative: 15, devOps: 5 },
      leftAnimation: "🔍",
      rightAnimation: "🎨"
    },
    {
      id: 4,
      text: "console.log('Hello World') vous semble... 😍 Familier ou 🤔 Étrange?",
      leftOption: "Étrange",
      rightOption: "Familier",
      leftMapping: { creative: 10, devOps: 5 },
      rightMapping: { analytical: 20, dataScience: 10 },
      leftAnimation: "🤔",
      rightAnimation: "😍"
    },
    {
      id: 5,
      text: "Quand vous entendez 'Python', pensez-vous à un 🐍 Animal ou un 🖥️ Langage?",
      leftOption: "Animal",
      rightOption: "Langage",
      leftMapping: { creative: 10, security: 5 },
      rightMapping: { dataScience: 20, analytical: 10 },
      leftAnimation: "🐍",
      rightAnimation: "🖥️"
    }
  ];
  
  // Handle drag end
  const handleDragEnd = (_, info) => {
    if (isAnimating) return;
    // Si le seuil n'est pas dépassé, la carte revient simplement à sa position d'origine
    if (info.offset.x > 100) {
      setIsAnimating(true);
      setExitX(200);
      // Update swipe results based on right mapping
      setSwipeResults(prev => {
        const newResults = { ...prev };
        Object.entries(currentQuestion.rightMapping).forEach(([key, value]) => {
          newResults[key] = (newResults[key] || 0) + value;
        });
        return newResults;
      });
      setTimeout(() => {
        nextQuestion();
      }, 300);
    } else if (info.offset.x < -100) {
      setIsAnimating(true);
      setExitX(-200);
      // Update swipe results based on left mapping
      setSwipeResults(prev => {
        const newResults = { ...prev };
        Object.entries(currentQuestion.leftMapping).forEach(([key, value]) => {
          newResults[key] = (newResults[key] || 0) + value;
        });
        return newResults;
      });
      setTimeout(() => {
        nextQuestion();
      }, 300);
    } else {
      // Pas assez de déplacement : retour à la position d'origine sans animation de sortie
      setExitX(0);
      setIsAnimating(false);
    }
  };

  
  // Go to next question or complete
  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setExitX(0);
      setIsAnimating(false);
    } else {
      // Normalize scores to percentages
      const totalPoints = Object.values(swipeResults).reduce((sum, val) => sum + val, 0);
      const normalizedResults = {};
      
      Object.entries(swipeResults).forEach(([key, value]) => {
        normalizedResults[key] = Math.round((value / totalPoints) * 100);
      });
      
      // Complete the Tindev phase
      onComplete(normalizedResults);
    }
  };
  
  // Current question
  const currentQuestion = questions[currentQuestionIndex];
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 py-8">
      <div className="text-center mb-6">
        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">
          Découvrez Votre Profil Tech
        </h2>
        <p className="text-lg text-blue-200 max-w-xl mx-auto">
          Swipez à droite ou à gauche pour répondre aux questions et révéler vos talents cachés
        </p>
      </div>
      
      <div className="relative w-full max-w-md h-96 mx-auto">
      <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            className={`absolute w-full h-full ${isAnimating ? 'pointer-events-none opacity-70' : ''}`}
            style={{ x, rotate, opacity }}
            drag={isAnimating ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={isAnimating ? undefined : handleDragEnd}
            initial={{ x: 0, opacity: 1 }}
            animate={isAnimating ? { x: exitX, opacity: 0 } : { x: 0, opacity: 1 }}
            exit={{ x: exitX, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden shadow-xl border border-gray-700 flex flex-col">
              <div className="flex-1 p-6 flex flex-col justify-center items-center text-center">
                <motion.div
                  className="text-7xl mb-8"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  {exitX > 0 ? currentQuestion.rightAnimation : exitX < 0 ? currentQuestion.leftAnimation : "❓"}
                </motion.div>
                
                <h3 className="text-2xl font-bold text-white mb-6">{currentQuestion.text}</h3>
                
                <div className="flex justify-between w-full mt-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-red-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-xl">👈</span>
                    </div>
                    <p className="text-sm text-gray-400">{currentQuestion.leftOption}</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-xl">👉</span>
                    </div>
                    <p className="text-sm text-gray-400">{currentQuestion.rightOption}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-900 p-4 flex justify-between items-center">
                <div className="text-blue-300 text-sm">
                  Question {currentQuestionIndex + 1}/{questions.length}
                </div>
                
                <div className="flex space-x-1">
                  {questions.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === currentQuestionIndex
                          ? 'bg-blue-500'
                          : index < currentQuestionIndex
                          ? 'bg-green-500'
                          : 'bg-gray-600'
                      }`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Neural visualization */}
      <div className="mt-8 w-full max-w-md mx-auto">
        <div className="bg-gray-800 bg-opacity-50 rounded-xl p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Analyse neuronale en temps réel</h3>
          
          <div className="space-y-2">
            {Object.entries(swipeResults).map(([key, value]) => {
              const domainNames = {
                creative: 'Créativité',
                analytical: 'Analyse',
                security: 'Sécurité',
                dataScience: 'Data Science',
                devOps: 'DevOps'
              };
              
              const domainColors = {
                creative: 'bg-pink-500',
                analytical: 'bg-blue-500',
                security: 'bg-green-500',
                dataScience: 'bg-indigo-500',
                devOps: 'bg-amber-500'
              };
              
              // Calculate percentage based on maximum possible score
              const maxPossibleScore = 100; // This would be the sum of all right or left mappings
              const percentage = Math.min(100, Math.round((value / maxPossibleScore) * 100));
              
              return (
                <div key={key} className="relative pt-1">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <span className="text-xs font-semibold inline-block text-gray-300">
                        {domainNames[key]}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-gray-300">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-1 mb-2 text-xs flex rounded bg-gray-700">
                    <motion.div
                      style={{ width: `${percentage}%` }}
                      className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${domainColors[key]}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5 }}
                    ></motion.div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-gray-400 text-sm max-w-md mx-auto">
          Swipez à gauche ou à droite, ou utilisez les flèches de votre clavier pour répondre
        </p>
      </div>
    </div>
  );
};

export default TindevNeural;
