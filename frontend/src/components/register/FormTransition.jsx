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