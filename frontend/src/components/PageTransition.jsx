import { motion } from 'framer-motion';
import { memo } from 'react';

// Utilisation de React.memo pour éviter les rendus inutiles
const PageTransition = memo(({ children }) => {
  // Simplification des animations pour de meilleures performances
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 5, // Réduire la distance pour une animation plus légère
    },
    in: {
      opacity: 1,
      y: 0,
    },
    out: {
      opacity: 0,
      y: -5, // Réduire la distance pour une animation plus légère
    },
  };

  // Transition optimisée pour les performances
  const pageTransition = {
    type: 'tween',
    ease: [0.25, 0.1, 0.25, 1.0], // Courbe de Bézier cubique optimisée pour la fluidité
    duration: 0.3, // Durée réduite pour une transition plus rapide
  };

  // Utilisation du mode de rendu "will-change" pour une meilleure performance GPU
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      style={{ 
        willChange: 'opacity, transform',
        // Astuce pour forcer l'accélération matérielle
        transform: 'translateZ(0)',
      }}
    >
      {children}
    </motion.div>
  );
});

// Add display name for better debugging
PageTransition.displayName = 'PageTransition';

export default PageTransition;

