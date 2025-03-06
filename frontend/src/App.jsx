import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { lazy, Suspense, useState, useEffect } from 'react'
import MainLayout from './components/MainLayout'
// Import différé des pages pour améliorer les performances
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const RegistrationSuccess = lazy(() => import('./pages/RegistrationSuccess'))
const VerificationSuccess = lazy(() => import('./pages/VerificationSuccess'))
const VerificationError = lazy(() => import('./pages/VerificationError'))
// Lazy loading pour le Profil et Dashboard
const Profil = lazy(() => import('./pages/Profil'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
// Dashboards spécifiques par rôle
const AdminDashboard = lazy(() => import('./pages/Admin/Dashboard'))
const StudentDashboard = lazy(() => import('./pages/Student/Dashboard'))
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

// Fonction pour précharger les pages au survol des liens
const preloadPages = () => {
  // Préchargement anticipé des composants
  const preloadLogin = () => import('./pages/Login');
  const preloadRegister = () => import('./pages/Register');
  const preloadRegistrationSuccess = () => import('./pages/RegistrationSuccess');
  const preloadVerificationSuccess = () => import('./pages/VerificationSuccess');
  const preloadVerificationError = () => import('./pages/VerificationError');
  const preloadProfil = () => import('./pages/Profil'); // Préchargement du Profil
  const preloadDashboard = () => import('./pages/Dashboard'); // Préchargement du Dashboard
  const preloadHomePage = () => import('./components/HomePage'); // Préchargement de HomePage
  const preloadAdminDashboard = () => import('./pages/Admin/Dashboard');
  const preloadStudentDashboard = () => import('./pages/Student/Dashboard');
  const preloadTeacherDashboard = () => import('./pages/Teacher/Dashboard');
  const preloadHRDashboard = () => import('./pages/HR/Dashboard');
  const preloadSuperAdminDashboard = () => import('./pages/SuperAdmin/Dashboard');
  const preloadGuestDashboard = () => import('./pages/Guest/Dashboard');
  const preloadRecruiterDashboard = () => import('./pages/Recruiter/Dashboard');
  
  // Déclencher le préchargement
  preloadLogin();
  preloadRegister();
  preloadRegistrationSuccess();
  preloadVerificationSuccess();
  preloadVerificationError();
  preloadProfil();
  preloadDashboard();
  preloadHomePage();
  preloadAdminDashboard();
  preloadStudentDashboard();
  preloadTeacherDashboard();
  preloadHRDashboard();
  preloadSuperAdminDashboard();
  preloadGuestDashboard();
  preloadRecruiterDashboard();
};

// Composant pour observer les liens et précharger les pages correspondantes
const PrefetchHandler = () => {
  const location = useLocation();
  const [hasPreloaded, setHasPreloaded] = useState(false);
  
  useEffect(() => {
    if (!hasPreloaded) {
      // Précharger les pages au premier rendu
      preloadPages();
      setHasPreloaded(true);
    }
  }, [hasPreloaded]);
  
  return null;
};

const App = () => {
  return (
    <Router>
      <div className="relative font-poppins">
        <PrefetchHandler />
        {/* Wrapper pour le contenu principal avec z-index positif */}
        <div className="relative z-10">
          <Suspense fallback={null}>
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
                </Route>
                
                {/* Routes protégées nécessitant une authentification */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/profil" element={<Profil />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  {/* Dashboards spécifiques par rôle */}
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/student/dashboard" element={<StudentDashboard />} />
                  <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
                  <Route path="/hr/dashboard" element={<HRDashboard />} />
                  <Route path="/super-admin/dashboard" element={<SuperAdminDashboard />} />
                  <Route path="/guest/dashboard" element={<GuestDashboard />} />
                  <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
                </Route>
                
                {/* Redirection des routes inconnues vers la page d'accueil */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </Suspense>
        </div>
        <Toaster />
      </div>
    </Router>
  )
}

export default App