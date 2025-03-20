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
import { useRolePermissions } from '@/features/roles/useRolePermissions';

// Style personnalisé pour les animations et transitions
const customStyles = `
  .menu-burger-button {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
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
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    z-index: 50;
    overflow: hidden;
    border-right: 1px solid rgba(82, 142, 178, 0.2);
    will-change: transform;
  }
  
  @media (max-width: 768px) {
    .sidebar-menu {
      width: 80vw;
    }
  }
  
  .menu-item {
    position: relative;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
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
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 0.375rem;
    margin: 0.25rem 0.5rem;
  }
  
  .submenu-item:hover {
    background-color: rgba(82, 142, 178, 0.3);
    transform: translateX(4px);
  }
  
  .chevron-icon {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .chevron-icon.open {
    transform: rotate(90deg);
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
  const permissions = useRolePermissions();

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
    // --- STUDENT ROLE SECTION ---
    {
      key: 'dashboard',
      label: 'Tableau de bord',
      icon: <LayoutDashboard className="w-5 h-5 mr-2 text-[#528eb2]" />,
      roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT],
      to: '/dashboard',
    },
    {
      key: 'notifications',
      label: 'Notifications',
      icon: <Bell className="w-5 h-5 mr-2 text-[#528eb2]" />,
      roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT],
      to: '/notifications',
    },
    {
      key: 'messagerie',
      label: 'Messagerie',
      icon: <MessageCircle className="w-5 h-5 mr-2 text-[#528eb2]" />,
      roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT, ROLES.RECRUITER],
      to: '/messagerie',
    },
    {
      key: 'cours',
      label: 'Mes Cours',
      icon: <Clipboard className="w-5 h-5 mr-2 text-[#528eb2]" />,
      roles: [ROLES.STUDENT, ROLES.TEACHER],
      to: '/cours',
    },
    {
      key: 'projet',
      label: 'Mes Projets',
      icon: <Briefcase className="w-5 h-5 mr-2 text-[#528eb2]" />,
      roles: [ROLES.STUDENT, ROLES.TEACHER],
      to: '/projet',
    },
    {
      key: 'justification_absence',
      label: 'Justifier une absence',
      icon: <Clipboard className="w-5 h-5 mr-2 text-[#528eb2]" />,
      roles: [ROLES.STUDENT],
      to: '/justification-absence',
    },
    {
      key: 'plannings',
      label: 'Plannings',
      icon: <Calendar className="w-5 h-5 mr-2 text-[#528eb2]" />,
      roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.HR, ROLES.STUDENT],
      links: [
        { name: 'Évènements', to: '/plannings/evenements', roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.HR, ROLES.STUDENT] },
        { name: 'Agenda', to: '/plannings/agenda', roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.HR, ROLES.STUDENT] },
        { name: 'Réservation de salle', to: '/plannings/reservation-salle', roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.TEACHER] },
        { name: 'Réservation de matériel', to: '/plannings/reservation-materiel', roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.TEACHER] },
      ],
    },
    {
      key: 'cagnottes',
      label: 'Cagnottes',
      icon: <PiggyBank className="w-5 h-5 mr-2 text-[#528eb2]" />,
      roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT],
      to: '/cagnottes',
    },
    {
      key: 'sponsors',
      label: 'Sponsors',
      icon: <Handshake className="w-5 h-5 mr-2 text-[#528eb2]" />,
      roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT],
      to: '/sponsors',
    },
    {
      key: 'trombinoscope',
      label: 'Trombinoscope',
      icon: <Camera className="w-5 h-5 mr-2 text-[#528eb2]" />,
      roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT, ROLES.RECRUITER],
      to: '/Trombinoscope',
    },
    
    // --- TEACHER ROLE SECTION ---
    {
      key: 'eleves',
      label: 'Élèves',
      icon: <GraduationCap className="w-5 h-5 mr-2 text-[#528eb2]" />,
      roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.HR],
      links: [
        { name: 'Gestion des élèves', to: '/eleves', roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.TEACHER] },
        { name: 'Résultats', to: '/eleves/resultats', roles: [ROLES.SUPERADMIN, ROLES.TEACHER] },
        { name: 'Dossiers', to: '/eleves/dossiers', roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.HR, ROLES.TEACHER] },
        { name: 'Certificats et Diplômes', to: '/eleves/certificats', roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.TEACHER] },
        { name: 'Historique des Absences', to: '/eleves/absences', roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.HR] },
      ],
    },
    {
      key: 'formations_management',
      label: 'Gestion des formations',
      icon: <BookOpen className="w-5 h-5 mr-2 text-white" />,
      roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.RECRUITER],
      to: '/formations',
    },
    
    // --- ADMIN ROLE SECTION ---
    {
      key: 'formateurs',
      label: 'Formateurs',
      icon: <User className="w-5 h-5 mr-2 text-[#528eb2]" />,
      roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.HR],
      links: [
        { name: 'Liste des formateurs', to: '/formateurs', roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.HR] },
        { name: 'Statistiques et Rapports', to: '/formateurs/statistiques', roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.HR] },
        { name: 'Gestion des Projets', to: '/formateurs/projets', roles: [ROLES.SUPERADMIN, ROLES.ADMIN] },
        { name: 'Commentaires', to: '/formateurs/commentaires', roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.HR] },
      ],
    },
    {
      key: 'roles_management',
      label: 'Gestion des rôles',
      icon: <UserPlus className="w-5 h-5 mr-2 text-white" />,
      roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.RECRUITER],
      to: '/recruiter/guest-student-roles',
    },
    {
      key: 'invites',
      label: 'Invités',
      icon: <UserPlus className="w-5 h-5 mr-2 text-[#528eb2]" />,
      roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.HR],
      links: [
        { name: 'Liste des invités', to: '/invites', roles: [ROLES.ADMIN, ROLES.SUPERADMIN] },
        { name: 'Gestion des invités', to: '/invites/', roles: [ROLES.ADMIN, ROLES.SUPERADMIN] },
        { name: 'Test d\'admission', to: '/invites/test_admission', roles: [ROLES.ADMIN, ROLES.HR, ROLES.SUPERADMIN] },
        { name: 'Statistiques des Invités', to: '/admin/invite/statistiques', roles: [ROLES.ADMIN, ROLES.SUPERADMIN] },
      ],
    },
    {
      key: 'rh',
      label: 'Ressources Humaines',
      icon: <Users className="w-5 h-5 mr-2 text-[#528eb2]" />,
      roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.HR],
      links: [
        { name: 'Gestion des Formateurs', to: '/rh/formateurs', roles: [ROLES.SUPERADMIN, ROLES.HR] },
        { name: 'Gestion des Candidatures', to: '/rh/candidatures', roles: [ROLES.SUPERADMIN, ROLES.HR] },
        { name: 'Suivi des Absences et Congés', to: '/rh/absences', roles: [ROLES.SUPERADMIN, ROLES.HR] },
        { name: 'Planning des Formateurs', to: '/rh/planning', roles: [ROLES.SUPERADMIN, ROLES.HR] },
        { name: 'Archivage des Dossiers', to: '/rh/archivage', roles: [ROLES.SUPERADMIN, ROLES.HR] },
        { name: 'Suivi des Recrutements', to: '/rh/recrutement', roles: [ROLES.SUPERADMIN, ROLES.HR] },
      ],
    },
    {
      key: 'admins',
      label: 'Administration',
      icon: <Shield className="w-5 h-5 mr-2 text-[#528eb2]" />,
      roles: [ROLES.SUPERADMIN, ROLES.ADMIN],
      links: [
        { name: 'Gestion des utilisateurs', to: '/admin/utilisateurs', roles: [ROLES.SUPERADMIN] },
        { name: 'Gestion des Formations', to: '/admin/formations', roles: [ROLES.SUPERADMIN] },
        { name: 'Suivi des Inscriptions', to: '/admin/inscriptions', roles: [ROLES.SUPERADMIN] },
        { name: 'Gestion des Paiements', to: '/admin/paiements', roles: [ROLES.SUPERADMIN] },
        { name: 'Suivi des Absences', to: '/admin/absences', roles: [ROLES.SUPERADMIN] },
        { name: 'Statistiques Administratives', to: '/admin/statistiques', roles: [ROLES.SUPERADMIN] },
        { name: 'Les logs', to: '/admin/logs', roles: [ROLES.SUPERADMIN] },
        { name: 'Gestion des partenaires', to: '/admin/partenariats', roles: [ROLES.SUPERADMIN] },
      ],
    },
    
    // --- SUPERADMIN ROLE SECTION ---
    {
      key: 'centres_formations',
      label: 'Centres de formations',
      icon: <School className="w-5 h-5 mr-2 text-[#528eb2]" />,
      roles: [ROLES.SUPERADMIN],
      to: '/centres_formations',
    },

    // --- RECRUITER ROLE SECTION ---
    {
      key: 'candidatures',
      label: 'Candidatures',
      icon: <Share2 className="w-5 h-5 mr-2 text-[#528eb2]" />,
      roles: [ROLES.HR, ROLES.RECRUITER],
      to: '/candidatures',
    },
    {
      key: 'recrutement',
      label: 'Recrutement',
      icon: <Briefcase className="w-5 h-5 mr-2 text-[#528eb2]" />,
      roles: [ROLES.RECRUITER],
      links: [
        { name: 'Tableau de bord', to: '/recruiter/dashboard', roles: [ROLES.RECRUITER] },
        { name: 'Offres d\'emploi', to: '/recruiter/jobs', roles: [ROLES.RECRUITER] },
        { name: 'Candidatures', to: '/recruiter/applications', roles: [ROLES.RECRUITER] },
        { name: 'Entretiens', to: '/recruiter/interviews', roles: [ROLES.RECRUITER] },
        { name: 'Base de CV', to: '/recruiter/cv-database', roles: [ROLES.RECRUITER] },
        { name: 'Statistiques', to: '/recruiter/statistics', roles: [ROLES.RECRUITER] },
      ],
    },
    {
      key: 'etudiants',
      label: 'Étudiants',
      icon: <GraduationCap className="w-5 h-5 mr-2 text-[#528eb2]" />,
      roles: [ROLES.RECRUITER],
      links: [
        { name: 'Liste des étudiants', to: '/recruiter/students', roles: [ROLES.RECRUITER] },
        { name: 'Profils & CV', to: '/recruiter/student-profiles', roles: [ROLES.RECRUITER] },
        { name: 'Stages & Alternances', to: '/recruiter/internships', roles: [ROLES.RECRUITER] },
      ],
    },
    {
      key: 'evenements',
      label: 'Événements',
      icon: <Calendar className="w-5 h-5 mr-2 text-[#528eb2]" />,
      roles: [ROLES.RECRUITER],
      links: [
        { name: 'Job Dating', to: '/recruiter/job-dating', roles: [ROLES.RECRUITER] },
        { name: 'Forums Entreprises', to: '/recruiter/career-fairs', roles: [ROLES.RECRUITER] },
        { name: 'Présentations Entreprise', to: '/recruiter/company-presentations', roles: [ROLES.RECRUITER] },
      ],
    },
    
    // --- GUEST ROLE SECTION ---
    {
      key: 'candidature',
      label: 'Ma Candidature',
      icon: <Clipboard className="w-5 h-5 mr-2 text-[#528eb2]" />,
      roles: [ROLES.GUEST],
      links: [
        { name: 'État de ma candidature', to: '/guest/application-status', roles: [ROLES.GUEST] },
        { name: 'Documents à fournir', to: '/guest/required-documents', roles: [ROLES.GUEST] },
        { name: 'Compléter mon dossier', to: '/guest/complete-profile', roles: [ROLES.GUEST] },
        { name: 'Historique des échanges', to: '/guest/communications', roles: [ROLES.GUEST] },
      ],
    },
    {
      key: 'formations',
      label: 'Formations',
      icon: <BookOpen className="w-5 h-5 mr-2 text-[#528eb2]" />,
      roles: [ROLES.GUEST],
      links: [
        { name: 'Catalogue des formations', to: '/guest/training-catalog', roles: [ROLES.GUEST] },
        { name: 'Détails des programmes', to: '/guest/program-details', roles: [ROLES.GUEST] },
        { name: 'Conditions d\'admission', to: '/guest/admission-requirements', roles: [ROLES.GUEST] },
        { name: 'FAQ Formations', to: '/guest/training-faq', roles: [ROLES.GUEST] },
      ],
    },
    {
      key: 'contact',
      label: 'Contact & Support',
      icon: <MessageCircle className="w-5 h-5 mr-2 text-[#528eb2]" />,
      roles: [ROLES.GUEST],
      links: [
        { name: 'Contacter un recruteur', to: '/guest/contact-recruiter', roles: [ROLES.GUEST] },
        { name: 'Questions fréquentes', to: '/guest/faq', roles: [ROLES.GUEST] },
        { name: 'Support technique', to: '/guest/technical-support', roles: [ROLES.GUEST] },
        { name: 'Prendre rendez-vous', to: '/guest/schedule-meeting', roles: [ROLES.GUEST] },
      ],
    },
    {
      key: 'ecole',
      label: 'Notre École',
      icon: <School className="w-5 h-5 mr-2 text-[#528eb2]" />,
      roles: [ROLES.GUEST],
      links: [
        { name: 'Présentation', to: '/guest/school-presentation', roles: [ROLES.GUEST] },
        { name: 'Vie étudiante', to: '/guest/student-life', roles: [ROLES.GUEST] },
        { name: 'Témoignages', to: '/guest/testimonials', roles: [ROLES.GUEST] },
        { name: 'Actualités', to: '/guest/news', roles: [ROLES.GUEST] },
      ],
    },
    
    // --- GENERAL ITEMS ---
    {
      key: 'aide',
      label: "Besoin d'aide ?",
      icon: <Calendar className="w-5 h-5 mr-2 text-[#528eb2]" />,
      links: [
        { name: 'FAQ', to: '/aide/faq' },
        { name: 'Forum', to: '/aide/forum' },
        { name: 'Supports', to: '/aide/supports' },
        { name: 'Contact', to: '/aide/contact' },
      ],
    },
    {
      key: 'nous_rejoindre',
      label: 'Nous rejoindre',
      icon: <Users className="w-5 h-5 mr-2 text-[#528eb2]" />,
      roles: [ROLES.GUEST],
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
          <>
            {/* Backdrop overlay with blur effect */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={() => setMenuOpen(false)}
            />
            
            {/* Menu sidebar with improved animation */}
            <motion.div
              ref={menuRef}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ 
                type: "tween", 
                ease: "easeInOut",
                duration: 0.3
              }}
              className="sidebar-menu"
            >
              <div className="flex flex-col h-full">
                {roles.length > 0 && (
                  <div className="flex items-center p-4 border-b border-blue-700 bg-gradient-to-r from-[#00284f] to-[#003a6b]">
                    <div className="w-12 h-12 bg-white/20 rounded-full mr-3 flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors" 
                         onClick={() => {
                           setMenuOpen(false);
                           navigate('/profile');
                         }}>
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="cursor-pointer" 
                         onClick={() => {
                           setMenuOpen(false);
                           navigate('/profile');
                         }}>
                      <p className="font-semibold hover:underline transition-all">{userData ? `${userData.firstName} ${userData.lastName}` : 'Utilisateur'}</p>
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
                    {menuItems.map(({ key, icon, label, roles: itemRoles, links, to }) => {
                      // Si l'élément n'a pas de rôles définis ou si l'utilisateur a les rôles requis
                      if (!itemRoles || hasAnyRole(itemRoles)) {
                        return (
                          <React.Fragment key={`menu-${key}`}>
                            {to ? (
                              // Élément de menu simple avec lien direct
                              <li className="menu-item">
                                <Link to={to} className="flex items-center px-4 py-2.5 w-full" onClick={() => setMenuOpen(false)}>
                                  {icon}
                                  <span>{label}</span>
                                </Link>
                              </li>
                            ) : (
                              // Élément de menu avec sous-menu
                              <>
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
                                  <AnimatePresence>
                                    {openSubMenus[key] && links && (
                                      <motion.ul
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="bg-[#001f3d] pl-4"
                                      >
                                        {links.map((link) => {
                                          if (!link.roles || hasAnyRole(link.roles)) {
                                            return (
                                              <li key={link.to} className="submenu-item">
                                                <Link
                                                  to={link.to}
                                                  className="flex items-center px-4 py-2 text-sm"
                                                  onClick={() => setMenuOpen(false)}
                                                >
                                                  {link.name}
                                                </Link>
                                              </li>
                                            );
                                          }
                                          return null;
                                        })}
                                      </motion.ul>
                                    )}
                                  </AnimatePresence>
                                </li>
                              </>
                            )}
                          </React.Fragment>
                        );
                      }
                      return null;
                    })}
                  </ul>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
});

export { MenuBurger };
