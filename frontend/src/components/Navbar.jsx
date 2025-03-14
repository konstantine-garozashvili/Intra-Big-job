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
import { MenuBurger } from "./MenuBurger";
import { useRolePermissions } from '@/features/roles/useRolePermissions';

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
  }
`;

// Utilisation de React.memo pour éviter les rendus inutiles de la barre de navigation
const Navbar = memo(({ user }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const permissions = useRolePermissions();
  const dropdownMenuRef = useRef(null);

  // Vérifier l'état d'authentification
  const checkAuthStatus = async () => {
    try {
      const status = authService.isLoggedIn();
      const wasAuthenticated = isAuthenticated;
      setIsAuthenticated(status);

      // Si l'utilisateur est connecté, charger ses données
      if (status) {
        try {
          // Si un utilisateur est passé en props, l'utiliser
          if (user) {
            console.log('Using user from props:', user);
            setUserData(user);
            
            // Déclencher un événement de changement de rôle si l'état d'authentification a changé
            if (!wasAuthenticated) {
              console.log('Dispatching role-change event from Navbar (login)');
              window.dispatchEvent(new Event('role-change'));
            }
          } else {
            // Sinon, essayer de récupérer les données depuis l'API
            const userData = await authService.getCurrentUser();
            console.log('User data from API:', userData);
            setUserData(userData);
            
            // Déclencher un événement de changement de rôle si l'état d'authentification a changé
            if (!wasAuthenticated) {
              console.log('Dispatching role-change event from Navbar (login)');
              window.dispatchEvent(new Event('role-change'));
            }
          }
        } catch (userError) {
          console.error(
            "Erreur lors de la récupération des données utilisateur:",
            userError
          );
          
          // Fallback: essayer de récupérer les données du profil
          try {
            const profileData = await profileService.getAllProfileData();
            console.log('Profile data from API:', profileData);
            
            if (profileData?.user) {
              setUserData(profileData.user);
            } else if (profileData?.data?.user) {
              setUserData(profileData.data.user);
            } else {
              setUserData(profileData);
            }
            
            // Déclencher un événement de changement de rôle si l'état d'authentification a changé
            if (!wasAuthenticated) {
              console.log('Dispatching role-change event from Navbar (login)');
              window.dispatchEvent(new Event('role-change'));
            }
          } catch (profileError) {
            console.error(
              "Erreur lors de la récupération des données du profil:",
              profileError
            );
          }
        }
      } else {
        setUserData(null);
        
        // Déclencher un événement de changement de rôle si l'état d'authentification a changé
        if (wasAuthenticated) {
          console.log('Dispatching role-change event from Navbar (logout)');
          window.dispatchEvent(new Event('role-change'));
        }
      }
    } catch (error) {
      console.error(
        "Erreur lors de la vérification du statut d'authentification:",
        error
      );
      setIsAuthenticated(false);
      setUserData(null);
    }
  };

  // Vérifier l'état d'authentification au chargement et lors des changements de route
  useEffect(() => {
    checkAuthStatus();
  }, [location.pathname, user]);

  // Ajouter un écouteur d'événement pour les changements d'authentification
  useEffect(() => {
    // Fonction pour gérer l'événement de connexion
    const handleAuthChange = () => {
      checkAuthStatus();
    };

    // Ajouter des écouteurs d'événements personnalisés
    window.addEventListener("login-success", handleAuthChange);
    window.addEventListener("logout-success", handleAuthChange);

    // Nettoyage lors du démontage du composant
    return () => {
      window.removeEventListener("login-success", handleAuthChange);
      window.removeEventListener("logout-success", handleAuthChange);
    };
  }, []);

  // Fonction de déconnexion
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      // Réinitialiser les données locales avant d'appeler le service de déconnexion
      setUserData(null);
      setIsAuthenticated(false);
      
      // Fermer la boîte de dialogue de déconnexion
      setLogoutDialogOpen(false);

      // Appeler le service de déconnexion
      // Cette fonction va maintenant forcer un rafraîchissement complet de la page
      await authService.logout();
      
      // Note: Le code ci-dessous ne sera pas exécuté car la page sera rafraîchie
      // mais nous le gardons au cas où le comportement du service changerait
      setIsLoggingOut(false);
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      setIsLoggingOut(false);
    }
  };

  // Composant pour le menu utilisateur (réutilisé pour desktop et mobile)
  const UserMenu = () => (
    <div className="flex items-center">
      {/* Notification icon (placeholder) */}
      <Button 
        variant="ghost" 
        className="rounded-full w-10 h-10 p-0 bg-transparent text-gray-200 hover:bg-[#02284f]/80 hover:text-white mr-2"
      >
        <Bell className="h-5 w-5" />
      </Button>
      
      {/* Dropdown menu */}
      <DropdownMenu onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className={`rounded-full w-10 h-10 p-0 ${dropdownOpen ? 'bg-[#528eb2]/20 border-[#528eb2]' : 'bg-transparent border-gray-500'} hover:bg-[#02284f]/80 hover:text-white hover:border-gray-400 transition-all duration-300`}
          >
            <UserRound className={`h-5 w-5 ${dropdownOpen ? 'text-white' : 'text-gray-200'}`} />
          </Button>
        </DropdownMenuTrigger>
        {dropdownOpen && (
          <DropdownMenuContent 
            align="end" 
            className="w-64 mt-2 p-0 overflow-hidden border border-gray-100 shadow-xl rounded-xl"
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
        )}
      </DropdownMenu>
    </div>
  );

  // Composant pour les boutons d'authentification (réutilisé pour desktop et mobile)
  const AuthButtons = () => (
    <>
      <Link to="/login" className="px-4 py-2 text-gray-200 transition-colors rounded-md hover:text-white">
        Connexion
      </Link>
      <Link to="/register" className="ml-2 px-4 py-2 bg-[#528eb2] rounded-md text-white font-medium hover:bg-[#528eb2]/90 transition-all transform hover:scale-105">
        Inscription
      </Link>
    </>
  );

  return (
    <>
      {/* Injection des styles personnalisés */}
      <style>{customStyles}</style>

      <nav className="bg-[#02284f] shadow-lg">
        <div className="container px-4 mx-auto">
          <div className="flex items-center justify-between h-16">
            {/* Partie gauche: Burger menu et logo */}
            <div className="flex items-center">
              <div className="menu-burger-wrapper">
                <MenuBurger />
              </div>
              <div className="flex-shrink-0">
                <Link
                  to={isAuthenticated ? "/dashboard" : "/login"}
                  className="text-2xl font-black tracking-tight text-white"
                >
                  Big<span className="text-[#528eb2]">Project</span>
                </Link>
              </div>
            </div>

            {/* Partie centrale: Navigation (visible uniquement sur desktop) */}
            <div className="hidden md:block">
              <div className="flex items-center ml-10 space-x-1">
                {/* Élements affichés uniquement pour les utilisateurs connectés */}
                {isAuthenticated && (
                  <Link 
                    to={permissions.getRoleDashboardPath()} 
                    className="px-3 py-2 rounded-md text-gray-200 hover:text-white hover:bg-[#02284f]/80 transition-colors flex items-center"
                  >
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Tableau de bord
                  </Link>
                )}
              </div>
            </div>

            {/* Partie droite: Authentification (desktop) */}
            <div className="hidden md:block">
              <div className="flex items-center ml-4">
                {isAuthenticated ? <UserMenu /> : <AuthButtons />}
              </div>
            </div>

            {/* Partie droite: Authentification (mobile) - Remplace le burger menu de droite */}
            <div className="md:hidden">
              <div className="flex items-center">
                {isAuthenticated ? (
                  <UserMenu />
                ) : (
                  <div className="mobile-auth-buttons">
                    <AuthButtons />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Dialogue de confirmation de déconnexion */}
        {logoutDialogOpen && (
          <Dialog open={logoutDialogOpen} onOpenChange={(open) => !isLoggingOut && setLogoutDialogOpen(open)}>
            <DialogContent className="max-h-[calc(100vh-2rem)] w-full max-w-md overflow-hidden rounded-2xl border-0 shadow-xl">
              <div
                className="overflow-y-auto max-h-[70vh] fade-in-up"
              >
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold">Confirmation de déconnexion</DialogTitle>
                  <DialogDescription className="text-base mt-2">
                    Êtes-vous sûr de vouloir vous déconnecter de votre compte ? Toutes vos sessions actives seront fermées.
                  </DialogDescription>
                </DialogHeader>
              </div>
              <DialogFooter className="mt-6 flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setLogoutDialogOpen(false)}
                  disabled={isLoggingOut}
                  className="rounded-full border-2 hover:bg-gray-100 transition-all duration-200"
                >
                  Annuler
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className={`rounded-full bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 transition-all duration-200 ${isLoggingOut ? 'opacity-80' : ''}`}
                >
                  {isLoggingOut ? "Déconnexion..." : "Se déconnecter"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </nav>
    </>
  );
});

// Ajout d'un nom d'affichage pour les outils de développement
Navbar.displayName = "Navbar";

export default Navbar;
