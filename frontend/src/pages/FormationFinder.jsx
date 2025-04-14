import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';

const FormationFinder = () => {
  const { colorMode, toggleColorMode, currentTheme } = useTheme();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);

  // Questions for the quiz
  const questions = [
    {
      question: "Qu'est-ce qui vous intéresse le plus dans la technologie?",
      options: [
        { text: "Créer des sites web et des applications", value: "web" },
        { text: "Analyser des données et trouver des insights", value: "data" },
        { text: "Protéger les systèmes contre les menaces", value: "security" },
        { text: "Développer l'intelligence artificielle", value: "ai" }
      ]
    },
    {
      question: "Quel type de projet aimeriez-vous réaliser?",
      options: [
        { text: "Une application mobile innovante", value: "mobile" },
        { text: "Un jeu vidéo captivant", value: "game" },
        { text: "Un système d'analyse de données", value: "data" },
        { text: "Un site web interactif", value: "web" }
      ]
    },
    {
      question: "Comment préférez-vous apprendre?",
      options: [
        { text: "En pratiquant avec des projets concrets", value: "practical" },
        { text: "En comprenant les concepts théoriques", value: "theoretical" },
        { text: "En résolvant des problèmes complexes", value: "problem-solving" },
        { text: "En collaborant avec d'autres", value: "collaborative" }
      ]
    },
    {
      question: "Quel domaine vous passionne le plus?",
      options: [
        { text: "L'innovation technologique", value: "innovation" },
        { text: "La sécurité informatique", value: "security" },
        { text: "Le design et l'expérience utilisateur", value: "design" },
        { text: "L'automatisation et l'intelligence artificielle", value: "ai" }
      ]
    },
    {
      question: "Quelle compétence souhaitez-vous développer en priorité?",
      options: [
        { text: "La programmation et le développement", value: "coding" },
        { text: "L'analyse et la visualisation de données", value: "analysis" },
        { text: "La cybersécurité", value: "security" },
        { text: "La conception d'interfaces utilisateur", value: "ui" }
      ]
    }
  ];

  // Formations data
  const formations = {
    web: {
      id: 'web',
      title: 'Développement Web',
      description: 'Maîtrisez HTML, CSS, JavaScript et les frameworks modernes pour créer des sites web et applications web interactifs et responsifs.',
      image: '/assets/images/course-web.jpg',
      color: 'from-blue-500 to-cyan-400',
      modules: ['HTML/CSS', 'JavaScript', 'React', 'Node.js', 'PHP/MySQL'],
      duration: '9 mois'
    },
    cybersecurity: {
      id: 'cybersecurity',
      title: 'Cybersécurité',
      description: 'Apprenez à protéger les systèmes informatiques contre les menaces et vulnérabilités avec des techniques avancées de sécurité.',
      image: '/assets/images/course-security.jpg',
      color: 'from-green-500 to-emerald-400',
      modules: ['Sécurité réseau', 'Cryptographie', 'Ethical Hacking', 'Forensics', 'Sécurité Cloud'],
      duration: '10 mois'
    },
    ai: {
      id: 'ai',
      title: 'Intelligence Artificielle',
      description: 'Découvrez le machine learning, le deep learning et leurs applications pratiques dans divers domaines industriels.',
      image: '/assets/images/course-ai.jpg',
      color: 'from-purple-500 to-pink-500',
      modules: ['Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision', 'Éthique de l\'IA'],
      duration: '12 mois'
    },
    data: {
      id: 'data-science',
      title: 'Science des Données',
      description: 'Analysez et visualisez des données complexes pour en extraire des insights précieux et prendre des décisions basées sur les données.',
      image: '/assets/images/course-data.jpg',
      color: 'from-indigo-500 to-blue-600',
      modules: ['Python pour Data Science', 'Statistiques', 'Visualisation', 'Big Data', 'Business Intelligence'],
      duration: '10 mois'
    },
    mobile: {
      id: 'mobile',
      title: 'Développement Mobile',
      description: 'Créez des applications mobiles pour iOS et Android avec des frameworks natifs et cross-platform comme React Native et Flutter.',
      image: '/assets/images/course-mobile.jpg',
      color: 'from-pink-500 to-red-500',
      modules: ['iOS (Swift)', 'Android (Kotlin)', 'React Native', 'Flutter', 'UX/UI Mobile'],
      duration: '8 mois'
    },
    game: {
      id: 'game',
      title: 'Développement de Jeux',
      description: 'Concevez et créez des jeux vidéo captivants en utilisant des moteurs de jeu professionnels comme Unity et Unreal Engine.',
      image: '/assets/images/course-game.jpg',
      color: 'from-yellow-500 to-orange-500',
      modules: ['Game Design', 'Unity', 'Unreal Engine', '3D Modeling', 'Game Physics'],
      duration: '11 mois'
    }
  };

  // Handle answer selection
  const handleAnswer = (value) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate result
      calculateResult(newAnswers);
    }
  };

  // Calculate the most suitable formation based on answers
  const calculateResult = (userAnswers) => {
    const scores = {
      web: 0,
      data: 0,
      cybersecurity: 0,
      ai: 0,
      mobile: 0,
      game: 0
    };

    // Count occurrences of each formation type in answers
    userAnswers.forEach(answer => {
      if (answer === 'web') scores.web += 2;
      if (answer === 'data') scores.data += 2;
      if (answer === 'security') scores.cybersecurity += 2;
      if (answer === 'ai') scores.ai += 2;
      if (answer === 'mobile') scores.mobile += 2;
      if (answer === 'game') scores.game += 2;
      
      // Additional scoring based on other answers
      if (answer === 'coding') {
        scores.web += 1;
        scores.mobile += 1;
        scores.game += 1;
      }
      if (answer === 'analysis') {
        scores.data += 1;
        scores.ai += 1;
      }
      if (answer === 'ui') {
        scores.web += 1;
        scores.mobile += 1;
      }
      if (answer === 'practical') {
        scores.web += 0.5;
        scores.mobile += 0.5;
        scores.game += 0.5;
      }
      if (answer === 'theoretical') {
        scores.ai += 0.5;
        scores.data += 0.5;
      }
      if (answer === 'problem-solving') {
        scores.cybersecurity += 0.5;
        scores.ai += 0.5;
      }
      if (answer === 'innovation') {
        scores.ai += 0.5;
        scores.mobile += 0.5;
      }
      if (answer === 'design') {
        scores.web += 0.5;
        scores.game += 0.5;
      }
    });

    // Find formation with highest score
    let maxScore = 0;
    let bestFormation = 'web'; // Default
    
    Object.entries(scores).forEach(([formation, score]) => {
      if (score > maxScore) {
        maxScore = score;
        bestFormation = formation;
      }
    });

    // Set result
    setResult(formations[bestFormation]);
    setShowResult(true);
  };

  // Reset quiz
  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setResult(null);
    setShowResult(false);
  };

  // Animated background stars
  const [stars, setStars] = useState([]);
  
  useEffect(() => {
    // Generate random stars
    const generatedStars = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.8 + 0.2,
      animationDelay: `${Math.random() * 5}s`
    }));
    
    setStars(generatedStars);
  }, []);

  return (
    <div className={`min-h-screen ${currentTheme.bg} text-white relative overflow-hidden`}>
      {/* Navigation */}

      {/* Animated stars background */}
      <div className="absolute inset-0 overflow-hidden">
        {stars.map(star => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white animate-twinkle"
            style={{
              top: star.top,
              left: star.left,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              animationDelay: star.animationDelay
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-24 relative z-10">
        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <header className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-300 to-purple-400 text-transparent bg-clip-text">
              Trouvez la Formation Idéale
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Répondez à quelques questions pour découvrir quelle formation correspond le mieux à vos intérêts et objectifs
            </p>
          </header>

          {!showResult ? (
            <motion.div
              className={`${currentTheme.cardBg} backdrop-blur-sm rounded-xl p-8 shadow-xl`}
              key={currentQuestion}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-8">
                <div className="flex justify-between mb-2 text-sm text-blue-200">
                  <span>Question {currentQuestion + 1} sur {questions.length}</span>
                  <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold mb-6">{questions[currentQuestion].question}</h2>
              
              <div className="grid grid-cols-1 gap-4">
                {questions[currentQuestion].options.map((option, index) => (
                  <motion.button
                    key={index}
                    className={`p-4 ${currentTheme.cardBg} border border-blue-500/20 rounded-lg text-left hover:border-blue-400 transition-colors`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswer(option.value)}
                  >
                    {option.text}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              className={`${currentTheme.cardBg} backdrop-blur-sm rounded-xl overflow-hidden shadow-xl`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className={`h-48 bg-gradient-to-r ${result.color} flex items-center justify-center`}>
                <h2 className="text-3xl font-bold text-white">Votre Formation Idéale</h2>
              </div>
              
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4">{result.title}</h3>
                <p className="text-gray-300 mb-6">{result.description}</p>
                
                <div className="mb-6">
                  <h4 className="font-semibold mb-2 text-blue-300">Modules principaux:</h4>
                  <ul className="grid grid-cols-2 gap-2">
                    {result.modules.map((module, i) => (
                      <li key={i} className="flex items-center">
                        <span className="mr-2">•</span>
                        {module}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mb-6">
                  <span className="text-sm font-semibold text-blue-300">Durée: {result.duration}</span>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to={`/formations/${result.id}`} className="flex-1">
                    <motion.button
                      className={`w-full py-3 px-6 ${currentTheme.buttonBg} rounded-lg font-medium text-center transition-colors`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Découvrir cette formation
                    </motion.button>
                  </Link>
                  
                  <motion.button
                    className={`flex-1 py-3 px-6 ${currentTheme.buttonAlt} backdrop-blur-sm rounded-lg font-medium text-center`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={resetQuiz}
                  >
                    Recommencer le quiz
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default FormationFinder;
