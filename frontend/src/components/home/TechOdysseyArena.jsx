import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CodePulseRhythm from './games/CodePulseRhythm';
import CyberEscapeRoom from './games/CyberEscapeRoom';
import DataGalaxy from './games/DataGalaxy';
import AIArtistShowdown from './games/AIArtistShowdown';
import NetworkNinja from './games/NetworkNinja';

const TechOdysseyArena = () => {
  // State variables
  const [currentScreen, setCurrentScreen] = useState('welcome'); // welcome, gameSelection, playing, report, leadCapture
  const [currentGame, setCurrentGame] = useState(null);
  const [completedGames, setCompletedGames] = useState([]);
  const [gameResults, setGameResults] = useState({});
  const [techDNA, setTechDNA] = useState({
    webDevelopment: 0,
    cybersecurity: 0,
    dataScience: 0,
    devOps: 0,
    creativeTech: 0
  });
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  
  // Game definitions
  const games = [
    {
      id: 'codePulse',
      name: 'CodePulse Rhythm',
      description: 'Déboguer du code en suivant le rythme',
      icon: '🎵',
      color: 'from-blue-500 to-purple-600',
      component: CodePulseRhythm,
      skills: ['logique', 'programmation', 'attention'],
      domains: { webDevelopment: 0.4, dataScience: 0.3, devOps: 0.2, cybersecurity: 0.1 }
    },
    {
      id: 'cyberEscape',
      name: 'Cyber Escape Room',
      description: 'Identifiez les vulnérabilités et déchiffrez les codes',
      icon: '🔐',
      color: 'from-green-500 to-teal-600',
      component: CyberEscapeRoom,
      skills: ['sécurité', 'analyse', 'résolution'],
      domains: { cybersecurity: 0.6, devOps: 0.2, webDevelopment: 0.1, dataScience: 0.1 }
    },
    {
      id: 'dataGalaxy',
      name: 'Data Galaxy',
      description: 'Triez et analysez des données stellaires',
      icon: '📊',
      color: 'from-indigo-500 to-blue-600',
      component: DataGalaxy,
      skills: ['analyse', 'patterns', 'visualisation'],
      domains: { dataScience: 0.7, devOps: 0.1, cybersecurity: 0.1, webDevelopment: 0.1 }
    },
    {
      id: 'aiArtist',
      name: 'AI Artist Showdown',
      description: 'Créez de l\'art avec l\'intelligence artificielle',
      icon: '🎨',
      color: 'from-pink-500 to-rose-600',
      component: AIArtistShowdown,
      skills: ['créativité', 'design', 'innovation'],
      domains: { creativeTech: 0.7, webDevelopment: 0.2, dataScience: 0.1 }
    },
    {
      id: 'networkNinja',
      name: 'Network Ninja',
      description: 'Connectez des serveurs pour optimiser le réseau',
      icon: '🌐',
      color: 'from-amber-500 to-orange-600',
      component: NetworkNinja,
      skills: ['infrastructure', 'optimisation', 'systèmes'],
      domains: { devOps: 0.6, cybersecurity: 0.2, dataScience: 0.1, webDevelopment: 0.1 }
    }
  ];
  
  // Handle game completion
  const handleGameComplete = useCallback((gameId, score, skillScores) => {
    // Add to completed games
    if (!completedGames.includes(gameId)) {
      setCompletedGames([...completedGames, gameId]);
    }
    
    // Save game results
    setGameResults(prev => ({
      ...prev,
      [gameId]: { score, skillScores }
    }));
    
    // Update tech DNA based on game domains and score
    const game = games.find(g => g.id === gameId);
    if (game) {
      const normalizedScore = score / 100; // Assuming score is 0-100
      
      setTechDNA(prev => {
        const newDNA = { ...prev };
        
        // Update each domain based on the game's domain distribution and score
        Object.entries(game.domains).forEach(([domain, weight]) => {
          newDNA[domain] = Math.min(
            100, 
            newDNA[domain] + (weight * normalizedScore * 100)
          );
        });
        
        return newDNA;
      });
    }
    
    // Check if we should show the report
    if (completedGames.length >= 2) { // Show after 3 games (including current)
      setCurrentScreen('report');
    } else {
      // Show game selection for next game
      setCurrentScreen('gameSelection');
    }
  }, [completedGames, games]);
  
  // Get recommended domain based on tech DNA
  const getRecommendedDomain = useCallback(() => {
    const sortedDomains = Object.entries(techDNA)
      .sort((a, b) => b[1] - a[1]);
    
    if (sortedDomains.length === 0) return null;
    
    const [topDomain, topScore] = sortedDomains[0];
    
    const domainInfo = {
      webDevelopment: {
        title: 'Développeur Web',
        description: 'Vous avez un talent naturel pour créer des interfaces interactives et des applications web.',
        icon: '💻'
      },
      cybersecurity: {
        title: 'Expert en Cybersécurité',
        description: 'Votre esprit analytique et votre attention aux détails font de vous un gardien idéal contre les menaces numériques.',
        icon: '🛡️'
      },
      dataScience: {
        title: 'Data Scientist',
        description: 'Vous excellez dans l\'analyse et l\'interprétation des données pour en extraire des insights précieux.',
        icon: '📈'
      },
      devOps: {
        title: 'Ingénieur DevOps',
        description: 'Vous avez un talent pour optimiser les infrastructures et automatiser les processus de développement.',
        icon: '⚙️'
      },
      creativeTech: {
        title: 'Designer Tech Créatif',
        description: 'Votre créativité et votre sens de l\'esthétique vous permettent d\'innover à l\'intersection de l\'art et de la technologie.',
        icon: '✨'
      }
    };
    
    return {
      domain: topDomain,
      score: topScore,
      ...domainInfo[topDomain]
    };
  }, [techDNA]);
  
  // Handle lead capture form submission
  const handleLeadSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log('Lead captured:', userInfo);
    // Show full report
    setCurrentScreen('fullReport');
  };
  
  // Start a specific game
  const startGame = (gameId) => {
    setCurrentGame(gameId);
    setCurrentScreen('playing');
  };
  
  // Render welcome screen
  const renderWelcomeScreen = () => (
    <motion.div 
      className="text-center max-w-4xl mx-auto py-16 px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <motion.div
        className="text-7xl mb-8"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 10 }}
      >
        🚀
      </motion.div>
      
      <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-6">
        Tech Odyssey Arena
      </h1>
      
      <p className="text-xl text-blue-200 mb-10 max-w-2xl mx-auto">
        Embarquez pour un voyage interstellaire à travers différents domaines technologiques et découvrez votre potentiel caché.
      </p>
      
      <motion.button
        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-bold text-lg shadow-lg"
        whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(79, 70, 229, 0.5)' }}
        whileTap={{ scale: 0.98 }}
        onClick={() => startGame('codePulse')} // Start with first game
      >
        Commencer l'aventure
      </motion.button>
      
      <div className="mt-10 grid grid-cols-5 gap-4 max-w-3xl mx-auto">
        {games.map((game, index) => (
          <motion.div
            key={game.id}
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br ${game.color} flex items-center justify-center text-2xl shadow-lg`}>
              {game.icon}
            </div>
            <p className="mt-2 text-xs text-blue-300">{game.name}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
  
  // Render game selection screen
  const renderGameSelectionScreen = () => (
    <motion.div 
      className="max-w-4xl mx-auto py-12 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-8">
        Choisissez votre prochaine mission
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games
          .filter(game => !completedGames.includes(game.id))
          .map((game) => (
            <motion.div
              key={game.id}
              className={`bg-gradient-to-br ${game.color} bg-opacity-20 rounded-xl overflow-hidden shadow-lg border border-gray-700`}
              whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.3)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => startGame(game.id)}
            >
              <div className="p-6">
                <div className="text-4xl mb-4">{game.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{game.name}</h3>
                <p className="text-blue-100 mb-4 text-sm">{game.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {game.skills.map(skill => (
                    <span key={skill} className="text-xs px-2 py-1 bg-white bg-opacity-20 rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
                <button className="w-full py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-white font-medium transition-all">
                  Lancer la mission
                </button>
              </div>
            </motion.div>
          ))}
      </div>
    </motion.div>
  );
  
  // Render current game
  const renderGame = () => {
    const game = games.find(g => g.id === currentGame);
    if (!game) return null;
    
    const GameComponent = game.component;
    return <GameComponent onComplete={(score, skillScores) => handleGameComplete(currentGame, score, skillScores)} />;
  };
  
  // Render tech DNA report
  const renderReportScreen = () => {
    const recommendedDomain = getRecommendedDomain();
    if (!recommendedDomain) return null;
    
    return (
      <motion.div 
        className="max-w-4xl mx-auto py-12 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="text-center mb-10">
          <motion.div
            className="text-7xl mb-6 mx-auto"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
          >
            {recommendedDomain.icon}
          </motion.div>
          
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-4">
            Votre Tech DNA
          </h2>
          
          <p className="text-xl text-blue-200 mb-6">
            Basé sur vos performances, vous êtes un...
          </p>
          
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-3xl py-3 px-6 rounded-lg inline-block mb-4">
            {recommendedDomain.title} ({Math.round(recommendedDomain.score)}%)
          </div>
          
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            {recommendedDomain.description}
          </p>
        </div>
        
        <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 mb-10">
          <h3 className="text-xl font-bold text-white mb-4">Votre profil complet</h3>
          
          <div className="space-y-4">
            {Object.entries(techDNA)
              .sort(([, a], [, b]) => b - a)
              .map(([domain, score]) => {
                const domainNames = {
                  webDevelopment: 'Développement Web',
                  cybersecurity: 'Cybersécurité',
                  dataScience: 'Data Science',
                  devOps: 'DevOps',
                  creativeTech: 'Tech Créative'
                };
                
                const domainColors = {
                  webDevelopment: 'bg-blue-500',
                  cybersecurity: 'bg-green-500',
                  dataScience: 'bg-indigo-500',
                  devOps: 'bg-amber-500',
                  creativeTech: 'bg-pink-500'
                };
                
                return (
                  <div key={domain} className="relative pt-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-sm font-semibold inline-block text-white">
                          {domainNames[domain]}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold inline-block text-white">
                          {Math.round(score)}%
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-700">
                      <motion.div
                        style={{ width: `${Math.round(score)}%` }}
                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${domainColors[domain]}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.round(score)}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      ></motion.div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-xl p-8 shadow-xl border border-blue-700">
          <h3 className="text-2xl font-bold text-white mb-4">Débloquez votre rapport complet</h3>
          
          <p className="text-blue-200 mb-6">
            Pour recevoir votre rapport Tech DNA détaillé et être mis en relation avec l'un de nos mentors, veuillez remplir le formulaire ci-dessous:
          </p>
          
          <form onSubmit={handleLeadSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-blue-300 mb-1">Nom</label>
              <input
                type="text"
                id="name"
                className="w-full px-4 py-2 bg-gray-800 bg-opacity-50 border border-blue-700 rounded-lg text-white"
                placeholder="Votre nom"
                value={userInfo.name}
                onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-blue-300 mb-1">Email</label>
              <input
                type="email"
                id="email"
                className="w-full px-4 py-2 bg-gray-800 bg-opacity-50 border border-blue-700 rounded-lg text-white"
                placeholder="votre.email@exemple.com"
                value={userInfo.email}
                onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                required
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-blue-300 mb-1">Téléphone</label>
              <input
                type="tel"
                id="phone"
                className="w-full px-4 py-2 bg-gray-800 bg-opacity-50 border border-blue-700 rounded-lg text-white"
                placeholder="Votre numéro de téléphone"
                value={userInfo.phone}
                onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-bold shadow-lg hover:shadow-xl transition-all"
            >
              Recevoir mon rapport complet
            </button>
          </form>
        </div>
      </motion.div>
    );
  };
  
  // Render full report after lead capture
  const renderFullReportScreen = () => {
    const recommendedDomain = getRecommendedDomain();
    if (!recommendedDomain) return null;
    
    return (
      <motion.div 
        className="max-w-4xl mx-auto py-12 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-4">
            Votre Rapport Tech DNA Complet
          </h2>
          
          <p className="text-xl text-blue-200 mb-6">
            Merci {userInfo.name}! Voici votre analyse détaillée.
          </p>
        </div>
        
        {/* Full report content would go here */}
        <div className="bg-gray-800 bg-opacity-50 rounded-xl p-8 mb-10">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
            <span className="text-3xl mr-3">{recommendedDomain.icon}</span>
            {recommendedDomain.title}
          </h3>
          
          <p className="text-lg text-blue-200 mb-6">
            {recommendedDomain.description}
          </p>
          
          <h4 className="text-xl font-semibold text-white mb-4">Vos points forts:</h4>
          <ul className="list-disc list-inside space-y-2 text-blue-200 mb-6">
            <li>Excellente capacité à {recommendedDomain.domain === 'webDevelopment' ? 'créer des interfaces utilisateur intuitives' : 
                                      recommendedDomain.domain === 'cybersecurity' ? 'identifier les vulnérabilités potentielles' :
                                      recommendedDomain.domain === 'dataScience' ? 'analyser et interpréter des données complexes' :
                                      recommendedDomain.domain === 'devOps' ? 'optimiser les infrastructures techniques' :
                                      'combiner créativité et technologie'}</li>
            <li>Forte aptitude à résoudre des problèmes complexes</li>
            <li>Pensée {recommendedDomain.domain === 'creativeTech' ? 'créative et innovante' : 'analytique et structurée'}</li>
          </ul>
          
          <h4 className="text-xl font-semibold text-white mb-4">Formations recommandées:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {[1, 2].map(i => (
              <div key={i} className="bg-gray-700 bg-opacity-50 rounded-lg p-4">
                <h5 className="font-bold text-white mb-2">
                  {recommendedDomain.domain === 'webDevelopment' ? `Développement Web ${i === 1 ? 'Frontend' : 'Backend'}` : 
                   recommendedDomain.domain === 'cybersecurity' ? `Sécurité ${i === 1 ? 'Offensive' : 'Défensive'}` :
                   recommendedDomain.domain === 'dataScience' ? `Data ${i === 1 ? 'Analysis' : 'Engineering'}` :
                   recommendedDomain.domain === 'devOps' ? `${i === 1 ? 'Cloud Computing' : 'Infrastructure as Code'}` :
                   `Design ${i === 1 ? 'UI/UX' : 'Interactif'}`}
                </h5>
                <p className="text-sm text-blue-200">
                  Formation intensive de {i === 1 ? '3' : '6'} mois avec projets pratiques et mentorat personnalisé.
                </p>
              </div>
            ))}
          </div>
          
          <h4 className="text-xl font-semibold text-white mb-4">Prochaines étapes:</h4>
          <p className="text-blue-200 mb-4">
            Un de nos conseillers pédagogiques vous contactera prochainement pour discuter de votre parcours et vous aider à choisir la formation la plus adaptée à votre profil.
          </p>
          
          <div className="flex justify-center mt-8">
            <button
              onClick={() => window.location.href = '/formations'}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-bold shadow-lg hover:shadow-xl transition-all"
            >
              Explorer nos formations
            </button>
          </div>
        </div>
      </motion.div>
    );
  };
  
  // Render the appropriate screen based on current state
  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return renderWelcomeScreen();
      case 'gameSelection':
        return renderGameSelectionScreen();
      case 'playing':
        return renderGame();
      case 'report':
        return renderReportScreen();
      case 'fullReport':
        return renderFullReportScreen();
      default:
        return renderWelcomeScreen();
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-gray-900/50 to-gray-950"></div>
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500 rounded-full filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-500 rounded-full filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-36 h-36 bg-pink-500 rounded-full filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="relative z-10 container mx-auto">
        <AnimatePresence mode="wait">
          {renderCurrentScreen()}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TechOdysseyArena;
