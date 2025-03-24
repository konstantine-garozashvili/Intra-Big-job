import React, { memo, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, Clipboard } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Skeleton } from '../../components/ui/skeleton';
import { MenuBurger } from "../../components/MenuBurger";
import { SearchBar } from "../../components/SearchBar";
import { useRolePermissions } from "../../features/roles/useRolePermissions";
import { authService } from "../../lib/services/authService";
import userDataManager from "../../lib/services/userDataManager";
import { profileService } from "../../pages/Global/Profile/services/profileService";

// Composants extraits
import AuthButtons from "./AuthButtons";
import UserMenu from "./UserMenu";
import { customStyles } from "./navbarStyles";

/**
 * Composant Navbar - Barre de navigation principale de l'application
 * Refactorisé pour une meilleure maintenabilité
 */
const Navbar = memo(() => {
  // États
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  
  // Hooks
  const navigate = useNavigate();
  const location = useLocation();
  const permissions = useRolePermissions();
  
  // Vérifier l'état d'authentification
  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      
      // Vérifier si l'utilisateur est authentifié
      const authenticated = authService.isAuthenticated();
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        try {
          // Récupérer les données utilisateur
          const data = await userDataManager.getUserData({
            forceRefresh: false,
            suppressErrors: true
          });
          
          setUserData(data);
          
          // Vérifier si le profil est complet
          const profileStatus = await profileService.checkProfileCompleteness();
          
          // Si le profil est incomplet et que l'utilisateur n'est pas déjà sur la page de profil
          if (
            profileStatus && 
            !profileStatus.isComplete && 
            !location.pathname.includes('/profile') &&
            !location.pathname.includes('/login') &&
            !location.pathname.includes('/register')
          ) {
            // Afficher une notification pour compléter le profil
            console.info('Profil incomplet, redirection vers la page de profil');
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des données utilisateur:', error);
          
          // Si l'erreur est due à un token invalide, déconnecter l'utilisateur
          if (error.response && error.response.status === 401) {
            authService.clearAuthData();
            setIsAuthenticated(false);
            setUserData(null);
          }
        }
      } else {
        setUserData(null);
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
  }, [location.pathname]);
  
  // Écouter l'événement de connexion réussie
  useEffect(() => {
    const handleLoginSuccess = () => {
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
      // Fermer la boîte de dialogue de déconnexion
      setLogoutDialogOpen(false);
      
      // Éviter les tentatives de déconnexion en double
      if (window.__isLoggingOut) return;
      
      // Déclencher un événement de pré-déconnexion pour préparer l'interface
      window.dispatchEvent(new Event('logout-start'));
      
      // Appeler directement le service de déconnexion
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
                {/* Bouton de présence basé sur le rôle */}
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
