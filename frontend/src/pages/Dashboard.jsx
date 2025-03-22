import React, { useMemo, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useUserData } from '../hooks/useDashboardQueries';

/**
 * Composant Tableau de bord affiché comme page d'accueil pour les utilisateurs connectés
 * avec un message de bienvenue personnalisé selon le rôle
 */
const Dashboard = () => {
  const { data: user, error, isLoading } = useUserData();
  
  // Debugging - check what data we actually have
  useEffect(() => {
    console.log("Dashboard user data:", user);
    console.log("Dashboard loading:", isLoading);
    console.log("Dashboard error:", error);
    
    // Check what's in localStorage
    try {
      const storedUser = localStorage.getItem('user');
      console.log("localStorage user:", storedUser ? JSON.parse(storedUser) : null);
    } catch (e) {
      console.error("Error parsing localStorage user:", e);
    }
  }, [user, isLoading, error]);
  
  // Utiliser useMemo pour éviter les re-rendus inutiles
  const welcomeMessage = useMemo(() => {
    if (!user) return '';
    const role = user.roles?.[0]?.replace('ROLE_', '') || '';
    return `Bienvenue ${user.firstName || ''} ${user.lastName || ''} - ${role}`;
  }, [user]);

  return (
    <DashboardLayout error={error?.message}>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          {welcomeMessage}
        </h1>
        {!user && !isLoading && (
          <div className="bg-yellow-100 p-4 rounded-md text-yellow-800">
            Problème de chargement des données utilisateur
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

// Utiliser React.memo pour éviter les re-rendus inutiles
export default React.memo(Dashboard);
