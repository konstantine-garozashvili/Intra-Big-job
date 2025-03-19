import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { lazy, Suspense, useState, useEffect } from 'react'
import MainLayout from './components/MainLayout'
import LoginLayout from './components/LoginLayout'
import RegisterLayout from './components/RegisterLayout'
import { RoleProvider, RoleDashboardRedirect, RoleGuard, ROLES } from './features/roles'
import { showGlobalLoader, hideGlobalLoader } from './lib/utils/loadingUtils'
import LoadingOverlay from './components/LoadingOverlay'

// Import différé des pages pour améliorer les performances
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const RegistrationSuccess = lazy(() => import('./pages/RegistrationSuccess'))
const VerificationSuccess = lazy(() => import('./pages/VerificationSuccess'))
const VerificationError = lazy(() => import('./pages/VerificationError'))

// Lazy loading pour le Profil et Dashboard
const SettingsProfile = lazy(() => import('./pages/Global/Profile/views/SettingsProfile'))
const SecuritySettings = lazy(() => import('./pages/Global/Profile/views/SecuritySettings'))
const NotificationSettings = lazy(() => import('./pages/Global/Profile/views/NotificationSettings'))
const CareerSettings = lazy(() => import('./pages/Global/Profile/views/CareerSettings'))
const ProfileView = lazy(() => import('./pages/Global/Profile/views/ProfileView'))
const Dashboard = lazy(() => import('./pages/Dashboard'))

// Dashboards spécifiques par rôle
const AdminDashboard = lazy(() => import('./pages/Admin/Dashboard'))
const StudentDashboard = lazy(() => import('./pages/Student/Dashboard'))
// Pages étudiantes
const StudentSchedule = lazy(() => import('./pages/Student/Schedule'))
const StudentGrades = lazy(() => import('./pages/Student/Grades'))
const StudentAbsences = lazy(() => import('./pages/Student/Absences'))
const StudentProjects = lazy(() => import('./pages/Student/Projects'))
const TeacherDashboard = lazy(() => import('./pages/Teacher/Dashboard'))
const HRDashboard = lazy(() => import('./pages/HR/Dashboard'))
const SuperAdminDashboard = lazy(() => import('./pages/SuperAdmin/Dashboard'))
const GuestDashboard = lazy(() => import('./pages/Guest/Dashboard'))
const RecruiterDashboard = lazy(() => import('./pages/Recruiter/Dashboard'))

// Import du composant HomePage 
const HomePage = lazy(() => import('./components/HomePage'))

import { Toaster } from './components/ui/sonner'
import './index.css'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'
import ProfileLayout from './layouts/ProfileLayout'
import useLoadingIndicator from './hooks/useLoadingIndicator'

// Fonction optimisée pour le préchargement intelligent des pages
// Ne charge que les pages pertinentes en fonction du contexte et du chemin actuel
const useIntelligentPreload = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  useEffect(() => {
    // Fonction pour précharger des composants spécifiques
    const preloadComponent = (getComponent) => {
      // Précharger immédiatement sans délai
      getComponent();
    };
    
    // Préchargement basé sur le chemin actuel
    if (currentPath.includes('/login') || currentPath === '/') {
      // Sur la page de login, précharger le dashboard et l'enregistrement
      preloadComponent(() => import('./pages/Dashboard'));
      preloadComponent(() => import('./pages/Register'));
    } 
    else if (currentPath.includes('/register')) {
      // Sur la page d'enregistrement, précharger la confirmation
      preloadComponent(() => import('./pages/RegistrationSuccess'));
    }
    else if (currentPath.includes('/profile')) {
      // Sur le profil, précharger les sous-pages de profil
      const profilePath = currentPath.split('/').pop();
      
      // Préchargement contextuel des vues de profil
      if (profilePath === 'settings') {
        preloadComponent(() => import('./pages/Global/Profile/views/SecuritySettings'));
      } 
      else if (profilePath === 'security') {
        preloadComponent(() => import('./pages/Global/Profile/views/NotificationSettings'));
      }
      else {
        // Précharger la page de paramètres par défaut
        preloadComponent(() => import('./pages/Global/Profile/views/SettingsProfile'));
      }
    }
    // Préchargement pour les routes spécifiques aux rôles
    else if (currentPath.includes('/admin')) {
      preloadComponent(() => import('./pages/Admin/Dashboard'));
    }
    else if (currentPath.includes('/student')) {
      preloadComponent(() => import('./pages/Student/Dashboard'));
      preloadComponent(() => import('./pages/Student/Schedule'));
    }
    else if (currentPath.includes('/teacher')) {
      preloadComponent(() => import('./pages/Teacher/Dashboard'));
    }
  }, [currentPath]);
  
  return null;
};

// Composant pour gérer les préchargements
const PrefetchHandler = () => {
  useIntelligentPreload();
  const location = useLocation();
  
  useEffect(() => {
    // Précharger les données utilisateur dès que l'utilisateur est authentifié
    if (localStorage.getItem('token')) {
      Promise.all([
        import('./hooks/useDashboardQueries'),
        import('./lib/services/queryClient'),
        import('./lib/services/authService')
      ]).then(([dashboardModule, queryClientModule, authModule]) => {
        const { getQueryClient } = queryClientModule;
        const { getSessionId } = authModule;
        const qc = getQueryClient();
        const sessionId = getSessionId();
        
        if (qc) {
          // Précharger les données utilisateur
          qc.prefetchQuery({
            queryKey: ['user-data', 'anonymous', sessionId],
            queryFn: async () => {
              const { default: apiService } = await import('./lib/services/apiService');
              return await apiService.get('/me', {}, true, 30 * 60 * 1000);
            },
            staleTime: 30 * 60 * 1000,
            cacheTime: 60 * 60 * 1000
          });
        }
      });
    }
  }, [location.pathname]);
  
  // Ajouter un écouteur d'événement pour forcer l'actualisation des données utilisateur lors d'un changement d'utilisateur
  useEffect(() => {
    const handleUserChange = () => {
      // Importer dynamiquement les modules nécessaires
      Promise.all([
        import('./lib/services/queryClient'),
        import('./lib/services/authService')
      ]).then(([queryClientModule, authModule]) => {
        const { getQueryClient } = queryClientModule;
        const { getSessionId } = authModule;
        const qc = getQueryClient();
        const sessionId = getSessionId();
        
        if (qc) {
          // Invalider toutes les requêtes liées à l'utilisateur
          qc.invalidateQueries({ queryKey: ['user-data'] });
          
          // Invalider également les requêtes de dashboard
          qc.invalidateQueries({ queryKey: ['teacher-dashboard'] });
          qc.invalidateQueries({ queryKey: ['admin-users'] });
          qc.invalidateQueries({ queryKey: ['admin-dashboard'] });
          qc.invalidateQueries({ queryKey: ['student-dashboard'] });
          qc.invalidateQueries({ queryKey: ['hr-dashboard'] });
        }
      });
    };
    
    // Fonction pour gérer le nettoyage complet du cache
    const handleCacheCleared = () => {
      // Forcer un rafraîchissement complet des données
      // Cette approche est plus radicale mais garantit que les anciennes données ne persistent pas
      window.location.reload();
    };
    
    // Ajouter les écouteurs d'événements
    window.addEventListener('login-success', handleUserChange);
    window.addEventListener('role-change', handleUserChange);
    window.addEventListener('query-cache-cleared', handleCacheCleared);
    
    // Nettoyer les écouteurs d'événements
    return () => {
      window.removeEventListener('login-success', handleUserChange);
      window.removeEventListener('role-change', handleUserChange);
      window.removeEventListener('query-cache-cleared', handleCacheCleared);
    };
  }, []);
  
  return null;
};

// Composant de chargement optimisé pour Suspense
const SuspenseLoader = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="loader"></div>
    </div>
  );
};

// Composant principal de l'application avec gestion des routes
const AppContent = () => {
  const { isLoading } = useLoadingIndicator();
  const navigate = useNavigate();
  
  // Gestion de la déconnexion avec confirmation/notification utilisateur
  const handleLogoutNavigation = (event) => {
    // Vérifier si l'utilisateur navigue vers une page sensible
    if (event.location.pathname === '/logout') {
      event.preventDefault();
      
      // Montrer un loader pendant la déconnexion
      showGlobalLoader();
      
      // Simuler un délai de traitement pour une meilleure UX
      setTimeout(() => {
        // Effacer les données de session
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('session_id');
        
        // Masquer le loader
        hideGlobalLoader();
        
        // Rediriger vers la page de connexion
        navigate('/login', { replace: true });
      }, 500);
    }
  };
  
  // Gestion de la connexion réussie
  const handleLoginSuccess = () => {
    // Implémenter une logique supplémentaire si nécessaire
  };
  
  return (
    <>
      <PrefetchHandler />
      {isLoading && <LoadingOverlay />}
      <Suspense fallback={<SuspenseLoader />}>
        <Routes>
          {/* Page d'accueil */}
          <Route path="/" element={<HomePage />} />
          
          {/* Routes publiques accessibles uniquement aux utilisateurs non authentifiés */}
          <Route element={<PublicRoute />}>
            <Route path="/registration-success" element={<RegistrationSuccess />} />
            <Route path="/verification-success" element={<VerificationSuccess />} />
            <Route path="/verification-error" element={<VerificationError />} />
          </Route>
          
          {/* Login route with MainLayout and public access control */}
          <Route element={<MainLayout />}>
            <Route element={<LoginLayout />}>
              <Route path="/login" element={<Login />} />
            </Route>
          </Route>
          
          {/* Register route with MainLayout and public access control */}
          <Route element={<MainLayout />}>
            <Route element={<RegisterLayout />}>
              <Route path="/register" element={<Register />} />
            </Route>
          </Route>
          
          {/* Routes protégées accessibles uniquement aux utilisateurs authentifiés */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              {/* Dashboard avec redirection automatique vers le dashboard spécifique au rôle */}
              <Route path="/dashboard" element={<RoleDashboardRedirect />} />
              
              {/* Routes spécifiques aux rôles */}
              <Route path="/admin">
                <Route path="dashboard" element={<RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.HR, ROLES.SUPERADMIN]} element={<AdminDashboard />} />} />
              </Route>
              
              <Route path="/student">
                <Route path="dashboard" element={<RoleGuard allowedRoles={[ROLES.STUDENT]} element={<StudentDashboard />} />} />
                <Route path="schedule" element={<RoleGuard allowedRoles={[ROLES.STUDENT]} element={<StudentSchedule />} />} />
                <Route path="grades" element={<RoleGuard allowedRoles={[ROLES.STUDENT]} element={<StudentGrades />} />} />
                <Route path="absences" element={<RoleGuard allowedRoles={[ROLES.STUDENT]} element={<StudentAbsences />} />} />
                <Route path="projects" element={<RoleGuard allowedRoles={[ROLES.STUDENT]} element={<StudentProjects />} />} />
              </Route>
              
              <Route path="/teacher">
                <Route path="dashboard" element={<RoleGuard allowedRoles={[ROLES.TEACHER]} element={<TeacherDashboard />} />} />
              </Route>
              
              <Route path="/hr">
                <Route path="dashboard" element={<RoleGuard allowedRoles={[ROLES.HR]} element={<HRDashboard />} />} />
              </Route>
              
              <Route path="/superadmin">
                <Route path="dashboard" element={<RoleGuard allowedRoles={[ROLES.SUPERADMIN]} element={<SuperAdminDashboard />} />} />
              </Route>
              
              <Route path="/guest">
                <Route path="dashboard" element={<RoleGuard allowedRoles={[ROLES.GUEST]} element={<GuestDashboard />} />} />
              </Route>
              
              <Route path="/recruiter">
                <Route path="dashboard" element={<RoleGuard allowedRoles={[ROLES.RECRUITER]} element={<RecruiterDashboard />} />} />
              </Route>
              
              {/* Routes de profil utilisateur */}
              <Route path="/profile" element={<ProfileLayout />}>
                <Route index element={<ProfileView />} />
                <Route path="settings" element={<SettingsProfile />} />
                <Route path="security" element={<SecuritySettings />} />
                <Route path="notifications" element={<NotificationSettings />} />
                <Route path="career" element={<CareerSettings />} />
              </Route>
            </Route>
          </Route>
          
          {/* Redirection vers la page d'accueil pour les routes non définies */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <Toaster />
    </>
  );
};

// Composant App avec contexte de gestion des rôles
const App = () => {
  return (
    <Router>
      <RoleProvider>
        <div className="app-container">
          <AppContent />
        </div>
      </RoleProvider>
    </Router>
  );
};

export default App;
