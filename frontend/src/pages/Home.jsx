import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { toast } from 'sonner';
import { authService } from '../lib/services/authService';
import { addressService } from '../lib/services/addressService';
import { useRolePermissions } from '@/features/roles/useRolePermissions';
import { useRoles } from '@/features/roles/roleContext';
import { Loader2 } from "lucide-react";
import ConnectionModal from '@/components/ConnectionModal';
import RegistrationModal from '@/components/RegistrationModal';

// Particle component for more dynamic background
const Particle = ({ size, color, top, left, delay, duration, amplitude }) => {
  return (
    <motion.div
      className="absolute rounded-full z-0"
      style={{
        top: `${top}%`,
        left: `${left}%`,
        width: `${size}px`,
        height: `${size}px`,
        background: color,
        boxShadow: `0 0 ${size * 2}px ${color}`
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: [0, 1, 0.8, 1, 0], 
        scale: [0, 1, 0.8, 1, 0],
        y: [`${-amplitude}px`, `${amplitude}px`, `${-amplitude}px`]
      }}
      transition={{ 
        repeat: Infinity, 
        duration: duration, 
        delay: delay,
        times: [0, 0.2, 0.5, 0.8, 1],
        y: {
          repeat: Infinity,
          duration: duration * 2,
          ease: "easeInOut"
        }
      }}
    />
  );
};

// Enhanced 3D Planet component
const Planet3D = ({ className, color, size, orbitDuration, orbitDistance, hoverScale = 1.1, onClick, children }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div 
      className={`absolute ${className}`}
      animate={{
        rotateZ: [0, 360],
      }}
      transition={{
        rotateZ: {
          repeat: Infinity,
          duration: orbitDuration,
          ease: "linear"
        }
      }}
    >
      <motion.div
        className="relative"
        style={{ 
          transform: `translateX(${orbitDistance}px)`,
        }}
        whileHover={{ scale: hoverScale }}
        animate={{ rotateZ: [0, -360] }}
        transition={{ rotateZ: { repeat: Infinity, duration: orbitDuration, ease: "linear" } }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={onClick}
      >
        <div 
          className="rounded-full relative overflow-hidden cursor-pointer"
          style={{ 
            width: `${size}px`, 
            height: `${size}px`,
            boxShadow: `0 0 ${size/4}px ${color}`,
            transform: 'perspective(1000px) rotateY(20deg) rotateX(10deg)',
          }}
        >
          {children}
        </div>
        
        {/* Orbit path */}
        <div 
          className="absolute rounded-full border border-white border-opacity-10"
          style={{ 
            width: `${orbitDistance * 2 + size}px`, 
            height: `${orbitDistance * 2 + size}px`,
            top: `${-orbitDistance + size/2}px`,
            left: `${-orbitDistance + size/2}px`,
          }}
        />
      </motion.div>
    </motion.div>
  );
};

// Enhanced 3D Card component for features
const Card3D = ({ children, delay = 0 }) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const cardRef = useRef(null);
  
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const cardCenterX = rect.left + rect.width / 2;
    const cardCenterY = rect.top + rect.height / 2;
    
    // Calculate rotation based on mouse position relative to card center
    const rotateYValue = -((e.clientX - cardCenterX) / (rect.width / 2)) * 15;
    const rotateXValue = ((e.clientY - cardCenterY) / (rect.height / 2)) * 15;
    
    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };
  
  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };
  
  return (
    <motion.div
      ref={cardRef}
      className="relative group perspective-1000"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <motion.div
        className="preserve-3d rounded-xl transition-all duration-500 w-full"
        whileHover={{ rotateY: 15, rotateX: -10, scale: 1.05 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

// Floating Element component for the keyboard/computer visuals
const FloatingElement = ({ children, baseX = 0, baseY = 0, amplitude = 10, duration = 5 }) => {
  return (
    <motion.div
      className="relative inline-block"
      animate={{
        y: [baseY, baseY - amplitude, baseY],
        x: [baseX, baseX + (amplitude/2), baseX]
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut'
      }}
    >
      {children}
    </motion.div>
  );
};

// Explore Modal with 3D visualization
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
                        image: '/assets/images/course-web.jpg',
                        color: 'from-blue-500 to-cyan-400'
                      },
                      { 
                        title: 'Intelligence Artificielle', 
                        description: 'Découvrez le machine learning et ses applications pratiques',
                        image: '/assets/images/course-ai.jpg',
                        color: 'from-purple-500 to-pink-500'
                      },
                      { 
                        title: 'Cybersécurité', 
                        description: 'Apprenez à protéger les systèmes contre les menaces',
                        image: '/assets/images/course-security.jpg',
                        color: 'from-green-500 to-emerald-400'
                      },
                      { 
                        title: 'Blockchain', 
                        description: 'Comprendre les fondements et applications de la blockchain',
                        image: '/assets/images/course-blockchain.jpg',
                        color: 'from-yellow-500 to-orange-500'
                      },
                      { 
                        title: 'Design UX/UI', 
                        description: 'Créez des interfaces utilisateur intuitives et attrayantes',
                        image: '/assets/images/course-design.jpg',
                        color: 'from-pink-500 to-red-500'
                      },
                      { 
                        title: 'Science des Données', 
                        description: 'Analysez et visualisez des données complexes',
                        image: '/assets/images/course-data.jpg',
                        color: 'from-indigo-500 to-blue-600'
                      }
                    ].map((course, i) => (
                      <motion.div 
                        key={i}
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
                        <div 
                          className="absolute inset-0 bg-cover bg-center z-0" 
                          style={{ 
                            backgroundImage: `url('${course.image}')`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }}
                        />
                        <div className={`absolute inset-0 bg-gradient-to-t ${course.color} opacity-60 group-hover:opacity-80 transition-opacity`} />
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
                      <h3 className="text-white text-xl font-bold mb-4">Forums de Discussion</h3>
                      <div className="space-y-4">
                        {[
                          { topic: 'Support Technique', posts: 2103, active: true },
                          { topic: 'Projets Collaboratifs', posts: 1458, active: true },
                          { topic: 'Offres d\'Emploi', posts: 892, active: false },
                          { topic: 'Retours d\'Expérience', posts: 1247, active: true }
                        ].map((forum, i) => (
                          <motion.div 
                            key={i} 
                            className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                          >
                            <div className="flex items-center">
                              <span className={`w-3 h-3 rounded-full ${forum.active ? 'bg-green-500' : 'bg-gray-500'} mr-3`}></span>
                              <span className="text-white">{forum.topic}</span>
                            </div>
                            <div className="text-gray-400 text-sm">{forum.posts} posts</div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-gray-800 rounded-xl p-6">
                      <h3 className="text-white text-xl font-bold mb-4">Événements à Venir</h3>
                      <div className="space-y-4">
                        {[
                          { name: 'Hackathon IA', date: '15 Avril', type: 'En ligne' },
                          { name: 'Conférence Web Dev', date: '28 Mai', type: 'Présentiel' },
                          { name: 'Workshop Design', date: '10 Juin', type: 'Hybride' }
                        ].map((event, i) => (
                          <motion.div
                            key={i}
                            className="border border-gray-700 rounded-lg p-4"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: i * 0.1 + 0.2 }}
                            whileHover={{ 
                              scale: 1.02, 
                              boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)'
                            }}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="text-white font-bold">{event.name}</h4>
                              <span className="bg-blue-600 text-xs text-white px-2 py-1 rounded">{event.type}</span>
                            </div>
                            <p className="text-gray-400">{event.date}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-gray-800 rounded-xl p-6 md:col-span-2">
                      <h3 className="text-white text-xl font-bold mb-4">Community Leaders</h3>
                      <div className="flex flex-wrap gap-4 justify-center">
                        {[
                          { name: 'Sophie Durant', role: 'Enseignante', avatar: '/assets/images/avatar-1.jpg' },
                          { name: 'Marc Leblanc', role: 'Mentor', avatar: '/assets/images/avatar-2.jpg' },
                          { name: 'Emma Petit', role: 'Community Manager', avatar: '/assets/images/avatar-3.jpg' },
                          { name: 'Thomas Dubois', role: 'Développeur Senior', avatar: '/assets/images/avatar-4.jpg' }
                        ].map((leader, i) => (
                          <motion.div 
                            key={i}
                            className="flex flex-col items-center"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: i * 0.1 + 0.4 }}
                            whileHover={{ y: -5 }}
                          >
                            <div className="w-20 h-20 rounded-full overflow-hidden mb-2 border-2 border-blue-500">
                              <img 
                                src={leader.avatar} 
                                alt={leader.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(leader.name);
                                }}
                              />
                            </div>
                            <h4 className="text-white font-medium text-center">{leader.name}</h4>
                            <p className="text-gray-400 text-sm text-center">{leader.role}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl opacity-10"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl opacity-10"></div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Data for feature cards
const FEATURES = [
  {
    id: 1,
    title: "Classes Virtuelles",
    description: "Participez à des cours interactifs en temps réel avec des professeurs expérimentés et des étudiants du monde entier.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 mb-4 text-blue-400">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="3" y1="9" x2="21" y2="9"></line>
        <line x1="9" y1="21" x2="9" y2="9"></line>
      </svg>
    )
  },
  {
    id: 2,
    title: "Outils IA",
    description: "Bénéficiez d'assistants d'apprentissage intelligents qui s'adaptent à votre rythme et à vos besoins spécifiques.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 mb-4 text-blue-400">
        <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.38-1 1.72V7h2a2 2 0 0 1 2 2v.28c.6.34 1 1.38 1 1.72a2 2 0 0 1-2 2 2 2 0 0 1-2 2c0-.74.4-1.38 1-1.72V9a2 2 0 0 1 2-2h2V5.72c-.6-.34-1-.98-1-1.72a2 2 0 0 1 2-2z"></path>
      </svg>
    )
  },
  {
    id: 3,
    title: "Communauté",
    description: "Rejoignez une communauté dynamique d'apprenants et de professionnels pour partager des connaissances et collaborer.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 mb-4 text-blue-400">
        <path d="M17 21v-2a4 4 0 1 1-4-4H5a4 4 0 0 1-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    )
  }
];

// Data for testimonials
const TESTIMONIALS = [
  {
    id: 1,
    name: "Sophie Martin",
    role: "Étudiante en informatique",
    content: "BIGproject m'a permis de poursuivre mes études tout en travaillant. L'approche innovante et les outils disponibles sont vraiment impressionnants !",
    avatar: "👩‍🎓"
  },
  {
    id: 2,
    name: "Thomas Dubois",
    role: "Professeur de mathématiques",
    content: "En tant qu'enseignant, j'apprécie énormément la facilité avec laquelle je peux créer des cours interactifs et suivre la progression de mes étudiants.",
    avatar: "👨‍🏫"
  },
  {
    id: 3,
    name: "Emma Leroy",
    role: "Professionnelle en reconversion",
    content: "Après 10 ans dans le marketing, j'ai pu me reconvertir dans le développement web grâce à BIGproject. La qualité des cours et l'accompagnement sont exceptionnels.",
    avatar: "👩‍💼"
  }
];

// Social media links for footer
const SOCIAL_LINKS = [
  {
    id: 1,
    name: "Twitter",
    url: "#",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.651.64.699 1.028 1.592 1.028 2.683 0 3.841-2.337 4.687-4.565 4.934.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.137 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
      </svg>
    )
  },
  {
    id: 2,
    name: "LinkedIn",
    url: "#",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
        <rect x="2" y="9" width="4" height="12"></rect>
        <circle cx="4" cy="4" r="2"></circle>
      </svg>
    )
  },
  {
    id: 3,
    name: "Instagram",
    url: "#",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
      </svg>
    )
  },
  {
    id: 4,
    name: "GitHub",
    url: "#",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
      </svg>
    )
  }
];

// Utility component for scroll-triggered animations
const ScrollAnimationWrapper = ({ children, threshold = 0.1 }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold }
    );
    
    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }
    
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold]);
  
  return (
    <div ref={ref}>
      {children(isVisible)}
    </div>
  );
};

// Globe component for the About section
const Globe = () => {
  const globeRef = useRef(null);
  
  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;
    
    let rotation = 0;
    const rotateGlobe = () => {
      rotation += 0.2;
      if (globe) {
        globe.style.transform = `rotate(${rotation}deg)`;
      }
      requestAnimationFrame(rotateGlobe);
    };
    
    const animationId = requestAnimationFrame(rotateGlobe);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);
  
  return (
    <div className="relative w-40 h-40 md:w-60 md:h-60">
      <div 
        ref={globeRef}
        className="absolute inset-0 rounded-full bg-gradient-radial from-blue-500 to-blue-900"
        style={{ 
          boxShadow: 'inset 5px -5px 20px rgba(0, 0, 0, 0.4), 0 0 20px rgba(52, 152, 219, 0.5)',
        }}
      >
        {/* Continents */}
        <div className="absolute w-12 h-8 bg-green-600 opacity-60 rounded-full" style={{ top: '25%', left: '30%' }}></div>
        <div className="absolute w-10 h-16 bg-green-600 opacity-60 rounded-full" style={{ top: '40%', left: '65%' }}></div>
        <div className="absolute w-8 h-8 bg-green-600 opacity-60 rounded-full" style={{ top: '70%', left: '40%' }}></div>
        <div className="absolute w-14 h-10 bg-green-600 opacity-60 rounded-full" style={{ top: '15%', left: '55%' }}></div>
        
        {/* Clouds */}
        <div className="absolute w-16 h-4 bg-white opacity-20 rounded-full" style={{ top: '20%', left: '10%' }}></div>
        <div className="absolute w-10 h-3 bg-white opacity-20 rounded-full" style={{ top: '30%', left: '60%' }}></div>
        <div className="absolute w-14 h-4 bg-white opacity-20 rounded-full" style={{ top: '60%', left: '35%' }}></div>
      </div>
    </div>
  );
};

// Star component for background animation
const Star = ({ top, left, size, delay }) => (
  <motion.div
    className="absolute bg-white rounded-full"
    style={{
      top: `${top}%`,
      left: `${left}%`,
      width: `${size}px`,
      height: `${size}px`,
    }}
    initial={{ opacity: 0 }}
    animate={{ 
      opacity: [0.2, 1, 0.2],
      scale: [1, 1.2, 1]
    }}
    transition={{
      duration: Math.random() * 3 + 2,
      delay: delay,
      repeat: Infinity,
      repeatType: "reverse"
    }}
  />
);

// ShootingStar component
const ShootingStar = ({ delay }) => {
  // Random position and angle for variety
  const top = Math.random() * 50;
  const left = Math.random() * 70 + 15;
  const angle = Math.random() * 60 - 30; // Between -30 and 30 degrees

  return (
    <motion.div
      className="absolute bg-white"
      style={{
        top: `${top}%`,
        left: `${left}%`,
        width: '3px',
        height: '3px',
        borderRadius: '50% 0 0 50%',
        boxShadow: '0 0 20px 2px rgba(255, 255, 255, 0.7)',
        transform: `rotate(${angle}deg)`,
        zIndex: 1
      }}
      initial={{ opacity: 0, x: 0, scale: 1 }}
      animate={{
        opacity: [0, 1, 0],
        x: -300,
        scale: [1, 2, 0.1]
      }}
      transition={{
        duration: 1.5,
        delay: delay,
        repeat: Infinity,
        repeatDelay: Math.random() * 15 + 10
      }}
    />
  );
};

// Planet component
const Planet = ({ type, top, left, size, delay, onClick, info }) => {
  // Determine planet colors based on type
  let mainColor, shadowColor, highlightColor;
  
  switch (type) {
    case 'earth':
      mainColor = 'from-blue-600 to-green-400';
      shadowColor = 'rgba(4, 120, 87, 0.8)';
      highlightColor = 'rgba(147, 197, 253, 0.5)';
      break;
    case 'mars':
      mainColor = 'from-red-700 to-orange-500';
      shadowColor = 'rgba(153, 27, 27, 0.8)';
      highlightColor = 'rgba(251, 146, 60, 0.5)';
      break;
    case 'jupiter':
      mainColor = 'from-amber-600 to-amber-300';
      shadowColor = 'rgba(180, 83, 9, 0.8)';
      highlightColor = 'rgba(252, 211, 77, 0.5)';
      break;
    default:
      mainColor = 'from-purple-600 to-indigo-400';
      shadowColor = 'rgba(76, 29, 149, 0.8)';
      highlightColor = 'rgba(167, 139, 250, 0.5)';
  }

  return (
    <motion.div
      className={`absolute rounded-full bg-gradient-radial ${mainColor} cursor-pointer overflow-hidden`}
      style={{
        top: `${top}%`,
        left: `${left}%`,
        width: `${size}px`,
        height: `${size}px`,
        boxShadow: `inset -15px -15px 40px ${shadowColor}, inset 5px 5px 20px ${highlightColor}`,
        zIndex: 2
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, delay: delay }}
      whileHover={{ 
        scale: 1.1,
        boxShadow: `inset -15px -15px 40px ${shadowColor}, inset 5px 5px 20px ${highlightColor}, 0 0 30px rgba(255, 255, 255, 0.5)`,
        transition: { duration: 0.3 }
      }}
      onClick={() => onClick(info)}
    >
      {/* Surface details */}
      {type === 'jupiter' && (
        <>
          <div className="absolute w-full h-2 bg-amber-200 opacity-30 rounded-full" 
               style={{ top: '30%', transform: 'rotate(-10deg)' }}></div>
          <div className="absolute w-full h-3 bg-amber-800 opacity-20 rounded-full" 
               style={{ top: '45%', transform: 'rotate(-5deg)' }}></div>
          <div className="absolute w-full h-2 bg-amber-300 opacity-30 rounded-full" 
               style={{ top: '60%', transform: 'rotate(-12deg)' }}></div>
        </>
      )}
      
      {type === 'earth' && (
        <>
          <div className="absolute bg-green-700 opacity-50 rounded-full"
               style={{ width: '40%', height: '35%', top: '20%', left: '10%' }}></div>
          <div className="absolute bg-green-800 opacity-40 rounded-full"
               style={{ width: '30%', height: '25%', top: '60%', left: '60%' }}></div>
          <div className="absolute bg-blue-800 opacity-30 rounded-full"
               style={{ width: '70%', height: '15%', top: '40%', left: '20%' }}></div>
        </>
      )}
      
      {type === 'mars' && (
        <>
          <div className="absolute bg-red-900 opacity-40 rounded-full"
               style={{ width: '20%', height: '20%', top: '30%', left: '20%' }}></div>
          <div className="absolute bg-red-800 opacity-30 rounded-full"
               style={{ width: '35%', height: '35%', top: '50%', left: '60%' }}></div>
        </>
      )}
    </motion.div>
  );
};

// Info Modal Component
const InfoModal = ({ isOpen, info, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-70" onClick={onClose}></div>
          <motion.div 
            className="relative bg-gray-900 border border-blue-400 rounded-lg p-6 max-w-md w-full"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 15 }}
          >
            <button 
              onClick={onClose}
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
              aria-label="Fermer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <h3 className="text-xl font-bold text-white mb-4">Saviez-vous?</h3>
            <p className="text-blue-300">{info}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Integrated Authentication Form Component
const IntegratedAuthForm = ({ mode, onSwitchMode }) => {
  const [formState, setFormState] = useState({
    // Login fields
    email: "",
    password: "",
    rememberMe: false,
    // Registration fields
    firstName: "",
    lastName: "",
    confirmPassword: "",
    birthDate: "",
    phoneNumber: "",
    nationality: "FR", // Default to France
    // Address fields
    addressName: "",
    addressCity: "",
    addressPostalCode: "",
    addressComplement: "",
    agreeTerms: false
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const navigate = useNavigate();
  const { refreshRoles } = useRoles();

  // Memoize the credentials object to prevent recreation on each render
  const credentials = useMemo(() => ({
    admin: { email: 'admin@bigproject.com', password: 'Password123@' },
    superadmin: { email: 'superadmin@bigproject.com', password: 'Password123@' },
    teacher: { email: 'teacher@bigproject.com', password: 'Password123@' },
    student: { email: 'student@bigproject.com', password: 'Password123@' },
    hr: { email: 'hr@bigproject.com', password: 'Password123@' },
    guest: { email: 'guest@bigproject.com', password: 'Password123@' },
    recruiter: { email: 'recruiter@bigproject.com', password: 'Password123@' }
  }), []);

  // Handle input changes
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Address autocomplete for French addresses
    if (name === 'addressName' && value.length > 3) {
      handleAddressSearch(value);
    }
  }, []);
  
  // Handle address search
  const handleAddressSearch = useCallback(async (query) => {
    if (!query || query.length < 3) {
      setAddressSuggestions([]);
      return;
    }
    
    setIsLoadingAddresses(true);
    try {
      const features = await addressService.searchAddresses(query);
      
      const suggestions = features.map(feature => ({
        label: feature.properties.label,
        city: feature.properties.city,
        postcode: feature.properties.postcode,
        name: feature.properties.name || feature.properties.street
      }));
      
      setAddressSuggestions(suggestions);
    } catch (error) {
      console.error('Error searching for addresses:', error);
      setAddressSuggestions([]);
    } finally {
      setIsLoadingAddresses(false);
    }
  }, []);
  
  // Handle address selection
  const handleSelectAddress = useCallback((suggestion) => {
    setFormState(prev => ({
      ...prev,
      addressName: suggestion.name,
      addressCity: suggestion.city,
      addressPostalCode: suggestion.postcode
    }));
    setAddressSuggestions([]);
  }, []);

  const renderStep3 = () => (
    <>
      <h3 className="text-xl font-bold mb-4 text-blue-300">Étape 3: Adresse</h3>
      
      <div className="space-y-4">
        <div className="relative">
          <FormInput
            id="addressName"
            label="Adresse"
            required
            value={formState.addressName}
            onChange={handleInputChange}
            error={errors.addressName}
          />
          
          {/* Address suggestions dropdown */}
          {addressSuggestions.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-blue-600/30 rounded-md shadow-lg max-h-60 overflow-auto">
              {isLoadingAddresses && (
                <div className="flex items-center justify-center p-2 text-blue-300">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Recherche en cours...
                </div>
              )}
              <ul className="py-1">
                {addressSuggestions.map((suggestion, index) => (
                  <li 
                    key={index}
                    className="px-3 py-2 text-sm text-gray-300 hover:bg-blue-900/40 cursor-pointer"
                    onClick={() => handleSelectAddress(suggestion)}
                  >
                    {suggestion.label}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <FormInput
          id="addressCity"
          label="Ville"
          required
          value={formState.addressCity}
          onChange={handleInputChange}
          error={errors.addressCity}
        />
        
        <FormInput
          id="addressPostalCode"
          label="Code postal"
          required
          value={formState.addressPostalCode}
          onChange={handleInputChange}
          error={errors.addressPostalCode}
        />
        
        <FormInput
          id="addressComplement"
          label="Complément d'adresse"
          value={formState.addressComplement}
          onChange={handleInputChange}
          error={errors.addressComplement}
        />
      </div>
      
      <div className="flex items-start mt-6">
        <div className="flex items-center h-5">
          <input
            id="agreeTerms"
            name="agreeTerms"
            type="checkbox"
            checked={formState.agreeTerms}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-700 rounded bg-gray-800"
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="agreeTerms" className="text-gray-300">
            J'accepte les <button type="button" className="text-blue-400 hover:underline">Conditions d'utilisation</button> et la <button type="button" className="text-blue-400 hover:underline">Politique de confidentialité</button>
          </label>
          {errors.agreeTerms && <p className="mt-1 text-xs text-red-500">{errors.agreeTerms}</p>}
        </div>
      </div>
      
      <div className="bg-blue-900/20 border border-blue-700/30 rounded-md p-4 text-sm text-blue-200 mt-4">
        <p>En créant un compte, vous pourrez :</p>
        <ul className="mt-2 list-disc list-inside space-y-1">
          <li>Accéder à toutes les fonctionnalités de la plateforme</li>
          <li>Suivre votre progression personnelle</li>
          <li>Participer aux sessions de formation</li>
          <li>Télécharger les ressources pédagogiques</li>
        </ul>
      </div>
    </>
  );

  // Login submission handler
  const handleLoginSubmit = async (e) => {
    // ... [This part remains unchanged]
  };

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateRegistrationStep()) return;
    
    setIsLoading(true);
    try {
      // Format user data for registration API with all required fields
      const userData = {
        firstName: formState.firstName,
        lastName: formState.lastName,
        email: formState.email,
        plainPassword: formState.password,
        birthDate: formState.birthDate,
        phoneNumber: formState.phoneNumber,
        nationality: formState.nationality,
        address: {
          name: formState.addressName,
          city: formState.addressCity,
          postalCode: formState.addressPostalCode,
          complement: formState.addressComplement || undefined
        }
      };
      
      // Use authService for proper backend registration
      const response = await authService.register(userData);
      
      // Show success message
      toast.success("Compte créé avec succès!");
      
      // Automatically log in after successful registration
      try {
        await authService.login(formState.email, formState.password);
        
        // Get the token
        const token = localStorage.getItem('token');
        
        if (token) {
          // Dispatch login success event
          window.dispatchEvent(new Event('login-success'));
          
          // Add small delay before navigation
          setTimeout(() => {
            // Navigate to the guest dashboard
            navigate('/dashboard');
            
            // Show success toast after navigation
            toast.success("Connexion réussie", {
              description: "Bienvenue sur la plateforme!"
            });
          }, 300);
          
          // Listen for when full user data is loaded
          const handleUserDataLoaded = () => {
            refreshRoles();
            window.removeEventListener('user-data-loaded', handleUserDataLoaded);
          };
          
          window.addEventListener('user-data-loaded', handleUserDataLoaded);
        } else {
          // If no token, redirect to login with filled email
          localStorage.setItem('registeredEmail', formState.email);
          onSwitchMode('login');
          toast.info("Veuillez vous connecter avec votre nouveau compte");
        }
      } catch (loginError) {
        console.error("Auto-login failed:", loginError);
        // If auto-login fails, switch to login form
        localStorage.setItem('registeredEmail', formState.email);
        onSwitchMode('login');
      }
    } catch (error) {
      if (error.response) {
        const { data } = error.response;
        
        if (data.message) {
          if (data.errors && Object.keys(data.errors).length > 0) {
            // Map API validation errors to form fields
            const apiErrors = {};
            Object.entries(data.errors).forEach(([key, value]) => {
              apiErrors[key] = Array.isArray(value) ? value[0] : value;
            });
            setErrors(apiErrors);
          } else {
            setErrors({ form: data.message });
          }
          
          toast.error("Erreur d'inscription", {
            description: data.message
          });
        } else {
          setErrors({ form: "Une erreur est survenue lors de l'inscription" });
          toast.error("Erreur d'inscription", {
            description: "Une erreur est survenue lors de l'inscription"
          });
        }
      } else {
        setErrors({ form: error.message || "Une erreur est survenue lors de l'inscription" });
        toast.error("Erreur d'inscription", {
          description: error.message || "Une erreur est survenue lors de l'inscription"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Render Login Form
  const renderLoginForm = () => (
    <motion.div 
      className="w-full bg-gray-900/80 backdrop-blur-sm p-8 rounded-lg shadow-lg mx-auto border border-blue-500/30"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-blue-300 mb-2">
          Connexion
        </h2>
        <p className="text-sm text-blue-200">
          Accédez à votre espace <span className="font-bold text-blue-400">Big<span className="text-indigo-400">Project</span></span>
        </p>
      </div>

      {errors.auth && (
        <div className="p-3 mb-5 text-red-400 bg-red-900/30 border border-red-700 rounded">
          {errors.auth}
        </div>
      )}

      <form className="space-y-6" onSubmit={handleLoginSubmit}>
        <FormInput
          id="email"
          label="Adresse email"
          type="email"
          autoComplete="email"
          required
          value={formState.email}
          onChange={handleInputChange}
          error={errors.email}
        />

        <FormInput
          id="password"
          label="Mot de passe"
          type="password"
          autoComplete="current-password"
          required
          value={formState.password}
          onChange={handleInputChange}
          error={errors.password}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="rememberMe"
              name="rememberMe"
              type="checkbox"
              checked={formState.rememberMe}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-700 rounded bg-gray-800"
            />
            <label htmlFor="rememberMe" className="block ml-2 text-sm text-gray-300">
              Se souvenir de moi
            </label>
          </div>

          <div className="text-sm">
            <button 
              type="button" 
              onClick={() => navigate('/reset-password')}
              className="font-medium text-blue-400 hover:underline"
            >
              Mot de passe oublié?
            </button>
          </div>
        </div>

        <div>
          <motion.button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connexion en cours...
              </>
            ) : (
              "Se connecter"
            )}
          </motion.button>
        </div>
      </form>

      <div className="mt-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 text-gray-400 bg-gray-900">
              Vous n'avez pas encore de compte?
            </span>
          </div>
        </div>

        <div className="mt-6">
          <motion.button
            type="button"
            onClick={() => navigate('/register')}
            className="w-full flex justify-center py-3 px-4 border border-gray-700 text-gray-300 rounded-md hover:bg-gray-800"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            S'inscrire
          </motion.button>
        </div>
      </div>
    </motion.div>
  );

  // Render Registration Form based on current step
  const renderRegistrationForm = () => {
    // Define different form sections based on the current step
    const renderStep1 = () => (
      <>
        <h3 className="text-xl font-bold mb-4 text-blue-300">Étape 1: Vos identifiants</h3>
        <div className="space-y-4">
          <FormInput
            id="email"
            label="Adresse email"
            type="email"
            required
            value={formState.email}
            onChange={handleInputChange}
            error={errors.email}
          />
          
          <FormInput
            id="password"
            label="Mot de passe"
            type="password"
            required
            value={formState.password}
            onChange={handleInputChange}
            error={errors.password}
          />
          
          <FormInput
            id="confirmPassword"
            label="Confirmer le mot de passe"
            type="password"
            required
            value={formState.confirmPassword}
            onChange={handleInputChange}
            error={errors.confirmPassword}
          />
        </div>
      </>
    );
    
    const renderStep2 = () => (
      <>
        <h3 className="text-xl font-bold mb-4 text-blue-300">Étape 2: Informations personnelles</h3>
        <div className="space-y-4">
          <FormInput
            id="firstName"
            label="Prénom"
            required
            value={formState.firstName}
            onChange={handleInputChange}
            error={errors.firstName}
          />
          
          <FormInput
            id="lastName"
            label="Nom"
            required
            value={formState.lastName}
            onChange={handleInputChange}
            error={errors.lastName}
          />
          
          <FormInput
            id="birthDate"
            label="Date de naissance"
            type="date"
            required
            value={formState.birthDate}
            onChange={handleInputChange}
            error={errors.birthDate}
          />
          
          <FormInput
            id="phoneNumber"
            label="Numéro de téléphone"
            type="tel"
            required
            value={formState.phoneNumber}
            onChange={handleInputChange}
            error={errors.phoneNumber}
          />
          
          <FormInput
            id="nationality"
            label="Nationalité"
            required
            value={formState.nationality}
            onChange={handleInputChange}
            error={errors.nationality}
          />
        </div>
      </>
    );
    
    const renderStep3 = renderStep3();
    
    return (
      <motion.div 
        className="w-full bg-gray-900/80 backdrop-blur-sm p-8 rounded-lg shadow-lg mx-auto border border-blue-500/30"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-blue-300 mb-2">
            Inscription
          </h2>
          <p className="text-sm text-blue-200">
            Rejoignez <span className="font-bold text-blue-400">Big<span className="text-indigo-400">Project</span></span> en quelques étapes
          </p>
        </div>
        
        {errors.form && (
          <div className="p-3 mb-5 text-red-400 bg-red-900/30 border border-red-700 rounded">
            {errors.form}
          </div>
        )}
        
        {/* Steps indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex flex-col items-center">
                <div 
                  className={`w-8 h-8 rounded-full ${currentStep === step 
                    ? 'bg-blue-600 text-white' 
                    : currentStep > step 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {currentStep > step ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step
                  )}
                </div>
                <span className="text-xs mt-1 text-gray-400">
                  {step === 1 ? 'Identifiants' : step === 2 ? 'Informations' : 'Adresse'}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between">
            <div className={`h-1 w-full ${currentStep > 1 ? 'bg-blue-600' : 'bg-gray-700'}`}></div>
            <div className={`h-1 w-full ${currentStep > 2 ? 'bg-blue-600' : 'bg-gray-700'}`}></div>
          </div>
        </div>
        
        <form onSubmit={handleRegistrationSubmit}>
          {/* Content based on current step */}
          <div className="min-h-[280px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={`step-${currentStep}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* Navigation buttons */}
          <div className="flex justify-between mt-8">
            {currentStep > 1 ? (
              <motion.button
                type="button"
                onClick={handlePrevStep}
                className="px-4 py-2 border border-gray-700 text-gray-300 rounded-md hover:bg-gray-800"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Précédent
              </motion.button>
            ) : (
              <motion.button
                type="button"
                onClick={() => onSwitchMode('login')}
                className="px-4 py-2 border border-gray-700 text-gray-300 rounded-md hover:bg-gray-800"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                J'ai déjà un compte
              </motion.button>
            )}
            
            {currentStep < 3 ? (
              <motion.button
                type="button"
                onClick={handleNextStep}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Suivant
              </motion.button>
            ) : (
              <motion.button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
                whileHover={{ scale: isLoading ? 1 : 1.05 }}
                whileTap={{ scale: isLoading ? 1 : 0.95 }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  "Créer mon compte"
                )}
              </motion.button>
            )}
          </div>
        </form>
      </motion.div>
    );
  };

  return (
    <div className="relative z-20 w-full max-w-md">
      {mode === 'login' ? renderLoginForm() : renderRegistrationForm()}
    </div>
  );
};

// Form Input component for the authentication forms
const FormInput = memo(({ 
  id, 
  label, 
  type = "text", 
  value, 
  onChange, 
  error, 
  ...props 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const actualType = type === "password" ? (showPassword ? "text" : "password") : type;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">
        {label}
      </label>
      <div className="mt-1 relative">
        <input
          id={id}
          name={id}
          type={actualType}
          value={value}
          onChange={onChange}
          className="appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 bg-gray-800 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          {...props}
        />
        {type === "password" && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        )}
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    </div>
  );
});

FormInput.displayName = "FormInput";

// Main Home component
const Home = () => {
  const navigate = useNavigate();
  const permissions = useRolePermissions();
  
  // State variables
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [showExploreModal, setShowExploreModal] = useState(false);
  
  // Navigation and button handlers
  const handleLoginClick = useCallback(() => {
    setAuthMode('login');
    setShowAuthForm(true);
  }, []);

  const handleRegisterClick = useCallback(() => {
    navigate('/register');
  }, [navigate]);
  
  const handleSwitchAuthMode = useCallback((mode) => {
    setAuthMode(mode);
  }, []);
  
  const handleCloseAuthForm = useCallback(() => {
    setShowAuthForm(false);
  }, []);
  
  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-950 text-white">
      {/* Navigation Bar - Simplified, only showing Connection and Registration buttons */}
      <nav className="fixed top-0 left-0 w-full z-40 transition-all duration-300">
        <div className="container mx-auto px-4 py-3 flex justify-end items-center">
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="py-2 px-6 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl flex items-center justify-center"
              onClick={handleLoginClick}
            >
              Connexion
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="py-2 px-6 bg-transparent border border-blue-500 text-blue-500 rounded-full font-medium hover:bg-blue-500 hover:text-white transition-colors shadow-lg hover:shadow-xl"
              onClick={handleRegisterClick}
            >
              Inscription
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative min-h-screen flex flex-col items-center justify-center text-center px-4">
        <motion.div 
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        >
          <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-blue-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-60 h-60 bg-purple-500 rounded-full filter blur-3xl opacity-10 animate-pulse" style={{animationDelay: '1s'}}></div>
        </motion.div>
      
        <motion.div 
          className="relative z-10 max-w-5xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <motion.h1 
            className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 100,
              delay: 0.3
            }}
          >
            Révolutionnez Votre Formation
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-blue-200 mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Découvrez une plateforme d'apprentissage innovante, créée pour transformer votre expérience éducative.
          </motion.p>
          
          <motion.div 
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.2
                }
              }
            }}
            initial="hidden"
            animate="show"
            className="flex flex-col md:flex-row gap-5 mt-5 justify-center"
          >
            <motion.button
              className="group relative inline-flex items-center justify-center px-8 py-3 text-lg font-medium text-white overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowExploreModal(true)}
            >
              <span className="relative z-10">Explorer l'univers</span>
              <motion.span 
                className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 to-indigo-700"
                animate={{ x: ['0%', '100%', '0%'] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </motion.button>
            
            <motion.button
              onClick={handleLoginClick}
              className="py-3 px-8 bg-gray-800 bg-opacity-50 backdrop-blur-sm text-white rounded-full font-medium border border-blue-500 hover:bg-gray-700 transition-colors shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Connexion
            </motion.button>
          </motion.div>
        </motion.div>
        
        {/* Enhanced 3D Planets */}
        <div className="absolute inset-0 overflow-hidden">
          <Planet3D
            className="top-[20%] left-[20%]"
            color="#38b2ac"
            size={80}
            orbitDuration={90}
            orbitDistance={120}
            hoverScale={1.2}
          >
            <div className="w-full h-full bg-gradient-to-br from-green-400 to-teal-500 rounded-full overflow-hidden">
              <motion.div 
                className="w-[200%] h-[200%] bg-[url('/assets/images/green-planet.jpg')] bg-cover bg-center"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 120, ease: "linear" }}
              />
            </div>
          </Planet3D>
          
          <Planet3D
            className="top-[40%] left-[70%]"
            color="#ed8936"
            size={60}
            orbitDuration={120}
            orbitDistance={100}
          >
            <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full overflow-hidden">
              <motion.div 
                className="w-[200%] h-[200%] bg-[url('/assets/images/orange-planet.jpg')] bg-cover bg-center"
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 90, ease: "linear" }}
              />
            </div>
          </Planet3D>
          
          <Planet3D
            className="top-[70%] left-[30%]"
            color="#e53e3e"
            size={70}
            orbitDuration={150}
            orbitDistance={80}
          >
            <div className="w-full h-full bg-gradient-to-br from-red-400 to-red-600 rounded-full overflow-hidden">
              <motion.div 
                className="w-[200%] h-[200%] bg-[url('/assets/images/red-planet.jpg')] bg-cover bg-center"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 100, ease: "linear" }}
              />
            </div>
          </Planet3D>
        </div>
        
        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </header>

      {/* New Immersive 3D Experience Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <motion.div 
            className="absolute top-0 left-0 w-full h-full bg-gradient-radial from-blue-900/30 to-transparent"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 10, repeat: Infinity, repeatType: "mirror" }}
          />
          <motion.div 
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-purple-500/10 filter blur-3xl"
            animate={{ 
              x: [0, 50, 0], 
              y: [0, 30, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 15, repeat: Infinity, repeatType: "mirror" }}
          />
          <motion.div 
            className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full bg-blue-600/10 filter blur-3xl"
            animate={{ 
              x: [0, -30, 0], 
              y: [0, 20, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 10, repeat: Infinity, repeatType: "mirror" }}
          />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 inline-block">
              Explorez Notre Univers Immersif
            </h2>
            <p className="text-xl text-blue-200 mt-4 max-w-3xl mx-auto">
              Une expérience d'apprentissage révolutionnaire qui combine technologie de pointe et méthodes pédagogiques innovantes
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="relative h-[500px]">
              <motion.div 
                className="absolute w-80 h-80 bg-blue-700/20 rounded-full filter blur-3xl"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 5, repeat: Infinity }}
              />
              
              {/* Replace 3D cube with floating keyboard and computer */}
              <div className="relative z-10 w-full h-full flex items-center justify-center">
                <FloatingElement
                  baseY={0}
                  amplitude={15}
                  duration={7}
                >
                  {/* Computer Monitor */}
                  <motion.div 
                    className="relative w-64 h-48 bg-gray-800 rounded-lg border-4 border-gray-700 shadow-2xl"
                    whileHover={{ scale: 1.05 }}
                  >
                    {/* Screen */}
                    <div className="absolute inset-2 bg-gradient-to-br from-blue-400 to-purple-600 rounded overflow-hidden flex items-center justify-center">
                      <div className="text-white text-opacity-80 text-xs">
                        <div className="mb-2 border-b border-white border-opacity-20 pb-1">BigProject.com</div>
                        <div className="flex space-x-1 mb-1">
                          <div className="w-2 h-2 rounded-full bg-green-400"></div>
                          <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                          <div className="w-2 h-2 rounded-full bg-red-400"></div>
                        </div>
                        <div className="text-[8px] mb-1">
                          <div className="h-1 w-16 bg-white bg-opacity-40 rounded mb-1"></div>
                          <div className="h-1 w-12 bg-white bg-opacity-40 rounded mb-1"></div>
                          <div className="h-1 w-20 bg-white bg-opacity-40 rounded"></div>
                        </div>
                        <div className="flex space-x-1 mt-2">
                          <div className="w-6 h-2 rounded bg-white bg-opacity-30"></div>
                          <div className="w-4 h-2 rounded bg-white bg-opacity-30"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Stand */}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-12 h-8 bg-gray-700 rounded-b-lg"></div>
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-[200%] w-20 h-1 bg-gray-700 rounded"></div>
                  </motion.div>
                </FloatingElement>
                
                <FloatingElement
                  baseY={30}
                  amplitude={10}
                  duration={6}
                >
                  {/* Keyboard */}
                  <motion.div 
                    className="relative w-72 h-20 bg-gray-700 rounded-lg border-2 border-gray-600 shadow-xl mt-16"
                    whileHover={{ scale: 1.05 }}
                  >
                    {/* Keys */}
                    <div className="absolute inset-2 grid grid-cols-10 gap-1">
                      {[...Array(40)].map((_, i) => (
                        <div 
                          key={i} 
                          className={`rounded-sm bg-gray-800 ${i % 11 === 0 ? 'col-span-2' : ''}`}
                          style={{
                            height: '6px',
                            boxShadow: 'inset 0 -1px 0 rgba(255,255,255,0.1)'
                          }}
                        ></div>
                      ))}
                    </div>
                  </motion.div>
                </FloatingElement>
                
                <FloatingElement
                  baseX={40}
                  baseY={-30}
                  amplitude={12}
                  duration={8}
                >
                  {/* Mouse */}
                  <motion.div 
                    className="absolute top-1/2 right-1/4 w-10 h-16 bg-gray-700 rounded-full border-2 border-gray-600 shadow-lg"
                    whileHover={{ scale: 1.1 }}
                  >
                    <div className="w-full h-1/3 bg-gray-800 rounded-t-full"></div>
                  </motion.div>
                </FloatingElement>
                
                {/* Decorative code particles */}
                {[...Array(15)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-blue-400 text-opacity-30 text-xs font-mono"
                    style={{
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      y: [0, Math.random() * 30 - 15],
                      opacity: [0.4, 0.7, 0.4]
                    }}
                    transition={{
                      duration: Math.random() * 4 + 3,
                      repeat: Infinity,
                      repeatType: 'reverse'
                    }}
                  >
                    {['const', 'let', 'import', 'from', 'function', 'return', '()=>{}', '<div>', '</div>', '{...}', '[]'][Math.floor(Math.random() * 11)]}
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div>
              <div className="space-y-8">
                {[
                  {
                    title: "Réalité Virtuelle Éducative",
                    description: "Plongez dans des environnements d'apprentissage virtuels qui simulent des scénarios réels pour une pratique immersive.",
                    icon: "🌌"
                  },
                  {
                    title: "Simulation Interactive",
                    description: "Manipulez des objets 3D et interagissez avec des modèles complexes pour une compréhension approfondie des concepts.",
                    icon: "🔬"
                  },
                  {
                    title: "Apprentissage Adaptatif",
                    description: "Un système qui s'adapte à votre rythme et style d'apprentissage pour optimiser votre progression.",
                    icon: "🧠"
                  }
                ].map((item, i) => (
                  <Card3D key={i} delay={i * 0.15}>
                    <div className="flex gap-4">
                      <div className="text-4xl">{item.icon}</div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                        <p className="text-blue-200">{item.description}</p>
                      </div>
                    </div>
                  </Card3D>
                ))}
              </div>
              
              <motion.div 
                className="mt-10"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
              >
                <motion.button
                  onClick={() => setShowExploreModal(true)}
                  className="group relative inline-flex items-center justify-center px-8 py-3 text-lg font-medium text-white overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="relative z-10">Explorer l'univers</span>
                  <motion.span 
                    className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 to-indigo-700"
                    animate={{ x: ['0%', '100%', '0%'] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                </motion.button>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 inline-block">
              Fonctionnalités Principales
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map((feature, index) => (
              <motion.div
                key={feature.id}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-blue-500/50 transition-colors"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ 
                  y: -5,
                  boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.3)'
                }}
              >
                <div className="flex flex-col items-center text-center">
                  {feature.icon}
                  <h3 className="text-xl font-bold mt-4 mb-2">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Modals */}
      <AnimatePresence>
        {showAuthForm && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseAuthForm}
            />
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ 
                type: "spring",
                damping: 25,
                stiffness: 300
              }}
            >
              <div onClick={(e) => e.stopPropagation()}>
                <IntegratedAuthForm 
                  mode={authMode} 
                  onSwitchMode={handleSwitchAuthMode}
                />
                <motion.button
                  className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-full bg-gray-800/50"
                  onClick={handleCloseAuthForm}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <ExploreModal isOpen={showExploreModal} onClose={() => setShowExploreModal(false)} />
    </div>
  );
};

export default Home;
