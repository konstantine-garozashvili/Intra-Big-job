import React, { memo, useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../lib/services/authService';
import { Link, useNavigate } from 'react-router-dom';
import { useRoles, ROLES } from '../features/roles/roleContext';
import { useRoleUI } from '../features/roles/useRolePermissions';
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
  const [userData, setUserData] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openSubMenus, setOpenSubMenus] = useState({});
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();
  
  // Utiliser le système de rôles
  const { roles, hasRole, hasAnyRole, refreshRoles } = useRoles();
  const { translateRoleName } = useRoleUI();

  // Fonction pour vérifier l'authentification et mettre à jour les données utilisateur
  const checkAuthentication = useCallback(async () => {
    try {
      if (authService.isLoggedIn()) {
        const user = await authService.getCurrentUser();
        if (user) {
          setUserData(user);
        } else {
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
    } catch (error) {
      setUserData(null);
    }
  }, []);

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

  // Effet pour vérifier l'authentification et écouter les événements d'authentification
  useEffect(() => {
    // Vérifier l'authentification au chargement
    checkAuthentication();
  
    // Gestionnaires d'événements pour les changements d'authentification
    const handleLoginEvent = async () => {
      await checkAuthentication();
      refreshRoles(); // Rafraîchir les rôles après connexion
    };
  
    const handleLogoutEvent = async () => {
      setUserData(null);
      // Les rôles seront automatiquement mis à jour par le contexte
    };
  
    const handleRoleChangeEvent = async () => {
      await checkAuthentication();
      refreshRoles(); // Rafraîchir les rôles après changement de rôle
    };
  
    // Ajouter les écouteurs d'événements
    window.addEventListener('login-success', handleLoginEvent);
    window.addEventListener('logout-success', handleLogoutEvent);
    window.addEventListener('role-change', handleRoleChangeEvent);
  
    // Nettoyer les écouteurs d'événements
    return () => {
      window.removeEventListener('login-success', handleLoginEvent);
      window.removeEventListener('logout-success', handleLogoutEvent);
      window.removeEventListener('role-change', handleRoleChangeEvent);
    };
  }, [checkAuthentication, refreshRoles]);
  
  // Effet pour fermer le menu lorsque les rôles changent
  useEffect(() => {
    // Fermer le menu si les rôles changent et que le menu est ouvert
    if (menuOpen) {
      setMenuOpen(false);
    }
  }, [roles]);
  
  const toggleMenu = () => setMenuOpen(!menuOpen);

  const toggleSubMenu = (menu) => {
    setOpenSubMenus((prev) => {
      // If the clicked menu is already open, close it
      if (prev[menu]) {
        return {
          ...prev,
          [menu]: false
        };
      }
      
      // Otherwise, close all menus and open only the clicked one
      const newState = {};
      Object.keys(prev).forEach(key => {
        newState[key] = false;
      });
      
      return {
        ...newState,
        [menu]: true
      };
    });
  };
  

  const menuItems = [
    {
      key: 'eleves',
      label: 'Élèves',
      icon: <GraduationCap className="w-5 h-5 mr-2 text-[#528eb2]" />,
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.HR, ROLES.RECRUITER],
      links: [
        { name: 'Gestion des élèves', to: '/eleves', roles: [ROLES.ADMIN, ROLES.TEACHER, ROLES.SUPER_ADMIN] },
        { name: 'Résultats', to: '/eleves/resultats', roles: [ROLES.TEACHER, ROLES.SUPER_ADMIN] },
        { name: 'Dossiers', to: '/eleves/dossiers', roles: [ROLES.ADMIN, ROLES.HR, ROLES.TEACHER, ROLES.SUPER_ADMIN] },
        { name: 'Certificats et Diplômes', to: '/eleves/certificats', roles: [ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT, ROLES.SUPER_ADMIN] },
        { name: 'Historique des Absences', to: '/eleves/absences', roles: [ROLES.ADMIN, ROLES.TEACHER, ROLES.HR] },
      ],
    },
    
    {
      key: 'enseignants',
      label: 'Enseignants',
      icon: <User className="mr-2" />,
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.HR, ROLES.RECRUITER],
      links: [
        { name: 'Liste des enseignants', to: '/enseignants', roles: [ROLES.ADMIN, ROLES.HR, ROLES.TEACHER, ROLES.SUPER_ADMIN] },
        { name: 'Statistiques et Rapports', to: '/enseignants/statistiques', roles: [ROLES.ADMIN, ROLES.HR, ROLES.TEACHER, ROLES.SUPER_ADMIN] },
        { name: 'Gestion des Projets', to: '/enseignants/projets', roles: [ROLES.ADMIN, ROLES.TEACHER] },
        { name: 'Commentaire', to: '/enseignants/commentaire', roles: [ROLES.ADMIN, ROLES.HR, ROLES.TEACHER, ROLES.SUPER_ADMIN] },
      ],
    },
    {
      key: 'invites',
      label: 'Invités',
      icon: <UserPlus className="mr-2" />,
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
      links: [
        { name: 'Liste des invités', to: '/invites', roles: [ROLES.ADMIN, ROLES.SUPER_ADMIN] },
        { name: 'Gestion des invités', to: '/invites/', roles: [ROLES.ADMIN, ROLES.SUPER_ADMIN] },
        { name: "Test d'admission", to: '/invites/test_admission', roles: [ROLES.ADMIN, ROLES.HR, ROLES.SUPER_ADMIN] },
        { name: 'Statistiques des Invités', to: '/admin/invite/statistiques', roles: [ROLES.ADMIN, ROLES.SUPER_ADMIN] },
      ],
    },
    {
      key: 'rh',
      label: 'RH',
      icon: <Users className="mr-2" />,
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
      links: [
        { name: 'Gestion des Formateurs', to: '/rh/formateurs', roles: [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.HR] },
        { name: 'Gestion des Candidatures', to: '/rh/candidatures', roles: [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.HR] },
        { name: 'Suivi des Absences et Congés', to: '/rh/absences', roles: [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.HR] },
        { name: 'Planning des Formateurs', to: '/rh/planning', roles: [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.HR] },
        { name: 'Archivage des Dossiers', to: '/rh/archivage', roles: [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.HR] },
        { name: 'Suivi des Recrutements', to: '/rh/recrutement', roles: [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.HR] },
      ],
    },
    {
      key: 'admins',
      label: 'Admins',
      icon: <Shield className="mr-2" />,
      roles: [ROLES.SUPER_ADMIN],
      links: [
        { name: 'Gestion des utilisateurs', to: '/admin/utilisateurs', roles: [ROLES.ADMIN, ROLES.SUPER_ADMIN] },
        { name: 'Gestion des Formations', to: '/admin/formations', roles: [ROLES.ADMIN, ROLES.SUPER_ADMIN] },
        { name: 'Suivi des Inscriptions', to: '/admin/inscriptions', roles: [ROLES.ADMIN, ROLES.SUPER_ADMIN] },
        { name: 'Gestion des Paiements', to: '/admin/paiements', roles: [ROLES.ADMIN, ROLES.SUPER_ADMIN] },
        { name: 'Suivi des Absences', to: '/admin/absences', roles: [ROLES.ADMIN, ROLES.SUPER_ADMIN] },
        { name: 'Statistiques Administratives', to: '/admin/statistiques', roles: [ROLES.ADMIN, ROLES.SUPER_ADMIN] }, 
        { name: 'Les logs', to: '/admin/logs', roles: [ROLES.SUPER_ADMIN] },
        { name: 'Gestion des partenaires', to: '/admin/partenariats', roles: [ROLES.ADMIN, ROLES.SUPER_ADMIN] },  
      ],
    },
    {
      key: 'plannings',
      label: 'Plannings',
      icon: <Calendar className="mr-2" />,
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.HR, ROLES.RECRUITER, ROLES.STUDENT],
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
              opacity: { duration: 0 }
            }}
            className="sidebar-menu"
          >
            <div className="flex flex-col h-full">
              {roles.length > 0 && (
                <div className="flex items-center p-4 border-b border-blue-700 bg-gradient-to-r from-[#00284f] to-[#003a6b]">
                  <div className="w-12 h-12 bg-white/20 rounded-full mr-3 flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">{userData ? `${userData.firstName} ${userData.lastName}` : 'Utilisateur'}</p>
                    <p className="text-sm text-blue-200">{translateRoleName(roles[0])}</p>
                  </div>
                  <button 
                    className="ml-auto text-white p-2 rounded-full hover:bg-blue-800/50 transition-colors" 
                    onClick={toggleMenu}
                    aria-label="Fermer le menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
              
              {!roles.length && (
                <div className="p-4 border-b border-blue-700 bg-gradient-to-r from-[#00284f] to-[#003a6b]">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl font-semibold text-white">Bienvenue</h2>
                    <button 
                      className="text-white p-2 rounded-full hover:bg-blue-800/50 transition-colors" 
                      onClick={toggleMenu}
                      aria-label="Fermer le menu"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-sm text-blue-200 mb-3">Connectez-vous pour accéder à toutes les fonctionnalités</p>
                  <Link 
                    to="/login" 
                    className="flex items-center justify-center w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Se connecter
                  </Link>
                </div>
              )}

              <div className="scrollable-div overflow-y-auto flex-grow">
                <ul className="py-2">
                  {hasAnyRole([ROLES.STUDENT, ROLES.TEACHER, ROLES.ADMIN, ROLES.SUPER_ADMIN]) && (
                    <li key="dashboard" className="menu-item">
                      <Link to="/dashboard" className="flex items-center px-4 py-2.5 w-full">
                        <LayoutDashboard className="w-5 h-5 mr-2 text-[#528eb2]" />
                        <span>Tableau de bord</span>
                      </Link>
                    </li>
                  )}
                  
                  {hasAnyRole([ROLES.STUDENT, ROLES.TEACHER, ROLES.ADMIN, ROLES.SUPER_ADMIN]) && (
                    <li key="messagerie" className="menu-item">
                      <Link to="/messagerie" className="flex items-center px-4 py-2.5 w-full">
                        <MessageCircle className="w-5 h-5 mr-2 text-[#528eb2]" />
                        <span>Ma Messagerie</span>
                      </Link>
                    </li>
                  )}

                  {hasAnyRole([ROLES.STUDENT, ROLES.TEACHER]) && (
                    <>
                      <li key="cours" className="menu-item">
                        <Link to="/cours" className="flex items-center px-4 py-2.5 w-full">
                          <Clipboard className="w-5 h-5 mr-2 text-[#528eb2]" />
                          <span>Mes Cours</span>
                        </Link>
                      </li>
                      <li key="projet" className="menu-item">
                        <Link to="/projet" className="flex items-center px-4 py-2.5 w-full">
                          <Briefcase className="w-5 h-5 mr-2 text-[#528eb2]" />
                          <span>Mes Projets</span>
                        </Link>
                      </li>
                    </>
                  )}
                  
                  {hasRole(ROLES.SUPER_ADMIN) && (
                    <li key="centres_formations" className="menu-item">
                      <Link to="/centres_formations" className="flex items-center px-4 py-2.5 w-full">
                        <School className="w-5 h-5 mr-2 text-[#528eb2]" />
                        <span>Centres de formations</span>
                      </Link>
                    </li>
                  )}
                  
                  {hasAnyRole([ROLES.HR, ROLES.RECRUITER]) && (
                    <li key="candidatures" className="menu-item">
                      <Link to="/candidatures" className="flex items-center px-4 py-2.5 w-full">
                        <Share2 className="w-5 h-5 mr-2 text-[#528eb2]" />
                        <span>Candidatures</span>
                      </Link>
                    </li>
                  )}
                  
                  <li key="formations" className="menu-item">
                    <Link to="/formations" className="flex items-center px-4 py-2.5 w-full">
                      <BookOpen className="w-5 h-5 mr-2 text-[#528eb2]" />
                      <span>Formations</span>
                    </Link>
                  </li>
                  
                  {menuItems.map(({ key, icon, label, roles: itemRoles, links }) =>
                    (!itemRoles || hasAnyRole(itemRoles)) ? (
                      <React.Fragment key={`menu-${key}`}>
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
                                .filter(link => !link.roles || hasAnyRole(link.roles))
                                .map((link, index) => (
                                  <li key={`${key}-${index}`} className="submenu-item">
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
                  
                  {hasRole(ROLES.STUDENT) && (
                    <li key="justification-absence" className="menu-item">
                      <Link to="/justification-absence" className="flex items-center px-4 py-2.5 w-full">
                        <Clipboard className="w-5 h-5 mr-2 text-[#528eb2]" />
                        <span>Justifier une absence</span>
                      </Link>
                    </li>
                  )}

                  {hasAnyRole([ROLES.STUDENT, ROLES.TEACHER, ROLES.ADMIN, ROLES.SUPER_ADMIN]) && (
                    <li key="cagnottes" className="menu-item">
                      <Link to="/cagnottes" className="flex items-center px-4 py-2.5 w-full">
                        <PiggyBank className="w-5 h-5 mr-2 text-[#528eb2]" />
                        <span>Cagnottes</span>
                      </Link>
                    </li>
                  )}
                  
                  {hasAnyRole([ROLES.STUDENT, ROLES.TEACHER, ROLES.ADMIN, ROLES.SUPER_ADMIN]) && (
                    <li key="sponsors" className="menu-item">
                      <Link to="/sponsors" className="flex items-center px-4 py-2.5 w-full">
                        <Handshake className="w-5 h-5 mr-2 text-[#528eb2]" />
                        <span>Sponsors</span>
                      </Link>
                    </li>
                  )}
                  
                  {hasAnyRole([ROLES.STUDENT, ROLES.TEACHER, ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.RECRUITER]) && (
                    <li key="trombinoscope" className="menu-item">
                      <Link to="/Trombinoscope" className="flex items-center px-4 py-2.5 w-full">
                        <Camera className="w-5 h-5 mr-2 text-[#528eb2]" />
                        <span>Trombinoscope</span>
                      </Link>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export { MenuBurger };
