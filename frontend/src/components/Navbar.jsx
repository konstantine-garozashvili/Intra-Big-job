import React, { memo, useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authService } from "../lib/services/authService";
import { profileService } from "../pages/Global/Profile/services/profileService";
import { Button } from "./ui/button";
import {
  UserRound,
  LayoutDashboard,
  LogOut,
  Settings,
  User,
  Bell,
  Search,
  Clipboard,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { MenuBurger } from "./MenuBurger";
import { SearchBar } from "./SearchBar";
import { useRolePermissions } from "../features/roles/useRolePermissions";
import { Skeleton } from './ui/skeleton';

// Style personnalisé pour le menu dropdown et le bouton burger
const customStyles = `
  .navbar-dropdown-item {
    display: flex !important;
    align-items: center !important;
    padding: 0.75rem !important;
    cursor: pointer !important;
    transition: all 0.2s ease !important;
  }
  
  .navbar-dropdown-item:hover {
    background-color: rgba(82, 142, 178, 0.1) !important;
    color: #02284f !important;
  }
  
  .navbar-dropdown-item.danger {
    color: #e11d48 !important;
  }
  
  .navbar-dropdown-item.danger:hover {
    background-color: rgba(225, 29, 72, 0.1) !important;
    color: #be123c !important;
  }
  
  .menu-burger-btn {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    transition: all 0.2s ease;
    margin-right: 0.75rem;
  }
  
  .menu-burger-btn:hover {
    background-color: rgba(255, 255, 255, 0.1);
    transform: scale(1.05);
  }
  
  .menu-burger-btn:active {
    transform: scale(0.95);
  }
  
  .search-container {
    position: relative;
    max-width: 400px;
    width: 100%;
    margin: 0 1rem;
    isolation: isolate;
    z-index: 90;
  }
  
  .search-container input {
    background-color: rgba(255, 255, 255, 0.1) !important;
    border-color: rgba(255, 255, 255, 0.2) !important;
    color: white !important;
  }
  
  .search-container input::placeholder {
    color: rgba(255, 255, 255, 0.6) !important;
  }
  
  .search-container input:focus {
    background-color: rgba(255, 255, 255, 0.15) !important;
    border-color: #528eb2 !important;
    box-shadow: 0 0 0 2px rgba(82, 142, 178, 0.25) !important;
  }
  
  /* Fixed navbar styles */
  .navbar-fixed {
    position: sticky;
    top: 0;
    z-index: 100;
    width: 100%;
    overflow-x: hidden;
    isolation: isolate;
  }
  
  @media (max-width: 1024px) {
    .search-container {
      max-width: 300px;
    }
  }
  
  @media (max-width: 768px) {
    .menu-burger-btn {
      margin-right: 0.5rem;
    }
    
    .mobile-auth-buttons {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 0.5rem;
    }
    
    .mobile-auth-buttons a {
      font-size: 0.875rem;
      padding: 0.5rem 0.75rem;
    }
    
    .search-container {
      display: none;
    }
  }
`;

// Composant pour les boutons d'authentification
const AuthButtons = () => (
  <>
    <Link
      to="/login"
      className="px-4 py-2 text-gray-200 transition-colors rounded-md hover:text-white"
    >
      Connexion
    </Link>
    <Link
      to="/register"
      className="ml-2 px-4 py-2 bg-[#528eb2] rounded-md text-white font-medium hover:bg-[#528eb2]/90 transition-all transform hover:scale-105"
    >
      Inscription
    </Link>
  </>
);

// Composant pour le menu utilisateur
const UserMenu = ({ onLogout, userData, setLogoutDialogOpen }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownMenuRef = useRef(null);

  // Style personnalisé pour le menu dropdown
  const dropdownMenuStyles = {
    enter: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: { duration: 0.2, ease: "easeOut" },
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.2, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: { duration: 0.1, ease: "easeIn" },
    },
  };

  return (
    <div className="flex items-center">
      {/* Notification icon (placeholder) */}
      <Button
        variant="ghost"
        className="rounded-full w-10 h-10 p-0 bg-transparent text-gray-200 hover:bg-[#02284f]/80 hover:text-white mr-2"
      >
        <Bell className="h-5 w-5" />
      </Button>

      {/* Dropdown menu */}
      <DropdownMenu modal={true}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className={`rounded-full w-10 h-10 p-0 ${dropdownOpen ? 'bg-[#528eb2]/20 border-[#528eb2]' : 'bg-transparent border-gray-500'} hover:bg-[#02284f]/80 hover:text-white hover:border-gray-400 transition-all duration-300`}
          >
            <UserRound className={`h-5 w-5 ${dropdownOpen ? 'text-white' : 'text-gray-200'}`} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-64 mt-2 p-0 overflow-hidden border border-gray-100 shadow-xl rounded-xl"
          onOpenAutoFocus={(e) => e.preventDefault()}
          sideOffset={5}
          ref={dropdownMenuRef}
        >
          {/* En-tête du dropdown avec avatar et nom */}
          <div className="bg-gradient-to-r from-[#02284f] to-[#03386b] p-4 text-white">
            <div className="flex items-center">
              <div className="bg-white/20 rounded-full p-2.5">
                <UserRound className="h-6 w-6" />
              </div>
              <div className="ml-3">
                <h3 className="font-medium text-sm">
                  {userData?.firstName && userData?.lastName 
                    ? `${userData.firstName} ${userData.lastName}`
                    : userData?.user?.firstName && userData?.user?.lastName
                      ? `${userData.user.firstName} ${userData.user.lastName}`
                      : 'Utilisateur'}
                </h3>
                <p className="text-xs text-gray-300">
                  {userData?.email || userData?.user?.email || 'utilisateur@example.com'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Corps du dropdown avec les options */}
          <div className="py-1 bg-white">
            <DropdownMenuItem 
              className="navbar-dropdown-item"
              onClick={() => navigate('/profile')}
            >
              <User className="mr-2 h-4 w-4 text-[#528eb2]" />
              <span>Mon profil</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              className="navbar-dropdown-item"
              onClick={() => navigate('/settings/profile')}
            >
              <Settings className="mr-2 h-4 w-4 text-[#528eb2]" />
              <span>Paramètres</span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator className="my-1 bg-gray-100" />
            
            <DropdownMenuItem 
              className="navbar-dropdown-item danger"
              onClick={() => setLogoutDialogOpen(true)}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Déconnexion</span>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

// Utilisation de React.memo pour éviter les rendus inutiles de la barre de navigation
const Navbar = memo(() => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const permissions = useRolePermissions();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  // Vérifier l'état d'authentification
  const checkAuthStatus = async () => {
    try {
      const status = authService.isLoggedIn();
      const wasAuthenticated = isAuthenticated;
      setIsAuthenticated(status);

      // Si l'utilisateur est connecté, charger ses données
      if (status) {
        try {
          // Nettoyer le cache avant de recharger les données utilisateur
          if (!wasAuthenticated) {
            const queryClient = window.queryClient || authService.getQueryClient();
            if (queryClient) {
              queryClient.invalidateQueries({ queryKey: ['user'] });
              queryClient.invalidateQueries({ queryKey: ['profile'] });
            }
          }
          
          // Toujours forcer une nouvelle requête pour obtenir les données utilisateur à jour
          const userData = await authService.getCurrentUser(true);
          setUserData(userData);

          // Déclencher un événement de changement de rôle si l'état d'authentification a changé
          if (!wasAuthenticated) {
            window.dispatchEvent(new Event("role-change"));
          }
        } catch (userError) {
          // Fallback: essayer de récupérer les données du profil
          try {
            const profileData = await profileService.getAllProfileData();

            if (profileData?.user) {
              setUserData(profileData.user);
            } else if (profileData?.data?.user) {
              setUserData(profileData.data.user);
            } else {
              setUserData(profileData);
            }

            // Déclencher un événement de changement de rôle si l'état d'authentification a changé
            if (!wasAuthenticated) {
              window.dispatchEvent(new Event("role-change"));
            }
          } catch (profileError) {
            // Gestion silencieuse de l'erreur
          }
        }
      } else {
        setUserData(null);

        // Déclencher un événement de changement de rôle si l'état d'authentification a changé
        if (wasAuthenticated) {
          window.dispatchEvent(new Event("role-change"));
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'authentification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Vérifier l'état d'authentification au chargement et lors des changements de route
  useEffect(() => {
    checkAuthStatus();
  }, [location.pathname, userData]);

  // Ajouter un écouteur pour l'événement de connexion réussie
  useEffect(() => {
    const handleLoginSuccess = () => {
      // Forcer un re-chargement des données utilisateur
      checkAuthStatus();
    };
    
    window.addEventListener('login-success', handleLoginSuccess);
    
    return () => {
      window.removeEventListener('login-success', handleLoginSuccess);
    };
  }, []);

  // Fonction de déconnexion
  const handleLogout = async () => {
    try {
      // Close the logout dialog
      setLogoutDialogOpen(false);
      
      // Prevent duplicate logout attempts
      if (window.__isLoggingOut) return;
      
      // Déclencher un événement de pré-déconnexion pour préparer l'interface
      window.dispatchEvent(new Event('logout-start'));
      
      // Call the logout service directly - no need for timeout
      authService.logout('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      
      // En cas d'erreur, forcer une déconnexion propre
      authService.clearAuthData(true, 'Une erreur est survenue lors de la déconnexion.');
    }
  };

  return (
    <>
      {/* Injection des styles personnalisés */}
      <style>{customStyles}</style>

      <header className="navbar-fixed bg-[#02284f] shadow-lg">
        <nav className="bg-[#02284f] w-full">
          <div className="container px-4 mx-auto">
            <div className="flex items-center justify-between h-16">
              {/* Partie gauche: Logo et burger menu */}
              <div className="flex items-center">
                <div className="menu-burger-wrapper">
                  <MenuBurger />
                </div>
                <div className="flex-shrink-0">
                  <Link
                    to={
                      isAuthenticated
                        ? permissions.getRoleDashboardPath()
                        : "/login"
                    }
                    className="text-2xl font-black tracking-tight text-white"
                  >
                    Big<span className="text-[#528eb2]">Project</span>
                  </Link>
                </div>
              </div>

              {/* Partie centrale: Barre de recherche */}
              {isAuthenticated && (
                <div className="hidden md:flex flex-1 justify-center mx-4">
                  <div className="search-container w-full max-w-md flex justify-end">
                    <SearchBar />
                  </div>
                </div>
              )}

              {/* Partie droite: Authentification */}
              <div className="flex items-center">
                {/* Attendance button based on role */}
                {isAuthenticated && (permissions.isStudent() || permissions.isTeacher()) && (
                  <Link 
                    to={permissions.isTeacher() ? "/teacher/attendance" : "/student/attendance"}
                    className="mr-4 px-3 py-2 rounded-md bg-green-700 text-white font-medium hover:bg-green-800 transition-colors flex items-center gap-2"
                  >
                    <Clipboard className="w-4 h-4" />
                    Présence
                  </Link>
                )}

                {/* Barre de recherche mobile */}
                {isAuthenticated && (
                  <div className="md:hidden mr-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full w-10 h-10 p-0 bg-transparent text-gray-200 hover:bg-[#02284f]/80 hover:text-white"
                      onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                    >
                      <Search className="h-5 w-5" />
                    </Button>
                  </div>
                )}
                
                {/* Menu utilisateur */}
                {isLoading ? (
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-8 w-24 rounded-md" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                  </div>
                ) : isAuthenticated ? (
                  <UserMenu
                    onLogout={() => setLogoutDialogOpen(true)}
                    userData={userData}
                    setLogoutDialogOpen={setLogoutDialogOpen}
                  />
                ) : (
                  <div className="mobile-auth-buttons">
                    <AuthButtons />
                  </div>
                )}
              </div>
            </div>

            {/* Barre de recherche mobile */}
            {isAuthenticated && mobileSearchOpen && (
              <div className="md:hidden px-4 pb-4">
                <SearchBar />
              </div>
            )}
          </div>

          {/* Dialogue de confirmation de déconnexion */}
          {logoutDialogOpen && (
            <Dialog
              open={logoutDialogOpen}
              onOpenChange={(open) => setLogoutDialogOpen(open)}
            >
              <DialogContent className="max-h-[calc(100vh-2rem)] w-full max-w-md overflow-hidden rounded-2xl border-0 shadow-xl">
                <div className="overflow-y-auto max-h-[70vh] fade-in-up">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">
                      Confirmation de déconnexion
                    </DialogTitle>
                    <DialogDescription className="text-base mt-2">
                      Êtes-vous sûr de vouloir vous déconnecter de votre compte ?
                      Toutes vos sessions actives seront fermées.
                    </DialogDescription>
                  </DialogHeader>
                </div>
                <DialogFooter className="mt-6 flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setLogoutDialogOpen(false)}
                    className="rounded-full border-2 hover:bg-gray-100 transition-all duration-200"
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleLogout}
                    className="rounded-full bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 transition-all duration-200"
                  >
                    Se déconnecter
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </nav>
      </header>
    </>
  );
});

// Ajout d'un nom d'affichage pour les outils de développement
Navbar.displayName = "Navbar";

export default Navbar;