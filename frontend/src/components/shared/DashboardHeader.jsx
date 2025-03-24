import React, { useEffect, useState, useRef, memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Clock, User, Sparkles } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { authService } from '@/lib/services/authService';
import userDataManager from '@/lib/services/userDataManager';
import UserSkeleton from '@/components/ui/UserSkeleton';

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
  
  // État local pour forcer les re-rendus quand les données stables changent
  const [userData, setUserData] = useState({});
  
  // Ajouter des logs pour déboguer les données utilisateur
  useEffect(() => {
    console.log("DashboardHeader - User data received:", user);
    console.log("DashboardHeader - Current stable user data:", stableUserDataRef.current);
    console.log("DashboardHeader - Has complete data:", hasCompleteUserData(user));
    
    // Si nous n'avons pas de données utilisateur valides, essayer de les récupérer de différentes sources
    if (!hasCompleteUserData(user) && !stableUserDataRef.current) {
      // 1. Essayer d'abord userDataManager (cache optimisé)
      try {
        const cachedUserData = userDataManager.getCachedUserData();
        console.log("DashboardHeader - Attempting to get data from userDataManager:", cachedUserData);
        
        if (hasCompleteUserData(cachedUserData)) {
          // Mettre à jour les données stables avec les données du userDataManager
          const newUserData = {
            firstName: cachedUserData.firstName,
            lastName: cachedUserData.lastName,
            profilePicture: cachedUserData.profilePicture || cachedUserData.avatar,
            fullName: `${cachedUserData.firstName} ${cachedUserData.lastName}`
          };
          
          stableUserDataRef.current = newUserData;
          // IMPORTANT: Mettre à jour l'état pour forcer un re-rendu
          setUserData(newUserData);
          
          console.log("DashboardHeader - Using userDataManager cache data as fallback");
          return;
        }
      } catch (error) {
        console.error("DashboardHeader - Error retrieving data from userDataManager:", error);
      }
      
      // 2. Sinon, essayer authService.getMinimalUserData (localStorage)
      try {
        const localStorageData = authService.getMinimalUserData();
        console.log("DashboardHeader - Attempting to get data from localStorage:", localStorageData);
        
        if (hasCompleteUserData(localStorageData)) {
          // Mettre à jour les données stables avec les données du localStorage
          const newUserData = {
            firstName: localStorageData.firstName,
            lastName: localStorageData.lastName,
            profilePicture: localStorageData.profilePicture || localStorageData.avatar,
            fullName: `${localStorageData.firstName} ${localStorageData.lastName}`
          };
          
          stableUserDataRef.current = newUserData;
          // IMPORTANT: Mettre à jour l'état pour forcer un re-rendu
          setUserData(newUserData);
          
          console.log("DashboardHeader - Using localStorage data as fallback");
        }
      } catch (error) {
        console.error("DashboardHeader - Error retrieving data from localStorage:", error);
      }
    }
  }, [user]);
  
  // État pour gérer l'affichage du skeleton
  const [showSkeleton, setShowSkeleton] = useState(false);
  
  // Référence pour le timer de skeleton
  const skeletonTimerRef = useRef(null);
  // Référence pour suivre si les données complètes ont déjà été reçues
  const hasReceivedCompleteDataRef = useRef(false);
  // Référence pour suivre le dernier timestamp où les données ont changé
  const lastDataChangeRef = useRef(Date.now());

  // Obtenir les initiales de l'utilisateur pour l'avatar
  const userInitials = useMemo(() => {
    if (!userData.firstName || !userData.lastName) {
      return user?.firstName && user?.lastName 
        ? `${user.firstName[0]}${user.lastName[0]}` 
        : 'U';
    }
    return `${userData.firstName[0]}${userData.lastName[0]}`;
  }, [user, userData]);

  useEffect(() => {
    // Si les données utilisateur sont partiellement complètes (au moins prénom OU nom)
    if (user && (user.firstName || user.lastName)) {
      console.log("DashboardHeader - Updating with partial data:", { firstName: user.firstName, lastName: user.lastName });
      
      // Mettre à jour les données stables de façon incrémentale
      const newUserData = {
        firstName: user.firstName || stableUserDataRef.current?.firstName,
        lastName: user.lastName || stableUserDataRef.current?.lastName,
        profilePicture: user.profilePicture || user.avatar || stableUserDataRef.current?.profilePicture,
        fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim()
      };
      
      stableUserDataRef.current = newUserData;
      // IMPORTANT: Mettre à jour l'état pour forcer un re-rendu
      setUserData(newUserData);
      
      // Marquer que nous avons reçu des données
      hasReceivedCompleteDataRef.current = true;
      lastDataChangeRef.current = Date.now();
      
      // Masquer le skeleton
      setShowSkeleton(false);
      
      // Nettoyer le timer
      if (skeletonTimerRef.current) {
        clearTimeout(skeletonTimerRef.current);
        skeletonTimerRef.current = null;
      }
    }
    // Si les données utilisateur sont complètes (les deux prénom ET nom)
    else if (hasCompleteUserData(user)) {
      console.log("DashboardHeader - Updating with complete data");
      
      // Marquer que nous avons reçu des données complètes
      hasReceivedCompleteDataRef.current = true;
      lastDataChangeRef.current = Date.now();
      
      // Mettre à jour les données stables si nécessaire
      if (!stableUserDataRef.current || 
          stableUserDataRef.current.firstName !== user.firstName || 
          stableUserDataRef.current.lastName !== user.lastName) {
        const newUserData = {
          firstName: user.firstName,
          lastName: user.lastName,
          profilePicture: user.profilePicture || user.avatar,
          fullName: `${user.firstName} ${user.lastName}`
        };
        
        stableUserDataRef.current = newUserData;
        // IMPORTANT: Mettre à jour l'état pour forcer un re-rendu
        setUserData(newUserData);
      }
      
      // Masquer le skeleton
      setShowSkeleton(false);
      
      // Nettoyer le timer
      if (skeletonTimerRef.current) {
        clearTimeout(skeletonTimerRef.current);
        skeletonTimerRef.current = null;
      }
    }
    // Si les données sont absentes mais que nous n'avons pas encore de données stables
    else if (!hasCompleteUserData(user) && !stableUserDataRef.current) {
      console.log("DashboardHeader - No data available, showing skeleton soon");
      // Si le timer n'est pas déjà programmé, programmer l'affichage du skeleton
      if (!skeletonTimerRef.current) {
        skeletonTimerRef.current = setTimeout(() => {
          setShowSkeleton(true);
        }, 300); // Délai court pour éviter les flashs lors des chargements rapides
      }
    }
    // Si les données redeviennent incomplètes après avoir été complètes
    else if (stableUserDataRef.current && hasReceivedCompleteDataRef.current) {
      // Calculer le temps écoulé depuis les dernières données valides
      const timeSinceLastValidData = Date.now() - lastDataChangeRef.current;
      console.log("DashboardHeader - Using stable data, time since last valid data:", timeSinceLastValidData);
      
      // Ne montrer le skeleton que si les données sont absentes depuis longtemps (10s)
      // Sinon, continuer à utiliser les données stables
      if (timeSinceLastValidData > 10000) {
        console.log("DashboardHeader - Data missing for too long, showing skeleton");
        setShowSkeleton(true);
      }
    }
    
    // Nettoyage à la destruction du composant
    return () => {
      if (skeletonTimerRef.current) {
        clearTimeout(skeletonTimerRef.current);
      }
    };
  }, [user]);
  
  // Log final des données affichées
  useEffect(() => {
    console.log("DashboardHeader - Final display data:", userData);
  }, [userData]);
  
  // Récupérer les données à afficher directement depuis l'état
  const { firstName, lastName, profilePicture } = userData;
  
  // Skeleton pour le header
  if (showSkeleton) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 overflow-hidden mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between relative z-10">
          <div className="flex items-center space-x-4">
            {/* Avatar et Info Utilisateur */}
            <UserSkeleton variant="compact" />
            
            {/* Titre et Rôle */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">Bonjour,</span>
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-5 w-5 rounded-full" />
              </div>
              <div className="flex items-center gap-1.5">
                <Skeleton className="h-3.5 w-3.5" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center mt-4 md:mt-0 gap-4">
            {/* Horloge */}
            <div className="flex items-center">
              <Skeleton className="w-5 h-5 mr-2" />
              <Skeleton className="h-6 w-16" />
            </div>
            {/* Bouton Profil */}
            <Skeleton className="h-9 w-[105px] rounded-md" />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
      </motion.div>
    );
  }
  
  // Contenu réel du header
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 overflow-hidden mb-8"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between relative z-10">
        <div className="flex items-center">
          <Avatar className="h-14 w-14 border-2 border-primary">
            <AvatarImage src={profilePicture} alt={firstName} />
            <AvatarFallback className="bg-primary text-primary-foreground">{userInitials}</AvatarFallback>
          </Avatar>
          <div className="ml-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              {firstName ? (
                <>
                  Bonjour, {firstName}{' '}
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
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Bonjour,</span>
                  <Skeleton className="h-8 w-32" />
                </div>
              )}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1.5 mt-1">
              {Icon ? <Icon className="h-3.5 w-3.5 text-primary" /> : <Sparkles className="h-3.5 w-3.5 text-primary" />}
              <span>{roleTitle}</span>
            </p>
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