import { User, Briefcase, UserCircle2 } from 'lucide-react';
import { cn } from '../utils';

/**
 * Convertit une constante de rôle en format d'affichage
 */
export const getRoleDisplayFormat = (roleConstant) => {
  // Normaliser le rôle en retirant le préfixe ROLE_ s'il existe
  const normalizedRole = roleConstant.replace(/^ROLE_/i, '');
  
  switch (normalizedRole.toUpperCase()) {
    case 'ADMIN': return 'Admin';
    case 'SUPER_ADMIN': 
    case 'SUPERADMIN': return 'Super Admin';
    case 'TEACHER': return 'Formateur';
    case 'STUDENT': return 'Étudiant';
    case 'RECRUITER': return 'Recruteur';
    case 'HR': return 'Ressources Humaines';
    case 'GUEST': return 'Invité';
    default: return roleConstant;
  }
};

/**
 * Obtenir l'icône correspondant au rôle
 */
export const getRoleIcon = (role) => {
  // Normalize role name (remove ROLE_ prefix if present)
  const normalizedRole = role?.toLowerCase().replace('role_', '');
  
  switch (normalizedRole) {
    case 'admin':
    case 'super_admin':
      return <Briefcase className="w-3 h-3 mr-1 text-blue-600" />;
    case 'teacher':
      return <Briefcase className="w-3 h-3 mr-1 text-green-600" />;
    case 'student':
      return <UserCircle2 className="w-3 h-3 mr-1 text-amber-600" />;
    case 'hr':
      return <Briefcase className="w-3 h-3 mr-1 text-purple-600" />;
    case 'recruiter':
      return <Briefcase className="w-3 h-3 mr-1 text-indigo-600" />;
    default:
      return <UserCircle2 className="w-3 h-3 mr-1 text-gray-600" />;
  }
};

/**
 * Obtenir la couleur correspondant au rôle
 */
export const getRoleColor = (role) => {
  // Normalize role name (remove ROLE_ prefix if present)
  const normalizedRole = role?.toLowerCase().replace('role_', '');
  
  switch (normalizedRole) {
    case 'admin':
      return 'bg-blue-50 text-blue-700';
    case 'super_admin':
    case 'superadmin':
      return 'bg-red-50 text-red-700';
    case 'teacher':
      return 'bg-green-50 text-green-700';
    case 'student':
      return 'bg-amber-50 text-amber-700';
    case 'hr':
      return 'bg-purple-50 text-purple-700';
    case 'recruiter':
      return 'bg-indigo-50 text-indigo-700';
    case 'guest':
      return 'bg-gray-50 text-gray-700';
    default:
      return 'bg-gray-50 text-gray-700';
  }
};

/**
 * Obtenir le nom d'affichage français pour un rôle
 */
export const getFrenchRoleDisplayName = (role) => {
  // Normaliser le rôle en retirant le préfixe ROLE_ s'il existe
  const normalizedRole = role?.replace(/^ROLE_/i, '').toLowerCase();
  
  switch (normalizedRole) {
    case 'admin': return 'Administrateur';
    case 'super_admin':
    case 'superadmin': return 'Super Administrateur';
    case 'teacher': return 'Formateur';
    case 'student': return 'Étudiant';
    case 'hr': return 'Ressources Humaines';
    case 'recruiter': return 'Recruteur';
    case 'guest': return 'Invité';
    default: return role || 'Utilisateur';
  }
}; 