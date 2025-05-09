import React, { memo, useState, useEffect, useRef, forwardRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authService } from "../lib/services/authService";
import userDataManager from "../lib/services/userDataManager";
import { profileService } from "../pages/Global/Profile/services/profileService";
import { Button } from "./ui/button";
import {
  UserRound,
  LogOut,
  Settings,
  User,
  Search,
  ClipboardPenLine,
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
import { Skeleton } from "./ui/skeleton";
import ProfilePictureDisplay from "./ProfilePictureDisplay";
import { Avatar, AvatarFallback } from "./ui/avatar";
import LanguageSelector from "./Translation/LanguageSelector";
import { NotificationBell } from "./ui/NotificationBell";
import { ThemeToggle } from "./ui/theme-toggle";
import { useProtectedTheme } from "../contexts/ProtectedThemeContext";
import { useSignatureReminder } from '../hooks/useSignatureReminder';

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
  
  /* Styles pour le mode sombre */
  .dark .navbar-dropdown-item:hover {
    background-color: rgba(120, 185, 221, 0.2) !important;
    color: #78b9dd !important;
  }
  
  .dark .navbar-dropdown-item.danger {
    color: #fb7185 !important;
    background-color: rgba(244, 63, 94, 0.05) !important;
    font-weight: 500 !important;
  }
  
  .dark .navbar-dropdown-item.danger:hover {
    background-color: rgba(244, 63, 94, 0.2) !important;
    color: #fff !important;
    font-weight: 600 !important;
    box-shadow: 0 0 0 1px rgba(244, 63, 94, 0.3) !important;
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
  
  /* Styles pour la barre de recherche en mode sombre */
  .dark .search-container input {
    background-color: rgba(120, 185, 221, 0.1) !important;
    border-color: rgba(120, 185, 221, 0.3) !important;
    color: #e0f2fe !important;
  }
  
  .dark .search-container input::placeholder {
    color: rgba(224, 242, 254, 0.6) !important;
  }
  
  .dark .search-container input:focus {
    background-color: rgba(120, 185, 221, 0.15) !important;
    border-color: #78b9dd !important;
    box-shadow: 0 0 0 2px rgba(120, 185, 221, 0.25) !important;
  }
  
  /* Fixed navbar styles */
  .navbar-fixed {
    position: sticky;
    top: 0;
    width: 100%;
    overflow-x: hidden;
    isolation: isolate;
  }

  /* Z-index hierarchy */
  .navbar-fixed {
    z-index: 100;
  }

  .menu-burger-wrapper {
    z-index: 101;
    position: relative;
  }

  .language-selector-wrapper {
    z-index: 101;
    position: relative;
  }

  .search-container {
    z-index: 90;
  }

  /* Override Sheet styles to match our design */
  .sidebar-sheet {
    z-index: 102 !important;
  }

  /* Responsive styles */
  @media (max-width: 1280px) {
    .search-container {
      max-width: 350px;
    }
    
    .navbar-actions {
      gap: 0.5rem;
    }
  
  .dark .navbar-fixed {
    background-color: #01111e !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2), 0 0 1px rgba(120, 185, 221, 0.1) !important;
    border-bottom: 1px solid rgba(120, 185, 221, 0.1) !important;
  }
  
  @media (max-width: 1024px) {
    .search-container {
      max-width: 300px;
    }
    
    .navbar-brand {
      font-size: 1.5rem;
    }
    
    .navbar-actions {
      gap: 0.25rem;
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
    
    .navbar-brand {
      font-size: 1.25rem;
    }
    
    .desktop-only {
      display: none;
    }
    
    .mobile-only {
      display: flex;
    }
  }
  
  @media (max-width: 640px) {
    .container {
      padding-left: 0.5rem;
      padding-right: 0.5rem;
    }
    
    .navbar-brand {
      font-size: 1.125rem;
    }
    
    .mobile-auth-buttons {
      flex-direction: column;
      position: absolute;
      top: 100%;
      right: 0;
      background: #02284f;
      padding: 0.5rem;
      border-radius: 0 0 0.5rem 0.5rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    
    .mobile-auth-buttons a {
      width: 100%;
      text-align: center;
    }
  }
  
  @media (max-width: 480px) {
    .navbar-actions {
      gap: 0.25rem;
    }
    
    .notification-button {
      display: none;
    }
  }
  
  /* Default states */
  .mobile-only {
    display: none;
  }
  
  .desktop-only {
    display: flex;
  }
`;

// Composant pour les boutons d'authentification
const AuthButtons = () => (
  <>
    <Link
      to="/login"
      className="px-4 py-2 text-gray-200 transition-all duration-200 rounded-md hover:text-white hover:bg-[#02284f]/50
      dark:text-white dark:bg-[#004080]/80 dark:border dark:border-[#78b9dd]/50 dark:font-medium 
      dark:hover:bg-[#005db3] dark:hover:border-[#78b9dd] dark:hover:shadow-[0_0_8px_rgba(120,185,221,0.25)]"
    >
      Connexion
    </Link>
    <Link
      to="/register"
      className="ml-2 px-4 py-2 bg-[#528eb2] rounded-md text-white font-medium hover:bg-[#528eb2]/90 transition-all transform hover:scale-105 dark:bg-[#004080] dark:hover:bg-[#004d99] dark:hover:shadow-[0_0_10px_rgba(120,185,221,0.3)]"
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
  const { theme, toggleTheme } = useProtectedTheme();

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
      {/* Language selector */}
      <LanguageSelector />

      {/* Notification icon */}
      <NotificationBell />
      {/* Theme toggle button */}
      <ThemeToggle className="mr-3" />

      {/* Dropdown menu */}
      <DropdownMenu modal={true}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={`rounded-full w-10 h-10 p-0 ${
              dropdownOpen
                ? "bg-[#528eb2]/20 border-[#528eb2]"
                : "bg-transparent border-gray-500"
            } hover:bg-[#02284f]/80 hover:text-white hover:border-gray-400 transition-all duration-300 dark:border-[#78b9dd]/50 dark:hover:bg-[#78b9dd]/20 dark:hover:border-[#78b9dd]`}
          >
            <Avatar className="h-11 w-11">
              <AvatarFallback className="bg-gradient-to-r from-[#02284f] to-[#03386b] text-white">
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-64 mt-2 p-0 overflow-hidden border border-gray-100 shadow-xl rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:shadow-[0_4px_16px_rgba(0,0,0,0.5),0_0_0_1px_rgba(120,185,221,0.1)]"
          onOpenAutoFocus={(e) => e.preventDefault()}
          sideOffset={5}
          ref={dropdownMenuRef}
        >
          {/* En-tête du dropdown avec avatar et nom */}
          <div className="bg-gradient-to-r from-[#02284f] to-[#03386b] p-4 text-white dark:from-[#01111e] dark:to-[#001f3d] dark:border-b dark:border-[#78b9dd]/20">
            <div className="flex items-center">
              <div className="bg-white/20 rounded-full p-4.5">
                <ProfilePictureDisplay className="h-11 w-11" />
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
          <div className="py-1 bg-white dark:bg-gray-800">
            <DropdownMenuItem
              className="navbar-dropdown-item"
              onClick={() => navigate("/profile")}
            >
              <User className="mr-2 h-4 w-4 text-[#528eb2] dark:text-[#78b9dd]" />
              <span>Mon profil</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              className="navbar-dropdown-item"
              onClick={() => navigate("/settings/profile")}
            >
              <Settings className="mr-2 h-4 w-4 text-[#528eb2] dark:text-[#78b9dd]" />
              <span>Paramètres</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-1 bg-gray-100 dark:bg-gray-700" />

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
  const needsSignature = useSignatureReminder();
  const [hoverLogo, setHoverLogo] = useState(false);

  // Vérifier l'état d'authentification
  const checkAuthStatus = async () => {
    try {
      const status = authService.isLoggedIn();
      const wasAuthenticated = isAuthenticated;
      setIsAuthenticated(status);

      // Si l'utilisateur est connecté, charger ses données
      if (status) {
        try {
          // Utiliser le cache si disponible pour éviter les appels API en doublon
          const cachedUserData = userDataManager.getCachedUserData();

          if (cachedUserData) {
            // Utiliser les données en cache d'abord
            setUserData(cachedUserData);
            setIsLoading(false);

            // Déclencher un événement de changement de rôle si l'état d'authentification a changé
            if (!wasAuthenticated) {
              window.dispatchEvent(new Event("role-change"));
            }

            // Vérifier si une mise à jour est nécessaire (données plus vieilles que 2 min)
            try {
              const stats = userDataManager.getStats
                ? userDataManager.getStats()
                : { dataAge: Infinity };
              const dataAge = stats.dataAge || Infinity;

              // Use a ref to track the last refresh time to prevent too frequent refreshes
              const now = Date.now();
              if (!window._lastNavbarRefreshTime)
                window._lastNavbarRefreshTime = 0;
              const timeSinceLastRefresh = now - window._lastNavbarRefreshTime;

              // Only refresh if data is old AND we haven't refreshed in the last 30 seconds
              if (dataAge > 2 * 60 * 1000 && timeSinceLastRefresh > 30000) {
                window._lastNavbarRefreshTime = now;

                // Récupérer les données en arrière-plan sans bloquer l'interface
                userDataManager
                  .getUserData({
                    routeKey: "/api/me",
                    forceRefresh: false,
                    background: true,
                    requestId: "navbar_background_refresh",
                  })
                  .then((freshData) => {
                    if (
                      freshData &&
                      JSON.stringify(freshData) !==
                        JSON.stringify(cachedUserData)
                    ) {
                      setUserData(freshData);
                    }
                  })
                  .catch((e) => {
                    console.warn(
                      "Erreur lors du rafraîchissement des données utilisateur:",
                      e
                    );
                  });
              }
            } catch (statsError) {
              console.warn("Error checking user data stats:", statsError);
            }
          } else {
            // Si le cache est vide, nettoyer le cache avant de recharger les données utilisateur
            if (!wasAuthenticated) {
              const queryClient =
                window.queryClient || authService.getQueryClient();
              if (queryClient) {
                queryClient.invalidateQueries({ queryKey: ["user"] });
                queryClient.invalidateQueries({ queryKey: ["profile"] });
              }
            }

            // Faire un appel API uniquement si nécessaire
            // Ajouter un identifiant unique pour la requête
            const userData = await authService.getCurrentUser(false, {
              requestSource: "navbar",
            });
            setUserData(userData);
            setIsLoading(false);

            // Déclencher un événement de changement de rôle si l'état d'authentification a changé
            if (!wasAuthenticated) {
              window.dispatchEvent(new Event("role-change"));
            }
          }
        } catch (userError) {
          console.warn(
            "Erreur lors de la récupération des données utilisateur:",
            userError
          );
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
            setIsLoading(false);

            // Déclencher un événement de changement de rôle si l'état d'authentification a changé
            if (!wasAuthenticated) {
              window.dispatchEvent(new Event("role-change"));
            }
          } catch (profileError) {
            // Gestion silencieuse de l'erreur
            setIsLoading(false);
          }
        }
      } else {
        setUserData(null);
        setIsLoading(false);

        // Déclencher un événement de changement de rôle si l'état d'authentification a changé
        if (wasAuthenticated) {
          window.dispatchEvent(new Event("role-change"));
        }
      }
    } catch (error) {
      console.error(
        "Erreur lors de la vérification de l'authentification:",
        error
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Vérifier l'état d'authentification au chargement et lors des changements de route
  useEffect(() => {
    checkAuthStatus();
  }, [location.pathname]);

  // Ajouter un écouteur pour l'événement de connexion réussie
  useEffect(() => {
    const handleLoginSuccess = () => {
      // Forcer un re-chargement des données utilisateur
      checkAuthStatus();
    };

    window.addEventListener("login-success", handleLoginSuccess);

    return () => {
      window.removeEventListener("login-success", handleLoginSuccess);
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
      window.dispatchEvent(new Event("logout-start"));

      // Call the logout service directly - no need for timeout
      authService.logout("/login");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);

      // En cas d'erreur, forcer une déconnexion propre
      authService.clearAuthData(
        true,
        "Une erreur est survenue lors de la déconnexion."
      );
    }
  };

  return (
    <>
      {/* Injection des styles personnalisés */}
      <style>{customStyles}</style>

      <header className="navbar-fixed bg-[#02284f] dark:bg-[#01111e] shadow-lg z-[100]">
        <nav className="bg-[#02284f] dark:bg-[#01111e] w-full relative">
          <div className="container px-4 mx-auto relative">
            <div className="flex items-center justify-between h-16">
              {/* Partie gauche: Logo et burger menu */}
              <div className="flex items-center">
                <div className="menu-burger-wrapper">
                  <MenuBurger />
                </div>
                <div className="flex-shrink-0">
                  <motion.div
                    onMouseEnter={() => setHoverLogo(true)}
                    onMouseLeave={() => setHoverLogo(false)}
                    style={{ display: 'inline-block' }}
                  >
                    <Link
                      to={
                        isAuthenticated
                          ? permissions.getRoleDashboardPath()
                          : "/login"
                      }
                      className="navbar-brand text-2xl font-black tracking-tight text-white dark:text-white whitespace-nowrap"
                      tabIndex={0}
                    >
                      <motion.span
                        animate={{ color: hoverLogo ? "#528eb2" : "white" }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="transition-colors"
                        style={{ marginRight: 2 }}
                      >
                        Big
                      </motion.span>
                      <motion.span
                        animate={{ color: hoverLogo ? "white" : "#528eb2" }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="transition-colors"
                      >
                        Project
                      </motion.span>
                    </Link>
                  </motion.div>
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
              <div className="flex items-center navbar-actions">
                {/* Attendance button based on role */}
                {isAuthenticated &&
                  (permissions.isStudent() || permissions.isTeacher()) && (
                    <div className="desktop-only relative mr-2">
                      <button
                        onClick={() =>
                          navigate(
                            permissions.isTeacher()
                              ? "/teacher/attendance"
                              : "/student/attendance"
                          )
                        }
                        className="group flex items-center justify-start w-11 h-11 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full cursor-pointer relative overflow-hidden transition-all duration-200 shadow-md md:hover:w-32 hover:rounded-[50px] hover:shadow-lg active:translate-x-1 active:translate-y-1"
                      >
                        <div className="flex items-center justify-center w-full transition-all duration-300 group-hover:justify-start group-hover:px-3">
                          <ClipboardPenLine className="w-4 h-4 text-white group-hover:animate-pulse" />
                          {needsSignature && (
                            <span className="absolute top-1 right-2 md:right-5 flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                            </span>
                          )}
                        </div>
                        <div className="absolute right-5 transform translate-x-full opacity-0 text-white text-sm font-medium transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 hidden md:block">
                          Présence
                        </div>
                      </button>
                    </div>
                  )}

                {/* Barre de recherche mobile */}
                {isAuthenticated && (
                  <div className="md:hidden">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full w-10 h-10 p-0 bg-transparent text-gray-200 hover:bg-[#02284f]/80 hover:text-white dark:text-[#78b9dd] dark:hover:bg-[#78b9dd]/20"
                      onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                    >
                      <Search className="h-5 w-5" />
                    </Button>
                  </div>
                )}

                {/* Menu utilisateur */}
                {isLoading ? (
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-8 w-24 rounded-md dark:bg-gray-700" />
                    <Skeleton className="h-10 w-10 rounded-full dark:bg-gray-700" />
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
        </nav>
      </header>

      {/* Dialogue de confirmation de déconnexion */}
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
    </>
  );
});

// Ajout d'un nom d'affichage pour les outils de développement
Navbar.displayName = "Navbar";

export default Navbar;
