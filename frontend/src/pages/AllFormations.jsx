import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
/**
 * AllFormations page displaying all available educational tracks
 */
const AllFormations = () => {
  const { colorMode, currentTheme } = useTheme();

  useEffect(() => {
    // Simple animation effect for stars using CSS animations instead of GSAP
    const stars = document.querySelectorAll('.star');
    
    stars.forEach((star) => {
      // Add random animation delay for twinkling effect
      star.style.animationDelay = `${Math.random() * 5}s`;
    });
    
    return () => {
      // Cleanup if needed
    };
  }, []);

  // Formation data
  const formations = [
    {
      id: 'web',
      title: 'Développement Web',
      description: 'Maîtrisez HTML, CSS, JavaScript et les frameworks modernes pour créer des sites web et applications web interactifs et responsifs.',
      image: '/assets/images/course-web.jpg',
      color: 'from-blue-500 to-cyan-400',
      modules: ['HTML/CSS', 'JavaScript', 'React', 'Node.js', 'PHP/MySQL'],
      duration: '9 mois'
    },
    {
      id: 'cybersecurity',
      title: 'Cybersécurité',
      description: 'Apprenez à protéger les systèmes informatiques contre les menaces et vulnérabilités avec des techniques avancées de sécurité.',
      image: '/assets/images/course-security.jpg',
      color: 'from-green-500 to-emerald-400',
      modules: ['Sécurité réseau', 'Cryptographie', 'Ethical Hacking', 'Forensics', 'Sécurité Cloud'],
      duration: '10 mois'
    },
    {
      id: 'ai',
      title: 'Intelligence Artificielle',
      description: 'Découvrez le machine learning, le deep learning et leurs applications pratiques dans divers domaines industriels.',
      image: '/assets/images/course-ai.jpg',
      color: 'from-purple-500 to-pink-500',
      modules: ['Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision', 'Éthique de l\'IA'],
      duration: '12 mois'
    },
    {
      id: 'data-science',
      title: 'Science des Données',
      description: 'Analysez et visualisez des données complexes pour en extraire des insights précieux et prendre des décisions basées sur les données.',
      image: '/assets/images/course-data.jpg',
      color: 'from-indigo-500 to-blue-600',
      modules: ['Python pour Data Science', 'Statistiques', 'Visualisation', 'Big Data', 'Business Intelligence'],
      duration: '10 mois'
    },
    {
      id: 'mobile',
      title: 'Développement Mobile',
      description: 'Créez des applications mobiles pour iOS et Android avec des frameworks natifs et cross-platform comme React Native et Flutter.',
      image: '/assets/images/course-mobile.jpg',
      color: 'from-pink-500 to-red-500',
      modules: ['iOS (Swift)', 'Android (Kotlin)', 'React Native', 'Flutter', 'UX/UI Mobile'],
      duration: '8 mois'
    },
    {
      id: 'game',
      title: 'Développement de Jeux',
      description: 'Concevez et créez des jeux vidéo captivants en utilisant des moteurs de jeu professionnels comme Unity et Unreal Engine.',
      image: '/assets/images/course-game.jpg',
      color: 'from-yellow-500 to-orange-500',
      modules: ['Game Design', 'Unity', 'Unreal Engine', '3D Modeling', 'Game Physics'],
      duration: '11 mois'
    }
  ];

  return (
    <div className={`min-h-screen ${currentTheme.bg} ${currentTheme.textPrimary} relative overflow-hidden pt-[72px]`}>
      {/* Animated background stars */}
      <div className="star-container absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="star absolute rounded-full bg-white animate-twinkle"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              opacity: Math.random() * 0.8 + 0.2,
              animationDuration: `${Math.random() * 3 + 2}s`
            }}
          />
        ))}
      </div>
      
      {/* Header */}
      <header className="container mx-auto pt-8 pb-12 px-4 text-center relative z-10">
        <motion.h1 
          className={`text-5xl md:text-6xl font-bold mb-6 ${currentTheme.textHighlight}`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Toutes Nos Formations
        </motion.h1>
        <motion.p 
          className={`text-xl md:text-2xl ${currentTheme.textPrimary} max-w-3xl mx-auto`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Explorez notre catalogue complet de formations pour trouver celle qui correspond à vos aspirations professionnelles
        </motion.p>
      </header>
      
      {/* Formations Grid */}
      <section className="container mx-auto px-4 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {formations.map((formation, index) => (
            <motion.div
              key={formation.id}
              className={`${currentTheme.cardBg} backdrop-blur-sm rounded-xl overflow-hidden ${currentTheme.shadow}`}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ 
                y: -10,
                transition: { duration: 0.3 }
              }}
            >
              <div 
                className="h-48 bg-cover bg-center"
                style={{ backgroundImage: `url(${formation.image})` }}
              >
                <div className={`h-full w-full bg-gradient-to-tr ${formation.color} opacity-80`}></div>
              </div>
              
              <div className="p-6">
                <h3 className={`text-2xl font-bold mb-2 ${currentTheme.textHighlight}`}>{formation.title}</h3>
                <p className={`${currentTheme.textPrimary} mb-4`}>{formation.description}</p>
                
                <div className="mb-4">
                  <span className={`text-sm font-semibold ${currentTheme.textHighlight}`}>Durée: {formation.duration}</span>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {formation.modules.map((module, i) => (
                    <span 
                      key={i}
                      className={`px-3 py-1 ${currentTheme.cardBg} rounded-full text-sm ${currentTheme.textPrimary}`}
                    >
                      {module}
                    </span>
                  ))}
                </div>
                
                <Link 
                  to={`/formations/${formation.id}`}
                  className={`inline-block w-full py-3 px-6 ${currentTheme.buttonBg} rounded-lg font-medium text-center transition-colors`}
                >
                  Découvrir la formation
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center relative z-10">
        <motion.div 
          className={`${currentTheme.cardBg} rounded-2xl p-8 md:p-12 ${currentTheme.shadow}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${currentTheme.textHighlight}`}>Prêt à commencer votre voyage éducatif?</h2>
          <p className={`text-xl ${currentTheme.textPrimary} mb-8 max-w-2xl mx-auto`}>
            Rejoignez notre communauté d'apprenants et transformez votre carrière avec nos formations de pointe.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register" 
              className={`py-3 px-8 ${currentTheme.buttonBg} rounded-lg font-medium text-lg transition-colors`}
            >
              S'inscrire maintenant
            </Link>
            <Link 
              to="/login" 
              className={`py-3 px-8 ${currentTheme.buttonAlt} rounded-lg font-medium text-lg transition-colors`}
            >
              Se connecter
            </Link>
          </div>
        </motion.div>
      </section>
      
      {/* Footer */}
      <footer className={`container mx-auto px-4 py-8 text-center ${currentTheme.textPrimary} relative z-10`}>
        <p>&copy; 2025 Tech Odyssey Academy. Tous droits réservés.</p>
      </footer>
    </div>
  );
};

export default AllFormations;
