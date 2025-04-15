import React from 'react';
import { motion } from 'framer-motion';
import FeatureCard from './FeatureCard';

/**
 * Features Section component for displaying key platform features
 */
const FeaturesSection = () => {
  const features = [
    {
      icon: '🚀',
      title: 'Apprentissage Interactif',
      description: 'Des cours interactifs avec des exercices pratiques et des projets réels pour une expérience d\'apprentissage immersive.',
      color: 'bg-[#0a3c6e]'
    },
    {
      icon: '🔍',
      title: 'Technologies de Pointe',
      description: 'Accédez aux dernières technologies et frameworks utilisés par les entreprises leaders du secteur.',
      color: 'bg-[#001a38]'
    },
    {
      icon: '👥',
      title: 'Communauté Active',
      description: 'Rejoignez une communauté dynamique d\'apprenants et d\'experts pour échanger et collaborer sur des projets.',
      color: 'bg-[#002147]'
    },
    {
      icon: '🏆',
      title: 'Certification Reconnue',
      description: 'Obtenez des certifications reconnues par l\'industrie pour valoriser vos compétences auprès des employeurs.',
      color: 'bg-[#003366]'
    },
    {
      icon: '📱',
      title: 'Accessible Partout',
      description: 'Apprenez où que vous soyez grâce à notre plateforme responsive et notre application mobile dédiée.',
      color: 'bg-[#00264d]'
    },
    {
      icon: '🔄',
      title: 'Contenu Mis à Jour',
      description: 'Bénéficiez de contenus constamment mis à jour pour rester à la pointe des évolutions technologiques.',
      color: 'bg-[#0a3c6e]'
    }
  ];

  return (
    <section className="relative py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-300 via-blue-400 to-blue-500 bg-clip-text text-transparent mb-4">
            Pourquoi Choisir Notre Plateforme?
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Découvrez les fonctionnalités qui font de notre plateforme l'environnement idéal pour développer vos compétences numériques.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              color={feature.color}
              index={index}
            />
          ))}
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-1/4 right-0 w-64 h-64 bg-[#0a3c6e] rounded-full filter blur-3xl opacity-10"></div>
      <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-[#001a38] rounded-full filter blur-3xl opacity-10"></div>
    </section>
  );
};

export default FeaturesSection;
