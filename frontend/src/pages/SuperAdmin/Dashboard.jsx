import React, { useMemo, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useUserData } from '@/hooks/useDashboardQueries';
import { authService } from '@/lib/services/authService';
import DashboardHeader from '@/components/shared/DashboardHeader';
import { ShieldAlert } from 'lucide-react';

/**
 * Tableau de bord spécifique pour les Super Administrateurs
 */
const SuperAdminDashboard = () => {
  const { data: user, isLoading, error } = useUserData();
  
  // Utiliser useMemo pour éviter les re-rendus inutiles
  const roleAlias = useMemo(() => {
    if (!user?.roles?.length) return '';
    const role = user.roles[0].replace('ROLE_', '');
    
    // Mapping des rôles vers des alias plus conviviaux
    const roleAliases = {
      'SUPERADMIN': 'Super Administrateur',
      'ADMIN': 'Administrateur',
      'TEACHER': 'Formateur',
      'STUDENT': 'Étudiant',
      'HR': 'Ressources Humaines',
      'RECRUITER': 'Recruteur'
    };
    
    return roleAliases[role] || role;
  }, [user]);

  // Forcer un rafraîchissement des données utilisateur au chargement
  useEffect(() => {
    const refreshUserData = async () => {
      try {
        await authService.getCurrentUser(true);
      } catch (error) {
        // Error handled silently
      }
    };
    
    refreshUserData();
  }, []);

  // Récupérer les données brutes du localStorage pour le débogage
  const rawUserData = useMemo(() => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  }, []);

  return (
    <DashboardLayout 
      loading={isLoading} 
      error={error?.message || null}
    >
      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <DashboardHeader 
          user={user}
          icon={ShieldAlert}
          roleTitle="Tableau de bord super administrateur"
        />
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="mb-8 text-3xl font-bold text-gray-800">
            Bienvenue {user?.firstName} {user?.lastName}
          </h1>
          <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-md">
            <p className="text-lg text-blue-800">
              <span className="font-semibold">Rôle:</span> {roleAlias}
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SuperAdminDashboard; 