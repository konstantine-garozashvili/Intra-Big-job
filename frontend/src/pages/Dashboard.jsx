import React, { useMemo } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useUserData } from '../hooks/useDashboardQueries';

/**
 * Composant Tableau de bord affiché comme page d'accueil pour les utilisateurs connectés
 * avec un message de bienvenue personnalisé selon le rôle
 */
const Dashboard = () => {
  const { data: user, isLoading, error } = useUserData();
  
  // Utiliser useMemo pour éviter les re-rendus inutiles
  const welcomeMessage = useMemo(() => {
    if (!user) return '';
    const role = user.roles?.[0]?.replace('ROLE_', '') || '';
    return `Bienvenue ${user.firstName || ''} ${user.lastName || ''} - ${role}`;
  }, [user]);

  return (
    <DashboardLayout loading={isLoading} error={error?.message}>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          {welcomeMessage}
        </h1>
      </div>
    </DashboardLayout>
  );
};

// Utiliser React.memo pour éviter les re-rendus inutiles
export default React.memo(Dashboard);
