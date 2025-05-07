import React, { useEffect, useState, useRef, memo } from 'react';
import { Link } from 'react-router-dom';
import { Clock, User, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { authService } from '@/lib/services/authService';
import userDataManager from '@/lib/services/userDataManager';
import UserSkeleton from '@/components/ui/UserSkeleton';
import ProfilePictureDisplay from '@/components/ProfilePictureDisplay';
import { useTranslation } from '@/contexts/TranslationContext';

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
  const { translate, currentLanguage } = useTranslation();
  const [translatedTitle, setTranslatedTitle] = useState('');
  const [translatedGreeting, setTranslatedGreeting] = useState('');
  const [translatedProfile, setTranslatedProfile] = useState('');
  
  // Données utilisateur stables (ne seront jamais réinitialisées à null une fois définies)
  const stableUserDataRef = useRef(null);
  
  // État local pour forcer les re-rendus quand les données stables changent
  const [userData, setUserData] = useState({});
  
  // État pour le temps actuel
  const [currentTime, setCurrentTime] = useState(new Date());

  // Effet pour mettre à jour l'heure
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Effet pour traduire les textes statiques
  useEffect(() => {
    const translateTexts = async () => {
      try {
        const [title, greeting, profile] = await Promise.all([
          typeof roleTitle === 'string' ? translate(roleTitle) : roleTitle,
          translate('Bonjour'),
          translate('Mon profil')
        ]);
        setTranslatedTitle(title);
        setTranslatedGreeting(greeting);
        setTranslatedProfile(profile);
      } catch (error) {
        console.error('Translation error:', error);
      }
    };
    translateTexts();
  }, [roleTitle, currentLanguage, translate]);

  // Effet pour gérer les données utilisateur
  useEffect(() => {
    if (!user) return;

    // Si nous avons des données complètes
    if (hasCompleteUserData(user)) {
      const newData = {
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture,
        fullName: `${user.firstName} ${user.lastName}`
      };

      // Mettre à jour les données stables
      stableUserDataRef.current = newData;
      setUserData(newData);
    }
    // Si nous avons des données partielles mais valides
    else if (user.firstName && user.lastName) {
      const partialData = {
        firstName: user.firstName,
        lastName: user.lastName
      };
      console.log('DashboardHeader - Updating with partial data:', partialData);
      setUserData(prev => ({ ...prev, ...partialData }));
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
  const userInitials = getInitials(userData.firstName, userData.lastName);

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
          <div className="relative h-16 w-16 sm:h-12 sm:w-12 md:h-16 md:w-16 lg:h-18 lg:w-18">
            <ProfilePictureDisplay className="w-full h-full" />
          </div>
          <div className="ml-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              {userData.firstName ? (
                <>
                  {translatedGreeting}, {userData.firstName}{' '}
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
                  <span>{translatedGreeting},</span>
                  <Skeleton className="h-8 w-32" />
                </div>
              )}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1.5 mt-1">
              {Icon ? <Icon className="h-3.5 w-3.5 text-primary" /> : <Sparkles className="h-3.5 w-3.5 text-primary" />}
              <span>{translatedTitle}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center mt-4 md:mt-0 gap-3">
          <div className="flex items-center mr-4">
            <Clock className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400" />
            <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              {currentTime.toLocaleTimeString(currentLanguage === 'fr' ? 'fr-FR' : 'en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: currentLanguage !== 'fr'
              })}
            </span>
          </div>
          <Link to="/profile">
            <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90">
              <User className="h-5 w-5" />
              <span className="hidden sm:inline">{translatedProfile}</span>
            </Button>
          </Link>
          {/* Only show for guest role */}
          {user?.role === 'guest' && (
            <Link to="/guest/enrollment-requests">
              <Button size="sm" variant="outline" className="gap-2 ml-2">
                <span className="hidden sm:inline">Mes demandes</span>
              </Button>
            </Link>
          )}
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