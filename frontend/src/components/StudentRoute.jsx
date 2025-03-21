// Ce fichier est remplacé par une logique unifiée dans ProtectedRoute.jsx
// qui utilise le hook useRolePermissions pour vérifier les accès
// Voir ProtectedRoute.jsx pour la nouvelle implémentation

import { Outlet } from 'react-router-dom';

// Composant de compatibilité maintenu pour éviter des modifications majeures
// À terme, remplacer par ProtectedRoute pour une gestion cohérente des rôles
const StudentRoute = () => {
  console.warn('StudentRoute: Ce composant est obsolète, utilisez ProtectedRoute à la place');
  return <Outlet />;
};

export default StudentRoute; 