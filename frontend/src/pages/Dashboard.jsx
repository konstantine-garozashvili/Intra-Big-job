import React, { useMemo, useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useUserData } from '../hooks/useDashboardQueries';
import { motion } from 'framer-motion';

/**
 * Composant Tableau de bord affiché comme page d'accueil pour les utilisateurs connectés
 * avec un message de bienvenue personnalisé selon le rôle
 */
const Dashboard = () => {
  // État local pour suivre si nous avons affiché les données de secours
  const [hasShownFallback, setHasShownFallback] = useState(false);
  
  // Utiliser le hook optimisé pour récupérer les données utilisateur
  const { data: user, error, isLoading, refetch } = useUserData();
  
  // Forcer un refetch au montage du composant
  useEffect(() => {
    console.log("Dashboard mounted, forcing data refresh");
    const timer = setTimeout(() => {
      refetch().catch(err => {
        console.error("Error refreshing dashboard data:", err);
      });
    }, 50); // Court délai pour s'assurer que le composant est monté
    
    return () => clearTimeout(timer);
  }, [refetch]);
  
  // Marquer quand nous avons affiché les données de secours
  useEffect(() => {
    if (user && !hasShownFallback) {
      setHasShownFallback(true);
    }
  }, [user, hasShownFallback]);
  
  // Aussi essayer de récupérer les données du localStorage comme filet de sécurité
  const fallbackUser = useMemo(() => {
    if (user) return null; // Ne pas calculer si nous avons déjà des données
    
    try {
      const storedUser = localStorage.getItem('user');
      console.log("Dashboard fallback: localStorage check", !!storedUser);
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      console.error("Error parsing localStorage user:", e);
      return null;
    }
  }, [user]);
  
  // Utiliser soit les données de l'API, soit les données de fallback
  const displayUser = user || fallbackUser;
  
  // Debugging - log complet des données disponibles
  useEffect(() => {
    console.log("Dashboard component state:", {
      user: user ? { id: user.id, firstName: user.firstName, lastName: user.lastName, roles: user.roles } : null,
      fallbackUser: fallbackUser ? { id: fallbackUser.id, firstName: fallbackUser.firstName, roles: fallbackUser.roles } : null,
      displayUser: displayUser ? { id: displayUser.id, firstName: displayUser.firstName, roles: displayUser.roles } : null,
      isLoading,
      error: error?.message
    });
    
    if (displayUser) {
      // Tentative de mise à jour localStorage si nécessaire
      try {
        localStorage.setItem('user', JSON.stringify(displayUser));
      } catch (e) {
        console.error("Error updating localStorage user:", e);
      }
    }
  }, [user, fallbackUser, displayUser, isLoading, error]);
  
  // Utiliser useMemo pour éviter les re-rendus inutiles
  const welcomeMessage = useMemo(() => {
    if (!displayUser) return '';
    
    // Extraire le rôle correctement
    let role = '';
    if (displayUser.roles) {
      if (Array.isArray(displayUser.roles) && displayUser.roles.length > 0) {
        role = displayUser.roles[0].replace('ROLE_', '');
      } else if (typeof displayUser.roles === 'string') {
        role = displayUser.roles.replace('ROLE_', '');
      }
    }
    
    return `Bienvenue ${displayUser.firstName || ''} ${displayUser.lastName || ''} - ${role}`;
  }, [displayUser]);
  
  // Si pas de données du tout, essayer de forcer un rechargement
  useEffect(() => {
    if (!displayUser && !isLoading) {
      console.log("No display user data, forcing reload");
      const reloadTimer = setTimeout(() => {
        window.location.reload();
      }, 2000);
      
      return () => clearTimeout(reloadTimer);
    }
  }, [displayUser, isLoading]);

  return (
    <DashboardLayout error={error?.message} isLoading={isLoading && !displayUser}>
      {displayUser ? (
        <motion.div 
          className="bg-white rounded-lg shadow-lg p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-8">
            {welcomeMessage}
          </h1>
        </motion.div>
      ) : !isLoading ? (
        <div className="bg-yellow-100 p-4 rounded-md text-yellow-800">
          Problème de chargement des données utilisateur. 
          <button 
            onClick={() => refetch()} 
            className="ml-2 text-blue-600 underline"
          >
            Réessayer
          </button>
        </div>
      ) : null}
    </DashboardLayout>
  );
};

// Utiliser React.memo pour éviter les re-rendus inutiles
export default React.memo(Dashboard);
