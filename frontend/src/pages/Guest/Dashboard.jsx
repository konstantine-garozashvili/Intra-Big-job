import React, { useMemo, useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useUserData } from '@/hooks/useDashboardQueries';
import { motion } from 'framer-motion';
import DocumentNotifications from '@/components/DocumentNotifications';
import axios from 'axios';

/**
 * Tableau de bord spécifique pour les invités
 */
const GuestDashboard = () => {
  const { data: user, isLoading, error } = useUserData();
  // État pour stocker les notifications reçues
  const [notifications, setNotifications] = useState([]);
  
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
      {/* Ajouter le composant de notifications de documents */}
      <DocumentNotifications />
      
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="mb-8 text-3xl font-bold text-gray-800">
          Bienvenue {user?.firstName} {user?.lastName}
        </h1>
        <div className="mb-6 p-4 bg-gray-50 border-l-4 border-gray-500 rounded-md">
          <p className="text-lg text-gray-800">
            <span className="font-semibold">Rôle:</span> {roleAlias}
          </p>
        </div>
      </div>

      {/* Zone de notifications */}
      <motion.div 
        className="bg-white rounded-lg shadow-lg p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Notifications</h2>
          <div className="space-x-2">
            <button 
              onClick={testNotification}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Notif générale
            </button>
            <button 
              onClick={testDocumentNotification}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              Notif document
            </button>
          </div>
        </div>
        <div id="messages" className="space-y-3">
          {notifications.length === 0 ? (
            <p className="text-gray-500 italic">Aucune notification pour le moment</p>
          ) : (
            notifications.map(notification => (
              <motion.div 
                key={notification.id}
                className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-md"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex justify-between">
                  <p className="text-blue-800">{notification.message}</p>
                  <span className="text-xs text-gray-500">{notification.timestamp}</span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default GuestDashboard; 