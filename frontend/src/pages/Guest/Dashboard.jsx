import React, { useMemo, useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useUserData } from '@/hooks/useDashboardQueries';
import { motion } from 'framer-motion';
import axios from 'axios';
import DashboardHeader from '@/components/shared/DashboardHeader';

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
    <DashboardLayout>
      <DashboardHeader user={user} roleTitle="Invité" />
    </DashboardLayout>
  );
};

export default GuestDashboard; 