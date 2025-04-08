import React from 'react';
import { motion } from 'framer-motion';
import FormationLayout from '@/components/formations/FormationLayout';

/**
 * Game Development Formation Page
 */
const GameDevelopment = ({ colorMode = 'navy' }) => {
  // Animation variants
  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };
  
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: i => ({ 
      opacity: 1, 
      y: 0,
      transition: { 
        delay: i * 0.1,
        duration: 0.5
      }
    })
  };
  
  // Course modules
  const modules = [
    {
      title: "Fondamentaux du Game Design",
      duration: "4 semaines",
      topics: ["Principes de game design", "Level design", "Narration interactive", "Équilibrage"],
      icon: "🎮"
    },
    {
      title: "Unity Engine",
      duration: "8 semaines",
      topics: ["C#", "Interface Unity", "2D & 3D", "Animation & Physics"],
      icon: "🔧"
    },
    {
      title: "Unreal Engine",
      duration: "6 semaines",
      topics: ["C++", "Blueprints", "Materials & Shaders", "Sequencer"],
      icon: "🎬"
    },
    {
      title: "Graphismes & Assets",
      duration: "4 semaines",
      topics: ["Modélisation 3D", "Texturing", "Animation", "VFX"],
      icon: "🎨"
    },
    {
      title: "Audio pour Jeux",
      duration: "2 semaines",
      topics: ["Sound Design", "Musique interactive", "Mixage", "Implémentation"],
      icon: "🔊"
    },
    {
      title: "Publication & Monétisation",
      duration: "4 semaines",
      topics: ["Steam", "Mobile Stores", "Marketing", "Modèles économiques"],
      icon: "🚀"
    }
  ];
  
  // Technologies used
  const technologies = [
    { name: "Unity", level: 90 },
    { name: "Unreal Engine", level: 85 },
    { name: "C#", level: 85 },
    { name: "C++", level: 75 },
    { name: "Blender", level: 70 },
    { name: "Maya", level: 65 },
    { name: "Substance Painter", level: 70 },
    { name: "FMOD", level: 65 }
  ];
  
  // Career opportunities
  const careers = [
    {
      title: "Game Developer",
      description: "Programmez la logique et les mécaniques des jeux vidéo.",
      salary: "45K€ - 70K€",
      demand: "Élevée"
    },
    {
      title: "Game Designer",
      description: "Concevez les règles, mécaniques et niveaux des jeux.",
      salary: "40K€ - 65K€",
      demand: "Modérée"
    },
    {
      title: "Technical Artist",
      description: "Faites le pont entre les artistes et les programmeurs.",
      salary: "48K€ - 75K€",
      demand: "Élevée"
    },
    {
      title: "VFX Artist",
      description: "Créez des effets visuels spectaculaires pour les jeux.",
      salary: "42K€ - 68K€",
      demand: "Modérée"
    }
  ];
  
  // Game projects
  const gameProjects = [
    {
      title: "Platformer 2D",
      description: "Créez un jeu de plateforme avec des mécaniques de saut, collecte d'objets et ennemis.",
      skills: ["Unity", "C#", "Animation 2D"],
      duration: "4 semaines"
    },
    {
      title: "FPS Multijoueur",
      description: "Développez un jeu de tir à la première personne avec mode multijoueur en réseau.",
      skills: ["Unreal Engine", "C++", "Networking"],
      duration: "6 semaines"
    },
    {
      title: "RPG Mobile",
      description: "Concevez un jeu de rôle pour mobile avec système de progression et combats au tour par tour.",
      skills: ["Unity", "Mobile Dev", "UI/UX"],
      duration: "8 semaines"
    }
  ];
  
  return (
    <FormationLayout
      title="Développement de Jeux Vidéo"
      subtitle="Maîtrisez Unity, Unreal Engine et les techniques de game design pour créer des jeux captivants sur différentes plateformes."
      color="yellow"
      icon="🎮"
      colorMode={colorMode}
    >
      {/* Overview Section */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className={`mb-20 p-8 rounded-2xl ${colorMode === 'navy' ? 'bg-[#001a38]/50' : 'bg-gray-900/50'} backdrop-blur-lg border ${colorMode === 'navy' ? 'border-[#0a3c6e]/30' : 'border-gray-800/30'}`}
      >
        <h2 className={`text-3xl font-bold mb-6 ${colorMode === 'navy' ? 'text-blue-300' : 'text-purple-300'}`}>
          Aperçu du programme
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={`p-6 rounded-xl ${colorMode === 'navy' ? 'bg-[#0a3c6e]/20' : 'bg-purple-900/20'} flex flex-col items-center text-center`}>
            <span className="text-4xl mb-4">⏱️</span>
            <h3 className="text-xl font-bold text-white mb-2">Durée</h3>
            <p className={`${colorMode === 'navy' ? 'text-blue-100' : 'text-gray-300'}`}>32 semaines</p>
          </div>
          <div className={`p-6 rounded-xl ${colorMode === 'navy' ? 'bg-[#0a3c6e]/20' : 'bg-purple-900/20'} flex flex-col items-center text-center`}>
            <span className="text-4xl mb-4">🎓</span>
            <h3 className="text-xl font-bold text-white mb-2">Niveau</h3>
            <p className={`${colorMode === 'navy' ? 'text-blue-100' : 'text-gray-300'}`}>Débutant à Avancé</p>
          </div>
          <div className={`p-6 rounded-xl ${colorMode === 'navy' ? 'bg-[#0a3c6e]/20' : 'bg-purple-900/20'} flex flex-col items-center text-center`}>
            <span className="text-4xl mb-4">🏆</span>
            <h3 className="text-xl font-bold text-white mb-2">Certification</h3>
            <p className={`${colorMode === 'navy' ? 'text-blue-100' : 'text-gray-300'}`}>Diplôme Tech Odyssey</p>
          </div>
        </div>
        <p className={`text-lg ${colorMode === 'navy' ? 'text-blue-100' : 'text-gray-300'} mb-6`}>
          Notre formation complète en développement de jeux vidéo vous permettra de maîtriser les outils et techniques 
          utilisés par les studios professionnels. L'industrie du jeu vidéo est en pleine expansion et recherche 
          constamment de nouveaux talents créatifs et techniques.
        </p>
        <p className={`text-lg ${colorMode === 'navy' ? 'text-blue-100' : 'text-gray-300'}`}>
          Ce programme intensif couvre à la fois les aspects techniques (programmation, moteurs de jeu) et créatifs 
          (game design, level design, graphismes) du développement de jeux. À la fin de cette formation, vous aurez 
          créé plusieurs jeux pour différentes plateformes et serez prêt à intégrer l'industrie ou à lancer votre 
          propre studio indépendant.
        </p>
      </motion.section>
      
      {/* Modules Section */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mb-20"
      >
        <h2 className={`text-3xl font-bold mb-10 text-center ${colorMode === 'navy' ? 'text-blue-300' : 'text-purple-300'}`}>
          Modules du cours
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className={`p-6 rounded-xl ${colorMode === 'navy' ? 'bg-[#001a38]/80' : 'bg-gray-900/80'} backdrop-blur-sm border ${colorMode === 'navy' ? 'border-[#0a3c6e]/30' : 'border-gray-800/30'} hover:shadow-lg transition-shadow`}
            >
              <div className="flex items-start mb-4">
                <div className="w-12 h-12 rounded-full bg-yellow-600 flex items-center justify-center text-2xl mr-4">
                  {module.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{module.title}</h3>
                  <p className={`${colorMode === 'navy' ? 'text-blue-200' : 'text-purple-200'} text-sm`}>{module.duration}</p>
                </div>
              </div>
              <ul className={`space-y-2 ${colorMode === 'navy' ? 'text-blue-100' : 'text-gray-300'}`}>
                {module.topics.map((topic, j) => (
                  <li key={j} className="flex items-center">
                    <span className={`mr-2 text-xs ${colorMode === 'navy' ? 'text-yellow-300' : 'text-yellow-400'}`}>●</span>
                    {topic}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </motion.section>
      
      {/* Technologies Section */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className={`mb-20 p-8 rounded-2xl ${colorMode === 'navy' ? 'bg-[#001a38]/50' : 'bg-gray-900/50'} backdrop-blur-lg border ${colorMode === 'navy' ? 'border-[#0a3c6e]/30' : 'border-gray-800/30'}`}
      >
        <h2 className={`text-3xl font-bold mb-10 text-center ${colorMode === 'navy' ? 'text-blue-300' : 'text-purple-300'}`}>
          Technologies et outils
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          {technologies.map((tech, i) => (
            <div key={i} className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="text-white font-medium">{tech.name}</span>
                <span className={`${colorMode === 'navy' ? 'text-yellow-300' : 'text-yellow-400'}`}>{tech.level}%</span>
              </div>
              <div className={`w-full h-2 bg-gray-700 rounded-full overflow-hidden`}>
                <motion.div
                  className="h-full bg-yellow-600"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${tech.level}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                ></motion.div>
              </div>
            </div>
          ))}
        </div>
      </motion.section>
      
      {/* Game Projects */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mb-20"
      >
        <h2 className={`text-3xl font-bold mb-10 text-center ${colorMode === 'navy' ? 'text-blue-300' : 'text-purple-300'}`}>
          Projets de jeux
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {gameProjects.map((project, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className={`p-6 rounded-xl ${colorMode === 'navy' ? 'bg-[#001a38]/80' : 'bg-gray-900/80'} backdrop-blur-sm border ${colorMode === 'navy' ? 'border-[#0a3c6e]/30' : 'border-gray-800/30'} hover:shadow-lg transition-all`}
            >
              <div className="w-full h-48 rounded-lg mb-4 overflow-hidden bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
                <span className="text-6xl">{project.title.split(" ")[0].charAt(0)}</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
              <p className={`${colorMode === 'navy' ? 'text-blue-100' : 'text-gray-300'} mb-4 text-sm`}>{project.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {project.skills.map((skill, j) => (
                  <span 
                    key={j} 
                    className={`px-3 py-1 rounded-full text-xs font-medium ${colorMode === 'navy' ? 'bg-yellow-900/40 text-yellow-200' : 'bg-yellow-800/40 text-yellow-200'}`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
              <div className="flex items-center">
                <span className={`text-sm ${colorMode === 'navy' ? 'text-yellow-300' : 'text-yellow-400'} mr-2`}>Durée:</span>
                <span className={`text-sm ${colorMode === 'navy' ? 'text-blue-100' : 'text-gray-300'}`}>{project.duration}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>
      
      {/* Career Opportunities */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mb-20"
      >
        <h2 className={`text-3xl font-bold mb-10 text-center ${colorMode === 'navy' ? 'text-blue-300' : 'text-purple-300'}`}>
          Débouchés professionnels
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {careers.map((career, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className={`p-6 rounded-xl ${colorMode === 'navy' ? 'bg-[#001a38]/80' : 'bg-gray-900/80'} backdrop-blur-sm border ${colorMode === 'navy' ? 'border-[#0a3c6e]/30' : 'border-gray-800/30'}`}
            >
              <h3 className="text-xl font-bold text-white mb-2">{career.title}</h3>
              <p className={`${colorMode === 'navy' ? 'text-blue-100' : 'text-gray-300'} mb-4`}>{career.description}</p>
              <div className="flex justify-between">
                <div>
                  <span className={`text-sm ${colorMode === 'navy' ? 'text-yellow-300' : 'text-yellow-400'}`}>Salaire annuel</span>
                  <p className="text-white font-medium">{career.salary}</p>
                </div>
                <div>
                  <span className={`text-sm ${colorMode === 'navy' ? 'text-yellow-300' : 'text-yellow-400'}`}>Demande</span>
                  <p className="text-white font-medium">{career.demand}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>
      
      {/* Call to Action */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className={`p-10 rounded-2xl text-center ${colorMode === 'navy' ? 'bg-gradient-to-r from-yellow-600/20 to-orange-600/20' : 'bg-gradient-to-r from-yellow-900/20 to-orange-900/20'} backdrop-blur-lg border ${colorMode === 'navy' ? 'border-yellow-500/30' : 'border-yellow-800/30'}`}
      >
        <h2 className="text-3xl font-bold text-white mb-4">Prêt à créer vos propres jeux vidéo ?</h2>
        <p className={`text-lg ${colorMode === 'navy' ? 'text-blue-100' : 'text-gray-300'} max-w-3xl mx-auto mb-8`}>
          Rejoignez notre formation complète et acquérez les compétences recherchées dans l'industrie du jeu vidéo.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <motion.button
            className="px-8 py-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium shadow-lg"
            whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(0, 0, 0, 0.3)' }}
            whileTap={{ scale: 0.98 }}
          >
            S'inscrire maintenant
          </motion.button>
          <motion.button
            className={`px-8 py-4 bg-opacity-10 bg-white text-white rounded-lg font-medium border ${colorMode === 'navy' ? 'border-yellow-500/30' : 'border-yellow-800/30'}`}
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
            whileTap={{ scale: 0.98 }}
          >
            Télécharger la brochure
          </motion.button>
        </div>
      </motion.section>
    </FormationLayout>
  );
};

export default GameDevelopment;
