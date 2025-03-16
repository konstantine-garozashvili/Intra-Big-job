import React, { useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useUserData } from '@/hooks/useDashboardQueries';

/**
 * Tableau de bord spécifique pour les invités
 */
const GuestDashboard = () => {
  const { data: user, isLoading, error } = useUserData();
  
  // Utiliser useMemo pour éviter les re-rendus inutiles
  const roleAlias = useMemo(() => {
    if (!user?.roles?.length) return '';
    const role = user.roles[0].replace('ROLE_', '');
    
    // Mapping des rôles vers des alias plus conviviaux
    const roleAliases = {
      'SUPER_ADMIN': 'Super Administrateur',
      'ADMIN': 'Administrateur',
      'TEACHER': 'Formateur',
      'STUDENT': 'Étudiant',
      'HR': 'Ressources Humaines',
      'RECRUITER': 'Recruteur',
      'GUEST': 'Invité'
    };
    
    return roleAliases[role] || role;
  }, [user]);

  return (
    <DashboardLayout loading={isLoading} error={error?.message}>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="mb-8 text-3xl font-bold text-gray-800">
          Bienvenue {user?.firstName} {user?.lastName}
        </h1>
        <div className="mb-6 p-4 bg-gray-50 border-l-4 border-gray-500 rounded-md">
          <p className="text-lg text-gray-800">
            <span className="font-semibold">Rôle:</span> {roleAlias}
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default GuestDashboard; 