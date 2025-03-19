import { motion } from 'framer-motion';
import { memo } from 'react';

// Composant spécifique pour les transitions du formulaire uniquement
const FormTransition = memo(({ children }) => {
  // Animations pour le formulaire
  const formVariants = {
    initial: {
      opacity: 0,
      y: 5,
    },
    in: {
      opacity: 1,
      y: 0,
    },
    out: {
      opacity: 0,
      y: -5,
    },
  };

  // Transition optimisée pour les performances
  const formTransition = {
    type: 'tween',
    ease: [0.25, 0.1, 0.25, 1.0],
    duration: 0.3,
  };

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={formVariants}
      transition={formTransition}
      style={{ 
        willChange: 'opacity, transform',
        transform: 'translateZ(0)',
      }}
    >
      {children}
    </motion.div>
  );
});

// Ajout d'un nom d'affichage pour les outils de développement
FormTransition.displayName = 'FormTransition';

export default FormTransition; 
import { memo } from 'react';

// Composant spécifique pour les transitions du formulaire uniquement
const FormTransition = memo(({ children }) => {
  return (
    <div
      className="fade-in-up hw-accelerated"
    >
      {children}
    </div>
  );
});

// Ajout d'un nom d'affichage pour les outils de développement
FormTransition.displayName = 'FormTransition';

export default FormTransition; 