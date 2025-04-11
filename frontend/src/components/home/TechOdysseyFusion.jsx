import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TindevNeural from './fusion/TindevNeural';
import TechStackFractal from './fusion/TechStackFractal';
import CodePulseRhythm from './games/CodePulseRhythm';
import CyberEscapeRoom from './games/CyberEscapeRoom';
import DataGalaxy from './games/DataGalaxy';
import AIArtistShowdown from './games/AIArtistShowdown';
import NetworkNinja from './games/NetworkNinja';
import LeadCapturePortal from './fusion/LeadCapturePortal';
import { useNavigate } from 'react-router-dom';

// Navigation
const TechOdysseyFusion = () => {
  const navigate = useNavigate();
  
  // Game flow state
  const [currentStage, setCurrentStage] = useState('landing'); // landing, tindev, game, leadCapture
  const [selectedGame, setSelectedGame] = useState(null);
  const [gameHistory, setGameHistory] = useState([]);
  const [userProfile, setUserProfile] = useState({
    creative: 0,
    analytical: 0,
    security: 0,
    dataScience: 0,
    devOps: 0
  });
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  
  // Handle Tindev completion
  const handleTindevComplete = (results) => {
    // Update user profile based on Tindev results
    setUserProfile(prev => ({
      ...prev,
      creative: results.creative || 0,
      analytical: results.analytical || 0,
      security: results.security || 0,
      dataScience: results.dataScience || 0,
      devOps: results.devOps || 0
    }));
    
    // Determine which game to show next based on highest score
    const scores = [
      { type: 'creative', score: results.creative || 0, game: 'techstack' },
      { type: 'analytical', score: results.analytical || 0, game: 'codepulse' },
      { type: 'security', score: results.security || 0, game: 'cyberescape' },
      { type: 'dataScience', score: results.dataScience || 0, game: 'datagalaxy' },
      { type: 'devOps', score: results.devOps || 0, game: 'networkninja' }
    ];
    
    // Sort by score (highest first)
    scores.sort((a, b) => b.score - a.score);
    
    // Select the game with the highest score
    const nextGame = scores[0].score > 70 ? scores[0].game : 'techstack';
    
    setSelectedGame(nextGame);
    setGameHistory([...gameHistory, 'tindev']);
    setCurrentStage('game');
  };
  
  // Handle game completion
  const handleGameComplete = (gameId, score, skillScores) => {
    // Update user profile based on game results
    const updatedProfile = { ...userProfile };
    
    // Update profile based on the game and skills
    switch (gameId) {
      case 'techstack':
        updatedProfile.creative += score * 0.5;
        updatedProfile.analytical += score * 0.3;
        break;
      case 'codepulse':
        updatedProfile.analytical += score * 0.6;
        updatedProfile.security += score * 0.2;
        break;
      case 'cyberescape':
        updatedProfile.security += score * 0.7;
        updatedProfile.analytical += score * 0.2;
        break;
      case 'datagalaxy':
        updatedProfile.dataScience += score * 0.8;
        updatedProfile.analytical += score * 0.2;
        break;
      case 'networkninja':
        updatedProfile.devOps += score * 0.7;
        updatedProfile.security += score * 0.2;
        break;
      case 'aiartist':
        updatedProfile.creative += score * 0.8;
        updatedProfile.dataScience += score * 0.2;
        break;
      default:
        break;
    }
    
    setUserProfile(updatedProfile);
    
    // Add to game history
    setGameHistory([...gameHistory, gameId]);
    
    // If user has completed at least 2 games (including Tindev), show lead capture
    if (gameHistory.length >= 1) {
      setCurrentStage('leadCapture');
    } else {
      // Otherwise, select next game based on updated profile
      const scores = [
        { type: 'creative', score: updatedProfile.creative, game: 'techstack' },
        { type: 'analytical', score: updatedProfile.analytical, game: 'codepulse' },
        { type: 'security', score: updatedProfile.security, game: 'cyberescape' },
        { type: 'dataScience', score: updatedProfile.dataScience, game: 'datagalaxy' },
        { type: 'devOps', score: updatedProfile.devOps, game: 'networkninja' }
      ];
      
      // Filter out games already played
      const availableGames = scores.filter(item => !gameHistory.includes(item.game));
      
      // Sort by score (highest first)
      availableGames.sort((a, b) => b.score - a.score);
      
      // Select the game with the highest score
      const nextGame = availableGames.length > 0 ? availableGames[0].game : 'techstack';
      
      setSelectedGame(nextGame);
    }
  };
  
  // Handle lead capture completion
  const handleLeadCaptureComplete = (userInfo) => {
    setUserInfo(userInfo);
    
    // Here you would typically send the data to your backend
    console.log('Lead captured:', userInfo);
    console.log('User profile:', userProfile);
    
    // Navigate to home or another page
    navigate('/');
  };
  
  // Render the current stage
  const renderCurrentStage = () => {
    switch (currentStage) {
      case 'landing':
        return (
          <motion.div 
            className="flex flex-col items-center justify-start w-full max-w-4xl mx-auto px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-8xl mt-0"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
            >
              🚀
            </motion.div>
            
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-6">
              Tech Odyssey Fusion
            </h1>
            
            <p className="text-xl text-blue-200 mb-8 max-w-2xl mx-auto text-center">
              Embarquez pour un voyage cosmique à travers l'univers tech et découvrez votre potentiel caché.
            </p>
            
            <motion.button
              className="px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-lg text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setCurrentStage('tindev')}
            >
              Commencer l'aventure
            </motion.button>
            
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-blue-500/30 rounded-xl p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="text-4xl mb-4">🧠</div>
                <h3 className="text-xl font-bold text-white mb-2">Découvrez vos talents</h3>
                <p className="text-sm text-blue-200">Identifiez vos compétences tech cachées à travers des jeux immersifs</p>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-purple-500/30 rounded-xl p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="text-4xl mb-4">🎮</div>
                <h3 className="text-xl font-bold text-white mb-2">Jouez & Apprenez</h3>
                <p className="text-sm text-blue-200">Développez vos compétences tout en vous amusant</p>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-pink-500/30 rounded-xl p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="text-4xl mb-4">🌟</div>
                <h3 className="text-xl font-bold text-white mb-2">Trouvez votre voie</h3>
                <p className="text-sm text-blue-200">Découvrez la formation tech idéale pour votre profil unique</p>
              </div>
            </div>
          </motion.div>
        );
        
      case 'tindev':
        return <TindevNeural onComplete={handleTindevComplete} />;
        
      case 'game':
        switch (selectedGame) {
          case 'techstack':
            return <TechStackFractal onComplete={(score, skillScores) => handleGameComplete('techstack', score, skillScores)} />;
          case 'codepulse':
            return <CodePulseRhythm onComplete={(score, skillScores) => handleGameComplete('codepulse', score, skillScores)} />;
          case 'cyberescape':
            return <CyberEscapeRoom onComplete={(score, skillScores) => handleGameComplete('cyberescape', score, skillScores)} />;
          case 'datagalaxy':
            return <DataGalaxy onComplete={(score, skillScores) => handleGameComplete('datagalaxy', score, skillScores)} />;
          case 'networkninja':
            return <NetworkNinja onComplete={(score, skillScores) => handleGameComplete('networkninja', score, skillScores)} />;
          case 'aiartist':
            return <AIArtistShowdown onComplete={(score, skillScores) => handleGameComplete('aiartist', score, skillScores)} />;
          default:
            return <TechStackFractal onComplete={(score, skillScores) => handleGameComplete('techstack', score, skillScores)} />;
        }
        
      case 'leadCapture':
        return <LeadCapturePortal userProfile={userProfile} onComplete={handleLeadCaptureComplete} />;
    }
  };
  
  return (
    <div className="w-full overflow-hidden text-white">
      {/* Main content */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {renderCurrentStage()}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TechOdysseyFusion;
