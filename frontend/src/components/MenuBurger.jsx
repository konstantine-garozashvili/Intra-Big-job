import React, { memo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../lib/services/authService';
import { Link, useNavigate } from 'react-router-dom';
import {
  User, 
  UserPlus, 
  Shield, 
  Users, 
  GraduationCap,
  Calendar,
  MessageCircle,
  BookOpen, 
  Bell, 
  PiggyBank,
  Camera,
  Handshake,
  School,
  LayoutDashboard,
  Briefcase, 
  Share2,
  Clipboard,
  ChevronDown,
  ChevronRight,
  LogOut,
  X,
  Menu
} from 'lucide-react';

// Style personnalisé pour les animations et transitions
const customStyles = `
  .menu-item {
    position: relative;
    transition: all 0.2s ease;
    border-radius: 0.375rem;
    margin: 0.25rem 0.5rem;
  }
  
  .menu-item:hover {
    background-color: rgba(82, 142, 178, 0.2);
    transform: translateX(4px);
  }
  
  .menu-item.active {
    background-color: rgba(82, 142, 178, 0.3);
    border-left: 3px solid #528eb2;
  }
  
  .submenu-item {
    transition: all 0.2s ease;
    border-radius: 0.375rem;
    margin: 0.25rem 0.5rem;
  }
  
  .submenu-item:hover {
    background-color: rgba(82, 142, 178, 0.3);
    transform: translateX(4px);
  }
  
  .chevron-icon {
    transition: transform 0.3s ease;
  }
  
  .chevron-icon.open {
    transform: rotate(90deg);
  }
  
  .menu-burger-button {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    transition: all 0.2s ease;
    margin-right: 0.75rem;
    background-color: transparent;
    border: none;
    cursor: pointer;
  }
  
  .menu-burger-button:hover {
    background-color: rgba(255, 255, 255, 0.1);
    transform: scale(1.05);
  }
  
  .menu-burger-button:active {
    transform: scale(0.95);
  }
  
  .sidebar-menu {
    position: fixed;
    top: 0;
    left: 0;
    width: 20vw;
    height: 100vh;
    background-color: #00284f;
    color: white;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    z-index: 50;
    overflow: hidden;
    border-right: 1px solid rgba(82, 142, 178, 0.2);
  }
  
  @media (max-width: 768px) {
    .sidebar-menu {
      width: 80vw;
    }
  }
`;

const MenuBurger = memo(() => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [openSubMenus, setOpenSubMenus] = useState({});
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();

  // Gestionnaire de clic à l'extérieur du menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuOpen && 
        menuRef.current && 
        !menuRef.current.contains(event.target) &&
        buttonRef.current && 
        !buttonRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };

    // Ajouter l'écouteur d'événement lorsque le menu est ouvert
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Nettoyer l'écouteur d'événement
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          setUserData(user);
          setIsAuthenticated(true);
          setUserRole(user.roles?.[0] || null);
        } else {
          setUserData(null);
          setIsAuthenticated(false);
          setUserRole(null);
        }
      } catch (error) {
        setUserData(null);
        setIsAuthenticated(false);
        setUserRole(null);
      }
    };
  
    checkAuthentication();
  
    // 🔥 Gérer la déconnexion
    const handleLogoutEvent = () => {
      setUserData(null);
      setIsAuthenticated(false);
      setUserRole(null);
      setMenuOpen(false); // Ferme le menu au cas où
      setOpenSubMenus({}); // 🔄 Réinitialise les sous-menus
    };
  
    // 🚀 Gérer la connexion
    const handleLoginEvent = async () => {
      await checkAuthentication(); // Recharge l'état après connexion
    };
  
    window.addEventListener('logout-success', handleLogoutEvent);
    window.addEventListener('login-success', handleLoginEvent);
  
    return () => {
      window.removeEventListener('logout-success', handleLogoutEvent);
      window.removeEventListener('login-success', handleLoginEvent);
    };
  }, []);
  
  
  const toggleMenu = () => setMenuOpen(!menuOpen);

  const toggleSubMenu = (menu) => {
    setOpenSubMenus((prev) => {
      return {
        ...prev,
        [menu]: !prev[menu] // Bascule uniquement le menu cliqué
      };
    });
  };
  

  const menuItems = [
    {
      key: 'eleves',
      label: 'Élèves',
      icon: <GraduationCap className="w-5 h-5 mr-2 text-[#528eb2]" />,
      roles: ['ROLE_SUPERADMIN', 'ROLE_ADMIN', 'ROLE_TEACHER', 'ROLE_HR', 'ROLE_RECRUITER'],
      links: [
        { name: 'Gestion des élèves', to: '/eleves', roles: ['ROLE_ADMIN', 'ROLE_TEACHER','ROLE_SUPERADMIN'] },
        { name: 'Résultats', to: '/eleves/resultats', roles: ['ROLE_TEACHER', 'ROLE_SUPERADMIN'] },
        { name: 'Dossiers', to: '/eleves/dossiers', roles: ['ROLE_ADMIN', 'ROLE_HR','ROLE_TEACHER','ROLE_SUPERADMIN'] },
        { name: 'Certificats et Diplômes', to: '/eleves/certificats', roles: ['ROLE_ADMIN', 'ROLE_TEACHER','ROLE_STUDENT','ROLE_SUPERADMIN'] },
        { name: 'Historique des Absences', to: '/eleves/absences', roles: ['ROLE_ADMIN', 'ROLE_TEACHER','ROLE_HR'] },
      ],
    },
    
    {
      key: 'enseignants',
      label: 'Enseignants',
      icon: <User className="mr-2" />,
      roles: ['ROLE_SUPERADMIN', 'ROLE_ADMIN', 'ROLE_HR','ROLE_RECRUITER'],
      links: [
        { name: 'Liste des enseignants', to: '/enseignants' , roles: ['ROLE_ADMIN', 'ROLE_HR','ROLE_TEACHER','ROLE_SUPERADMIN']},
        { name: 'Statistiques et Rapports', to: '/enseignants/statistiques' , roles: ['ROLE_ADMIN', 'ROLE_HR','ROLE_TEACHER','ROLE_SUPERADMIN']},
        { name: 'Gestion des Projets', to: '/enseignants/projets' , roles: ['ROLE_ADMIN','ROLE_TEACHER']},
        { name: 'Commentaire', to: '/enseignants/commentaire', roles: ['ROLE_ADMIN', 'ROLE_HR','ROLE_TEACHER','ROLE_SUPERADMIN'] },
      ],
    },
    {
      key: 'invites',
      label: 'Invités',
      icon: <UserPlus className="mr-2" />,
      roles: ['ROLE_SUPERADMIN', 'ROLE_ADMIN'],
      links: [
        { name: 'Liste des invités', to: '/invites', roles: ['ROLE_ADMIN','ROLE_SUPERADMIN'] },
        { name: 'Gestion des invités', to: '/invites/' , roles: ['ROLE_ADMIN', 'ROLE_SUPERADMIN']},
        { name: "Test d'admission", to: '/invites/test_admission' , roles: ['ROLE_ADMIN', 'ROLE_HR','ROLE_SUPERADMIN']},
        { name: 'Statistiques des Invités', to: '/admin/invite/statistiques', roles: ['ROLE_ADMIN', 'ROLE_SUPERADMIN'] },
      ],
    },
    {
      key: 'rh',
      label: 'RH',
      icon: <Users className="mr-2" />,
      roles: ['ROLE_SUPERADMIN', 'ROLE_ADMIN'],
      links: [
        { name: 'Gestion des Formateurs', to: '/rh/formateurs' , roles: ['ROLE_ADMIN', 'ROLE_SUPERADMIN', 'ROLE_HR']},
        { name: 'Gestion des Candidatures', to: '/rh/candidatures', roles: ['ROLE_ADMIN', 'ROLE_SUPERADMIN', 'ROLE_HR'] },
        { name: 'Suivi des Absences et Congés', to: '/rh/absences' , roles: ['ROLE_ADMIN', 'ROLE_SUPERADMIN', 'ROLE_HR']},
        { name: 'Planning des Formateurs', to: '/rh/planning' , roles: ['ROLE_ADMIN', 'ROLE_SUPERADMIN', 'ROLE_HR']},
        { name: 'Archivage des Dossiers', to: '/rh/archivage', roles: ['ROLE_ADMIN', 'ROLE_SUPERADMIN', 'ROLE_HR'] },
    { name: 'Suivi des Recrutements', to: '/rh/recrutement' , roles: ['ROLE_ADMIN', 'ROLE_SUPERADMIN', 'ROLE_HR']},
    
      ],
    },
    {
      key: 'admins',
      label: 'Admins',
      icon: <Shield className="mr-2" />,
      roles: ['ROLE_SUPERADMIN'],
      links: [
        { name: 'Gestion des utilisateurs', to: '/admin/utilisateurs' , roles: ['ROLE_ADMIN','ROLE_SUPERADMIN']},
        { name: 'Gestion des Formations', to: '/admin/formations' , roles: ['ROLE_ADMIN','ROLE_SUPERADMIN']},
        { name: 'Suivi des Inscriptions', to: '/admin/inscriptions' , roles: ['ROLE_ADMIN','ROLE_SUPERADMIN']},
        { name: 'Gestion des Paiements', to: '/admin/paiements' , roles: ['ROLE_ADMIN','ROLE_SUPERADMIN']},
        { name: 'Suivi des Absences', to: '/admin/absences', roles: ['ROLE_ADMIN','ROLE_SUPERADMIN'] },
        { name: 'Statistiques Administratives', to: '/admin/statistiques' , roles: ['ROLE_ADMIN','ROLE_SUPERADMIN']}, 
        { name: 'Les logs', to: '/admin/logs' },
        { name: 'Gestion des partenaires', to: '/admin/partenariats', roles: ['ROLE_ADMIN','ROLE_SUPERADMIN'] },  
      ],
    },
    {
      key: 'plannings',
      label: 'Plannings',
      icon: <Calendar className="mr-2" />,
      roles: ['ROLE_SUPERADMIN', 'ROLE_ADMIN', 'ROLE_TEACHER','ROLE_HR','ROLE_RECRUITER','ROLE_STUDENT'],
      links: [
        { name: 'Evènement', to: '/plannings/évènements' },
        { name: 'Agenda', to: '/plannings/agenda' },
        { name: 'Réservation de salle', to: '/plannings/reservation-salle' },
      { name: 'Réservation de matériel', to: '/plannings/reservation-materiel' }
        
      ],
    },
    {
      key: 'aide',
      label: "Besoin d'aide ?",
      icon: <Calendar className="mr-2" />,
      links: [ // Pas de `roles`, donc accessible à tout le monde
        { name: 'FAQ', to: '/aide/faq' },
        { name: 'Forum', to: '/aide/forum' },
        { name: 'Supports', to: '/aide/faq' },
        { name: 'Contact', to: '/aide/contact' },
      ],
    },
    {
      key: 'nous_rejoindre',
      label: 'Nous rejoindre',
      icon: <Users className="mr-2" />,
      links: [
        { name: 'Envoyer une candidature', to: '/nous-rejoindre/candidature' },
        { name: 'Processus de recrutement', to: '/nous-rejoindre/recrutement' },
        { name: "Offres d'emploi", to: '/nous-rejoindre/offres' },
        { name: 'Devenir partenaire', to: '/nous-rejoindre/partenaire' },
        { name: 'Devenir sponsor', to: '/nous-rejoindre/sponsor' },
      ],
    },
    
  ];

  // Fonction de déconnexion
  const handleLogout = async () => {
    try {
      await authService.logout();
      
      // Déclencher un événement personnalisé pour informer l'application de la déconnexion
      window.dispatchEvent(new Event("logout-success"));
      
      setMenuOpen(false);
      navigate("/login");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  return (
    <div className="relative">
      {/* Injection des styles personnalisés */}
      <style>{customStyles}</style>
      
      <button 
        ref={buttonRef}
        className="menu-burger-button text-gray-200 hover:text-white focus:outline-none" 
        onClick={toggleMenu}
        aria-label="Menu principal"
      >
        <Menu className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            ref={menuRef}
            initial={{ x: '-100%', opacity: 1 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 1 }}
            transition={{ 
              duration: 0.3, 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              opacity: { duration: 0 } // Désactive l'animation de l'opacité
            }}
            className="sidebar-menu"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center p-4 border-b border-blue-700 bg-gradient-to-r from-[#00284f] to-[#003a6b]">
                <div className="w-12 h-12 bg-white/20 rounded-full mr-3 flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold">{userData ? `${userData.firstName} ${userData.lastName}` : 'Utilisateur'}</p>
                  <p className="text-sm text-blue-200">{userRole || 'Non connecté'}</p>
                </div>
                <button 
                  className="ml-auto text-white p-2 rounded-full hover:bg-blue-800/50 transition-colors" 
                  onClick={toggleMenu}
                  aria-label="Fermer le menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="scrollable-div overflow-y-auto flex-grow">
                <ul className="py-2">
                  {(userRole === 'ROLE_STUDENT' || userRole === 'ROLE_TEACHER'|| userRole === 'ROLE_ADMIN'|| userRole === 'ROLE_SUPERADMIN') &&(
                    <li className="menu-item">
                      <Link to="/dashboard" className="flex items-center px-4 py-2.5 w-full">
                        <LayoutDashboard className="w-5 h-5 mr-2 text-[#528eb2]" />
                        <span>Tableau de bord</span>
                      </Link>
                    </li>
                  )}
                  

                  
                  {(userRole === 'ROLE_STUDENT' || userRole === 'ROLE_TEACHER'|| userRole === 'ROLE_ADMIN'|| userRole === 'ROLE_SUPERADMIN') &&(
                    <li className="menu-item">
                      <Link to="/messagerie" className="flex items-center px-4 py-2.5 w-full">
                        <MessageCircle className="w-5 h-5 mr-2 text-[#528eb2]" />
                        <span>Ma Messagerie</span>
                      </Link>
                    </li>
                  )}

                  {(userRole === 'ROLE_STUDENT' || userRole === 'ROLE_TEACHER') && (
                    <>
                      <li className="menu-item">
                        <Link to="/cours" className="flex items-center px-4 py-2.5 w-full">
                          <Clipboard className="w-5 h-5 mr-2 text-[#528eb2]" />
                          <span>Mes Cours</span>
                        </Link>
                      </li>
                      <li className="menu-item">
                        <Link to="/projet" className="flex items-center px-4 py-2.5 w-full">
                          <Briefcase className="w-5 h-5 mr-2 text-[#528eb2]" />
                          <span>Mes Projets</span>
                        </Link>
                      </li>
                    </>
                  )}
                  
                  {userRole === 'ROLE_SUPERADMIN' && (
                    <li className="menu-item">
                      <Link to="/centres_formations" className="flex items-center px-4 py-2.5 w-full">
                        <School className="w-5 h-5 mr-2 text-[#528eb2]" />
                        <span>Centres de formations</span>
                      </Link>
                    </li>
                  )}
                  
                  {(userRole === 'ROLE_HR' || userRole === 'ROLE_RECRUITER') && (
                    <li className="menu-item">
                      <Link to="/candidatures" className="flex items-center px-4 py-2.5 w-full">
                        <Share2 className="w-5 h-5 mr-2 text-[#528eb2]" />
                        <span>Candidatures</span>
                      </Link>
                    </li>
                  )}
                  
                  <li className="menu-item">
                    <Link to="/formations" className="flex items-center px-4 py-2.5 w-full">
                      <BookOpen className="w-5 h-5 mr-2 text-[#528eb2]" />
                      <span>Formations</span>
                    </Link>
                  </li>
                  
                  {menuItems.map(({ key, icon, label, roles, links }) =>
                    (!roles || roles.includes(userRole)) ? (
                      <React.Fragment key={key}>
                        <li
                          className={`menu-item ${openSubMenus[key] ? 'active' : ''}`}
                          onClick={() => toggleSubMenu(key)}
                        >
                          <div className="flex items-center px-4 py-2.5 w-full cursor-pointer">
                            {icon}
                            <span>{label}</span>
                            <div className="ml-auto">
                              {openSubMenus[key] ? (
                                <ChevronDown className="w-4 h-4 text-[#528eb2]" />
                              ) : (
                                <ChevronRight className={`w-4 h-4 text-[#528eb2] chevron-icon ${openSubMenus[key] ? 'open' : ''}`} />
                              )}
                            </div>
                          </div>
                        </li>

                        <AnimatePresence>
                          {openSubMenus[key] && (
                            <motion.ul
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="pl-4 overflow-hidden"
                            >
                              {links
                                .filter(link => !link.roles || link.roles.includes(userRole))
                                .map((link, index) => (
                                  <li key={index} className="submenu-item">
                                    <Link to={link.to} className="flex items-center px-4 py-2 w-full text-sm text-gray-300 hover:text-white">
                                      <div className="w-1 h-1 bg-[#528eb2] rounded-full mr-2"></div>
                                      {link.name}
                                    </Link>
                                  </li>
                                ))}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      </React.Fragment>
                    ) : null
                  )}
                  
                  {(userRole === 'ROLE_STUDENT') && (
                    <li className="menu-item">
                      <Link to="/justification-absence" className="flex items-center px-4 py-2.5 w-full">
                        <Clipboard className="w-5 h-5 mr-2 text-[#528eb2]" />
                        <span>Justifier une absence</span>
                      </Link>
                    </li>
                  )}

                  {(userRole === 'ROLE_STUDENT' || userRole === 'ROLE_TEACHER'|| userRole === 'ROLE_ADMIN'|| userRole === 'ROLE_SUPERADMIN') &&(
                    <li className="menu-item">
                      <Link to="/cagnottes" className="flex items-center px-4 py-2.5 w-full">
                        <PiggyBank className="w-5 h-5 mr-2 text-[#528eb2]" />
                        <span>Cagnottes</span>
                      </Link>
                    </li>
                  )}
                  
                  {(userRole === 'ROLE_STUDENT' || userRole === 'ROLE_TEACHER'|| userRole === 'ROLE_ADMIN'|| userRole === 'ROLE_SUPERADMIN') &&(
                    <li className="menu-item">
                      <Link to="/sponsors" className="flex items-center px-4 py-2.5 w-full">
                        <Handshake className="w-5 h-5 mr-2 text-[#528eb2]" />
                        <span>Sponsors</span>
                      </Link>
                    </li>
                  )}
                  
                  {(userRole === 'ROLE_STUDENT' || userRole === 'ROLE_TEACHER'|| userRole === 'ROLE_ADMIN'|| userRole === 'ROLE_SUPERADMIN' || userRole === 'ROLE_RECRUITER') &&(
                    <li className="menu-item">
                      <Link to="/Trombinoscope" className="flex items-center px-4 py-2.5 w-full">
                        <Camera className="w-5 h-5 mr-2 text-[#528eb2]" />
                        <span>Trombinoscope</span>
                      </Link>
                    </li>
                  )}
                </ul>
              </div>

              <div className="p-4 border-t border-blue-700 mt-auto">
                <button 
                  className="menu-item flex items-center w-full px-4 py-2.5 text-left text-red-300 hover:text-red-200"
                  onClick={handleLogout}
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  <span>Déconnexion</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export { MenuBurger };
