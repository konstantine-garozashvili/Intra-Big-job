import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useRoles } from '@/features/roles/roleContext';
import { useRolePermissions } from '@/features/roles/useRolePermissions';
import { toast } from 'sonner';
import { Spinner } from './ui/spinner';

/**
 * Composant pour protéger les routes spécifiques à un rôle
 * Vérifie si l'utilisateur a le rôle requis
 * Redirige vers le dashboard approprié si l'utilisateur n'a pas le rôle requis
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {string|string[]} props.allowedRoles - Le ou les rôles autorisés à accéder à cette route
 * @returns {JSX.Element} - Le composant de route protégée
 */
const RoleRoute = ({ allowedRoles }) => {
  const location = useLocation();
  const { hasRole, hasAnyRole, isLoading } = useRoles();
  const permissions = useRolePermissions();
  
  // Convertir en tableau si c'est une chaîne
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  
  // Vérifier si l'utilisateur a au moins un des rôles autorisés
  const hasAllowedRole = hasAnyRole(roles);
  
  // Pendant le chargement, afficher un spinner
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <Spinner type="dots" size="lg" />
      </div>
    );
  }
  
  // Si l'utilisateur n'a pas le rôle requis, le rediriger vers son dashboard
  if (!hasAllowedRole) {
    // Afficher une notification d'erreur
    toast.error("Vous n'avez pas les droits d'accès à cette page", {
      duration: 3000,
      position: 'top-center',
    });
    
    // Obtenir le chemin du dashboard approprié pour l'utilisateur
    const dashboardPath = permissions.getRoleDashboardPath();
    
    // Rediriger vers le dashboard approprié
    return <Navigate to={dashboardPath} replace />;
  }
  
  // Si l'utilisateur a le rôle requis, afficher le contenu de la route
  return <Outlet />;
};

export default RoleRoute; 