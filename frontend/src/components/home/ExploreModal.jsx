import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

/**
 * Explore Modal with 3D visualization for course exploration
 */
const ExploreModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('courses');
  
  const variants = {
    hidden: { 
      opacity: 0,
      scale: 0.8,
    },
    visible: { 
      opacity: 1,
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 70,
        damping: 20
      }
    },
    exit: { 
      opacity: 0,
      scale: 0.8,
      transition: { 
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          <motion.div 
            className="fixed inset-10 bg-gradient-to-br from-gray-900 to-blue-900 rounded-2xl p-8 z-50 overflow-hidden flex flex-col"
            variants={variants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-white">Explorer l'Univers Éducatif</h2>
                <button 
                  onClick={onClose} 
                  className="text-gray-400 hover:text-white focus:outline-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
              
              <div className="flex space-x-4 mb-8">
                {['courses', 'technologies', 'communaute'].map((tab) => (
                  <motion.button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3 rounded-lg font-medium text-lg transition-colors ${
                      activeTab === tab 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                    whileHover={{ y: -3 }}
                    whileTap={{ y: 0 }}
                  >
                    {tab === 'courses' && 'Cours'}
                    {tab === 'technologies' && 'Technologies'}
                    {tab === 'communaute' && 'Communauté'}
                  </motion.button>
                ))}
              </div>
              
              <div className="flex-grow overflow-auto">
                {activeTab === 'courses' && (
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {[
                      { 
                        title: 'Développement Web', 
                        description: 'Maîtrisez HTML, CSS, JavaScript et les frameworks modernes',
                        image: '/assets/images/formations/web-dev.webp',
                        color: 'from-blue-500 to-cyan-400',
                        link: '/formations/web'
                      },
                      { 
                        title: 'Intelligence Artificielle', 
                        description: 'Découvrez le machine learning et ses applications pratiques',
                        image: '/assets/images/formations/ia.webp',
                        color: 'from-purple-500 to-pink-500',
                        link: '/formations/ai'
                      },
                      { 
                        title: 'Cybersécurité', 
                        description: 'Apprenez à protéger les systèmes contre les menaces',
                        image: '/assets/images/formations/cybersecurity.webp',
                        color: 'from-green-500 to-emerald-400',
                        link: '/formations/cybersecurity'
                      },
                      { 
                        title: 'Développement Mobile', 
                        description: 'Créez des applications mobiles pour iOS et Android',
                        image: '/assets/images/formations/mobile-dev.webp',
                        color: 'from-pink-500 to-red-500',
                        link: '/formations/mobile'
                      },
                      { 
                        title: 'Science des Données', 
                        description: 'Analysez et visualisez des données complexes',
                        image: '/assets/images/formations/data-science.webp',
                        color: 'from-indigo-500 to-blue-600',
                        link: '/formations/data-science'
                      },
                      { 
                        title: 'Développement de Jeux', 
                        description: 'Concevez et créez des jeux vidéo captivants',
                        image: '/assets/images/formations/game-dev.webp',
                        color: 'from-yellow-500 to-orange-500',
                        link: '/formations/game'
                      }
                    ].map((course, i) => (
                      <Link to={course.link} key={i} onClick={onClose}>
                        <motion.div 
                          className="relative h-64 rounded-xl overflow-hidden group cursor-pointer"
                          whileHover={{ 
                            scale: 1.03,
                            rotate: 1,
                            transition: { duration: 0.3 }
                          }}
                          initial={{ y: 50, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-0">
                            <img 
                              src={course.image} 
                              alt={course.title}
                              className="w-full h-48 object-cover object-[center_30%] z-10 relative"
                            />
                          </div>
                          <div className="absolute inset-0 bg-black opacity-40 group-hover:opacity-60 transition-opacity" />
                          <div className="absolute inset-0 p-6 flex flex-col justify-end z-10">
                            <h3 className="text-white text-xl font-bold mb-2">{course.title}</h3>
                            <p className="text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">{course.description}</p>
                          </div>
                          <div className="absolute top-4 right-4 bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </motion.div>
                      </Link>
                    ))}
                  </motion.div>
                )}
                
                {activeTab === 'technologies' && (
                  <motion.div 
                    className="grid grid-cols-2 md:grid-cols-4 gap-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {[
                      { name: 'React', icon: '⚛️', color: 'bg-blue-500' },
                      { name: 'Angular', icon: '🅰️', color: 'bg-red-500' },
                      { name: 'Vue', icon: '🟢', color: 'bg-green-500' },
                      { name: 'Node.js', icon: '🟩', color: 'bg-green-600' },
                      { name: 'Python', icon: '🐍', color: 'bg-yellow-500' },
                      { name: 'TensorFlow', icon: '🧠', color: 'bg-orange-500' },
                      { name: 'AWS', icon: '☁️', color: 'bg-yellow-600' },
                      { name: 'Docker', icon: '🐳', color: 'bg-blue-600' },
                      { name: 'Kubernetes', icon: '⎈', color: 'bg-blue-700' },
                      { name: 'GraphQL', icon: '◼️', color: 'bg-pink-600' },
                      { name: 'MongoDB', icon: '🍃', color: 'bg-green-700' },
                      { name: 'Flutter', icon: '📱', color: 'bg-blue-400' }
                    ].map((tech, i) => (
                      <motion.div
                        key={i}
                        className="bg-gray-800 rounded-xl p-6 flex flex-col items-center justify-center text-center"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        whileHover={{ 
                          y: -5,
                          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
                        }}
                      >
                        <div className={`${tech.color} w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-4`}>
                          {tech.icon}
                        </div>
                        <h3 className="text-white font-bold">{tech.name}</h3>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
                
                {activeTab === 'communaute' && (
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 gap-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="bg-gray-800 rounded-xl p-6">
                      <h3 className="text-xl font-bold text-white mb-4">Événements à venir</h3>
                      <div className="space-y-4">
                        {[
                          { 
                            title: 'Hackathon IA & Santé', 
                            date: '15-16 Juin 2023',
                            location: 'Paris'
                          },
                          { 
                            title: 'Workshop React Avancé', 
                            date: '22 Juin 2023',
                            location: 'En ligne'
                          },
                          { 
                            title: 'Conférence Cybersécurité', 
                            date: '5-7 Juillet 2023',
                            location: 'Lyon'
                          }
                        ].map((event, i) => (
                          <motion.div 
                            key={i}
                            className="border-l-4 border-blue-500 pl-4 py-2"
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                          >
                            <h4 className="text-white font-medium">{event.title}</h4>
                            <div className="flex items-center text-sm text-gray-400 mt-1">
                              <span className="mr-3">{event.date}</span>
                              <span>{event.location}</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                      <motion.button
                        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Voir tous les événements
                      </motion.button>
                    </div>
                    
                    <div className="bg-gray-800 rounded-xl p-6">
                      <h3 className="text-xl font-bold text-white mb-4">Forums actifs</h3>
                      <div className="space-y-4">
                        {[
                          { 
                            title: 'Débuter avec React Hooks', 
                            replies: 42,
                            activity: 'Très actif'
                          },
                          { 
                            title: 'Problèmes de déploiement Docker', 
                            replies: 28,
                            activity: 'Actif'
                          },
                          { 
                            title: 'Optimisation des performances React', 
                            replies: 36,
                            activity: 'Très actif'
                          },
                          { 
                            title: 'Intégration de l\'API OpenAI', 
                            replies: 64,
                            activity: 'Très actif'
                          }
                        ].map((forum, i) => (
                          <motion.div 
                            key={i}
                            className="flex justify-between items-center py-3 border-b border-gray-700"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                          >
                            <div>
                              <h4 className="text-white font-medium">{forum.title}</h4>
                              <p className="text-sm text-gray-400">{forum.replies} réponses</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs ${
                              forum.activity === 'Très actif' 
                                ? 'bg-green-500 text-green-100' 
                                : 'bg-blue-500 text-blue-100'
                            }`}>
                              {forum.activity}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                      <motion.button
                        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Accéder aux forums
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-10"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500 rounded-full filter blur-3xl opacity-10"></div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ExploreModal;
