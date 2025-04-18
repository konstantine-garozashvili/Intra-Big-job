import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TinDev = () => {
  // State variables
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [swipedCards, setSwipedCards] = useState([]);
  const [courseMatches, setCourseMatches] = useState({});
  const [showFinalMatch, setShowFinalMatch] = useState(false);
  const [streak, setStreak] = useState(0);
  const [badges, setBadges] = useState([]);
  const [boosted, setBoosted] = useState(false);
  const [score, setScore] = useState(0);
  
  // Refs for card swiping
  const cardRef = useRef(null);
  const initialPosition = useRef({ x: 0, y: 0 });
  const currentPosition = useRef({ x: 0, y: 0 });
  
  // Updated questions to yes/no format about whether technologies suit the user
  const questions = [
    {
      id: 1,
      category: 'frontend',
      question: "Aimez-vous créer des interfaces visuelles attrayantes?",
      subtext: "Les développeurs frontend conçoivent ce que les utilisateurs voient et avec quoi ils interagissent.",
      techName: "Frontend Development",
      matchCategories: ['frontend', 'css', 'html'],
    },
    {
      id: 2,
      category: 'javascript',
      question: "Souhaitez-vous maîtriser le langage le plus répandu du web?",
      subtext: "JavaScript est essentiel pour créer des sites web interactifs et dynamiques.",
      techName: "JavaScript",
      matchCategories: ['javascript', 'frontend'],
    },
    {
      id: 3,
      category: 'react',
      question: "Voulez-vous construire des interfaces utilisateur réactives avec React?",
      subtext: "React est l'une des bibliothèques frontend les plus populaires, développée par Facebook.",
      techName: "React",
      matchCategories: ['javascript', 'react', 'frontend'],
    },
    {
      id: 4,
      category: 'tailwind',
      question: "Préférez-vous un framework CSS utilitaire pour des designs rapides?",
      subtext: "Tailwind CSS permet de créer des designs personnalisés sans quitter votre HTML.",
      techName: "Tailwind CSS",
      matchCategories: ['frontend', 'css'],
    },
    {
      id: 5,
      category: 'php',
      question: "Êtes-vous intéressé par le développement backend avec PHP?",
      subtext: "PHP reste l'un des langages de programmation côté serveur les plus utilisés.",
      techName: "PHP",
      matchCategories: ['php', 'backend'],
    },
    {
      id: 6,
      category: 'symfony',
      question: "Souhaitez-vous développer avec le framework Symfony?",
      subtext: "Symfony est un puissant framework PHP pour créer des applications web complexes.",
      techName: "Symfony",
      matchCategories: ['php', 'symfony', 'backend'],
    },
    {
      id: 7,
      category: 'mysql',
      question: "La gestion de bases de données vous intéresse-t-elle?",
      subtext: "MySQL est un système de gestion de base de données relationnelle très répandu.",
      techName: "MySQL",
      matchCategories: ['mysql', 'backend'],
    },
    {
      id: 8,
      category: 'docker',
      question: "Voulez-vous maîtriser la conteneurisation avec Docker?",
      subtext: "Docker simplifie le déploiement d'applications dans des environnements isolés.",
      techName: "Docker",
      matchCategories: ['docker', 'devops'],
    },
    {
      id: 9,
      category: 'fullstack',
      question: "Préférez-vous être polyvalent et travailler sur toute la pile technologique?",
      subtext: "Les développeurs full stack maîtrisent à la fois le frontend et le backend.",
      techName: "Full Stack Development",
      matchCategories: ['frontend', 'backend', 'javascript', 'php'],
    },
    {
      id: 10,
      category: 'teamwork',
      question: "Aimez-vous travailler en équipe sur des projets complexes?",
      subtext: "La collaboration est essentielle dans les projets de développement modernes.",
      techName: "Collaborative Development",
      matchCategories: ['softskills'],
    }
  ];
  
  // Sample courses for recommendations - based on the tech stack
  const courses = [
    {
      id: 'frontend-mastery',
      title: 'Formation Frontend Complète',
      description: 'Maîtrisez HTML, CSS et JavaScript pour créer des interfaces utilisateur modernes et réactives.',
      matchCategories: ['frontend', 'javascript', 'html', 'css'],
      level: 'Débutant à Intermédiaire'
    },
    {
      id: 'react-pro',
      title: 'React Professionnel',
      description: 'Développez des applications frontend performantes et maintenables avec React et ses écosystèmes.',
      matchCategories: ['react', 'javascript', 'frontend'],
      level: 'Intermédiaire'
    },
    {
      id: 'php-symfony',
      title: 'PHP & Symfony',
      description: 'Apprenez à construire des applications web robustes avec PHP et le framework Symfony.',
      matchCategories: ['php', 'symfony', 'backend'],
      level: 'Intermédiaire'
    },
    {
      id: 'database-specialist',
      title: 'Expert en Bases de Données',
      description: 'Maîtrisez la conception, l\'optimisation et l\'administration de bases de données MySQL.',
      matchCategories: ['mysql', 'backend'],
      level: 'Intermédiaire à Avancé'
    },
    {
      id: 'devops-docker',
      title: 'DevOps avec Docker',
      description: 'Apprenez les stratégies de conteneurisation et de déploiement avec Docker.',
      matchCategories: ['docker', 'devops'],
      level: 'Intermédiaire'
    },
    {
      id: 'fullstack-dev',
      title: 'Développeur Full Stack',
      description: 'Devenez un développeur polyvalent capable de travailler sur l\'ensemble de la pile technologique.',
      matchCategories: ['frontend', 'backend', 'javascript', 'php', 'mysql'],
      level: 'Intermédiaire à Avancé'
    }
  ];
  
  // Initialize course matches
  useEffect(() => {
    const initialMatches = {};
    courses.forEach(course => {
      initialMatches[course.id] = 0;
    });
    setCourseMatches(initialMatches);
  }, []);
  
  // Handle card swipe
  const handleSwipe = (direction, superlike = false) => {
    if (currentQuestionIndex >= questions.length) {
      return;
    }
    
    const currentQuestion = questions[currentQuestionIndex];
    const multiplier = superlike ? 2 : 1;
    
    // Update swiped cards
    setSwipedCards([...swipedCards, {
      questionId: currentQuestion.id,
      direction,
      superlike
    }]);
    
    // Update course matches based on the swipe
    if (direction === 'right') {
      const updatedMatches = { ...courseMatches };
      
      courses.forEach(course => {
        // Check if any of the question's match categories intersect with the course's match categories
        const hasMatchingCategory = currentQuestion.matchCategories.some(category => 
          course.matchCategories.includes(category)
        );
        
        if (hasMatchingCategory) {
          updatedMatches[course.id] += 10 * multiplier;
        }
      });
      
      setCourseMatches(updatedMatches);
      
      // Update streak and score
      setStreak(streak + 1);
      setScore(score + (10 * (superlike ? 2 : 1)));
      
      // Award badges
      if (streak === 3) {
        setBadges([...badges, { id: 'hot-streak', name: 'Hot Streak', icon: '🔥' }]);
      }
    } else {
      // Reset streak on left swipe
      setStreak(0);
    }
    
    // Move to next question
    setCurrentQuestionIndex(currentQuestionIndex + 1);
    
    // Check if we've reached the end of questions
    if (currentQuestionIndex === questions.length - 1) {
      setTimeout(() => {
        setShowFinalMatch(true);
      }, 500);
    }
  };
  
  // Handle boost activation
  const handleBoost = () => {
    setBoosted(true);
    
    // Reset boost after 24 hours
    setTimeout(() => {
      setBoosted(false);
    }, 24 * 60 * 60 * 1000);
  };
  
  // Handle social sharing
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Mes résultats TinDev',
        text: `J'ai obtenu un score de ${score} points sur TinDev! Pouvez-vous faire mieux?`,
        url: window.location.href,
      });
    } else {
      // Fallback for browsers that don't support the Web Share API
      alert(`Partagez votre score de ${score} avec vos amis!`);
    }
  };
  
  // Get top course matches
  const getTopMatches = (count = 3) => {
    return Object.entries(courseMatches)
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([courseId, matchScore]) => {
        const course = courses.find(c => c.id === courseId);
        return {
          ...course,
          matchPercentage: Math.min(Math.round((matchScore / 100) * 100), 100)
        };
      });
  };
  
  // Calculate overall match percentage
  const getOverallMatchPercentage = () => {
    const topMatch = getTopMatches(1)[0];
    return topMatch ? topMatch.matchPercentage : 0;
  };
  
  // Get emoji for tech category
  const getCategoryEmoji = (category) => {
    const emojiMap = {
      'frontend': '🎨',
      'javascript': '📜',
      'react': '⚛️',
      'php': '🐘',
      'symfony': '🛠️',
      'mysql': '🗄️',
      'docker': '🐳',
      'css': '🎭',
      'html': '📄',
      'devops': '⚙️',
      'backend': '🖥️',
      'fullstack': '🔄',
      'softskills': '🤝'
    };
    
    return emojiMap[category] || '💻';
  };
  
  return (
    <section className="py-10 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto relative h-[500px]">
          {/* Match percentage indicator */}
          <div className="absolute top-0 left-0 right-0 flex justify-center z-10 mb-4">
            <div className="bg-gray-800 bg-opacity-70 backdrop-blur-sm rounded-full px-4 py-2 flex items-center">
              <div className="mr-2 text-pink-500">❤️</div>
              <div className="font-bold text-white">{getOverallMatchPercentage()}% Match</div>
            </div>
          </div>
          
          {/* Game stats */}
          <div className="absolute top-0 right-0 z-10 mb-4 bg-gray-800 bg-opacity-70 backdrop-blur-sm rounded-lg px-3 py-2">
            <div className="text-sm text-white">Score: {score}</div>
            <div className="text-sm text-blue-300">Streak: {streak} 🔥</div>
          </div>
          
          {/* Badges */}
          {badges.length > 0 && (
            <div className="absolute top-0 left-0 z-10 mb-4 bg-gray-800 bg-opacity-70 backdrop-blur-sm rounded-lg px-3 py-2">
              <div className="text-sm text-white">Badges:</div>
              <div className="flex space-x-1 mt-1">
                {badges.map(badge => (
                  <div key={badge.id} className="text-lg" title={badge.name}>
                    {badge.icon}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Card stack */}
          <AnimatePresence>
            {!showFinalMatch && currentQuestionIndex < questions.length && (
              <motion.div
                key={currentQuestionIndex}
                ref={cardRef}
                className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden shadow-xl border-2 border-blue-500"
                initial={{ scale: 0.8, opacity: 0, rotateZ: -10 }}
                animate={{ scale: 1, opacity: 1, rotateZ: 0 }}
                exit={{ 
                  x: currentPosition.current.x > 100 ? 1000 : currentPosition.current.x < -100 ? -1000 : 0,
                  opacity: 0,
                  transition: { duration: 0.3 }
                }}
                drag
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                dragElastic={0.7}
                onDragStart={(e, info) => {
                  initialPosition.current = { x: info.point.x, y: info.point.y };
                }}
                onDrag={(e, info) => {
                  currentPosition.current = { 
                    x: info.point.x - initialPosition.current.x,
                    y: info.point.y - initialPosition.current.y
                  };
                }}
                onDragEnd={(e, info) => {
                  if (info.offset.x > 100) {
                    handleSwipe('right');
                  } else if (info.offset.x < -100) {
                    handleSwipe('left');
                  }
                }}
                style={{
                  rotateZ: currentPosition.current.x * 0.05
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-70"></div>
                
                {/* Question content */}
                <div className="p-6 flex flex-col h-full">
                  <div className="text-center text-white">
                    <div className="text-6xl mb-6 mx-auto">
                      {getCategoryEmoji(questions[currentQuestionIndex].category)}
                    </div>
                    <div className="font-bold text-sm mb-2 text-blue-300">
                      {questions[currentQuestionIndex].techName}
                    </div>
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-center items-center">
                    <h3 className="text-2xl font-bold mb-4 text-white text-center">
                      {questions[currentQuestionIndex].question}
                    </h3>
                    <p className="text-gray-300 text-center mb-8 text-sm">
                      {questions[currentQuestionIndex].subtext}
                    </p>
                  </div>
                  
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                    <div className="bg-gray-900 bg-opacity-60 backdrop-blur-sm rounded-lg px-4 py-2">
                      <span className="text-sm text-gray-400">Swipe</span> 
                      <span className="mx-2 text-sm text-red-400">←</span>
                      <span className="text-sm text-gray-400">Non</span>
                      <span className="mx-2 text-sm text-gray-400">|</span>
                      <span className="text-sm text-gray-400">Oui</span>
                      <span className="mx-2 text-sm text-green-400">→</span>
                      <span className="text-sm text-gray-400">Swipe</span>
                    </div>
                  </div>
                </div>
                
                {/* Swipe indicators */}
                <div 
                  className={`absolute top-1/2 left-6 transform -translate-y-1/2 bg-red-500 text-white font-bold py-2 px-4 rounded-lg transition-opacity ${
                    currentPosition.current.x < -50 ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  NON
                </div>
                <div 
                  className={`absolute top-1/2 right-6 transform -translate-y-1/2 bg-green-500 text-white font-bold py-2 px-4 rounded-lg transition-opacity ${
                    currentPosition.current.x > 50 ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  OUI
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Swipe buttons */}
          {!showFinalMatch && currentQuestionIndex < questions.length && (
            <div className="absolute bottom-0 left-0 right-0 flex justify-center space-x-4 p-4">
              <button 
                className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                onClick={() => handleSwipe('left')}
                aria-label="Non"
              >
                <span className="text-white text-2xl">✕</span>
              </button>
              <button 
                className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors"
                onClick={() => handleSwipe('right', true)}
                aria-label="J'adore"
              >
                <span className="text-white text-2xl">★</span>
              </button>
              <button 
                className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors"
                onClick={() => handleSwipe('right')}
                aria-label="Oui"
              >
                <span className="text-white text-2xl">✓</span>
              </button>
            </div>
          )}
          
          {/* Final match screen */}
          <AnimatePresence>
            {showFinalMatch && (
              <motion.div
                className="absolute inset-0 bg-gray-900 rounded-xl overflow-hidden shadow-xl border-2 border-pink-500 flex flex-col"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="bg-gradient-to-b from-pink-600 to-purple-800 p-6 text-center">
                  <div className="text-6xl mb-2">💖</div>
                  <h3 className="text-2xl font-bold text-white mb-1">C'est un Match!</h3>
                  <p className="text-pink-200">Nous avons trouvé vos formations idéales!</p>
                </div>
                
                <div className="flex-1 overflow-auto p-4">
                  <div className="space-y-4">
                    {getTopMatches(3).map((course, index) => (
                      <motion.div
                        key={course.id}
                        className="bg-gray-800 rounded-lg overflow-hidden shadow-md"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.2 }}
                      >
                        <div className="p-4">
                          <div className="flex items-center mb-3">
                            <div className="text-3xl mr-3">
                              {course.matchCategories.map(cat => getCategoryEmoji(cat))[0]}
                            </div>
                            <div>
                              <h4 className="font-bold text-white">{course.title}</h4>
                              <p className="text-sm text-gray-300">{course.level}</p>
                            </div>
                            <div className="ml-auto bg-pink-500 text-white text-sm font-bold rounded-full px-2 py-1">
                              {course.matchPercentage}% Match
                            </div>
                          </div>
                          <p className="text-sm text-gray-400 mb-3">{course.description}</p>
                          <button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition-colors">
                            Explorer la Formation
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
                
                <div className="p-4 border-t border-gray-800 flex justify-between">
                  <button 
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
                    onClick={handleShare}
                  >
                    <span className="mr-2">🔗</span> Partager
                  </button>
                  <button 
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-2 rounded-lg font-medium hover:from-yellow-600 hover:to-yellow-700 transition-colors flex items-center"
                    onClick={handleBoost}
                    disabled={boosted}
                  >
                    <span className="mr-2">⚡</span> 
                    {boosted ? 'Boosté' : 'Booster'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default TinDev;
