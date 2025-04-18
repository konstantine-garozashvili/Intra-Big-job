import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { RoleDashboardRedirect, RoleGuard, ROLES } from '../../features/roles';
import MainLayout from '../../components/MainLayout';
import ProfileLayout from '../../layouts/ProfileLayout';
import ProtectedRoute from '../../components/ProtectedRoute';
import PublicRoute from '../../components/PublicRoute';
import StudentRoute from '../../components/StudentRoute';
import NotificationsPage from '@/pages/Global/Notifications/NotificationsPage';

// Composant de chargement pour Suspense
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

/**
 * Composant AppRoutes - Gère les routes de l'application
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {Object} props.lazyComponents - Les composants chargés de manière différée
 */
const AppRoutes = ({ lazyComponents }) => {
  const {
    // Pages d'authentification
    Login,
    Register,
    RegistrationSuccess,
    VerificationSuccess,
    VerificationError,
    ResetPasswordRequest,
    ResetPasswordConfirmation,
    ResetPassword,
    
    // Pages de profil
    SettingsProfile,
    SecuritySettings,
    NotificationSettings,
    CareerSettings,
    ProfileView,
    Dashboard,
    PublicProfileView,
    
    // Dashboards spécifiques par rôle
    AdminDashboard,
    StudentDashboard,
    StudentSchedule,
    StudentGrades,
    StudentAbsences,
    StudentProjects,
    StudentAttendance,
    TeacherDashboard,
    TeacherSignatureMonitoring,
    TeacherAttendance,
    HRDashboard,
    SuperAdminDashboard,
    GuestDashboard,
    RecruiterDashboard,
    
    // Autres pages
    FormationList,
    GuestStudentRoleManager,
    HomePage
  } = lazyComponents;

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<PublicRoute />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="registration-success" element={<RegistrationSuccess />} />
          <Route path="verify-email/:token" element={<VerificationSuccess />} />
          <Route path="verify-email-error" element={<VerificationError />} />
          <Route path="reset-password" element={<ResetPasswordRequest />} />
          <Route path="reset-password/confirmation" element={<ResetPasswordConfirmation />} />
          <Route path="reset-password/:token" element={<ResetPassword />} />
          <Route path="public-profile/:id" element={<PublicProfileView />} />
          <Route path="profile/view/:id" element={<ProfileView />} />
        </Route>

        {/* Routes protégées */}
        <Route path="/" element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            {/* Redirection basée sur le rôle */}
            <Route path="dashboard" element={<RoleDashboardRedirect />} />
            
            {/* Page des notifications complète */}
            <Route path="notifications" element={<NotificationsPage />} />
            
            {/* Routes de profil */}
            <Route path="profile" element={<ProfileLayout />}>
              <Route index element={<ProfileView />} />
              <Route path="settings" element={<SettingsProfile />} />
              <Route path="security" element={<SecuritySettings />} />
              <Route path="notifications" element={<NotificationSettings />} />
              <Route path="career" element={<CareerSettings />} />
            </Route>

            {/* Routes spécifiques aux rôles */}
            {/* Admin */}
            <Route path="admin" element={<RoleGuard roles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]} />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="formations" element={<FormationList />} />
            </Route>

            {/* Super Admin */}
            <Route path="super-admin" element={<RoleGuard roles={[ROLES.SUPER_ADMIN]} />}>
              <Route path="dashboard" element={<SuperAdminDashboard />} />
            </Route>

            {/* Étudiant */}
            <Route path="student" element={<StudentRoute />}>
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="schedule" element={<StudentSchedule />} />
              <Route path="grades" element={<StudentGrades />} />
              <Route path="absences" element={<StudentAbsences />} />
              <Route path="projects" element={<StudentProjects />} />
              <Route path="attendance" element={<StudentAttendance />} />
            </Route>

            {/* Enseignant */}
            <Route path="teacher" element={<RoleGuard roles={[ROLES.TEACHER]} />}>
              <Route path="dashboard" element={<TeacherDashboard />} />
              <Route path="signature-monitoring" element={<TeacherSignatureMonitoring />} />
              <Route path="attendance" element={<TeacherAttendance />} />
            </Route>

            {/* RH */}
            <Route path="hr" element={<RoleGuard roles={[ROLES.HR]} />}>
              <Route path="dashboard" element={<HRDashboard />} />
            </Route>

            {/* Recruteur */}
            <Route path="recruiter" element={<RoleGuard roles={[ROLES.RECRUITER]} />}>
              <Route path="dashboard" element={<RecruiterDashboard />} />
              <Route path="guest-student-role-manager" element={<GuestStudentRoleManager />} />
            </Route>

            {/* Invité */}
            <Route path="guest" element={<RoleGuard roles={[ROLES.GUEST]} />}>
              <Route path="dashboard" element={<GuestDashboard />} />
            </Route>
          </Route>
        </Route>

        {/* Redirection par défaut */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
