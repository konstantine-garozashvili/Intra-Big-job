import React from 'react';
import { motion } from 'framer-motion';
import FormationLayout from '@/components/formations/FormationLayout';

/**
 * Cybersecurity Formation Page
 */
const Cybersecurity = ({ colorMode = 'navy' }) => {
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
      title: "Fondamentaux de la Sécurité",
      duration: "4 semaines",
      topics: ["Principes de cybersécurité", "Cryptographie", "Gestion des risques", "Conformité et réglementations"],
      icon: "🔒"
    },
    {
      title: "Sécurité des Réseaux",
      duration: "6 semaines",
      topics: ["Architecture réseau sécurisée", "Pare-feu et IDS/IPS", "VPN et tunneling", "Détection d'intrusion"],
      icon: "🌐"
    },
    {
      title: "Sécurité des Applications",
      duration: "6 semaines",
      topics: ["OWASP Top 10", "Secure Coding", "Tests de pénétration", "Sécurité des API"],
      icon: "💻"
    },
    {
      title: "Ethical Hacking",
      duration: "8 semaines",
      topics: ["Reconnaissance", "Exploitation", "Post-exploitation", "Rédaction de rapports"],
      icon: "🕵️"
    },
    {
      title: "Sécurité Cloud",
      duration: "4 semaines",
      topics: ["AWS/Azure/GCP Security", "DevSecOps", "Conteneurs sécurisés", "Infrastructure as Code"],
      icon: "☁️"
    },
    {
      title: "Réponse aux Incidents",
      duration: "4 semaines",
      topics: ["Forensics", "Analyse de malware", "Plans de réponse", "Récupération après incident"],
      icon: "🚨"
    }
  ];
  
  // Technologies used
  const technologies = [
    { name: "Kali Linux", level: 90 },
    { name: "Wireshark", level: 85 },
    { name: "Metasploit", level: 80 },
    { name: "Burp Suite", level: 85 },
    { name: "SIEM Tools", level: 75 },
    { name: "Cryptographie", level: 80 },
    { name: "Forensics Tools", level: 75 },
    { name: "Cloud Security", level: 70 }
  ];
  
  // Career opportunities
  const careers = [
    {
      title: "Analyste en Cybersécurité",
      description: "Surveillez et analysez les menaces de sécurité pour protéger les systèmes d'information.",
      salary: "50K€ - 75K€",
      demand: "Très élevée"
    },
    {
      title: "Pentester / Ethical Hacker",
      description: "Testez la sécurité des systèmes en simulant des attaques pour identifier les vulnérabilités.",
      salary: "55K€ - 85K€",
      demand: "Élevée"
    },
    {
      title: "Ingénieur en Sécurité",
      description: "Concevez et implémentez des solutions de sécurité pour protéger les infrastructures.",
      salary: "60K€ - 90K€",
      demand: "Très élevée"
    },
    {
      title: "RSSI (Responsable Sécurité)",
      description: "Définissez et pilotez la stratégie de sécurité des systèmes d'information.",
      salary: "75K€ - 120K€",
      demand: "Élevée"
    }
  ];
  
  // Certifications
  const certifications = [
    { name: "CompTIA Security+", level: "Fondamental", duration: "Préparation incluse" },
    { name: "CEH (Certified Ethical Hacker)", level: "Intermédiaire", duration: "Préparation incluse" },
    { name: "OSCP (Offensive Security Certified Professional)", level: "Avancé", duration: "Préparation optionnelle" },
    { name: "CISSP", level: "Expert", duration: "Préparation optionnelle" }
  ];
  
  return (
    <FormationLayout
      title="Cybersécurité"
      subtitle="Apprenez à protéger les systèmes et les données contre les menaces informatiques dans un monde de plus en plus connecté."
      color="green"
      icon="🔒"
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
            <p className={`${colorMode === 'navy' ? 'text-blue-100' : 'text-gray-300'}`}>Diplôme Tech Odyssey + Certifications</p>
          </div>
        </div>
        <p className={`text-lg ${colorMode === 'navy' ? 'text-blue-100' : 'text-gray-300'} mb-6`}>
          Notre formation complète en cybersécurité vous prépare à défendre les systèmes d'information contre les menaces modernes. 
          Dans un monde où les cyberattaques sont de plus en plus sophistiquées, les experts en sécurité sont plus demandés que jamais.
        </p>
        <p className={`text-lg ${colorMode === 'navy' ? 'text-blue-100' : 'text-gray-300'}`}>
          Ce programme intensif combine théorie et pratique, avec des laboratoires virtuels, des simulations d'attaques et de défense, 
          et un accompagnement par des professionnels expérimentés. À la fin de cette formation, vous serez capable d'identifier, 
          d'analyser et de contrer les menaces de sécurité informatique.
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
                <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-2xl mr-4">
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
                    <span className={`mr-2 text-xs ${colorMode === 'navy' ? 'text-green-400' : 'text-green-500'}`}>●</span>
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
                <span className={`${colorMode === 'navy' ? 'text-green-400' : 'text-green-500'}`}>{tech.level}%</span>
              </div>
              <div className={`w-full h-2 bg-gray-700 rounded-full overflow-hidden`}>
                <motion.div
                  className="h-full bg-green-600"
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
      
      {/* Certifications Section */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className={`mb-20 p-8 rounded-2xl ${colorMode === 'navy' ? 'bg-[#001a38]/50' : 'bg-gray-900/50'} backdrop-blur-lg border ${colorMode === 'navy' ? 'border-[#0a3c6e]/30' : 'border-gray-800/30'}`}
      >
        <h2 className={`text-3xl font-bold mb-10 text-center ${colorMode === 'navy' ? 'text-blue-300' : 'text-purple-300'}`}>
          Certifications incluses
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-3 px-4 text-left text-white">Certification</th>
                <th className="py-3 px-4 text-left text-white">Niveau</th>
                <th className="py-3 px-4 text-left text-white">Préparation</th>
              </tr>
            </thead>
            <tbody>
              {certifications.map((cert, i) => (
                <tr key={i} className="border-b border-gray-800">
                  <td className="py-4 px-4 text-white font-medium">{cert.name}</td>
                  <td className={`py-4 px-4 ${colorMode === 'navy' ? 'text-blue-200' : 'text-purple-200'}`}>{cert.level}</td>
                  <td className={`py-4 px-4 ${colorMode === 'navy' ? 'text-blue-100' : 'text-gray-300'}`}>{cert.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={`mt-6 text-sm ${colorMode === 'navy' ? 'text-blue-200' : 'text-purple-200'}`}>
          * Les frais d'examen pour CompTIA Security+ et CEH sont inclus dans le prix de la formation.
        </p>
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
                  <span className={`text-sm ${colorMode === 'navy' ? 'text-green-400' : 'text-green-500'}`}>Salaire annuel</span>
                  <p className="text-white font-medium">{career.salary}</p>
                </div>
                <div>
                  <span className={`text-sm ${colorMode === 'navy' ? 'text-green-400' : 'text-green-500'}`}>Demande</span>
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
        className={`p-10 rounded-2xl text-center ${colorMode === 'navy' ? 'bg-gradient-to-r from-green-600/20 to-emerald-600/20' : 'bg-gradient-to-r from-green-900/20 to-emerald-900/20'} backdrop-blur-lg border ${colorMode === 'navy' ? 'border-green-500/30' : 'border-green-800/30'}`}
      >
        <h2 className="text-3xl font-bold text-white mb-4">Prêt à devenir un expert en cybersécurité ?</h2>
        <p className={`text-lg ${colorMode === 'navy' ? 'text-blue-100' : 'text-gray-300'} max-w-3xl mx-auto mb-8`}>
          Rejoignez notre formation complète et acquérez les compétences recherchées pour protéger les infrastructures critiques.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <motion.button
            className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow-lg"
            whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(0, 0, 0, 0.3)' }}
            whileTap={{ scale: 0.98 }}
          >
            S'inscrire maintenant
          </motion.button>
          <motion.button
            className={`px-8 py-4 bg-opacity-10 bg-white text-white rounded-lg font-medium border ${colorMode === 'navy' ? 'border-green-500/30' : 'border-green-800/30'}`}
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

export default Cybersecurity;
