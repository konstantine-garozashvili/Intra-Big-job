import { memo } from 'react';

// Utilisation de React.memo pour éviter les rendus inutiles
const PageTransition = memo(({ children }) => {
  // Utilisation de classes CSS pour les animations au lieu de Framer Motion
  return (
    <div
      className="fade-in-up hw-accelerated"
    >
      {children}
    </div>
  );
});

// Ajout d'un nom d'affichage pour les outils de développement
PageTransition.displayName = 'PageTransition';

export default PageTransition; 