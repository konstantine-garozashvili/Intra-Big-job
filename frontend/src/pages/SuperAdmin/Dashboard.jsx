import React, { useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { useUserData } from '@/hooks/useDashboardQueries';
import { authService } from '@/lib/services/authService';
import { ShieldAlert, Users, Book, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 15, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 400, damping: 25 }
  }
};

/**
 * Tableau de bord spécifique pour les Super Administrateurs
 */
const SuperAdminDashboard = () => {
  const { data: user, isLoading, error, refetch } = useUserData();
  const refreshAttemptedRef = useRef(false);
  
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

  // Approche améliorée pour gérer les données utilisateur
  useEffect(() => {
    // Si nous avons déjà des données complètes, ne pas rafraîchir
    if (user?.firstName && user?.lastName) {
      refreshAttemptedRef.current = true;
      return;
    }
    
    // Si une tentative a déjà été faite ou si le chargement est en cours, ne pas réessayer
    if (refreshAttemptedRef.current || isLoading) {
      return;
    }
    
    // Une seule tentative de rafraîchissement si nécessaire
    const refreshUserData = async () => {
      try {
        refreshAttemptedRef.current = true;
        // Utiliser le refetch du hook useUserData plutôt que d'appeler directement l'API
        await refetch();
      } catch (error) {
        // Ignore error
      }
    };
    
    // Attendre un court instant pour permettre aux données initiales de se charger
    const timeoutId = setTimeout(() => {
      if (!user?.firstName && !refreshAttemptedRef.current) {
        refreshUserData();
      }
    }, 500); // Augmenter le délai pour réduire les chances de conflit
    
    return () => clearTimeout(timeoutId);
  }, [user, refetch, isLoading]);

  // Définir les cartes pour les accès rapides
  const quickAccessCards = [
    {
      title: 'Gestion des utilisateurs',
      description: 'Gérer les utilisateurs',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-50',
      link: '/admin/users',
    },
    {
      title: 'Gestion des rôles',
      description: 'Gérer les rôles des étudiants invités',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-50',
      link: '/recruiter/guest-student-roles',
    },
    {
      title: 'Formations',
      description: 'Gérer et consulter les formations',
      icon: Book,
      color: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-50',
      link: '/formations',
    },
    {
      title: 'Toutes les formations',
      description: 'Voir toutes les formations disponibles',
      icon: Book,
      color: 'from-orange-500 to-orange-600',
      textColor: 'text-orange-50',
      link: '/admin/formations',
    }
  ];

  return (
    <DashboardLayout 
      loading={isLoading} 
      error={error?.message || null}
      user={user}
      headerIcon={ShieldAlert}
      headerTitle="Tableau de bord super administrateur"
    >
      <Card className="border-0 shadow-md mb-6">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Accès rapide</h2>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >
            {quickAccessCards.map((card, index) => (
              <motion.div key={index} variants={itemVariants} className="h-full">
                <Link to={card.link} className="block h-full">
                  <div className="relative h-full overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group">
                    <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-90 group-hover:opacity-100 transition-opacity`}></div>
                    <div className="relative p-5 h-full flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 rounded-lg bg-white/20 backdrop-blur-sm">
                          <card.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="p-1.5 rounded-full bg-white/20 backdrop-blur-sm">
                          <ChevronRight className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      
                      <h2 className="text-xl font-semibold text-white mb-1">
                        {card.title}
                      </h2>
                      <p className="text-white/80 text-sm mb-4">
                        {card.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default SuperAdminDashboard; 