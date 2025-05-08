import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import MainLayout from "./components/MainLayout";
import {
  RoleProvider,
  RoleDashboardRedirect,
  RoleGuard,
  ROLES,
} from "./features/roles";
import { AuthProvider } from "./contexts/AuthContext";
import { TranslationProvider } from "./contexts/TranslationContext";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import "./index.css";
import ProtectedRoute from "./components/ProtectedRoute";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedThemeProvider } from "@/contexts/ProtectedThemeContext";
import PublicLayout from "./layouts/PublicLayout";
import PublicRoute from "./components/PublicRoute";
import ProfileLayout from "./layouts/ProfileLayout";
import StudentRoute from "./components/StudentRoute";
import { Toaster } from "./components/ui/sonner";
import { ErrorBoundary } from "react-error-boundary";
import AdminTicketList from "./components/admin/AdminTicketList";
import { queryClient } from "./lib/services/queryClient";
import ReactQueryHydration from "./components/shared/ReactQueryHydration";
import deduplicationService from "./lib/services/deduplicationService";
import apiService from "./lib/services/apiService";
import PublicProfileView from "@/pages/Global/Profile/views/PublicProfileView";
import TranslationTest from "./components/Translation/TranslationTest";
import { notificationService } from './lib/services/notificationService';
import React from 'react';
import AbsenceFormation from './components/signature/AbsenceFormation';
import AbsenceUser from './components/signature/AbsenceUser';
import FormationDetail from './pages/FormationDetail';

// Export queryClient to be used elsewhere
export { queryClient };

// Import différé des pages pour améliorer les performances
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const RegistrationSuccess = lazy(() => import("./pages/RegistrationSuccess"));
const VerificationSuccess = lazy(() => import("./pages/VerificationSuccess"));
const VerificationError = lazy(() => import("./pages/VerificationError"));

// Lazy loading pour la réinitialisation de mot de passe
const ResetPasswordRequest = lazy(() =>
  import("./components/auth/ResetPasswordRequest")
);
const ResetPasswordConfirmation = lazy(() =>
  import("./components/auth/ResetPasswordConfirmation")
);
const ResetPassword = lazy(() => import("./components/auth/ResetPassword"));

// Lazy loading pour le Profil et Dashboard
const SettingsProfile = lazy(() =>
  import("./pages/Global/Profile/views/SettingsProfile")
);
const SecuritySettings = lazy(() =>
  import("./pages/Global/Profile/views/SecuritySettings")
);
const NotificationSettings = lazy(() =>
  import("./pages/Global/Profile/views/NotificationSettings")
);
const CareerSettings = lazy(() =>
  import("./pages/Global/Profile/views/CareerSettings")
);
const ProfileView = lazy(() =>
  import("./pages/Global/Profile/views/ProfileView")
);
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Trombinoscope = lazy(() => import("./pages/Global/Trombinoscope"));

// Dashboards spécifiques par rôle
const AdminDashboard = lazy(() => import("./pages/Admin/Dashboard"));
const StudentDashboard = lazy(() => import("./pages/Student/Dashboard"));
// Pages étudiantes
const StudentSchedule = lazy(() => import("./pages/Student/Schedule"));
const StudentGrades = lazy(() => import("./pages/Student/Grades"));
const StudentAbsences = lazy(() => import("./pages/Student/Absences"));
const StudentProjects = lazy(() => import("./pages/Student/Projects"));
const StudentAttendance = lazy(() => import("./pages/Student/Attendance"));
const TeacherDashboard = lazy(() => import("./pages/Teacher/Dashboard"));
const TeacherSignatureMonitoring = lazy(() =>
  import("./pages/Teacher/SignatureMonitoring")
);
const TeacherAttendance = lazy(() => import("./pages/Teacher/Attendance"));
const TeacherSignatureHistory = lazy(() =>
  import("./pages/Teacher/SignatureHistory")
);
const TeacherFormationList = lazy(() =>
  import("./components/teacher/TeacherFormationList")
);
const TeacherFormationDetails = lazy(() =>
  import("./components/teacher/TeacherFormationDetails")
);
const HRDashboard = lazy(() => import("./pages/HR/Dashboard"));
const SuperAdminDashboard = lazy(() => import("./pages/SuperAdmin/Dashboard"));
const GuestDashboard = lazy(() => import("./pages/Guest/Dashboard"));
const RecruiterDashboard = lazy(() => import("./pages/Recruiter/Dashboard"));

// Nouvelles pages à importer
const FormationList = lazy(() => import("./components/formations/FormationTable"));
const GuestStudentRoleManager = lazy(() =>
  import("./pages/Recruiter/GuestStudentRoleManager")
);
const UserRoleManager = lazy(() =>
  import("./pages/Admin/components/UserRoleManager")
);
const FormationFinder = lazy(() => import("./pages/FormationFinder"));
const AdminFormationsView = lazy(() => import("./pages/Admin/views/AdminFormationsView"));
const WebDevelopment = lazy(() => import("./pages/formations/WebDevelopment"));
const Cybersecurity = lazy(() => import("./pages/formations/Cybersecurity"));
const ArtificialIntelligence = lazy(() =>
  import("./pages/formations/ArtificialIntelligence")
);
const DataScience = lazy(() => import("./pages/formations/DataScience"));
const MobileDevelopment = lazy(() =>
  import("./pages/formations/MobileDevelopment")
);
const GameDevelopment = lazy(() =>
  import("./pages/formations/GameDevelopment")
);
const SkillAssessment = lazy(() => import("./pages/Games"));
const NotificationsPage = lazy(() => import("./pages/Global/Notifications/NotificationsPage"));

// Import du composant HomePage
const HomePage = lazy(() => import("./components/HomePage"));
const Home = lazy(() => import("./pages/Home"));

// Ticket system components
const TicketList = lazy(() => import("./components/TicketList"));
const TicketForm = lazy(() => import("./components/TicketForm"));
const TicketDetail = lazy(() => import("./components/TicketDetail"));

// Import the TicketServiceList component
const TicketServiceList = lazy(() =>
  import("./components/admin/TicketServiceList")
);

// Formation components
const FormationForm = lazy(() => import("./components/formations/FormationForm"));
const EditFormationForm = lazy(() => import("./components/formations/EditFormationForm"));
const Act = lazy(() => import("./components/Formation/Act/index"));

// Import the EnrollmentRequests component
const EnrollmentRequests = lazy(() => import("./pages/Recruiter/views/EnrollmentRequests"));

// Formation details component
const FormationDetails = lazy(() => import("./pages/Admin/views/FormationDetails"));

// Lazy loading for the MyFormation page
const MyFormation = lazy(() => import("./pages/Student/MyFormation"));

// Import the GuestEnrollmentRequests component
const GuestEnrollmentRequests = lazy(() => import("./pages/Guest/EnrollmentRequests"));

// Fonction optimisée pour le préchargement intelligent des pages
// Ne charge que les pages pertinentes en fonction du contexte et du chemin actuel
function useIntelligentPreload() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Preload relevant pages based on location
  useEffect(() => {
    // Only preload if we're in a logged-in area
    if (
      location.pathname.startsWith("/profile") ||
      location.pathname.startsWith("/dashboard")
    ) {
      // Précharger les données du profil utilisateur
      const prefetchUserProfile = async () => {
        try {
          // Ne précharger que si les données ne sont pas déjà en cache
          if (!deduplicationService.hasCache(["user-profile"])) {
            await queryClient.prefetchQuery({
              queryKey: ["session", "user-profile"],
              queryFn: async () => {
                return await apiService.get("/api/me");
              },
              staleTime: 2 * 60 * 1000, // 2 minutes
            });
          }
        } catch (error) {
          // Ignorer silencieusement les erreurs de préchargement
        }
      };

      prefetchUserProfile();
    }
  }, [location.pathname, queryClient]);

  // Nettoyer les caches lors de la déconnexion
  useEffect(() => {
    const handleLogout = () => {
      // Nettoyer le service de déduplication
      deduplicationService.clear();

      // Nettoyer le cache React Query
      queryClient.clear();

      // Nettoyer sessionStorage
      sessionStorage.removeItem("APP_QUERY_CACHE");
    };

    window.addEventListener("logout", handleLogout);
    return () => {
      window.removeEventListener("logout", handleLogout);
    };
  }, [queryClient]);

  return null;
}

// Component for handling prefetching and setting up environment
function AppInitializer() {
  useIntelligentPreload();
  return null;
}

// Composant pour gérer les préchargements
function PrefetchHandler() {
  const location = useLocation();

  return null;
}

// Fallback component for error boundary
function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div
      role="alert"
      className="p-4 bg-red-100 border border-red-300 rounded-md m-4"
    >
      <h2 className="text-xl font-semibold text-red-800 mb-2">
        Une erreur est survenue
      </h2>
      <p className="text-red-700 mb-4">{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded"
      >
        Réessayer
      </button>
    </div>
  );
}

// Main App Component
const App = () => {
  // Précharger les notifications au démarrage de l'application
  notificationService.getNotifications(1, 10, true, true)
    .then(data => {
      // console.log('App - Notification service initialized with data:', data);
    })
    .catch(error => {
      // console.error('App - Error initializing notification service:', error);
    });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <RoleProvider>
            <TranslationProvider>
              <Routes>
                {/* Routes publiques */}
                <Route element={<PublicRoute />}>
                  <Route element={<PublicLayout />}>
                    <Route index element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/registration-success" element={<RegistrationSuccess />} />
                    <Route path="/verification-success" element={<VerificationSuccess />} />
                    <Route path="/verification-error" element={<VerificationError />} />
                    <Route path="/reset-password" element={<ResetPasswordRequest />} />
                    <Route path="/reset-password/confirmation" element={<ResetPasswordConfirmation />} />
                    <Route path="/reset-password/reset" element={<ResetPassword />} />
                    <Route path="/formations" element={<FormationList />} />
                    <Route path="/formation-finder" element={<FormationFinder />} />
                    <Route path="/all-formations" element={<AdminFormationsView />} />
                    <Route path="/formations/web" element={<WebDevelopment />} />
                    <Route path="/formations/ai" element={<ArtificialIntelligence />} />
                    <Route path="/formations/cybersecurity" element={<Cybersecurity />} />
                    <Route path="/formations/mobile" element={<MobileDevelopment />} />
                    <Route path="/formations/data-science" element={<DataScience />} />
                    <Route path="/formations/game" element={<GameDevelopment />} />
                    <Route path="/skill-assessment" element={<SkillAssessment />} />
                  </Route>
                </Route>

                {/* Routes protégées */}
                <Route element={<ProtectedRoute />}>
                  <Route element={
                    <ProtectedThemeProvider>
                      <MainLayout />
                    </ProtectedThemeProvider>
                  }>
                    {/* Regular protected routes */}
                    <Route path="/dashboard" element={<RoleDashboardRedirect />} />

                    {/* Notifications route */}
                    <Route path="/notifications" element={<NotificationsPage />} />

                    {/* Profile routes */}
                    <Route path="/profile" element={<ProfileView />} />
                    <Route path="/profile/:userId" element={<PublicProfileView />} />
                    <Route path="/public-profile/:userId" element={<PublicProfileView />} />

                    {/* Settings routes avec ProfileLayout */}
                    <Route element={<ProfileLayout />}>
                      <Route path="/settings" element={<Navigate to="/profile" replace />} />
                      <Route path="/settings/profile" element={<SettingsProfile />} />
                      <Route path="/settings/career" element={<CareerSettings />} />
                      <Route path="/settings/security" element={<SecuritySettings />} />
                      <Route path="/settings/notifications" element={<NotificationSettings />} />
                    </Route>

                    {/* Routes Admin */}
                    <Route path="/admin/dashboard" element={<RoleGuard roles={ROLES.ADMIN} fallback={<Navigate to="/dashboard" replace />}><AdminDashboard /></RoleGuard>} />
                    <Route path="/admin/users" element={<RoleGuard roles={[ROLES.ADMIN, ROLES.HR, ROLES.TEACHER, ROLES.SUPERADMIN]}><UserRoleManager /></RoleGuard>} />
                    <Route path="/admin/ticket-services" element={<RoleGuard roles={[ROLES.ADMIN, ROLES.SUPERADMIN]} fallback={<Navigate to="/dashboard" replace />}><TicketServiceList /></RoleGuard>} />
                    <Route path="/admin/tickets" element={<RoleGuard roles={[ROLES.ADMIN, ROLES.SUPERADMIN]} fallback={<Navigate to="/dashboard" replace />}><AdminTicketList /></RoleGuard>} />
                    <Route path="/admin/formations" element={<RoleGuard roles={[ROLES.ADMIN, ROLES.SUPERADMIN]} fallback={<Navigate to="/dashboard" replace />}><AdminFormationsView /></RoleGuard>} />
                    <Route path="/admin/formations/:id" element={<RoleGuard roles={[ROLES.ADMIN, ROLES.SUPERADMIN]} fallback={<Navigate to="/dashboard" replace />}><FormationDetails /></RoleGuard>} />
                    <Route path="/admin/formations/new" element={<RoleGuard roles={[ROLES.ADMIN, ROLES.SUPERADMIN]} fallback={<Navigate to="/dashboard" replace />}><FormationForm /></RoleGuard>} />
                    <Route path="/admin/formations/edit/:id" element={<RoleGuard roles={[ROLES.ADMIN, ROLES.SUPERADMIN]} fallback={<Navigate to="/dashboard" replace />}><EditFormationForm /></RoleGuard>} />

                    {/* Routes Formation Management accessibles à recruiter, admin, superadmin */}
                    <Route path="/formation-management" element={<RoleGuard roles={[ROLES.RECRUITER, ROLES.ADMIN, ROLES.SUPERADMIN]} fallback={<Navigate to="/dashboard" replace />}><AdminFormationsView /></RoleGuard>} />
                    <Route path="/formation-management/:id" element={<RoleGuard roles={[ROLES.RECRUITER, ROLES.ADMIN, ROLES.SUPERADMIN]} fallback={<Navigate to="/dashboard" replace />}><FormationDetails /></RoleGuard>} />
                    <Route path="/formation-management/new" element={<RoleGuard roles={[ROLES.RECRUITER, ROLES.ADMIN, ROLES.SUPERADMIN]} fallback={<Navigate to="/dashboard" replace />}><FormationForm /></RoleGuard>} />
                    <Route path="/formation-management/edit/:id" element={<RoleGuard roles={[ROLES.RECRUITER, ROLES.ADMIN, ROLES.SUPERADMIN]} fallback={<Navigate to="/dashboard" replace />}><EditFormationForm /></RoleGuard>} />

                    {/* Routes étudiantes */}
                    <Route path="/student">
                      <Route path="dashboard" element={<RoleGuard roles={ROLES.STUDENT} fallback={<Navigate to="/dashboard" replace />}><StudentDashboard /></RoleGuard>} />
                      <Route path="schedule" element={<RoleGuard roles={ROLES.STUDENT} fallback={<Navigate to="/dashboard" replace />}><StudentSchedule /></RoleGuard>} />
                      <Route path="grades" element={<RoleGuard roles={ROLES.STUDENT} fallback={<Navigate to="/dashboard" replace />}><StudentGrades /></RoleGuard>} />
                      <Route path="absences" element={<RoleGuard roles={ROLES.STUDENT} fallback={<Navigate to="/dashboard" replace />}><StudentAbsences /></RoleGuard>} />
                      <Route path="projects" element={<RoleGuard roles={ROLES.STUDENT} fallback={<Navigate to="/dashboard" replace />}><StudentProjects /></RoleGuard>} />
                      <Route path="formation" element={<RoleGuard roles={ROLES.STUDENT} fallback={<Navigate to="/dashboard" replace />}><MyFormation /></RoleGuard>} />
                      <Route element={<StudentRoute />}>
                        <Route path="attendance" element={<StudentAttendance />} />
                      </Route>
                    </Route>

                    {/* Routes enseignantes */}
                    <Route path="/teacher">
                      <Route path="dashboard" element={<RoleGuard roles={ROLES.TEACHER} fallback={<Navigate to="/dashboard" replace />}><TeacherDashboard /></RoleGuard>} />
                      <Route path="attendance" element={<RoleGuard roles={ROLES.TEACHER} fallback={<Navigate to="/dashboard" replace />}><TeacherAttendance /></RoleGuard>} />
                      <Route path="signature-monitoring" element={<RoleGuard roles={ROLES.TEACHER} fallback={<Navigate to="/dashboard" replace />}><TeacherSignatureMonitoring /></RoleGuard>} />
                      <Route path="signature-history" element={<RoleGuard roles={ROLES.TEACHER} fallback={<Navigate to="/dashboard" replace />}><TeacherSignatureHistory /></RoleGuard>} />
                      <Route path="formations" element={<RoleGuard roles={ROLES.TEACHER} fallback={<Navigate to="/dashboard" replace />}><TeacherFormationList /></RoleGuard>} />
                      <Route path="formations/:id" element={<RoleGuard roles={ROLES.TEACHER} fallback={<Navigate to="/dashboard" replace />}><TeacherFormationDetails /></RoleGuard>} />
                    </Route>

                    {/* Routes HR */}
                    <Route path="/hr/dashboard" element={<RoleGuard roles={ROLES.HR} fallback={<Navigate to="/dashboard" replace />}><HRDashboard /></RoleGuard>} />

                    {/* Admin Routes */}
                    <Route path="/admin">
                      <Route path="users" element={<RoleGuard roles={[ROLES.ADMIN, ROLES.SUPERADMIN]} fallback={<Navigate to="/dashboard" replace />}><UserRoleManager /></RoleGuard>} />
                    </Route>

                    {/* Routes Super Admin */}
                    <Route path="/superadmin/dashboard" element={<RoleGuard roles={ROLES.SUPERADMIN} fallback={<Navigate to="/dashboard" replace />}><SuperAdminDashboard /></RoleGuard>} />

                    {/* Routes Guest */}
                    <Route path="/guest/dashboard" element={<RoleGuard roles={ROLES.GUEST} fallback={<Navigate to="/dashboard" replace />}><GuestDashboard /></RoleGuard>} />
                    <Route path="/guest/enrollment-requests" element={<RoleGuard roles={ROLES.GUEST} fallback={<Navigate to="/dashboard" replace />}><GuestEnrollmentRequests /></RoleGuard>} />

                    {/* Routes Recruiter */}
                    <Route path="/recruiter/dashboard" element={<RoleGuard roles={ROLES.RECRUITER} fallback={<Navigate to="/dashboard" replace />}><RecruiterDashboard /></RoleGuard>} />
                    <Route path="/recruiter/guest-student-roles" element={<RoleGuard roles={[ROLES.RECRUITER, ROLES.ADMIN, ROLES.SUPERADMIN]} fallback={<Navigate to="/dashboard" replace />}><GuestStudentRoleManager /></RoleGuard>} />
                    <Route path="/recruiter/enrollment-requests" element={<RoleGuard roles={ROLES.RECRUITER} fallback={<Navigate to="/dashboard" replace />}><EnrollmentRequests /></RoleGuard>} />

                    {/* Trombinoscope route */}
                    <Route path="trombinoscope" element={<RoleGuard roles={[ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT, ROLES.RECRUITER]} fallback={<Navigate to="/dashboard" replace />}><Trombinoscope /></RoleGuard>} />

                    {/* Ticket routes */}
                    <Route path="/tickets" element={<TicketList />} />
                    <Route path="/tickets/new" element={<TicketForm />} />
                    <Route path="/tickets/:id" element={<TicketDetail />} />

                    {/* Route pour le test de traduction */}
                    <Route path="/translation" element={<TranslationTest />} />

                    {/* Formation Management Routes */}
                    <Route path="/formations">
                      <Route path="new" element={
                        <RoleGuard 
                          roles={[ROLES.ADMIN, ROLES.SUPERADMIN, ROLES.RECRUITER]} 
                          fallback={<Navigate to="/dashboard" replace />}
                        >
                          <FormationForm />
                        </RoleGuard>
                      } />
                      <Route path="edit/:id" element={
                        <RoleGuard 
                          roles={[ROLES.ADMIN, ROLES.SUPERADMIN, ROLES.RECRUITER]} 
                          fallback={<Navigate to="/dashboard" replace />}
                        >
                          <EditFormationForm />
                        </RoleGuard>
                      } />
                      <Route path="list" element={
                        <RoleGuard 
                          roles={[ROLES.GUEST]} 
                          fallback={<Navigate to="/dashboard" replace />}
                        >
                          <Act />
                        </RoleGuard>
                      } />
                    </Route>

                    {/* Recruiter Formation Management Routes (reuse admin components) */}
                    <Route path="/recruiter/formation-management" element={
                      <RoleGuard roles={[ROLES.RECRUITER, ROLES.ADMIN, ROLES.SUPERADMIN]} fallback={<Navigate to="/dashboard" replace />}>
                        <AdminFormationsView />
                      </RoleGuard>
                    } />
                    <Route path="/recruiter/formation-management/:id" element={
                      <RoleGuard roles={[ROLES.RECRUITER, ROLES.ADMIN, ROLES.SUPERADMIN]} fallback={<Navigate to="/dashboard" replace />}>
                        <FormationDetails />
                      </RoleGuard>
                    } />

                    {/* Absences par formation et par utilisateur */}
                    <Route path="/absences/formation/:formationId" element={<RoleGuard roles={[ROLES.TEACHER, ROLES.ADMIN, ROLES.SUPERADMIN]} fallback={<Navigate to="/dashboard" replace />}><AbsenceFormation /></RoleGuard>} />
                    <Route path="/absences/user/:userId" element={<RoleGuard roles={[ROLES.TEACHER, ROLES.ADMIN, ROLES.SUPERADMIN, ROLES.STUDENT]} fallback={<Navigate to="/dashboard" replace />}><AbsenceUser /></RoleGuard>} />

                    {/* Formation Detail Route */}
                    <Route path="/formations/:id" element={<FormationDetail />} />
                  </Route>
                </Route>

                {/* Redirection des routes inconnues vers la page d'accueil */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              
              <Toaster />
            </TranslationProvider>
          </RoleProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
