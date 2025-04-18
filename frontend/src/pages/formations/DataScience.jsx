import React from 'react';
import { motion } from 'framer-motion';
import FormationLayout from '@/components/formations/FormationLayout';

/**
 * Data Science Formation Page
 */
const DataScience = ({ colorMode = 'navy' }) => {
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
      title: "Fondamentaux de la Data",
      duration: "4 semaines",
      topics: ["Statistiques", "Probabilités", "Algèbre linéaire", "Visualisation de données"],
      icon: "📊"
    },
    {
      title: "Programmation pour Data Science",
      duration: "6 semaines",
      topics: ["Python avancé", "Pandas & NumPy", "SQL", "Data cleaning"],
      icon: "💻"
    },
    {
      title: "Analyse exploratoire",
      duration: "4 semaines",
      topics: ["EDA", "Feature engineering", "Visualisation avancée", "Storytelling avec les données"],
      icon: "🔍"
    },
    {
      title: "Machine Learning",
      duration: "8 semaines",
      topics: ["Régression", "Classification", "Clustering", "Validation de modèles"],
      icon: "🤖"
    },
    {
      title: "Big Data",
      duration: "6 semaines",
      topics: ["Spark", "Hadoop", "Traitement distribué", "Cloud computing"],
      icon: "☁️"
    },
    {
      title: "Data Engineering",
      duration: "4 semaines",
      topics: ["Pipelines de données", "ETL", "Data warehousing", "Orchestration"],
      icon: "🔧"
    }
  ];
  
  // Technologies used
  const technologies = [
    { name: "Python", level: 95 },
    { name: "SQL", level: 90 },
    { name: "Pandas & NumPy", level: 95 },
    { name: "Scikit-learn", level: 85 },
    { name: "Tableau/PowerBI", level: 80 },
    { name: "Spark", level: 75 },
    { name: "Hadoop", level: 70 },
    { name: "Airflow", level: 75 }
  ];
  
  // Career opportunities
  const careers = [
    {
      title: "Data Scientist",
      description: "Analysez des données complexes pour extraire des insights et créer des modèles prédictifs.",
      salary: "50K€ - 80K€",
      demand: "Très élevée"
    },
    {
      title: "Data Analyst",
      description: "Transformez les données brutes en informations exploitables pour guider les décisions commerciales.",
      salary: "45K€ - 70K€",
      demand: "Élevée"
    },
    {
      title: "Data Engineer",
      description: "Concevez et maintenez les infrastructures et pipelines de données.",
      salary: "55K€ - 85K€",
      demand: "Très élevée"
    },
    {
      title: "Business Intelligence Analyst",
      description: "Créez des tableaux de bord et des rapports pour aider à la prise de décision.",
      salary: "48K€ - 75K€",
      demand: "Élevée"
    }
  ];
  
  // Real-world applications
  const applications = [
    {
      title: "Analyse prédictive des ventes",
      description: "Prédisez les tendances de ventes futures pour optimiser les stocks et la chaîne d'approvisionnement.",
      industry: "Retail & E-commerce"
    },
    {
      title: "Détection de fraude",
      description: "Identifiez les transactions frauduleuses en temps réel grâce à des algorithmes avancés.",
      industry: "Finance & Banque"
    },
    {
      title: "Segmentation client",
      description: "Créez des profils clients détaillés pour personnaliser les stratégies marketing.",
      industry: "Marketing"
    },
    {
      title: "Optimisation de la supply chain",
      description: "Améliorez l'efficacité de la chaîne d'approvisionnement grâce à l'analyse prédictive.",
      industry: "Logistique"
    }
  ];
  
  return (
    <FormationLayout
      title="Data Science"
      subtitle="Transformez les données brutes en insights précieux et en modèles prédictifs pour guider les décisions stratégiques."
      color="indigo"
      icon="📊"
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
          Notre formation complète en Data Science vous permettra de maîtriser l'art et la science de l'extraction d'insights 
          à partir de données complexes. Dans un monde où les données sont omniprésentes, les compétences en Data Science 
          sont parmi les plus recherchées sur le marché du travail.
        </p>
        <p className={`text-lg ${colorMode === 'navy' ? 'text-blue-100' : 'text-gray-300'}`}>
          Ce programme intensif combine théorie statistique, programmation et business intelligence, avec de nombreux projets 
          concrets basés sur des cas réels. À la fin de cette formation, vous serez capable d'analyser des données complexes, 
          de créer des modèles prédictifs et de communiquer efficacement vos résultats pour guider la prise de décision.
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
                <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-2xl mr-4">
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
                    <span className={`mr-2 text-xs ${colorMode === 'navy' ? 'text-indigo-300' : 'text-indigo-400'}`}>●</span>
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
                <span className={`${colorMode === 'navy' ? 'text-indigo-300' : 'text-indigo-400'}`}>{tech.level}%</span>
              </div>
              <div className={`w-full h-2 bg-gray-700 rounded-full overflow-hidden`}>
                <motion.div
                  className="h-full bg-indigo-600"
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
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${colorMode === 'navy' ? 'bg-indigo-900/40 text-indigo-200' : 'bg-indigo-800/40 text-indigo-200'}`}>
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
                  <span className={`text-sm ${colorMode === 'navy' ? 'text-indigo-300' : 'text-indigo-400'}`}>Salaire annuel</span>
                  <p className="text-white font-medium">{career.salary}</p>
                </div>
                <div>
                  <span className={`text-sm ${colorMode === 'navy' ? 'text-indigo-300' : 'text-indigo-400'}`}>Demande</span>
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
        className={`p-10 rounded-2xl text-center ${colorMode === 'navy' ? 'bg-gradient-to-r from-indigo-600/20 to-blue-600/20' : 'bg-gradient-to-r from-indigo-900/20 to-blue-900/20'} backdrop-blur-lg border ${colorMode === 'navy' ? 'border-indigo-500/30' : 'border-indigo-800/30'}`}
      >
        <h2 className="text-3xl font-bold text-white mb-4">Prêt à devenir un expert en Data Science ?</h2>
        <p className={`text-lg ${colorMode === 'navy' ? 'text-blue-100' : 'text-gray-300'} max-w-3xl mx-auto mb-8`}>
          Rejoignez notre formation complète et acquérez les compétences recherchées pour transformer les données en décisions stratégiques.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <motion.button
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-lg"
            whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(0, 0, 0, 0.3)' }}
            whileTap={{ scale: 0.98 }}
          >
            S'inscrire maintenant
          </motion.button>
          <motion.button
            className={`px-8 py-4 bg-opacity-10 bg-white text-white rounded-lg font-medium border ${colorMode === 'navy' ? 'border-indigo-500/30' : 'border-indigo-800/30'}`}
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

export default DataScience;
