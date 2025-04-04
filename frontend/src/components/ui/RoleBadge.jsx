import React, { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { getRoleDisplayName, getRoleBadgeColor, normalizeRole } from '@/lib/constants/roles';

/**
 * Composant RoleBadge qui affiche un badge pour un rôle utilisateur
 * 
 * @param {Object} props - Propriétés du composant
 * @param {string|Object} props.role - Le rôle à afficher (chaîne avec/sans préfixe ROLE_ ou objet avec propriété name)
 * @param {boolean} props.animated - Si le badge doit être animé (framer-motion)
 * @param {number} props.index - Index pour l'animation (delay)
 * @param {string} props.className - Classes CSS additionnelles
 * @param {boolean} props.solid - Utiliser les couleurs solides au lieu des gradients
 * @param {boolean} props.useVariant - Utiliser la variante de badge de shadcn
 * @param {boolean} props.interactive - Ajouter des effets d'interaction (hover, etc.)
 * @param {function} props.onHoverStart - Fonction appelée au début du survol
 * @param {function} props.onHoverEnd - Fonction appelée à la fin du survol
 * @param {boolean} props.hovered - État de survol du badge (contrôlé de l'extérieur)
 * @returns {JSX.Element} Composant Badge
 */
const RoleBadge = ({ 
  role, 
  animated = false, 
  index = 0, 
  className = '',
  solid = false,
  useVariant = false,
  interactive = true,
  onHoverStart = null,
  onHoverEnd = null,
  hovered = false,
  ...props 
}) => {
  // Extraire le nom du rôle, qu'il soit sous forme d'objet ou de chaîne
  const roleName = useMemo(() => {
    if (typeof role === 'object' && role !== null) {
      return role.name || 'USER';
    }
    return role || 'USER';
  }, [role]);

  // Calculer les styles seulement quand les props changent
  const badgeContent = useMemo(() => {
    return getRoleDisplayName(roleName);
  }, [roleName]);

  // Déterminer la variante de shadcn à utiliser
  const badgeVariant = useMemo(() => {
    if (!useVariant) return undefined;
    
    // Si on utilise les variantes, normaliser le rôle pour correspondre aux variantes définies
    const normalizedRole = normalizeRole(roleName).toLowerCase();
    
    switch (normalizedRole) {
      case 'student': return 'student';
      case 'teacher': return 'teacher';
      case 'admin': return 'admin';
      case 'super_admin':
      case 'superadmin': return 'superadmin';
      case 'hr': return 'hr';
      case 'recruiter': return 'recruiter';
      case 'guest': return 'guest';
      case 'user': return 'user';
      default: return undefined;
    }
  }, [roleName, useVariant]);
  
  const badgeColorClasses = useMemo(() => {
    // Si on utilise les variantes de shadcn, on ne définit pas de classes supplémentaires
    if (useVariant) return '';
    
    return getRoleBadgeColor(roleName, solid);
  }, [roleName, solid, useVariant]);
  
  // Appliquer les classes de base et celles fournies en prop
  const badgeClasses = useMemo(() => {
    return cn(
      !useVariant && badgeColorClasses,
      !useVariant && 'px-2.5 py-0.5 text-xs rounded-full',
      interactive && 'transition-all duration-300',
      hovered && interactive && 'shadow-lg scale-105',
      className
    );
  }, [badgeColorClasses, className, hovered, interactive, useVariant]);
  
  // Déterminer si on utilise une animation ou non
  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2, delay: index * 0.1 }}
        onHoverStart={interactive ? onHoverStart : undefined}
        onHoverEnd={interactive ? onHoverEnd : undefined}
      >
        <Badge 
          className={badgeClasses} 
          variant={badgeVariant}
          {...props}
        >
          {badgeContent}
        </Badge>
      </motion.div>
    );
  }
  
  // Version sans animation
  return (
    <Badge 
      className={badgeClasses} 
      variant={badgeVariant}
      {...props}
    >
      {badgeContent}
    </Badge>
  );
};

export default RoleBadge; 