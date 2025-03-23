import React, { useEffect, useState, useRef, memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Clock, User, Sparkles } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const getInitials = (firstName, lastName) => {
  if (!firstName || !lastName) return '?';
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

/**
 * Vérifie si les données utilisateur sont complètes
 * @param {Object} userData - Données utilisateur à vérifier
 * @returns {boolean} - true si les données sont complètes
 */
const hasCompleteUserData = (userData) => {
  return Boolean(
    userData && 
    typeof userData === 'object' && 
    userData.firstName && 
    userData.lastName
  );
};

/**
 * En-tête du tableau de bord avec affichage optimisé des informations utilisateur
 * Utilise un système de chargement progressif pour éviter les flashs de skeleton
 * Design inspiré du tableau de bord étudiant
 */
const DashboardHeader = ({ user, icon: Icon, roleTitle }) => {
  // Données utilisateur stables (ne seront jamais réinitialisées à null une fois définies)
  const stableUserDataRef = useRef(null);
  
  // État de chargement initial et affiché
  const [loading, setLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(false);
  
  // Délai avant d'afficher le skeleton pour éviter les flashs sur les chargements rapides
  const skeletonTimerRef = useRef(null);
  // Référence pour suivre si les données complètes ont déjà été reçues
  const hasReceivedCompleteDataRef = useRef(false);
  // Référence pour suivre le dernier timestamp où les données ont changé
  const lastDataChangeRef = useRef(Date.now());

  // Obtenir les initiales de l'utilisateur pour l'avatar
  const userInitials = useMemo(() => {
    if (!stableUserDataRef.current?.firstName || !stableUserDataRef.current?.lastName) {
      return user?.firstName && user?.lastName 
        ? `${user.firstName[0]}${user.lastName[0]}` 
        : 'U';
    }
    return `${stableUserDataRef.current.firstName[0]}${stableUserDataRef.current.lastName[0]}`;
  }, [user, stableUserDataRef.current]);

  useEffect(() => {
    // Phase 1: Démarrer le timer pour afficher le skeleton après un délai
    // seulement si on n'a pas encore de données stables
    if (!stableUserDataRef.current && !skeletonTimerRef.current) {
      skeletonTimerRef.current = setTimeout(() => {
        setShowSkeleton(true);
      }, 300); // délai court pour éviter le flash de skeleton
    }

    // Phase 2: Mettre à jour les données stables si on reçoit des données complètes
    if (hasCompleteUserData(user)) {
      // Marquer qu'on a reçu des données complètes
      hasReceivedCompleteDataRef.current = true;
      lastDataChangeRef.current = Date.now();
      
      // Mettre à jour les données stables seulement si nécessaire
      if (!stableUserDataRef.current || 
          stableUserDataRef.current.firstName !== user.firstName || 
          stableUserDataRef.current.lastName !== user.lastName) {
        stableUserDataRef.current = {
          firstName: user.firstName,
          lastName: user.lastName,
          profilePicture: user.profilePicture || user.avatar,
          fullName: `${user.firstName} ${user.lastName}`
        };
      }
      
      // Enlever l'état de chargement
      setLoading(false);
      setShowSkeleton(false);
      
      // Nettoyer le timer si nécessaire
      if (skeletonTimerRef.current) {
        clearTimeout(skeletonTimerRef.current);
        skeletonTimerRef.current = null;
      }
    } 
    // Phase 3: Si les données deviennent incomplètes après avoir eu des données complètes
    else if (stableUserDataRef.current && hasReceivedCompleteDataRef.current) {
      // Si nous avons déjà des données stables, ne pas revenir au skeleton
      // à moins que cela ne persiste pendant une longue période (10 secondes)
      const timeSinceLastValidData = Date.now() - lastDataChangeRef.current;
      if (timeSinceLastValidData > 10000) {
        // Si ça fait plus de 10s sans données valides, montrer le skeleton
        setShowSkeleton(true);
      } else {
        // Sinon, continuer à utiliser les données stables - pas de skeleton
        setShowSkeleton(false);
      }
    }
    // Phase 4: Si on a un user mais sans données complètes et qu'on n'a jamais reçu de données complètes
    else if (user && !hasReceivedCompleteDataRef.current) {
      // Après 2 secondes, montrer le skeleton si on n'a toujours pas de données complètes
      if (!skeletonTimerRef.current) {
        skeletonTimerRef.current = setTimeout(() => {
          setShowSkeleton(true);
        }, 2000);
      }
    }
    
    // Nettoyage à la destruction du composant
    return () => {
      if (skeletonTimerRef.current) {
        clearTimeout(skeletonTimerRef.current);
      }
    };
  }, [user]);
  
  // Récupérer les données à afficher (données stables ou skeleton)
  const displayData = stableUserDataRef.current || {};
  const { firstName, lastName, profilePicture } = displayData;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 overflow-hidden mb-8"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between relative z-10">
        <div className="flex items-center">
          {showSkeleton ? (
            <Skeleton className="h-14 w-14 rounded-full" />
          ) : (
            <Avatar className="h-14 w-14 border-2 border-primary">
              <AvatarImage src={profilePicture} alt={firstName} />
              <AvatarFallback className="bg-primary text-primary-foreground">{userInitials}</AvatarFallback>
            </Avatar>
          )}
          <div className="ml-4">
            {showSkeleton ? (
              <div className="space-y-2">
                <Skeleton className="h-7 w-40" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                  Bonjour, {firstName || 'Utilisateur'}{' '}
                  <span className="inline-block ml-2">
                    <motion.div 
                      className="w-5 h-5 text-yellow-500"
                      animate={{
                        rotate: [0, 20, 0, -20, 0],
                        scale: [1, 1.2, 1, 1.2, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </span>
                </h1>
                <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1.5 mt-1">
                  {Icon ? <Icon className="h-3.5 w-3.5 text-primary" /> : <Sparkles className="h-3.5 w-3.5 text-primary" />}
                  <span>{roleTitle}</span>
                </p>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center mt-4 md:mt-0 gap-3">
          <div className="flex items-center mr-4">
            <Clock className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400" />
            <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span>
          </div>
          <Link to="/profile">
            <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Mon profil</span>
            </Button>
          </Link>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
    </motion.div>
  );
};

// Optimisation pour éviter les re-rendus inutiles avec une fonction de comparaison personnalisée
export default memo(DashboardHeader, (prevProps, nextProps) => {
  // Si les deux props sont nulles ou indéfinies, ne pas re-rendre
  if (!prevProps.user && !nextProps.user) return true;
  
  // Si l'un est défini et l'autre non, re-rendre
  if (!prevProps.user || !nextProps.user) return false;
  
  // Si les données essentielles changent, re-rendre
  if (prevProps.user?.firstName !== nextProps.user?.firstName) return false;
  if (prevProps.user?.lastName !== nextProps.user?.lastName) return false;
  if (prevProps.user?.profilePicture !== nextProps.user?.profilePicture) return false;
  if (prevProps.user?.avatar !== nextProps.user?.avatar) return false;
  if (prevProps.roleTitle !== nextProps.roleTitle) return false;
  
  // Dans tous les autres cas, ne pas re-rendre
  return true;
}); 