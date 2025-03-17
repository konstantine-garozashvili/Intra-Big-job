import React, { memo, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../lib/services/authService';
import profilService from '../lib/services/profilService';
import { Button } from './ui/button';
import { UserRound, LayoutDashboard, LogOut, Settings, User, Bell, Clipboard, ClipboardCheck } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from './ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';

// Style personnalisé pour le menu dropdown
const customDropdownStyles = `
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
`;

// Utilisation de React.memo pour éviter les rendus inutiles de la barre de navigation
const Navbar = memo(() => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Vérifier l'état d'authentification
  const checkAuthStatus = async () => {
    try {
      const status = authService.isLoggedIn();
      setIsAuthenticated(status);
      
      // Si l'utilisateur est connecté, charger ses données
      if (status) {
        try {
          const profilData = await profilService.getAllProfilData();
          // Vérifions la structure des données et adaptons l'accès en fonction
          if (profilData && profilData.user) {
            setUserData(profilData.user);
          } else if (profilData && profilData.data && profilData.data.user) {
            // Alternative si la structure est différente
            setUserData(profilData.data.user);
          } else {
            // Fallback: essayons de récupérer directement les données utilisateur
            const userData = await profilService.getUserData();
            setUserData(userData);
          }
        } catch (profileError) {
          console.error('Erreur lors de la récupération des données du profil:', profileError);
        }
      } else {
        setUserData(null);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du statut d\'authentification:', error);
      setIsAuthenticated(false);
      setUserData(null);
    }
  };

  // Vérifier l'état d'authentification au chargement et lors des changements de route
  useEffect(() => {
    checkAuthStatus();
  }, [location.pathname]);

  // Ajouter un écouteur d'événement pour les changements d'authentification
  useEffect(() => {
    // Fonction pour gérer l'événement de connexion
    const handleAuthChange = () => {
      checkAuthStatus();
    };

    // Ajouter des écouteurs d'événements personnalisés
    window.addEventListener('login-success', handleAuthChange);
    window.addEventListener('logout-success', handleAuthChange);
    
    // Nettoyage lors du démontage du composant
    return () => {
      window.removeEventListener('login-success', handleAuthChange);
      window.removeEventListener('logout-success', handleAuthChange);
    };
  }, []);

  // Fonction de déconnexion
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      
      await authService.logout();
      
      // Déclencher un événement personnalisé pour informer la navbar de la déconnexion
      window.dispatchEvent(new Event('logout-success'));
      
      setLogoutDialogOpen(false);
      setIsAuthenticated(false);
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      setIsLoggingOut(false);
    }
  };

  // Style personnalisé pour le menu dropdown
  const dropdownMenuStyles = {
    enter: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: { duration: 0.2, ease: "easeOut" }
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.2, ease: "easeOut" }
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: { duration: 0.1, ease: "easeIn" }
    }
  };

  // Add a function to check if user has a specific role
  const hasRole = (role) => {
    // First check userData.roles
    if (userData && userData.roles && userData.roles.includes(role)) {
      return true;
    }
    // Fallback to localStorage
    const userRoles = JSON.parse(localStorage.getItem('userRoles') || '[]');
    return userRoles.includes(role);
  };

  return (
    <>
      {/* Injection des styles personnalisés */}
      <style>{customDropdownStyles}</style>
      
      <nav className="bg-[#02284f] shadow-lg">
        <div className="container px-4 mx-auto">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <Link to={isAuthenticated ? "/dashboard" : "/login"} className="text-2xl font-black tracking-tight text-white">
                Big<span className="text-[#528eb2]">Project</span>
              </Link>
            </div>

            <div className="hidden md:block">
              <div className="flex items-center ml-10 space-x-1">
                {/* Élements affichés uniquement pour les utilisateurs connectés */}
                {isAuthenticated && (
                  <>
                    <Link 
                      to="/dashboard" 
                      className="px-3 py-2 rounded-md text-gray-200 hover:text-white hover:bg-[#02284f]/80 transition-colors flex items-center"
                    >
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Tableau de bord
                    </Link>
                    
                    {/* Lien pour l'enregistrement de présence (pour les étudiants uniquement) */}
                    {hasRole('ROLE_STUDENT') && (
                      <Link 
                        to="/attendance" 
                        className="px-3 py-2 rounded-md text-gray-200 hover:text-white hover:bg-[#02284f]/80 transition-colors flex items-center"
                      >
                        <Clipboard className="h-4 w-4 mr-2" />
                        Présence
                      </Link>
                    )}
                    
                    {/* Lien pour le suivi des signatures (pour les enseignants uniquement) */}
                    {hasRole('ROLE_TEACHER') && (
                      <Link 
                        to="/signature-monitoring" 
                        className="px-3 py-2 rounded-md text-gray-200 hover:text-white hover:bg-[#02284f]/80 transition-colors flex items-center"
                      >
                        <ClipboardCheck className="h-4 w-4 mr-2" />
                        Suivi des présences
                      </Link>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="hidden md:block">
              <div className="flex items-center ml-4">
                {isAuthenticated ? (
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
                      <AnimatePresence>
                        {dropdownOpen && (
                          <DropdownMenuContent 
                            align="end" 
                            className="w-64 mt-2 p-0 overflow-hidden border border-gray-100 shadow-xl rounded-xl"
                            asChild
                            forceMount
                          >
                            <motion.div
                              initial="enter"
                              animate="visible"
                              exit="exit"
                              variants={dropdownMenuStyles}
                            >
                              {/* En-tête du dropdown avec avatar et nom */}
                              <div className="bg-gradient-to-r from-[#02284f] to-[#03386b] p-4 text-white">
                                <div className="flex items-center">
                                  <div className="bg-white/20 rounded-full p-2.5">
                                    <UserRound className="h-6 w-6" />
                                  </div>
                                  <div className="ml-3">
                                    <h3 className="font-medium text-sm">{userData ? `${userData.firstName} ${userData.lastName}` : 'Utilisateur'}</h3>
                                    <p className="text-xs text-gray-300">{userData ? userData.email : 'utilisateur@example.com'}</p>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Corps du dropdown avec les options */}
                              <div className="py-1 bg-white">
                                <DropdownMenuItem 
                                  className="flex items-center p-3" 
                                  onClick={() => navigate('/profil')}
                                >
                                  <User className="mr-2 h-4 w-4 text-[#528eb2]" />
                                  <span>Mon profil</span>
                                </DropdownMenuItem>
                                
                                <DropdownMenuItem 
                                  className="flex items-center p-3"
                                >
                                  <Settings className="mr-2 h-4 w-4 text-[#528eb2]" />
                                  <span>Paramètres</span>
                                </DropdownMenuItem>
                                
                                <DropdownMenuSeparator className="my-1 bg-gray-100" />
                                
                                <DropdownMenuItem 
                                  className="flex items-center p-3 text-red-600"
                                  onClick={() => setLogoutDialogOpen(true)}
                                >
                                  <LogOut className="mr-2 h-4 w-4" />
                                  <span>Déconnexion</span>
                                </DropdownMenuItem>
                              </div>
                            </motion.div>
                          </DropdownMenuContent>
                        )}
                      </AnimatePresence>
                    </DropdownMenu>
                  </div>
                ) : (
                  <>
                    <Link to="/login" className="px-4 py-2 text-gray-200 transition-colors rounded-md hover:text-white">
                      Connexion
                    </Link>
                    <Link to="/register" className="ml-2 px-4 py-2 bg-[#528eb2] rounded-md text-white font-medium hover:bg-[#528eb2]/90 transition-all transform hover:scale-105">
                      Inscription
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="md:hidden">
              <button className="text-gray-200 hover:text-white focus:outline-none">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Dialogue de confirmation de déconnexion */}
        <AnimatePresence>
          {logoutDialogOpen && (
            <Dialog open={logoutDialogOpen} onOpenChange={(open) => !isLoggingOut && setLogoutDialogOpen(open)}>
              <DialogContent className="max-h-[calc(100vh-2rem)] w-full max-w-md overflow-hidden rounded-2xl border-0 shadow-xl">
                <motion.div
                  className="overflow-y-auto max-h-[70vh]"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">Confirmation de déconnexion</DialogTitle>
                    <DialogDescription className="text-base mt-2">
                      Êtes-vous sûr de vouloir vous déconnecter de votre compte ? Toutes vos sessions actives seront fermées.
                    </DialogDescription>
                  </DialogHeader>
                </motion.div>
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
                    {isLoggingOut ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="mr-2 h-4 w-4"
                        >
                          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </motion.div>
                        Déconnexion en cours...
                      </>
                    ) : (
                      <>
                        <LogOut className="mr-2 h-4 w-4" />
                        Se déconnecter
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
});

// Ajout d'un nom d'affichage pour les outils de développement
Navbar.displayName = 'Navbar';

export default Navbar;