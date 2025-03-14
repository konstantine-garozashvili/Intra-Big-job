import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useUserData } from '@/hooks/useDashboardQueries';

/**
 * Tableau de bord spécifique pour les Super Administrateurs
 */
const SuperAdminDashboard = () => {
  const { data: user, isLoading, error } = useUserData();

  return (
    <DashboardLayout loading={isLoading} error={error?.message}>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="mb-8 text-3xl font-bold text-gray-800">
          Bienvenue {user?.firstName} {user?.lastName}
        </h1>
      </div>
    </DashboardLayout>
  );
};

export default SuperAdminDashboard; 