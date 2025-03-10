import React, { memo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../lib/services/authService';
import { Link } from 'react-router-dom';
import {User, UserPlus, Shield , Users, GraduationCap,Calendar,MessageCircle,BookOpen, Bell, PiggyBank,Camera,Handshake,School,LayoutDashboard,Briefcase, Share2,Clipboard} from 'lucide-react';


const MenuBurger = memo(() => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [openSubMenus, setOpenSubMenus] = useState({});

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
    setOpenSubMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  const menuItems = [
    {
      key: 'eleves',
      label: 'Élèves',
      icon: <GraduationCap className="mr-2" />,
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
        { name: 'Test d’admission', to: '/invites/test_admission' , roles: ['ROLE_ADMIN', 'ROLE_HR','ROLE_SUPERADMIN']},
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
      label: 'Besoin d’aide ?',
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
        { name: 'Offres d\'emploi', to: '/nous-rejoindre/offres' },
        { name: 'Devenir partenaire', to: '/nous-rejoindre/partenaire' },
        { name: 'Devenir sponsor', to: '/nous-rejoindre/sponsor' },
      ],
    },
    
  ];

  return (
    <div className="relative">
      <button className="menu-burger-button text-gray-200 hover:text-white focus:outline-none" onClick={toggleMenu}>
        <svg className="w-10 h-auto mr-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 w-[20vw] h-full bg-[#00284f] text-white shadow-lg z-50"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center p-4 border-b border-blue-700">
                <div className="w-12 h-12 bg-white rounded-full mr-3" />
                <div>
                  <p className="font-semibold">{userData ? `${userData.firstName} ${userData.lastName}` : ''}</p>
                  <p className="text-sm text-blue-200">{userRole}</p>
                </div>
                <button className="ml-auto text-white" onClick={toggleMenu}>
                  ✕
                </button>
              </div>

              <div className="scrollable-div">
                <ul className="py-2">
                {(userRole === 'ROLE_STUDENT' || userRole === 'ROLE_TEACHER'|| userRole === 'ROLE_ADMIN'|| userRole === 'ROLE_SUPERADMIN') &&(
                    <li className="flex items-center px-4 py-2 hover:bg-blue-800">
                      <LayoutDashboard className="w-5 h-5 mr-2" />
                      <Link to="/dashboard">Tableau de bord</Link>
                    </li>
                  )}
                  {(userRole === 'ROLE_STUDENT' || userRole === 'ROLE_TEACHER'|| userRole === 'ROLE_ADMIN'|| userRole === 'ROLE_SUPERADMIN') &&(
                    <li className="flex items-center px-4 py-2 hover:bg-blue-800">
                      <Bell className="w-5 h-5 mr-2" />
                      <Link to="/notifications">Notifications</Link>
                    </li>
                  )}
                  {menuItems.map(({ key, icon, label, roles, links }) =>
                  // Vérifie si le rôle de l'utilisateur est inclus ou si les rôles sont indéfinis (permet à tout le monde d'accéder à cet élément)
                  (!roles || roles.includes(userRole)) ? ( // Vérifie si aucun rôle n'est défini ou si le rôle de l'utilisateur est inclus
                    <React.Fragment key={key}>
                      <li
                        className="flex items-center px-4 py-2 hover:bg-blue-800 cursor-pointer"
                        onClick={() => toggleSubMenu(key)}
                      >
                        {icon}
                        {label} <span className="ml-auto">{openSubMenus[key] ? '▼' : '►'}</span>
                      </li>

                      <AnimatePresence>
                        {openSubMenus[key] && (
                          <motion.ul
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="pl-6 bg-[blue-800]"
                          >
                            {links
                              .filter(link => !link.roles || link.roles.includes(userRole)) // Filtrage des liens avec ou sans rôles
                              .map((link, index) => (
                                <li key={index} className="px-4 py-2 hover:bg-[#528eb2]">
                                  <Link to={link.to}>{link.name}</Link>
                                </li>
                              ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  ) : null
                )}



                  {(userRole === 'ROLE_STUDENT' || userRole === 'ROLE_TEACHER'|| userRole === 'ROLE_ADMIN'|| userRole === 'ROLE_SUPERADMIN') &&(
                    <li className="flex items-center px-4 py-2 hover:bg-blue-800">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      <Link to="/messagerie">Ma Messagerie</Link>
                    </li>
                  )}

                  
                  {(userRole === 'ROLE_STUDENT' || userRole === 'ROLE_TEACHER') && (
                    <>
                      <li className="flex items-center px-4 py-2 hover:bg-blue-800">
                        <Clipboard className="w-5 h-5 mr-2" />
                        <Link to="/cours">Mes Cours</Link>
                      </li>
                      <li className="flex items-center px-4 py-2 hover:bg-blue-800">
                        <Briefcase className="w-5 h-5 mr-2" />
                        <Link to="/projet">Mes Projets</Link>
                      </li>
                    </>
                  )}
                  {userRole === 'ROLE_SUPERADMIN' && (
                    <li className="flex items-center px-4 py-2 hover:bg-blue-800">
                      <School className="w-5 h-5 mr-2" />
                      <Link to="/centres_formations">Centres de formations</Link>
                    </li>
                  )}
                  
                  {(userRole === 'ROLE_HR' || userRole === 'ROLE_RECRUITER') && (
                    <li className="flex items-center px-4 py-2 hover:bg-blue-800">
                      <Share2 className="w-5 h-5 mr-2" />
                      <Link to="/candidatures">Candidatures</Link>
                    </li>
                  )}
                  
                  
                  <li className="flex items-center px-4 py-2 hover:bg-blue-800">
                  <BookOpen className="w-5 h-5 mr-2" />
                    <Link to="/formations">Formations</Link>
                  </li>
                  
                  {(userRole === 'ROLE_STUDENT' || userRole === 'ROLE_TEACHER'|| userRole === 'ROLE_ADMIN'|| userRole === 'ROLE_SUPERADMIN') &&(
                    <li className="flex items-center px-4 py-2 hover:bg-blue-800">
                      <PiggyBank className="w-5 h-5 mr-2" />
                      <Link to="/cagnottes">Cagnottes</Link>
                    </li>
                  )}
                  {(userRole === 'ROLE_STUDENT' || userRole === 'ROLE_TEACHER'|| userRole === 'ROLE_ADMIN'|| userRole === 'ROLE_SUPERADMIN') &&(
                    <li className="flex items-center px-4 py-2 hover:bg-blue-800">
                      <Handshake className="w-5 h-5 mr-2" />
                      <Link to="/sponsors">Sponsors</Link>
                    </li>
                  )}
                  {(userRole === 'ROLE_STUDENT' || userRole === 'ROLE_TEACHER'|| userRole === 'ROLE_ADMIN'|| userRole === 'ROLE_SUPERADMIN' || userRole === 'ROLE_RECRUITER') &&(
                    <li className="flex items-center px-4 py-2 hover:bg-blue-800">
                      <Camera className="w-5 h-5 mr-2" />
                      <Link to="/Trombinoscope">Trombinoscope</Link>
                    </li>
                  )}
                </ul>
              </div>

              <div className="p-4 border-t border-blue-700">
                <button className="flex items-center w-full text-left hover:bg-blue-800 px-4 py-2 mt-2">
                  Déconnexion
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
