import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useUserData } from '../hooks/useDashboardQueries';

/**
 * Composant Tableau de bord affiché comme page d'accueil pour les utilisateurs connectés
 * avec un message de bienvenue personnalisé selon le rôle
 */
const Dashboard = () => {
  const { data: user, isLoading, error } = useUserData();

  return (
    <DashboardLayout loading={isLoading} error={error?.message}>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Bienvenue {user?.firstName} {user?.lastName} - {user?.roles?.[0]?.replace('ROLE_', '')}
        </h1>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
