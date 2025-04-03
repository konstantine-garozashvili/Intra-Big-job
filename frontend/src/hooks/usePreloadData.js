import { useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePrefetchQuery } from './useReactQuery';
import { getSessionId } from '@/lib/services/authService';

// Map des préchargements par route
const PRELOAD_MAP = {
  // Profile & Settings
  '/profile': [
    { endpoint: '/api/me', key: 'user-profile' },
    { endpoint: '/api/profile/picture', key: 'profile-picture' }
  ],
  '/settings/profile': [
    { endpoint: '/api/me', key: 'user-profile' },
    { endpoint: '/api/profile/picture', key: 'profile-picture' }
  ],
  '/settings/security': [
    { endpoint: '/api/me', key: 'user-profile' },
    { endpoint: '/api/security/options', key: 'security-options' }
  ],
  '/settings/notifications': [
    { endpoint: '/api/notifications/settings', key: 'notification-settings' }
  ],
  
  // Dashboards
  '/dashboard': [
    { endpoint: '/api/me', key: 'user-profile' },
    { endpoint: '/api/notifications', key: 'notifications' }
  ],
  '/student/dashboard': [
    { endpoint: '/api/student/overview', key: 'student-overview' },
    { endpoint: '/api/student/schedule/upcoming', key: 'upcoming-classes' }
  ],
  '/admin/dashboard': [
    { endpoint: '/api/admin/stats', key: 'admin-stats' },
    { endpoint: '/api/users/recent', key: 'recent-users' }
  ],
  '/teacher/dashboard': [
    { endpoint: '/api/teacher/schedule', key: 'teacher-schedule' },
    { endpoint: '/api/teacher/students', key: 'teacher-students' }
  ],
  
  // Student-specific pages
  '/student/schedule': [
    { endpoint: '/api/student/schedule', key: 'full-schedule' }
  ],
  '/student/grades': [
    { endpoint: '/api/student/grades', key: 'grades' }
  ],
  '/student/absences': [
    { endpoint: '/api/student/absences', key: 'absences' }
  ],
  
  // Other common pages
  '/tickets': [
    { endpoint: '/api/tickets', key: 'tickets' }
  ]
};

/**
 * Hook pour précharger les données en fonction de la navigation de l'utilisateur
 * Optimise les performances en préchargeant intelligemment les données avant la navigation
 */
export function usePreloadData() {
  const location = useLocation();
  const navigate = useNavigate();
  const sessionId = getSessionId();
  
  // Précharger les données pour les routes potentielles
  useEffect(() => {
    // Uniquement si l'utilisateur est authentifié
    if (!sessionId) return;
    
    const currentPath = location.pathname;
    
    // Identifier les routes potentielles basées sur le chemin actuel
    const potentialRoutes = [];
    
    // Logique pour prédire les prochaines destinations probables de l'utilisateur
    if (currentPath.startsWith('/dashboard')) {
      // Depuis le dashboard, l'utilisateur ira probablement vers son profil ou les tickets
      potentialRoutes.push('/profile', '/tickets');
      
      // Si c'est un étudiant, ajouter les routes étudiantes probables
      if (currentPath === '/student/dashboard') {
        potentialRoutes.push('/student/schedule', '/student/grades');
      }
      // Si c'est un enseignant, ajouter les routes enseignantes probables
      else if (currentPath === '/teacher/dashboard') {
        potentialRoutes.push('/teacher/attendance', '/teacher/signature-monitoring');
      }
      // Si c'est un administrateur, ajouter les routes admin probables
      else if (currentPath === '/admin/dashboard') {
        potentialRoutes.push('/admin/users', '/admin/tickets');
      }
    } 
    else if (currentPath === '/profile') {
      // Depuis le profil, l'utilisateur ira probablement vers les paramètres
      potentialRoutes.push('/settings/profile', '/dashboard');
    }
    else if (currentPath.startsWith('/settings')) {
      // Depuis les paramètres, l'utilisateur naviguera probablement entre les sections
      const settingsSections = [
        '/settings/profile', 
        '/settings/security', 
        '/settings/notifications', 
        '/settings/career'
      ];
      
      // Filtrer la section actuelle
      potentialRoutes.push(...settingsSections.filter(section => section !== currentPath));
    }
    else if (currentPath.startsWith('/student')) {
      // Pour un étudiant, précharger d'autres sections étudiantes
      const studentSections = [
        '/student/dashboard',
        '/student/schedule',
        '/student/grades',
        '/student/absences',
        '/student/projects'
      ];
      potentialRoutes.push(...studentSections.filter(section => section !== currentPath));
    }
    else if (currentPath.startsWith('/teacher')) {
      // Pour un enseignant, précharger d'autres sections enseignantes
      const teacherSections = [
        '/teacher/dashboard',
        '/teacher/attendance',
        '/teacher/signature-monitoring'
      ];
      potentialRoutes.push(...teacherSections.filter(section => section !== currentPath));
    }
    
    // Limiter le nombre de routes préchargées pour économiser la bande passante
    const routesToPreload = potentialRoutes.slice(0, 3);
    
    // Précharger les données pour les routes potentielles
    for (const route of routesToPreload) {
      const preloadConfig = PRELOAD_MAP[route];
      if (preloadConfig) {
        for (const { endpoint, key } of preloadConfig) {
          const { prefetch } = usePrefetchQuery(endpoint, key, {
            // Ne pas forcer le rechargement pour économiser la bande passante
            force: false,
            // Limiter le staleTime pour les préchargements
            staleTime: 2 * 60 * 1000 // 2 minutes
          });
          
          // Précharger en arrière-plan avec une faible priorité
          setTimeout(() => {
            prefetch().catch(() => {
              // Ignorer les erreurs de préchargement
            });
          }, 500);
        }
      }
    }
  }, [location.pathname, sessionId]);
  
  // Fonction pour naviguer avec préchargement
  const navigateWithPreload = useCallback((to, options = {}) => {
    // Ne rien faire si on navigue déjà vers la même page
    if (location.pathname === to) return;
    
    const targetPath = typeof to === 'string' ? to : to.pathname;
    const preloadConfig = PRELOAD_MAP[targetPath];
    
    // Si des données de préchargement sont définies pour cette route, les précharger
    if (preloadConfig && preloadConfig.length > 0) {
      // Précharger toutes les données en parallèle
      const preloadPromises = preloadConfig.map(({ endpoint, key }) => {
        const { prefetch } = usePrefetchQuery(endpoint, key);
        return prefetch().catch(() => {
          // Ignorer les erreurs de préchargement
        });
      });
      
      // Attendre un court délai ou la fin du préchargement, selon le premier
      const timeoutPromise = new Promise(resolve => setTimeout(resolve, 300));
      
      // Naviguer immédiatement sans attendre si le préchargement prend trop de temps
      Promise.race([Promise.all(preloadPromises), timeoutPromise]).finally(() => {
        navigate(to, options);
      });
    } else {
      // Naviguer directement s'il n'y a pas de préchargement défini
      navigate(to, options);
    }
  }, [navigate, location.pathname]);
  
  return { 
    navigateWithPreload,
    preloadRoute: async (route) => {
      const preloadConfig = PRELOAD_MAP[route];
      if (preloadConfig) {
        for (const { endpoint, key } of preloadConfig) {
          const { prefetch } = usePrefetchQuery(endpoint, key);
          await prefetch().catch(() => {
            // Ignorer les erreurs de préchargement
          });
        }
        
        return true;
      }
      
      return false;
    }
  };
} 