import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom'
import { lazy, Suspense, useEffect, useRef, useCallback } from 'react'
import MainLayout from './components/MainLayout'
import { RoleProvider, RoleDashboardRedirect, RoleGuard, ROLES } from './features/roles'
import { AuthProvider } from './contexts/AuthContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'
import ProfileLayout from './layouts/ProfileLayout'
import StudentRoute from './components/StudentRoute'
import { Toaster } from './components/ui/sonner'
import { ErrorBoundary } from "react-error-boundary"
import { ThemeProvider } from './context/ThemeContext';

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
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const RegistrationSuccess = lazy(() => import('./pages/RegistrationSuccess'));
const VerificationSuccess = lazy(() => import('./pages/VerificationSuccess'));
const VerificationError = lazy(() => import('./pages/VerificationError'));
const ResetPasswordRequest = lazy(() => import('./components/Auth/ResetPasswordRequest'));
const ResetPasswordConfirmation = lazy(() => import('./components/Auth/ResetPasswordConfirmation'));
const ResetPassword = lazy(() => import('./components/Auth/ResetPassword'));
const StudentDashboard = lazy(() => import('./pages/Student/Dashboard'));
const TeacherDashboard = lazy(() => import('./pages/Teacher/Dashboard'));
const RecruiterDashboard = lazy(() => import('./pages/Recruiter/Dashboard'));
const AdminDashboard = lazy(() => import('./pages/Admin/Dashboard'));
const SuperAdminDashboard = lazy(() => import('./pages/SuperAdmin/Dashboard'));
const GuestDashboard = lazy(() => import('./pages/Guest/Dashboard'));
const HRDashboard = lazy(() => import('./pages/HR/Dashboard'));
const ProfileView = lazy(() => import('./pages/Global/Profile/views/ProfileView'));
const SettingsProfile = lazy(() => import('./pages/Global/Profile/views/SettingsProfile'));
const CareerSettings = lazy(() => import('./pages/Global/Profile/views/CareerSettings'));
const SecuritySettings = lazy(() => import('./pages/Global/Profile/views/SecuritySettings'));
const NotificationSettings = lazy(() => import('./pages/Global/Profile/views/NotificationSettings'));
const FormationList = lazy(() => import('./pages/FormationList'));
const GuestStudentRoleManager = lazy(() => import('./pages/Recruiter/GuestStudentRoleManager'));
const SkillAssessment = lazy(() => import('./pages/Games'));
const VisualConcept = lazy(() => import('./pages/VisualConcept'));
const FormationFinder = lazy(() => import('./pages/FormationFinder'));

// Formation pages
const WebDevelopment = lazy(() => import('./pages/formations/WebDevelopment'));
const Cybersecurity = lazy(() => import('./pages/formations/Cybersecurity'));
const ArtificialIntelligence = lazy(() => import('./pages/formations/ArtificialIntelligence'));
const DataScience = lazy(() => import('./pages/formations/DataScience'));
const MobileDevelopment = lazy(() => import('./pages/formations/MobileDevelopment'));
const GameDevelopment = lazy(() => import('./pages/formations/GameDevelopment'));
const AllFormations = lazy(() => import('./pages/AllFormations'));
const FormationThemeWrapper = lazy(() => import('./components/formations/FormationThemeWrapper'));

// Lazy load student components
const StudentSchedule = lazy(() => import('./pages/Student/Schedule'));
const StudentGrades = lazy(() => import('./pages/Student/Grades'));
const StudentAbsences = lazy(() => import('./pages/Student/Absences'));
const StudentProjects = lazy(() => import('./pages/Student/Projects'));
const StudentAttendance = lazy(() => import('./pages/Student/Attendance'));

// Lazy load teacher components
const TeacherAttendance = lazy(() => import('./pages/Teacher/Attendance'));
const TeacherSignatureMonitoring = lazy(() => import('./pages/Teacher/SignatureMonitoring'));

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
      preloadComponent(() => import('./pages/Register'));
      // Précharger les composants de réinitialisation de mot de passe
      preloadComponent(() => import('./components/Auth/ResetPasswordRequest'));
    } 
    else if (currentPath.includes('/register')) {
      // Sur la page d'enregistrement, précharger la confirmation
      preloadComponent(() => import('./pages/RegistrationSuccess'));
    }
    else if (currentPath.includes('/reset-password')) {
      // Précharger les composants de réinitialisation de mot de passe
      if (currentPath === '/reset-password') {
        preloadComponent(() => import('./components/Auth/ResetPasswordConfirmation'));
      } else if (currentPath.includes('/reset-password/confirmation')) {
        preloadComponent(() => import('./components/Auth/ResetPassword'));
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

// Component for handling prefetching and setting up environment
const AppInitializer = () => {
  useEffect(() => {
    // Expose queryClient for debugging purposes
    window.queryClient = queryClient;
    
    // Expose userDataManager for debugging
    import('./lib/services/userDataManager')
      .then(({ default: userDataManager }) => {
        window.userDataManager = userDataManager;
      });
    

      
    // Set up QueryClient
    import('./lib/services/queryClient')
      .then(({ setQueryClient }) => {
        setQueryClient(queryClient);
      });
      
  }, []);
  
  return null;
};

// Composant pour gérer les préchargements
const PrefetchHandler = () => {
  useIntelligentPreload();
  const location = useLocation();
  
  // Effet pour initialiser userDataManager
  useEffect(() => {
    // Importer et initialiser userDataManager
    import('./lib/services/userDataManager')
      .then(({ default: userDataManager }) => {
        // Attacher userDataManager à window pour le débogage
        window.userDataManager = userDataManager;
        
        // Afficher des informations de débogage en mode développement
        if (import.meta.env.DEV) {
          console.log('[Dev] userDataManager disponible globalement via window.userDataManager');
        }
      });
  }, []);
  
  useEffect(() => {
    // Précharger les données utilisateur dès que l'utilisateur est authentifié
    if (localStorage.getItem('token')) {
      // Importer les modules nécessaires de manière dynamique
      import('./lib/services/userDataManager')
        .then(({ default: userDataManager }) => {
          // Précharger les données utilisateur en arrière-plan
          userDataManager.getUserData({
            forceRefresh: false,
            useCache: true,
            background: true
          }).catch(error => {
            console.warn('Erreur lors du préchargement des données utilisateur:', error);
          });
        });
    }
  }, [location.pathname]);
  
  // Ajouter un écouteur d'événement pour forcer l'actualisation des données utilisateur lors d'un changement d'utilisateur
  useEffect(() => {
    const handleUserChange = () => {
      // Importer dynamiquement le module userDataManager
      import('./lib/services/userDataManager')
        .then(({ default: userDataManager }) => {
          // Invalider le cache pour forcer un rechargement des données
          userDataManager.invalidateCache();
          
          // Ensuite précharger les nouvelles données
          userDataManager.getUserData({
            forceRefresh: true,
            useCache: false
          }).catch(error => {
            console.warn('Erreur lors du rechargement des données utilisateur:', error);
          });
          
          // Importer React Query pour invalider les requêtes spécifiques
          import('./lib/services/queryClient').then(({ getQueryClient }) => {
            const qc = getQueryClient();
            if (qc) {
              // Invalider également les requêtes de dashboard
              qc.invalidateQueries({ queryKey: ['teacher-dashboard'] });
              qc.invalidateQueries({ queryKey: ['admin-users'] });
              qc.invalidateQueries({ queryKey: ['admin-dashboard'] });
              qc.invalidateQueries({ queryKey: ['student-dashboard'] });
              qc.invalidateQueries({ queryKey: ['hr-dashboard'] });
            }
          });
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

// Composant de contenu principal qui utilise les hooks de React Router
const AppContent = () => {
  const navigate = useNavigate();
  const navigationTimeoutRef = useRef(null);
  const isProcessingRef = useRef(false);
  const mountedRef = useRef(true);
  
  // Cache for navigation decisions to avoid redundant token parsing
  const roleCache = useRef({
    lastToken: null,
    dashboardPath: '/dashboard'
  });
  
  // Get dashboard route by role, with caching
  const getDashboardByRole = useCallback(() => {
    const token = localStorage.getItem('token');
    
    // Return cached result if token hasn't changed
    if (token === roleCache.current.lastToken && roleCache.current.dashboardPath) {
      return roleCache.current.dashboardPath;
    }
    
    // Default dashboard path
    let dashboardPath = '/dashboard';
    
    if (token) {
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          if (payload.roles && payload.roles.length > 0) {
            const mainRole = payload.roles[0];
            switch (mainRole) {
              case 'ROLE_ADMIN': dashboardPath = '/admin/dashboard'; break;
              case 'ROLE_SUPERADMIN': dashboardPath = '/superadmin/dashboard'; break;
              case 'ROLE_TEACHER': dashboardPath = '/teacher/dashboard'; break;
              case 'ROLE_STUDENT': dashboardPath = '/student/dashboard'; break;
              case 'ROLE_HR': dashboardPath = '/hr/dashboard'; break;
            }
          }
        }
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
    
    // Cache the result
    roleCache.current = {
      lastToken: token,
      dashboardPath
    };
    
    return dashboardPath;
  }, []);
  
  // Event listeners for authentication events
  useEffect(() => {
    const handleLogoutNavigation = () => {
      if (isProcessingRef.current || !mountedRef.current) return;
      isProcessingRef.current = true;
      
      // Clear any pending navigation first
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
      
      // Fast navigation - don't rely on the event system here
      navigationTimeoutRef.current = setTimeout(() => {
        if (!mountedRef.current) return;
        isProcessingRef.current = false;
        navigate('/login', { replace: true });
      }, 10); // Immediately schedule navigation
    };
    
    const handleLoginSuccess = () => {
      if (isProcessingRef.current || !mountedRef.current) return;
      isProcessingRef.current = true;
      
      // Clear any pending navigation first
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
      
      navigationTimeoutRef.current = setTimeout(() => {
        if (!mountedRef.current) return;
        isProcessingRef.current = false;
        
        const returnTo = sessionStorage.getItem('returnTo');
        if (returnTo) {
          sessionStorage.removeItem('returnTo');
          navigate(returnTo, { replace: true });
        } else {
          // Use cached dashboard path for faster navigation
          navigate(getDashboardByRole(), { replace: true });
        }
      }, 10); // Immediately schedule navigation
    };

    window.addEventListener('logout-success', handleLogoutNavigation);
    window.addEventListener('login-success', handleLoginSuccess);
    
    return () => {
      mountedRef.current = false;
      window.removeEventListener('logout-success', handleLogoutNavigation);
      window.removeEventListener('login-success', handleLoginSuccess);
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, [navigate, getDashboardByRole]);

  return (
    <div className="relative font-poppins">
      <PrefetchHandler />
      
      {/* Wrapper for the main content */}
      <div className="relative z-10">
        <Suspense>
          <RoleProvider>
            <div>
              <Routes>
                {/* Route racine avec Home rendu indépendamment sans MainLayout */}
                <Route path="/" element={<Home />} />
                
                {/* Route pour la page des jeux */}
                <Route path="/skill-assessment" element={<SkillAssessment />} />
                <Route path="/games" element={<Navigate to="/skill-assessment" replace />} />
                
                {/* Formation pages - No authentication required */}
                <Route path="/formations/web" element={
                  <FormationThemeWrapper Component={WebDevelopment} />
                } />
                <Route path="/formations/data-science" element={
                  <FormationThemeWrapper Component={DataScience} />
                } />
                <Route path="/formations/ai" element={
                  <FormationThemeWrapper Component={ArtificialIntelligence} />
                } />
                <Route path="/formations/cybersecurity" element={
                  <FormationThemeWrapper Component={Cybersecurity} />
                } />
                <Route path="/formations/mobile" element={
                  <FormationThemeWrapper Component={MobileDevelopment} />
                } />
                <Route path="/formations/game" element={
                  <FormationThemeWrapper Component={GameDevelopment} />
                } />
                <Route path="/formations/all" element={<AllFormations />} />
                <Route path="/formations/finder" element={<FormationFinder />} />
                
                {/* Standalone Visual Concept page - No authentication required */}
                <Route path="/visual-concept" element={<VisualConcept />} />
                
                <Route element={<MainLayout />}>
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

// Fallback component for error boundary
const ErrorFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
      <h2 className="mb-4 text-2xl font-bold text-red-600">Une erreur est survenue</h2>
      <p className="mb-4 text-gray-600">
        Nous nous excusons pour ce désagrément. Veuillez rafraîchir la page ou réessayer plus tard.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
      >
        Rafraîchir la page
      </button>
    </div>
  </div>
);

// Composant App principal qui configure le Router
const App = () => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <RoleProvider>
              <Router>
                {/* Initialisation des services de l'application */}
                <AppInitializer />
                
                {/* Gestionnaire de préchargement */}
                <PrefetchHandler />
                
                <Suspense>
                  <AppContent />
                </Suspense>
              </Router>
            </RoleProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;