import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom'
import { lazy, Suspense, useEffect, useRef, useCallback } from 'react'
import MainLayout from './components/MainLayout'
import { RoleProvider, RoleDashboardRedirect, RoleGuard, ROLES } from './features/roles'
import { AuthProvider } from './contexts/AuthContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'
import ProfileLayout from '@/layouts/ProfileLayout'
import StudentRoute from './components/StudentRoute'
import { Toaster } from './components/ui/sonner'
import { ErrorBoundary } from "react-error-boundary"
import AdminTicketList from './components/admin/AdminTicketList'
import { queryClient } from './lib/services/queryClient'

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
const UserRoleManager = lazy(() => import('./pages/Admin/components/UserRoleManager'))

// Import du composant HomePage 
const HomePage = lazy(() => import('./components/HomePage'))

// Ticket system components
const TicketList = lazy(() => import('./components/TicketList'))
const TicketForm = lazy(() => import('./components/TicketForm'))
const TicketDetail = lazy(() => import('./components/TicketDetail'))

// Import the TicketServiceList component
const TicketServiceList = lazy(() => import('./components/admin/TicketServiceList'))

// Fonction optimisée pour le préchargement intelligent des pages
// Ne charge que les pages pertinentes en fonction du contexte et du chemin actuel
function useIntelligentPreload() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Log the current location for debugging
  useEffect(() => {
    console.log('[App] Current location:', location.pathname);
  }, [location]);

  // Initialize queryClient with test data for debugging
  useEffect(() => {
    if (import.meta.env.DEV) {
      queryClient.setQueryData(['persistent-test-query'], {
        message: 'React Query is working!',
        timestamp: new Date().toISOString(),
        status: 'active'
      });
      queryClient.setQueryData(['persistent-mutation'], {
        message: 'Mutation example',
        status: 'idle'
      });
    }
  }, []);

  // Preload relevant pages based on location
  useEffect(() => {
    // Only preload if we're in a logged-in area
    if (location.pathname.startsWith('/profile') || location.pathname.startsWith('/dashboard')) {
      // Preload profile data
      queryClient.prefetchQuery({
        queryKey: ['user-profile'],
        queryFn: async () => {
          console.log('[App] Preloading profile data');
          return { message: 'Profile data preloaded' };
        }
      });
    }
  }, [location.pathname]);
}

// Component for handling prefetching and setting up environment
function AppInitializer() {
  useIntelligentPreload();
  return null;
}

// Composant pour gérer les préchargements
function PrefetchHandler() {
  const location = useLocation();
  
  // Log route changes for debugging
  useEffect(() => {
    console.log('[App] Route changed to:', location.pathname);
  }, [location.pathname]);

  return null;
}

// Composant de contenu principal qui utilise les hooks de React Router
function AppContent() {
  const location = useLocation();
  
  // Log route changes for debugging
  useEffect(() => {
    console.log('[App] Current route:', location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative font-poppins">
      <PrefetchHandler />
      
      {/* Wrapper for the main content */}
      <div className="relative z-10">
        <Suspense>
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
                    <Route path="/admin/users" element={
                      <RoleGuard roles={[ROLES.ADMIN, ROLES.HR, ROLES.TEACHER, ROLES.SUPERADMIN]}>
                        <UserRoleManager />
                      </RoleGuard>
                    } />
                    
                    {/* Ticket Service Management - Admin Only */}
                    <Route path="/admin/ticket-services" element={
                      <RoleGuard roles={[ROLES.ADMIN, ROLES.SUPERADMIN]} fallback={<Navigate to="/dashboard" replace />}>
                        <TicketServiceList />
                      </RoleGuard>
                    } />
                    
                    {/* Admin Ticket Management */}
                    <Route path="/admin/tickets" element={
                      <RoleGuard roles={[ROLES.ADMIN, ROLES.SUPERADMIN]} fallback={<Navigate to="/dashboard" replace />}>
                        <AdminTicketList />
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
                  
                  {/* Ticket routes - fix double MainLayout issue */}
                  <Route path="/tickets" element={<TicketList />} />
                  <Route path="/tickets/new" element={<TicketForm />} />
                  <Route path="/tickets/:id" element={<TicketDetail />} />
                  
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
}

// Fallback component for error boundary
function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <p>Une erreur est survenue:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Réessayer</button>
    </div>
  );
}

// Composant App principal qui configure le Router
function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
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
    </ErrorBoundary>
  );
}

export default App;