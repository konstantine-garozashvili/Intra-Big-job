import React, { memo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useRoles, ROLES } from '../features/roles/roleContext';
import { useRoleUI } from '../features/roles/useRolePermissions';
import { useUserData } from '@/hooks/useUserData';
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
  Menu,
  ClipboardCheck,
  Ticket
} from 'lucide-react';
import { useRolePermissions } from '@/features/roles/useRolePermissions';
import ProfilePictureDisplay from '@/components/ProfilePictureDisplay';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

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
    z-index: 101;
  }
  
  .menu-burger-button:hover {
    background-color: rgba(255, 255, 255, 0.1);
    transform: scale(1.05);
  }
  
  .menu-burger-button:active {
    transform: scale(0.95);
  }
  
  /* Override Sheet styles to match our design */
  .sidebar-sheet {
    background-color: #00284f !important;
    color: white !important;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
    border-right: 1px solid rgba(82, 142, 178, 0.2) !important;
    z-index: 102 !important;
  }
  
  .scrollable-div {
    scrollbar-width: thin;
    scrollbar-color: rgba(82, 142, 178, 0.5) transparent;
  }
  
  .scrollable-div::-webkit-scrollbar {
    width: 6px;
  }
  
  .scrollable-div::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .scrollable-div::-webkit-scrollbar-thumb {
    background-color: rgba(82, 142, 178, 0.5);
    border-radius: 3px;
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
  
  /* Responsive styles */
  @media (min-width: 1024px) {
    .sidebar-sheet {
      width: 320px !important;
    }
  }
  
  @media (max-width: 1023px) {
    .sidebar-sheet {
      width: 280px !important;
    }
  }
  
  @media (max-width: 768px) {
    .sidebar-sheet {
      width: 85vw !important;
    }
    
    .menu-item {
      margin: 0.125rem 0.25rem;
    }
    
    .submenu-item {
      margin: 0.125rem 0.25rem;
    }
  }
  
  @media (max-width: 480px) {
    .sidebar-sheet {
      width: 100vw !important;
    }
    
    .menu-item, .submenu-item {
      margin: 0.125rem 0;
      border-radius: 0;
    }
    
    .menu-item:hover, .submenu-item:hover {
      transform: none;
      background-color: rgba(82, 142, 178, 0.15);
    }
  }

  /* Hide the default close button from Sheet */
  .sidebar-sheet [data-state] > button[type="button"] {
    display: none;
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
  const { user: userData, isLoading } = useUserData();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openSubMenus, setOpenSubMenus] = useState({});
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();
  
  // Utiliser le système de rôles
  const { roles, hasRole, hasAnyRole, refreshRoles } = useRoles();
  const { translateRoleName } = useRoleUI();
  const permissions = useRolePermissions();

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

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  // Effet pour fermer le menu lorsque les rôles changent
  useEffect(() => {
    if (menuOpen) {
      setMenuOpen(false);
    }
  }, [roles]);
  
  const toggleMenu = () => setMenuOpen(!menuOpen);

  const toggleSubMenu = (menu) => {
    setOpenSubMenus((prev) => ({
      ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}),
      [menu]: !prev[menu]
    }));
  };
  

  const menuItems = [
    // --- SECTION NAVIGATION PRINCIPALE (pour tous les rôles) ---
    {
      key: 'dashboard',
      label: 'Tableau de bord',
      icon: <LayoutDashboard className="w-5 h-5 mr-2 text-[#528eb2]" />,
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
      to: '#',
    },
    {
      key: 'trombinoscope',
      label: 'Trombinoscope',
      icon: <Camera className="w-5 h-5 mr-2 text-[#528eb2]" />,
      roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT, ROLES.RECRUITER],
      to: '/trombinoscope',
    },
    
    // Formations 
    {
      key: 'formations_section',
      label: 'Formations',
      icon: <BookOpen className="w-5 h-5 mr-2 text-[#528eb2]" />,
      roles: [ROLES.ADMIN, ROLES.SUPERADMIN, ROLES.RECRUITER],
      links: [
        { 
          name: 'Toutes les formations', 
          to: '/formations', 
          roles: [ROLES.ADMIN, ROLES.SUPERADMIN, ROLES.RECRUITER] 
        },
        { 
          name: 'Créer une formation', 
          to: '/formations/new', 
          roles: [ROLES.ADMIN, ROLES.SUPERADMIN, ROLES.RECRUITER] 
        },
        { 
          name: 'Demandes en attente', 
          to: '/formations/pending', 
          roles: [ROLES.ADMIN, ROLES.SUPERADMIN, ROLES.RECRUITER] 
        },
      ],
    },
    // --- SECTION ÉTUDES ET FORMATIONS ---
    {
      key: 'etudiants',
      label: 'Étudiants',
      icon: <GraduationCap className="w-5 h-5 mr-2 text-[#528eb2]" />,
      roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.HR, ROLES.RECRUITER],
      links: [
        { name: 'Liste des étudiants', to: '/admin/users?filter=ROLE_STUDENT', roles: [ROLES.SUPERADMIN, ROLES.ADMIN] },
        { name: 'Gestion des étudiants', to: '/eleves', roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.HR] },
        { name: 'Résultats', to: '/eleves/resultats', roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.TEACHER] },
        { name: 'Dossiers', to: '/eleves/dossiers', roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.HR, ROLES.TEACHER] },
        { name: 'Certificats et Diplômes', to: '/eleves/certificats', roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.TEACHER] },
        { name: 'Historique des Absences', to: '/eleves/absences', roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.HR] },
        { name: 'Profils & CV', to: '/recruiter/student-profiles', roles: [ROLES.RECRUITER] },
        { name: 'Stages & Alternances', to: '/recruiter/internships', roles: [ROLES.RECRUITER] },
      ],
    },
    {
      key: 'cours',
      label: 'Mes Cours',
      icon: <Clipboard className="w-5 h-5 mr-2 text-[#528eb2]" />,
      roles: [ROLES.STUDENT, ROLES.TEACHER],
      to: '#',
    },
    {
      key: 'projet',
      label: 'Mes Projets',
      icon: <Briefcase className="w-5 h-5 mr-2 text-[#528eb2]" />,
      roles: [ROLES.STUDENT, ROLES.TEACHER],
      to: '#',
    },
    {
      key: 'formations_management',
      label: 'Gestion des formations',
      icon: <BookOpen className="w-5 h-5 mr-2 text-[#528eb2]" />,
      roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.RECRUITER],
      to: '/formations',
    },
    {
      key: 'justification_absence',
      label: 'Justifier une absence',
      icon: <Clipboard className="w-5 h-5 mr-2 text-[#528eb2]" />,
      roles: [ROLES.STUDENT],
      to: '#',
    },
    
    // --- SECTION PLANIFICATION ---
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
    
    // --- SECTION RECRUTEMENT & CARRIÈRE ---
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
    
    // --- SECTION PARTENARIATS ET FINANCEMENT ---
    {
      key: 'cagnottes',
      label: 'Cagnottes',
      icon: <PiggyBank className="w-5 h-5 mr-2 text-[#528eb2]" />,
      roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT],
      to: '#',
    },
    {
      key: 'sponsors',
      label: 'Sponsors',
      icon: <Handshake className="w-5 h-5 mr-2 text-[#528eb2]" />,
      roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT],
      to: '#',
    },
    
    // --- SECTION ADMINISTRATION ET GESTION (Regroupé par type d'utilisateur) ---
    {
      key: 'admin_all_users',
      label: 'Tous les utilisateurs',
      icon: <Users className="w-5 h-5 mr-2 text-[#528eb2]" />,
      roles: [ROLES.ADMIN, ROLES.SUPERADMIN],
      to: '/admin/users',
    },
    {
      key: 'admin_teachers',
      label: 'Formateurs',
      icon: <Clipboard className="w-5 h-5 mr-2 text-[#528eb2]" />,
      roles: [ROLES.ADMIN, ROLES.SUPERADMIN],
      links: [
        { name: 'Liste des formateurs', to: '/admin/users?filter=ROLE_TEACHER', roles: [ROLES.ADMIN, ROLES.SUPERADMIN] },
        { name: 'Planning des Formateurs', to: '/rh/planning', roles: [ROLES.ADMIN, ROLES.SUPERADMIN] },
        { name: 'Évaluation des formateurs', to: '/admin/teacher-evaluation', roles: [ROLES.ADMIN, ROLES.SUPERADMIN] },
      ],
    },
    {
      key: 'admin_hr',
      label: 'Personnel RH',
      icon: <Users className="w-5 h-5 mr-2 text-[#528eb2]" />,
      roles: [ROLES.ADMIN, ROLES.SUPERADMIN],
      links: [
        { name: 'Liste du personnel RH', to: '/admin/users?filter=ROLE_HR', roles: [ROLES.ADMIN, ROLES.SUPERADMIN] },
        { name: 'Attributions', to: '/admin/hr-assignments', roles: [ROLES.ADMIN, ROLES.SUPERADMIN] },
      ],
    },
    {
      key: 'admin_admins',
      label: 'Administrateurs',
      icon: <Shield className="w-5 h-5 mr-2 text-[#528eb2]" />,
      roles: [ROLES.ADMIN, ROLES.SUPERADMIN],
      links: [
        { name: 'Liste des administrateurs', to: '/admin/users?filter=ROLE_ADMIN', roles: [ROLES.ADMIN, ROLES.SUPERADMIN] },
        { name: 'Droits d\'accès', to: '/admin/access-rights', roles: [ROLES.SUPERADMIN] },
      ],
    },
    {
      key: 'admin_guests',
      label: 'Invités',
      icon: <UserPlus className="w-5 h-5 mr-2 text-[#528eb2]" />,
      roles: [ROLES.ADMIN, ROLES.SUPERADMIN],
      links: [
        { name: 'Liste des invités', to: '/admin/users?filter=ROLE_GUEST', roles: [ROLES.ADMIN, ROLES.SUPERADMIN] },
        { name: 'Gestion des invités', to: '/invites/', roles: [ROLES.ADMIN, ROLES.SUPERADMIN] },
        { name: 'Test d\'admission', to: '/invites/test_admission', roles: [ROLES.ADMIN, ROLES.SUPERADMIN] },
        { name: 'Statistiques des Invités', to: '/admin/invite/statistiques', roles: [ROLES.ADMIN, ROLES.SUPERADMIN] },
      ],
    },
    {
      key: 'admin_recruiters',
      label: 'Recruteurs',
      icon: <Briefcase className="w-5 h-5 mr-2 text-[#528eb2]" />,
      roles: [ROLES.ADMIN, ROLES.SUPERADMIN],
      links: [
        { name: 'Liste des recruteurs', to: '/admin/users?filter=ROLE_RECRUITER', roles: [ROLES.ADMIN, ROLES.SUPERADMIN] },
        { name: 'Entreprises partenaires', to: '/admin/partner-companies', roles: [ROLES.ADMIN, ROLES.SUPERADMIN] },
        { name: 'Offres d\'emploi', to: '/admin/job-offers', roles: [ROLES.ADMIN, ROLES.SUPERADMIN] },
      ],
    },
    {
      key: 'guest_student_roles',
      label: 'Gestion Invité/Élève',
      icon: <Users className="w-5 h-5 mr-2 text-[#528eb2]" />,
      roles: [ROLES.RECRUITER],
      to: '/recruiter/guest-student-roles',
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
        { name: 'Gestion des formateurs', to: '/admin/users?filter=ROLE_TEACHER', roles: [ROLES.HR] },
      ],
    },
    {
      key: 'admins',
      label: 'Administration',
      icon: <Shield className="w-5 h-5 mr-2 text-[#528eb2]" />,
      roles: [ROLES.SUPERADMIN, ROLES.ADMIN],
      links: [
        { name: 'Gestion des Formations', to: '/admin/formations', roles: [ROLES.SUPERADMIN] },
        { name: 'Gestion des Services de Support', to: '/admin/ticket-services', roles: [ROLES.SUPERADMIN, ROLES.ADMIN] },
        { name: 'Gestion des Tickets', to: '/admin/tickets', roles: [ROLES.SUPERADMIN, ROLES.ADMIN] },
        { name: 'Suivi des Inscriptions', to: '/admin/inscriptions', roles: [ROLES.SUPERADMIN] },
        { name: 'Gestion des Paiements', to: '/admin/paiements', roles: [ROLES.SUPERADMIN] },
        { name: 'Suivi des Absences', to: '/admin/absences', roles: [ROLES.SUPERADMIN] },
        { name: 'Statistiques Administratives', to: '/admin/statistiques', roles: [ROLES.SUPERADMIN] },
        { name: 'Les logs', to: '/admin/logs', roles: [ROLES.SUPERADMIN] },
        { name: 'Gestion des partenaires', to: '/admin/partenariats', roles: [ROLES.SUPERADMIN] },
      ],
    },
    {
      key: 'centres_formations',
      label: 'Centres de formations',
      icon: <School className="w-5 h-5 mr-2 text-[#528eb2]" />,
      roles: [ROLES.SUPERADMIN],
      to: '/centres_formations',
    },
    
    // --- SECTION INVITÉ ---
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
    
    // Move "Besoin d'aide" to the end
    {
      key: 'aide',
      label: "Besoin d'aide",
      icon: <Ticket className="w-5 h-5 mr-2 text-[#528eb2]" />,
      roles: [ROLES.TEACHER, ROLES.STUDENT, ROLES.HR, ROLES.RECRUITER, ROLES.GUEST],
      links: [
        { name: 'Créer un ticket', to: '/tickets/new', roles: [ROLES.TEACHER, ROLES.STUDENT, ROLES.HR, ROLES.RECRUITER, ROLES.GUEST] },
        { name: 'Mes tickets', to: '/tickets', roles: [ROLES.TEACHER, ROLES.STUDENT, ROLES.HR, ROLES.RECRUITER, ROLES.GUEST] },
      ],
    },
  ];

  return (
    <div className="relative z-[101]">
      {/* Injection des styles personnalisés */}
      <style>{customStyles}</style>
      
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetTrigger asChild>
          <button 
            ref={buttonRef}
            className="menu-burger-button text-gray-200 hover:text-white focus:outline-none" 
            aria-label="Menu principal"
          >
            <Menu className="w-6 h-6" />
          </button>
        </SheetTrigger>
        <SheetContent 
          side="left" 
          className="sidebar-sheet p-0 border-0"
          showClose={false}
        >
          <div className="flex flex-col h-full">
            {roles.length > 0 && (
              <div className="flex items-center p-4 border-b border-blue-700 bg-gradient-to-r from-[#00284f] to-[#003a6b]">
                <div className="w-14 h-14 bg-white/20 rounded-full mr-3 flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors" 
                     onClick={() => {
                       setMenuOpen(false);
                       navigate('/profile');
                     }}>
                  <ProfilePictureDisplay className="w-full h-full" />
                </div>
                <div className="cursor-pointer" 
                     onClick={() => {
                       setMenuOpen(false);
                       navigate('/profile');
                     }}>
                  <p className="font-semibold hover:underline transition-all text-white">
                    {userData ? `${userData.firstName} ${userData.lastName}` : 'Chargement...'}
                  </p>
                  <p className="text-sm text-blue-200">{translateRoleName(roles[0])}</p>
                </div>
                <button 
                  className="ml-auto text-white p-2 rounded-full hover:bg-blue-800/50 transition-colors" 
                  onClick={() => setMenuOpen(false)}
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
                    onClick={() => setMenuOpen(false)}
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
                {menuItems.map(({ key, icon, label, roles: itemRoles, links, to, onClick }) => {
                  if (!itemRoles || hasAnyRole(itemRoles)) {
                    return (
                      <React.Fragment key={`menu-${key}`}>
                        {to ? (
                          <li className="menu-item">
                            {key === 'support' ? (
                              <div 
                                className="flex items-center px-4 py-2.5 w-full cursor-pointer" 
                                onClick={() => {
                                  setMenuOpen(false);
                                  navigate('/tickets');
                                }}
                              >
                                {icon}
                                <span>{label}</span>
                              </div>
                            ) : (
                              <Link 
                                to={to} 
                                className="flex items-center px-4 py-2.5 w-full" 
                                onClick={() => setMenuOpen(false)}
                              >
                                {icon}
                                <span>{label}</span>
                              </Link>
                            )}
                          </li>
                        ) : (
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
                        )}
                      </React.Fragment>
                    );
                  }
                  return null;
                })}
              </ul>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
});

export { MenuBurger };
