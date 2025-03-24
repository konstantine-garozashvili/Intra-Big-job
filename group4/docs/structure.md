# Structure du Projet Intra-Bigjob et charte graphique

## Organisation des Dossiers

### Backend (Symfony)

```
backend/
├── src/
│   ├── Domain/           # Logique métier par domaine
│   │   ├── Admin/        # Fonctionnalités Admin
│   │   ├── HR/           # Fonctionnalités RH
│   │   ├── Student/      # Fonctionnalités Étudiant
│   │   ├── SuperAdmin/   # Fonctionnalités Super Admin
│   │   ├── Teacher/      # Fonctionnalités Formateur
│   │   └── User/         # Fonctionnalités Utilisateur
│   ├── Service/          # Services publics partagés
│   └── Controller/       # Contrôleurs publics partagés
```

### Frontend (React)

```
frontend/
├── src/
│   ├── pages/           # Pages par domaine
│   │   ├── Admin/       # Pages Admin
│   │   ├── HR/          # Pages RH
│   │   ├── Student/     # Pages Étudiant
│   │   ├── SuperAdmin/  # Pages Super Admin
│   │   ├── Teacher/     # Pages Formateur
│   │   └── User/        # Pages Utilisateur
│   ├── components/      # Composants React réutilisables
│   │   ├── ui/          # Composants UI génériques
│   │   └── shared/      # Composants partagés entre domaines
│   └── services/        # Services partagés (API, utils, etc.)
```

## Composants et Services Publics

### Backend
- Les services publics dans `src/Service/` sont accessibles à tous les domaines
- Les contrôleurs publics dans `src/Controller/` gèrent les fonctionnalités communes
- Exemples : authentification, gestion des fichiers, notifications

### Frontend
- Les composants UI dans `components/ui/` fournissent les éléments d'interface de base
- Les composants partagés dans `components/shared/` sont utilisés par plusieurs domaines
- Les services dans `services/` gèrent la logique commune (appels API, utilitaires)
- Exemples : modales, formulaires, tableaux, navigation

## Guide des Couleurs

### Variables CSS à Utiliser

```css
/* Mode Clair */
--color-primary: #528eb2    /* Couleur principale */
--color-secondary: #02284f  /* Couleur secondaire */
--color-white: #FFFFFF      /* Blanc */

/* Couleurs Système */
--background: #FFFFFF       /* Fond */
--foreground: #020817      /* Texte principal */
--muted: #f1f5f9          /* Éléments atténués */
--accent: #528eb2         /* Accent (10% opacité) */
--border: #e2e8f0         /* Bordures */

/* Couleurs Graphiques */
--chart-1: #528eb2        /* Graphique - Principal */
--chart-2: #003366        /* Graphique - Foncé */
--chart-3: #02284f        /* Graphique - Secondaire */
--chart-4: #235465        /* Graphique - Variante */
--chart-5: #addde6        /* Graphique - Clair */
```

### Utilisation

```css
/* Exemple d'utilisation */
.element {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
  border-color: hsl(var(--border));
}

.button-primary {
  background-color: hsl(var(--color-primary));
  color: hsl(var(--color-white));
}
```

## Bonnes Pratiques

1. Respectez la structure des dossiers pour maintenir une organisation cohérente
2. Utilisez les variables CSS définies pour la cohérence visuelle
3. Suivez la séparation des domaines métier dans le backend et le frontend
4. Maintenez la correspondance entre les domaines backend et les pages frontend 