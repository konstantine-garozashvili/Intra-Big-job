import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { lazy, Suspense, useState, useEffect } from 'react'
import MainLayout from './components/MainLayout'
import { RoleProvider, RoleDashboardRedirect, RoleGuard, ROLES } from './features/roles'
import { showGlobalLoader, hideGlobalLoader } from './lib/utils/loadingUtils'
import LoadingOverlay from './components/LoadingOverlay'
import { AuthProvider } from './contexts/AuthContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { clearChatCache } from './lib/services/chatService'
import { getQueryClient } from './lib/services/queryClient'
import { authService } from './lib/services/authService'
import './index.css'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'
import ProfileLayout from '@/layouts/ProfileLayout'
import useLoadingIndicator from './hooks/useLoadingIndicator'
import TeacherProtectedRoute from './components/TeacherProtectedRoute'
import RecruiterProtectedRoute from './components/RecruiterProtectedRoute'
import StudentRoute from './components/StudentRoute'
import { Toaster } from './components/ui/sonner'

// Create a shared query client for the entire application
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 60 * 60 * 1000, // 1 hour
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      logging: false, // Disable query logging in console
    },
  },
  logger: {
    log: () => {},
    warn: () => {},
    error: () => {}
  }
});

// Export queryClient to be used elsewhere
export { queryClient };

// Import différé des pages pour améliorer les performances
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const RegistrationSuccess = lazy(() => import('./pages/RegistrationSuccess'))
const VerificationSuccess = lazy(() => import('./pages/VerificationSuccess'))
const VerificationError = lazy(() => import('./pages/VerificationError'))

// Lazy loading pour la réinitialisation de mot de passe
const ResetPasswordRequest = lazy(() => import('./components/auth/ResetPasswordRequest'))
const ResetPasswordConfirmation = lazy(() => import('./components/auth/ResetPasswordConfirmation'))
const ResetPassword = lazy(() => import('./components/auth/ResetPassword'))

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
const StudentAttendance = lazy(() => import('./pages/Student/Attendance'))
const TeacherDashboard = lazy(() => import('./pages/Teacher/Dashboard'))
const TeacherSignatureMonitoring = lazy(() => import('./pages/Teacher/SignatureMonitoring'))
const TeacherAttendance = lazy(() => import('./pages/Teacher/Attendance'))
const HRDashboard = lazy(() => import('./pages/HR/Dashboard'))
const SuperAdminDashboard = lazy(() => import('./pages/SuperAdmin/Dashboard'))
const GuestDashboard = lazy(() => import('./pages/Guest/Dashboard'))
const RecruiterDashboard = lazy(() => import('./pages/Recruiter/Dashboard'))

// Nouvelles pages à importer
const FormationList = lazy(() => import('./pages/FormationList'))
const GuestStudentRoleManager = lazy(() => import('./pages/Recruiter/GuestStudentRoleManager'))

// Import du composant HomePage 
const HomePage = lazy(() => import('./components/HomePage'))

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
      // Précharger les composants de réinitialisation de mot de passe
      preloadComponent(() => import('./components/auth/ResetPasswordRequest'));
    } 
    else if (currentPath.includes('/register')) {
      // Sur la page d'enregistrement, précharger la confirmation
      preloadComponent(() => import('./pages/RegistrationSuccess'));
    }
    else if (currentPath.includes('/reset-password')) {
      // Précharger les composants de réinitialisation de mot de passe
      if (currentPath === '/reset-password') {
        preloadComponent(() => import('./components/auth/ResetPasswordConfirmation'));
      } else if (currentPath.includes('/reset-password/confirmation')) {
        preloadComponent(() => import('./components/auth/ResetPassword'));
      }
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
      preloadComponent(() => import('./pages/Student/Attendance'));
    }
    else if (currentPath.includes('/teacher')) {
      preloadComponent(() => import('./pages/Teacher/Dashboard'));
      preloadComponent(() => import('./pages/Teacher/SignatureMonitoring'));
      preloadComponent(() => import('./pages/Teacher/Attendance'));
    }
  }, [currentPath]);
  
  return null;
};

// Composant pour gérer les préchargements
const PrefetchHandler = () => {
  useIntelligentPreload();
  const location = useLocation();
  const queryClient = getQueryClient ? getQueryClient() : queryClient;
  
  // Précharger les données utilisateur
  useEffect(() => {
    // Précharger les données utilisateur dès que l'utilisateur est authentifié
    if (localStorage.getItem('token') && queryClient) {
      const sessionId = authService.getSessionId();
      
      // Précharger les données utilisateur
      queryClient.prefetchQuery({
        queryKey: ['user-data', 'anonymous', sessionId],
        queryFn: async () => {
          const apiService = (await import('./lib/services/apiService')).default;
          return await apiService.get('/me', {}, true, 30 * 60 * 1000);
        },
        staleTime: 30 * 60 * 1000,
        cacheTime: 60 * 60 * 1000
      });
    }
  }, [location.pathname, queryClient]);
  
  // Handle user changes - more reliable now with debounce to prevent race conditions
  useEffect(() => {
    // Import services needed for user change handling
    const handleUserChange = async () => {
      try {
        // Utiliser les imports en haut du fichier plutôt que des imports dynamiques
        console.log('User change detected');
        
        if (!queryClient) {
          console.error('QueryClient not available');
          return;
        }
        
        // Invalidate user-related queries
        queryClient.invalidateQueries({ queryKey: ['user-data'] });
        queryClient.invalidateQueries({ queryKey: ['user'] });
        queryClient.invalidateQueries({ queryKey: ['userRoles'] });
        
        // Invalidate role-specific dashboards
        queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['student-dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['teacher-dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['hr-dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['recruiter-dashboard'] });
        
        // Forcer la mise à jour des rôles sans recharger toute la page
        try {
          await authService.forceRoleRefresh();
        } catch (error) {
          console.error('Error refreshing roles:', error);
        }
      } catch (error) {
        console.error('Error in handleUserChange:', error);
      }
    };

    // Implement a debounced version to prevent multiple rapid triggers
    let debounceTimer;
    const debouncedUserChange = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(handleUserChange, 100);
    };

    // Function for complete cache clear - avoiding window.location.reload()
    const handleCacheClear = () => {
      console.log('Cache clear requested');
      
      if (!queryClient) {
        console.error('QueryClient not available');
        return;
      }
      
      // Force a complete data refresh
      queryClient.clear();
      
      // Instead of forcing a full page reload, trigger a user change event
      // which will refresh all relevant queries
      window.dispatchEvent(new Event('user-change'));
      window.dispatchEvent(new Event('role-change'));
    };

    window.addEventListener('user-change', debouncedUserChange);
    window.addEventListener('cache-clear', handleCacheClear);

    return () => {
      clearTimeout(debounceTimer);
      window.removeEventListener('user-change', debouncedUserChange);
      window.removeEventListener('cache-clear', handleCacheClear);
    };
  }, [queryClient]);
  
  return null;
};

// Composant de chargement optimisé pour Suspense
const SuspenseLoader = () => {
  // Apply app-loading class to show the global loader
  useEffect(() => {
    // Just use the global loader directly
    showGlobalLoader();
    
    return () => {
      // Just hide the global loader on unmount
      hideGlobalLoader();
    };
  }, []);
  
  // No need to render anything - handled by the global loader
  return null;
};

// Composant de contenu principal qui utilise les hooks de React Router
const AppContent = () => {
  const [isNavigating, setIsNavigating] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const navigate = useNavigate();
  
  // Use the loading indicator hook to hide the browser's default loading indicator
  useLoadingIndicator();
  
  // Écouteur d'événement pour la navigation après déconnexion
  useEffect(() => {
    const handleLogoutNavigation = (event) => {
      // Référence pour éviter les déclenchements multiples
      if (window.__isLoggingOut) return;
      window.__isLoggingOut = true;
      
      // Toujours rediriger vers /login
      const redirectTo = '/login';
      
      // Clear chat cache using the utility function
      clearChatCache(queryClient);
      
      // Show loader during navigation
      setShowLoader(true);
      
      // Set navigating state to true
      setIsNavigating(true);
      
      // Utiliser la redirection avec replace pour éviter l'historique
      navigate(redirectTo, { replace: true });
      
      // Attendre que la navigation soit terminée avant de masquer le loader
      setTimeout(() => {
        setIsNavigating(false);
        setTimeout(() => {
          setShowLoader(false);
          
          // Réinitialiser le flag après un délai suffisant
          setTimeout(() => {
            window.__isLoggingOut = false;
          }, 500);
        }, 100);
      }, 300);
    };

    const handleLoginSuccess = () => {
      // Show loader during login
      setShowLoader(true);
      
      // Keep loader visible for a minimum time
      setTimeout(() => {
        // Hide loader after navigation is complete
        setShowLoader(false);
      }, 500);
    };

    // Listen for logout navigation events
    window.addEventListener('logout-success', handleLogoutNavigation);
    window.addEventListener('login-success', handleLoginSuccess);
    
    return () => {
      window.removeEventListener('logout-success', handleLogoutNavigation);
      window.removeEventListener('login-success', handleLoginSuccess);
    };
  }, [navigate]);

  return (
    <div className="relative font-poppins">
      <PrefetchHandler />
      
      {/* Guaranteed loader that will always be visible during transitions */}
      <LoadingOverlay isVisible={showLoader} />
      
      {/* Wrapper pour le contenu principal avec z-index positif */}
      <div className={`relative z-10 transition-opacity duration-200 ${isNavigating ? 'opacity-0' : 'opacity-100'}`}>
        <Suspense fallback={<SuspenseLoader />}>
          <RoleProvider>
            <div>
              <Routes>
                {/* Structure révisée: MainLayout englobe toutes les routes pour préserver la navbar */}
                <Route element={<MainLayout />}>
                  {/* Route racine avec redirection automatique */}
                  <Route path="/" element={<HomePage />} />
                  
                  {/* Routes publiques - Accès interdit aux utilisateurs authentifiés */}
                  <Route element={<PublicRoute />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/registration-success" element={<RegistrationSuccess />} />
                    <Route path="/verification-success" element={<VerificationSuccess />} />
                    <Route path="/verification-error" element={<VerificationError />} />
                    {/* Routes de réinitialisation de mot de passe */}
                    <Route path="/reset-password" element={<ResetPasswordRequest />} />
                    <Route path="/reset-password/confirmation" element={<ResetPasswordConfirmation />} />
                    <Route path="/reset-password/:token" element={<ResetPassword />} />
                  </Route>
                  
                  <Route element={<ProtectedRoute />}>
                    {/* Regular protected routes */}
                    <Route path="/dashboard" element={<RoleDashboardRedirect />} />
                    
                    {/* Profile view route */}
                    <Route path="/profile" element={<ProfileView />} />
                    <Route path="/profile/:userId" element={<ProfileView />} />
                    
                    {/* Settings routes avec ProfileLayout */}
                    <Route element={<ProfileLayout />}>
                      <Route path="/settings" element={<Navigate to="/settings/profile" replace />} />
                      <Route path="/settings/profile" element={<SettingsProfile />} />
                      <Route path="/settings/career" element={<CareerSettings />} />
                      <Route path="/settings/security" element={<SecuritySettings />} />
                      <Route path="/settings/notifications" element={<NotificationSettings />} />
                    </Route>
                    
                    {/* Routes pour la gestion des formations - accessible par teachers, admins, superadmins et recruiters */}
                    <Route path="/formations" element={
                      <RoleGuard 
                        roles={[ROLES.TEACHER, ROLES.ADMIN, ROLES.SUPERADMIN, ROLES.RECRUITER]} 
                        fallback={<Navigate to="/dashboard" replace />}
                      >
                        <FormationList />
                      </RoleGuard>
                    } />
                    
                    {/* Routes pour la gestion des rôles - accessible par recruiters, admins et superadmins */}
                    <Route path="/recruiter/guest-student-roles" element={
                      <RoleGuard 
                        roles={[ROLES.RECRUITER, ROLES.ADMIN, ROLES.SUPERADMIN]} 
                        fallback={<Navigate to="/dashboard" replace />}
                      >
                        <GuestStudentRoleManager />
                      </RoleGuard>
                    } />
                    
                    {/* Routes Admin */}
                    <Route path="/admin/dashboard" element={
                      <RoleGuard roles={ROLES.ADMIN} fallback={<Navigate to="/dashboard" replace />}>
                        <AdminDashboard />
                      </RoleGuard>
                    } />
                    
                    {/* Routes étudiantes */}
                    <Route path="/student">
                      <Route path="dashboard" element={
                        <RoleGuard roles={ROLES.STUDENT} fallback={<Navigate to="/dashboard" replace />}>
                          <StudentDashboard />
                        </RoleGuard>
                      } />
                      <Route path="schedule" element={
                        <RoleGuard roles={ROLES.STUDENT} fallback={<Navigate to="/dashboard" replace />}>
                          <StudentSchedule />
                        </RoleGuard>
                      } />
                      <Route path="grades" element={
                        <RoleGuard roles={ROLES.STUDENT} fallback={<Navigate to="/dashboard" replace />}>
                          <StudentGrades />
                        </RoleGuard>
                      } />
                      <Route path="absences" element={
                        <RoleGuard roles={ROLES.STUDENT} fallback={<Navigate to="/dashboard" replace />}>
                          <StudentAbsences />
                        </RoleGuard>
                      } />
                      <Route path="projects" element={
                        <RoleGuard roles={ROLES.STUDENT} fallback={<Navigate to="/dashboard" replace />}>
                          <StudentProjects />
                        </RoleGuard>
                      } />
                      {/* Ajout de la route d'assiduité pour étudiants */}
                      <Route element={<StudentRoute />}>
                        <Route path="attendance" element={<StudentAttendance />} />
                      </Route>
                    </Route>
                    
                    {/* Routes enseignantes */}
                    <Route path="/teacher">
                      <Route path="dashboard" element={
                        <RoleGuard roles={ROLES.TEACHER} fallback={<Navigate to="/dashboard" replace />}>
                          <TeacherDashboard />
                        </RoleGuard>
                      } />
                      {/* Ajout de la route d'émargement pour les enseignants */}
                      <Route path="attendance" element={
                        <RoleGuard roles={ROLES.TEACHER} fallback={<Navigate to="/dashboard" replace />}>
                          <TeacherAttendance />
                        </RoleGuard>
                      } />
                      {/* Ajout de la route de surveillance des signatures */}
                      <Route path="signature-monitoring" element={
                        <RoleGuard roles={ROLES.TEACHER} fallback={<Navigate to="/dashboard" replace />}>
                          <TeacherSignatureMonitoring />
                        </RoleGuard>
                      } />
                    </Route>
                    
                    {/* Routes HR */}
                    <Route path="/hr/dashboard" element={
                      <RoleGuard roles={ROLES.HR} fallback={<Navigate to="/dashboard" replace />}>
                        <HRDashboard />
                      </RoleGuard>
                    } />
                    
                    {/* Routes Super Admin */}
                    <Route path="/superadmin/dashboard" element={
                      <RoleGuard roles={ROLES.SUPERADMIN} fallback={<Navigate to="/dashboard" replace />}>
                        <SuperAdminDashboard />
                      </RoleGuard>
                    } />
                    
                    {/* Routes Guest */}
                    <Route path="/guest/dashboard" element={
                      <RoleGuard roles={ROLES.GUEST} fallback={<Navigate to="/dashboard" replace />}>
                        <GuestDashboard />
                      </RoleGuard>
                    } />
                    
                    {/* Routes Recruiter */}
                    <Route path="/recruiter/dashboard" element={
                      <RoleGuard roles={ROLES.RECRUITER} fallback={<Navigate to="/dashboard" replace />}>
                        <RecruiterDashboard />
                      </RoleGuard>
                    } />
                  </Route>
                  
                  {/* Redirection des routes inconnues vers la page d'accueil */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </div>
          </RoleProvider>
          <Toaster />
        </Suspense>
      </div>
    </div>
  );
};

// Composant App principal qui configure le Router
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RoleProvider>
          <Router>
            <Suspense fallback={<SuspenseLoader />}>
              <AppContent />
            </Suspense>
          </Router>
        </RoleProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
