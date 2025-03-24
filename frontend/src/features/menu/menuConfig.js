import React from 'react';
import {
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  FileText,
  Folder,
  GraduationCap,
  Home,
  LayoutDashboard,
  MessageCircle,
  School,
  Settings,
  User,
  Users,
} from 'lucide-react';

// Définition des rôles pour faciliter la maintenance
export const ROLES = {
  ADMIN: 'ROLE_ADMIN',
  STUDENT: 'ROLE_STUDENT',
  TEACHER: 'ROLE_TEACHER',
  HR: 'ROLE_HR',
  SUPER_ADMIN: 'ROLE_SUPER_ADMIN',
  GUEST: 'ROLE_GUEST',
  RECRUITER: 'ROLE_RECRUITER',
};

// Configuration des éléments de menu
export const getMenuItems = () => [
  // --- ADMIN ITEMS ---
  {
    key: 'admin_dashboard',
    label: 'Tableau de bord',
    icon: <LayoutDashboard className="w-5 h-5 mr-2 text-[#528eb2]" />,
    roles: [ROLES.ADMIN, ROLES.SUPER_ADMIN],
    to: '/admin/dashboard',
  },
  {
    key: 'admin_users',
    label: 'Gestion des utilisateurs',
    icon: <Users className="w-5 h-5 mr-2 text-[#528eb2]" />,
    roles: [ROLES.ADMIN, ROLES.SUPER_ADMIN],
    links: [
      { name: 'Liste des utilisateurs', to: '/admin/users', roles: [ROLES.ADMIN, ROLES.SUPER_ADMIN] },
      { name: 'Ajouter un utilisateur', to: '/admin/users/add', roles: [ROLES.ADMIN, ROLES.SUPER_ADMIN] },
      { name: 'Rôles et permissions', to: '/admin/roles', roles: [ROLES.SUPER_ADMIN] },
    ],
  },
  {
    key: 'admin_formations',
    label: 'Formations',
    icon: <BookOpen className="w-5 h-5 mr-2 text-[#528eb2]" />,
    roles: [ROLES.ADMIN, ROLES.SUPER_ADMIN],
    links: [
      { name: 'Liste des formations', to: '/admin/formations', roles: [ROLES.ADMIN, ROLES.SUPER_ADMIN] },
      { name: 'Ajouter une formation', to: '/admin/formations/add', roles: [ROLES.ADMIN, ROLES.SUPER_ADMIN] },
      { name: 'Modules et cours', to: '/admin/modules', roles: [ROLES.ADMIN, ROLES.SUPER_ADMIN] },
    ],
  },

  // --- STUDENT ITEMS ---
  {
    key: 'student_dashboard',
    label: 'Tableau de bord',
    icon: <LayoutDashboard className="w-5 h-5 mr-2 text-[#528eb2]" />,
    roles: [ROLES.STUDENT],
    to: '/student/dashboard',
  },
  {
    key: 'student_schedule',
    label: 'Emploi du temps',
    icon: <Calendar className="w-5 h-5 mr-2 text-[#528eb2]" />,
    roles: [ROLES.STUDENT],
    to: '/student/schedule',
  },
  {
    key: 'student_grades',
    label: 'Notes et évaluations',
    icon: <FileText className="w-5 h-5 mr-2 text-[#528eb2]" />,
    roles: [ROLES.STUDENT],
    to: '/student/grades',
  },
  {
    key: 'student_absences',
    label: 'Absences',
    icon: <ClipboardList className="w-5 h-5 mr-2 text-[#528eb2]" />,
    roles: [ROLES.STUDENT],
    to: '/student/absences',
  },
  {
    key: 'student_projects',
    label: 'Projets',
    icon: <Folder className="w-5 h-5 mr-2 text-[#528eb2]" />,
    roles: [ROLES.STUDENT],
    to: '/student/projects',
  },

  // --- TEACHER ITEMS ---
  {
    key: 'teacher_dashboard',
    label: 'Tableau de bord',
    icon: <LayoutDashboard className="w-5 h-5 mr-2 text-[#528eb2]" />,
    roles: [ROLES.TEACHER],
    to: '/teacher/dashboard',
  },
  {
    key: 'teacher_courses',
    label: 'Mes cours',
    icon: <BookOpen className="w-5 h-5 mr-2 text-[#528eb2]" />,
    roles: [ROLES.TEACHER],
    to: '/teacher/courses',
  },
  {
    key: 'teacher_students',
    label: 'Mes étudiants',
    icon: <GraduationCap className="w-5 h-5 mr-2 text-[#528eb2]" />,
    roles: [ROLES.TEACHER],
    to: '/teacher/students',
  },
  {
    key: 'teacher_attendance',
    label: 'Gestion des présences',
    icon: <ClipboardList className="w-5 h-5 mr-2 text-[#528eb2]" />,
    roles: [ROLES.TEACHER],
    to: '/teacher/attendance',
  },

  // --- HR ITEMS ---
  {
    key: 'hr_dashboard',
    label: 'Tableau de bord RH',
    icon: <LayoutDashboard className="w-5 h-5 mr-2 text-[#528eb2]" />,
    roles: [ROLES.HR],
    to: '/hr/dashboard',
  },
  {
    key: 'hr_candidates',
    label: 'Candidats',
    icon: <Users className="w-5 h-5 mr-2 text-[#528eb2]" />,
    roles: [ROLES.HR],
    to: '/hr/candidates',
  },

  // --- RECRUITER ITEMS ---
  {
    key: 'recruiter_dashboard',
    label: 'Tableau de bord',
    icon: <LayoutDashboard className="w-5 h-5 mr-2 text-[#528eb2]" />,
    roles: [ROLES.RECRUITER],
    to: '/recruiter/dashboard',
  },
  {
    key: 'recruiter_students',
    label: 'Gestion des étudiants',
    icon: <GraduationCap className="w-5 h-5 mr-2 text-[#528eb2]" />,
    roles: [ROLES.RECRUITER],
    to: '/recruiter/students',
  },

  // --- GUEST ITEMS ---
  {
    key: 'guest_dashboard',
    label: 'Accueil',
    icon: <Home className="w-5 h-5 mr-2 text-[#528eb2]" />,
    roles: [ROLES.GUEST],
    to: '/guest/dashboard',
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

// Fonction utilitaire pour traduire les noms de rôles
export const translateRoleName = (role) => {
  const roleTranslations = {
    'ROLE_ADMIN': 'Administrateur',
    'ROLE_STUDENT': 'Étudiant',
    'ROLE_TEACHER': 'Enseignant',
    'ROLE_HR': 'Ressources Humaines',
    'ROLE_SUPER_ADMIN': 'Super Administrateur',
    'ROLE_GUEST': 'Invité',
    'ROLE_RECRUITER': 'Recruteur',
  };
  
  return roleTranslations[role] || role;
};
