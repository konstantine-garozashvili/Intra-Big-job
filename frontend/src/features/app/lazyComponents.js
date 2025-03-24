import { lazy } from 'react';

/**
 * Configuration des composants chargés de manière différée (lazy loading)
 * Cela permet d'améliorer les performances en ne chargeant que les composants nécessaires
 */

// Pages d'authentification
const Login = lazy(() => import('../../pages/Login'));
const Register = lazy(() => import('../../pages/Register'));
const RegistrationSuccess = lazy(() => import('../../pages/RegistrationSuccess'));
const VerificationSuccess = lazy(() => import('../../pages/VerificationSuccess'));
const VerificationError = lazy(() => import('../../pages/VerificationError'));
const ResetPasswordRequest = lazy(() => import('../../components/auth/ResetPasswordRequest'));
const ResetPasswordConfirmation = lazy(() => import('../../components/auth/ResetPasswordConfirmation'));
const ResetPassword = lazy(() => import('../../components/auth/ResetPassword'));

// Pages de profil
const ProfileView = lazy(() => import('../../pages/Global/Profile/views/ProfileView'));
const SettingsProfile = lazy(() => import('../../pages/Global/Profile/views/SettingsProfile'));
const SecuritySettings = lazy(() => import('../../pages/Global/Profile/views/SecuritySettings'));
const NotificationSettings = lazy(() => import('../../pages/Global/Profile/views/NotificationSettings'));
const CareerSettings = lazy(() => import('../../pages/Global/Profile/views/CareerSettings'));

// Dashboard général
const Dashboard = lazy(() => import('../../pages/Dashboard'));

// Dashboards spécifiques par rôle
const AdminDashboard = lazy(() => import('../../pages/Admin/Dashboard'));
const StudentDashboard = lazy(() => import('../../pages/Student/Dashboard'));
const TeacherDashboard = lazy(() => import('../../pages/Teacher/Dashboard'));
const HRDashboard = lazy(() => import('../../pages/HR/Dashboard'));
const SuperAdminDashboard = lazy(() => import('../../pages/SuperAdmin/Dashboard'));
const GuestDashboard = lazy(() => import('../../pages/Guest/Dashboard'));
const RecruiterDashboard = lazy(() => import('../../pages/Recruiter/Dashboard'));

// Pages spécifiques aux étudiants
const StudentSchedule = lazy(() => import('../../pages/Student/Schedule'));
const StudentGrades = lazy(() => import('../../pages/Student/Grades'));
const StudentAbsences = lazy(() => import('../../pages/Student/Absences'));
const StudentProjects = lazy(() => import('../../pages/Student/Projects'));
const StudentAttendance = lazy(() => import('../../pages/Student/Attendance'));

// Pages spécifiques aux enseignants
const TeacherSignatureMonitoring = lazy(() => import('../../pages/Teacher/SignatureMonitoring'));
const TeacherAttendance = lazy(() => import('../../pages/Teacher/Attendance'));

// Autres pages
const FormationList = lazy(() => import('../../pages/Admin/FormationList'));
const GuestStudentRoleManager = lazy(() => import('../../pages/Recruiter/GuestStudentRoleManager'));
const HomePage = lazy(() => import('../../pages/HomePage'));

// Exporter tous les composants lazy
export const lazyComponents = {
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
  ProfileView,
  SettingsProfile,
  SecuritySettings,
  NotificationSettings,
  CareerSettings,
  
  // Dashboard général
  Dashboard,
  
  // Dashboards spécifiques par rôle
  AdminDashboard,
  StudentDashboard,
  TeacherDashboard,
  HRDashboard,
  SuperAdminDashboard,
  GuestDashboard,
  RecruiterDashboard,
  
  // Pages spécifiques aux étudiants
  StudentSchedule,
  StudentGrades,
  StudentAbsences,
  StudentProjects,
  StudentAttendance,
  
  // Pages spécifiques aux enseignants
  TeacherSignatureMonitoring,
  TeacherAttendance,
  
  // Autres pages
  FormationList,
  GuestStudentRoleManager,
  HomePage
};
