import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useRoles } from '@/features/roles/roleContext';
import { useRolePermissions } from '@/features/roles/useRolePermissions';
import { toast } from 'sonner';
import { Spinner } from './ui/spinner';
import { ROLES } from '@/features/roles/roleContext';

/**
 * Composant pour protéger les routes d'administration
 * Vérifie si l'utilisateur a un rôle d'administrateur
 * Redirige vers le dashboard approprié si l'utilisateur n'est pas administrateur
 */
const AdminRoute = () => {
  const location = useLocation();
  const { hasRole, isLoading } = useRoles();
  const permissions = useRolePermissions();
  
  // Vérifier si l'utilisateur a un rôle d'administrateur
  const isAdmin = hasRole(ROLES.ADMIN) || hasRole(ROLES.SUPERADMIN);
  
  // Pendant le chargement, afficher un spinner
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <Spinner type="dots" size="lg" />
      </div>
    );
  }
  
  // Si l'utilisateur n'est pas administrateur, le rediriger vers son dashboard
  if (!isAdmin) {
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
  
  // Si l'utilisateur est administrateur, afficher le contenu de la route
  return <Outlet />;
};

export default AdminRoute; 