import React from 'react';
import { motion } from 'framer-motion';
import FormationLayout from '@/components/formations/FormationLayout';

/**
 * Mobile Development Formation Page
 */
const MobileDevelopment = ({ colorMode = 'navy' }) => {
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
      title: "Fondamentaux du Mobile",
      duration: "4 semaines",
      topics: ["UI/UX Mobile", "Architecture d'apps", "Cycle de vie des apps", "Responsive Design"],
      icon: "📱"
    },
    {
      title: "Développement iOS",
      duration: "6 semaines",
      topics: ["Swift", "SwiftUI", "UIKit", "Core Data"],
      icon: "🍎"
    },
    {
      title: "Développement Android",
      duration: "6 semaines",
      topics: ["Kotlin", "Jetpack Compose", "Android SDK", "Room Database"],
      icon: "🤖"
    },
    {
      title: "Cross-Platform",
      duration: "8 semaines",
      topics: ["React Native", "Flutter", "State Management", "Native Modules"],
      icon: "🔄"
    },
    {
      title: "Backend pour Mobile",
      duration: "4 semaines",
      topics: ["APIs RESTful", "Firebase", "Auth & Sécurité", "Push Notifications"],
      icon: "☁️"
    },
    {
      title: "Publication & Monétisation",
      duration: "4 semaines",
      topics: ["App Store", "Google Play", "Analytics", "Modèles de revenus"],
      icon: "🚀"
    }
  ];
  
  // Technologies used
  const technologies = [
    { name: "React Native", level: 90 },
    { name: "Flutter", level: 85 },
    { name: "Swift", level: 80 },
    { name: "Kotlin", level: 80 },
    { name: "Firebase", level: 85 },
    { name: "Redux/MobX", level: 75 },
    { name: "GraphQL", level: 70 },
    { name: "CI/CD Mobile", level: 75 }
  ];
  
  // Career opportunities
  const careers = [
    {
      title: "Développeur iOS",
      description: "Créez des applications natives pour l'écosystème Apple (iPhone, iPad, Apple Watch).",
      salary: "50K€ - 75K€",
      demand: "Élevée"
    },
    {
      title: "Développeur Android",
      description: "Développez des applications pour la plateforme Android et ses différents appareils.",
      salary: "48K€ - 72K€",
      demand: "Élevée"
    },
    {
      title: "Développeur Cross-Platform",
      description: "Créez des applications qui fonctionnent sur iOS et Android avec une base de code unique.",
      salary: "52K€ - 80K€",
      demand: "Très élevée"
    },
    {
      title: "Lead Mobile Developer",
      description: "Dirigez une équipe de développeurs mobiles et définissez l'architecture technique.",
      salary: "65K€ - 95K€",
      demand: "Modérée"
    }
  ];
  
  // App showcase
  const appShowcase = [
    {
      name: "FitTrack Pro",
      description: "Application de fitness avec suivi d'activité, plans d'entraînement personnalisés et analyses de progression.",
      features: ["Suivi GPS", "Intégration HealthKit/Google Fit", "Coaching IA"],
      image: "/assets/images/app-fitness.jpg"
    },
    {
      name: "EcoMarket",
      description: "Marketplace pour produits écologiques avec système de paiement intégré et livraison à domicile.",
      features: ["Paiement in-app", "Géolocalisation", "Scan de code-barres"],
      image: "/assets/images/app-ecommerce.jpg"
    },
    {
      name: "MindfulMoments",
      description: "Application de méditation et bien-être avec exercices guidés et suivi de l'humeur.",
      features: ["Contenu audio", "Mode hors-ligne", "Widgets personnalisés"],
      image: "/assets/images/app-meditation.jpg"
    }
  ];
  
  return (
    <FormationLayout
      title="Développement Mobile"
      subtitle="Créez des applications mobiles performantes et intuitives pour iOS et Android avec les technologies les plus demandées."
      color="pink"
      icon="📱"
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
          Notre formation complète en développement mobile vous permettra de maîtriser la création d'applications pour iOS et Android. 
          Dans un monde où les smartphones sont omniprésents, les compétences en développement mobile sont extrêmement recherchées.
        </p>
        <p className={`text-lg ${colorMode === 'navy' ? 'text-blue-100' : 'text-gray-300'}`}>
          Ce programme intensif couvre à la fois le développement natif (iOS et Android) et cross-platform (React Native, Flutter), 
          avec un accent particulier sur les bonnes pratiques, la performance et l'expérience utilisateur. À la fin de cette formation, 
          vous serez capable de concevoir, développer et publier des applications mobiles professionnelles.
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
                <div className="w-12 h-12 rounded-full bg-pink-600 flex items-center justify-center text-2xl mr-4">
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
                    <span className={`mr-2 text-xs ${colorMode === 'navy' ? 'text-pink-300' : 'text-pink-400'}`}>●</span>
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
          Technologies et frameworks
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          {technologies.map((tech, i) => (
            <div key={i} className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="text-white font-medium">{tech.name}</span>
                <span className={`${colorMode === 'navy' ? 'text-pink-300' : 'text-pink-400'}`}>{tech.level}%</span>
              </div>
              <div className={`w-full h-2 bg-gray-700 rounded-full overflow-hidden`}>
                <motion.div
                  className="h-full bg-pink-600"
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
      
      {/* App Showcase */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mb-20"
      >
        <h2 className={`text-3xl font-bold mb-10 text-center ${colorMode === 'navy' ? 'text-blue-300' : 'text-purple-300'}`}>
          Projets d'applications
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {appShowcase.map((app, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className={`p-6 rounded-xl ${colorMode === 'navy' ? 'bg-[#001a38]/80' : 'bg-gray-900/80'} backdrop-blur-sm border ${colorMode === 'navy' ? 'border-[#0a3c6e]/30' : 'border-gray-800/30'} hover:shadow-lg transition-all`}
            >
              <div className="w-full h-48 rounded-lg mb-4 overflow-hidden bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                <span className="text-6xl">{app.name.charAt(0)}</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{app.name}</h3>
              <p className={`${colorMode === 'navy' ? 'text-blue-100' : 'text-gray-300'} mb-4 text-sm`}>{app.description}</p>
              <div className="flex flex-wrap gap-2">
                {app.features.map((feature, j) => (
                  <span 
                    key={j} 
                    className={`px-3 py-1 rounded-full text-xs font-medium ${colorMode === 'navy' ? 'bg-pink-900/40 text-pink-200' : 'bg-pink-800/40 text-pink-200'}`}
                  >
                    {feature}
                  </span>
                ))}
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
                  <span className={`text-sm ${colorMode === 'navy' ? 'text-pink-300' : 'text-pink-400'}`}>Salaire annuel</span>
                  <p className="text-white font-medium">{career.salary}</p>
                </div>
                <div>
                  <span className={`text-sm ${colorMode === 'navy' ? 'text-pink-300' : 'text-pink-400'}`}>Demande</span>
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
        className={`p-10 rounded-2xl text-center ${colorMode === 'navy' ? 'bg-gradient-to-r from-pink-600/20 to-red-600/20' : 'bg-gradient-to-r from-pink-900/20 to-red-900/20'} backdrop-blur-lg border ${colorMode === 'navy' ? 'border-pink-500/30' : 'border-pink-800/30'}`}
      >
        <h2 className="text-3xl font-bold text-white mb-4">Prêt à créer des applications mobiles innovantes ?</h2>
        <p className={`text-lg ${colorMode === 'navy' ? 'text-blue-100' : 'text-gray-300'} max-w-3xl mx-auto mb-8`}>
          Rejoignez notre formation complète et acquérez les compétences recherchées pour développer des applications iOS et Android.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <motion.button
            className="px-8 py-4 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-medium shadow-lg"
            whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(0, 0, 0, 0.3)' }}
            whileTap={{ scale: 0.98 }}
          >
            S'inscrire maintenant
          </motion.button>
          <motion.button
            className={`px-8 py-4 bg-opacity-10 bg-white text-white rounded-lg font-medium border ${colorMode === 'navy' ? 'border-pink-500/30' : 'border-pink-800/30'}`}
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

export default MobileDevelopment;
