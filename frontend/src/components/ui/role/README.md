# Système de badges de rôles

Ce module fournit un système unifié pour l'affichage des badges de rôles utilisateurs dans l'application. Il permet d'assurer une représentation cohérente des rôles à travers toutes les interfaces.

## Composants

### RoleBadge

`RoleBadge` est un composant qui affiche un badge pour un rôle utilisateur avec les bonnes couleurs et le bon libellé, indépendamment du format du rôle (avec ou sans préfixe ROLE_).

```jsx
import RoleBadge from '@/components/ui/RoleBadge';

// Usage simple
<RoleBadge role="ROLE_ADMIN" />

// Avec animation
<RoleBadge 
  role="STUDENT" 
  animated={true} 
  index={0} 
/>

// En utilisant les variantes de shadcn (couleurs cohérentes)
<RoleBadge 
  role="ROLE_TEACHER" 
  useVariant={true} 
/>

// Version solide (sans gradient)
<RoleBadge 
  role="HR" 
  solid={true} 
/>

// Avec interactions au survol
<RoleBadge 
  role="ROLE_RECRUITER"
  hovered={isHovered}
  onHoverStart={() => setIsHovered(true)}
  onHoverEnd={() => setIsHovered(false)}
/>
```

## Utilitaires

Le module expose également plusieurs utilitaires pour travailler avec les rôles :

### Constantes

```jsx
import { ROLES, ROLE_DISPLAY_NAMES, ROLE_COLORS, ROLE_SOLID_COLORS } from '@/lib/constants/roles';

// Exemple : ROLES.ADMIN === 'ROLE_ADMIN'
```

### Fonctions utilitaires

```jsx
import { 
  getRoleDisplayName,  // Obtenir le nom d'affichage français
  getRoleBadgeColor,   // Obtenir les classes de couleur pour un badge
  normalizeRole        // Normaliser un nom de rôle
} from '@/lib/constants/roles';

// Exemples
getRoleDisplayName('ROLE_ADMIN'); // "Administrateur"
getRoleBadgeColor('STUDENT', true); // "bg-blue-100 text-blue-700"
normalizeRole('ROLE_TEACHER'); // "TEACHER"
```

## Importer tout d'un coup

Pour simplifier l'import, vous pouvez utiliser :

```jsx
import { 
  RoleBadge, 
  ROLES, 
  ROLE_DISPLAY_NAMES, 
  getRoleDisplayName 
} from '@/components/ui/role';
```

## Bonnes pratiques

- Utilisez toujours `RoleBadge` au lieu de créer vos propres badges pour les rôles
- Pour les rôles spécifiques, référencez-les via les constantes `ROLES.XX` plutôt que des chaînes brutes
- Pour les interfaces avec beaucoup de badges, utilisez la propriété `solid={true}` pour un style plus léger
- Pour les badges dans des listes (tables, etc), utilisez `useVariant={true}` pour utiliser les variantes shadcn

## Dépannage

Si un rôle n'est pas affiché correctement :

1. Vérifiez que le format du rôle est correct (avec ou sans préfixe ROLE_)
2. Si le rôle est un objet, assurez-vous qu'il possède une propriété `name`
3. Si le rôle n'est pas reconnu, il sera affiché comme "Utilisateur" avec des couleurs par défaut 