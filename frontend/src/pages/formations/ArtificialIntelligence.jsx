import React from 'react';
import { motion } from 'framer-motion';
import FormationLayout from '@/components/formations/FormationLayout';

/**
 * Artificial Intelligence Formation Page
 */
const ArtificialIntelligence = ({ colorMode = 'navy' }) => {
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
      title: "Fondements de l'IA",
      duration: "4 semaines",
      topics: ["Histoire de l'IA", "Logique et raisonnement", "Algorithmes d'optimisation", "Agents intelligents"],
      icon: "🧠"
    },
    {
      title: "Machine Learning",
      duration: "8 semaines",
      topics: ["Apprentissage supervisé", "Apprentissage non supervisé", "Feature Engineering", "Évaluation de modèles"],
      icon: "📊"
    },
    {
      title: "Deep Learning",
      duration: "6 semaines",
      topics: ["Réseaux de neurones", "CNN", "RNN & LSTM", "Transfer Learning"],
      icon: "🔮"
    },
    {
      title: "NLP & Computer Vision",
      duration: "6 semaines",
      topics: ["Traitement du langage naturel", "Vision par ordinateur", "Reconnaissance d'objets", "Génération de texte"],
      icon: "👁️"
    },
    {
      title: "IA avancée",
      duration: "4 semaines",
      topics: ["Apprentissage par renforcement", "GANs", "Systèmes multi-agents", "Robotique"],
      icon: "🤖"
    },
    {
      title: "Éthique & IA responsable",
      duration: "4 semaines",
      topics: ["Biais algorithmiques", "Confidentialité", "IA explicable", "Impact sociétal"],
      icon: "⚖️"
    }
  ];
  
  // Technologies used
  const technologies = [
    { name: "Python", level: 95 },
    { name: "TensorFlow", level: 90 },
    { name: "PyTorch", level: 85 },
    { name: "Scikit-learn", level: 90 },
    { name: "Computer Vision", level: 80 },
    { name: "NLP", level: 85 },
    { name: "Deep Learning", level: 90 },
    { name: "Reinforcement Learning", level: 75 }
  ];
  
  // Career opportunities
  const careers = [
    {
      title: "Data Scientist IA",
      description: "Développez des modèles d'IA pour extraire des insights et créer des solutions prédictives.",
      salary: "60K€ - 90K€",
      demand: "Très élevée"
    },
    {
      title: "Ingénieur ML",
      description: "Concevez et implémentez des systèmes d'apprentissage automatique à grande échelle.",
      salary: "65K€ - 95K€",
      demand: "Très élevée"
    },
    {
      title: "Spécialiste NLP",
      description: "Créez des systèmes capables de comprendre, interpréter et générer du langage humain.",
      salary: "70K€ - 100K€",
      demand: "Élevée"
    },
    {
      title: "Chercheur en IA",
      description: "Développez de nouvelles méthodes et algorithmes pour faire progresser le domaine de l'IA.",
      salary: "75K€ - 120K€",
      demand: "Élevée"
    }
  ];
  
  // AI Applications
  const applications = [
    {
      title: "Systèmes de recommandation",
      description: "Créez des expériences personnalisées pour les utilisateurs en prédisant leurs préférences.",
      industry: "E-commerce & Entertainment"
    },
    {
      title: "Diagnostic médical",
      description: "Assistez les professionnels de santé dans la détection précoce et le diagnostic de maladies.",
      industry: "Santé"
    },
    {
      title: "Voitures autonomes",
      description: "Développez des systèmes de perception et de décision pour véhicules autonomes.",
      industry: "Automobile"
    },
    {
      title: "Traitement du langage naturel",
      description: "Créez des assistants virtuels et des systèmes de traduction automatique.",
      industry: "Technologie & Services"
    }
  ];
  
  return (
    <FormationLayout
      title="Intelligence Artificielle"
      subtitle="Maîtrisez les techniques avancées d'IA pour créer des systèmes intelligents capables d'apprendre, de raisonner et de s'adapter."
      color="purple"
      icon="🧠"
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
            <p className={`${colorMode === 'navy' ? 'text-blue-100' : 'text-gray-300'}`}>Intermédiaire à Avancé</p>
          </div>
          <div className={`p-6 rounded-xl ${colorMode === 'navy' ? 'bg-[#0a3c6e]/20' : 'bg-purple-900/20'} flex flex-col items-center text-center`}>
            <span className="text-4xl mb-4">🏆</span>
            <h3 className="text-xl font-bold text-white mb-2">Certification</h3>
            <p className={`${colorMode === 'navy' ? 'text-blue-100' : 'text-gray-300'}`}>Diplôme Tech Odyssey</p>
          </div>
        </div>
        <p className={`text-lg ${colorMode === 'navy' ? 'text-blue-100' : 'text-gray-300'} mb-6`}>
          Notre formation complète en Intelligence Artificielle vous permettra de maîtriser les technologies qui transforment 
          notre monde. De l'apprentissage automatique au deep learning, vous découvrirez comment concevoir et déployer des 
          systèmes intelligents capables d'apprendre et de s'adapter.
        </p>
        <p className={`text-lg ${colorMode === 'navy' ? 'text-blue-100' : 'text-gray-300'}`}>
          Ce programme intensif combine théorie et pratique, avec des projets concrets dans des domaines variés comme la vision par 
          ordinateur, le traitement du langage naturel et l'apprentissage par renforcement. À la fin de cette formation, vous 
          serez capable de développer des solutions d'IA innovantes pour résoudre des problèmes complexes.
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
                <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-2xl mr-4">
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
                    <span className={`mr-2 text-xs ${colorMode === 'navy' ? 'text-purple-300' : 'text-purple-400'}`}>●</span>
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
                <span className={`${colorMode === 'navy' ? 'text-purple-300' : 'text-purple-400'}`}>{tech.level}%</span>
              </div>
              <div className={`w-full h-2 bg-gray-700 rounded-full overflow-hidden`}>
                <motion.div
                  className="h-full bg-purple-600"
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
      
      {/* Applications Section */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mb-20"
      >
        <h2 className={`text-3xl font-bold mb-10 text-center ${colorMode === 'navy' ? 'text-blue-300' : 'text-purple-300'}`}>
          Applications concrètes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {applications.map((app, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className={`p-6 rounded-xl ${colorMode === 'navy' ? 'bg-[#001a38]/80' : 'bg-gray-900/80'} backdrop-blur-sm border ${colorMode === 'navy' ? 'border-[#0a3c6e]/30' : 'border-gray-800/30'}`}
            >
              <div className="mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${colorMode === 'navy' ? 'bg-purple-900/40 text-purple-200' : 'bg-purple-800/40 text-purple-200'}`}>
                  {app.industry}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{app.title}</h3>
              <p className={`${colorMode === 'navy' ? 'text-blue-100' : 'text-gray-300'}`}>{app.description}</p>
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
                  <span className={`text-sm ${colorMode === 'navy' ? 'text-purple-300' : 'text-purple-400'}`}>Salaire annuel</span>
                  <p className="text-white font-medium">{career.salary}</p>
                </div>
                <div>
                  <span className={`text-sm ${colorMode === 'navy' ? 'text-purple-300' : 'text-purple-400'}`}>Demande</span>
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
        className={`p-10 rounded-2xl text-center ${colorMode === 'navy' ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20' : 'bg-gradient-to-r from-purple-900/20 to-pink-900/20'} backdrop-blur-lg border ${colorMode === 'navy' ? 'border-purple-500/30' : 'border-purple-800/30'}`}
      >
        <h2 className="text-3xl font-bold text-white mb-4">Prêt à devenir un expert en Intelligence Artificielle ?</h2>
        <p className={`text-lg ${colorMode === 'navy' ? 'text-blue-100' : 'text-gray-300'} max-w-3xl mx-auto mb-8`}>
          Rejoignez notre formation complète et acquérez les compétences recherchées pour développer les technologies du futur.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <motion.button
            className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium shadow-lg"
            whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(0, 0, 0, 0.3)' }}
            whileTap={{ scale: 0.98 }}
          >
            S'inscrire maintenant
          </motion.button>
          <motion.button
            className={`px-8 py-4 bg-opacity-10 bg-white text-white rounded-lg font-medium border ${colorMode === 'navy' ? 'border-purple-500/30' : 'border-purple-800/30'}`}
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

export default ArtificialIntelligence;
