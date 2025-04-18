# Structure du frontend
frontend/
├── public/             # Fichiers statiques accessibles publiquement
├── src/                # Code source de l'application
│   ├── assets/         # Images, polices, etc.
│   ├── components/     # Composants React réutilisables
│   │   ├── ui/         # Composants UI de base (Shadcn)
│   │   └── shared/     # Composants partagés entre domaines
│   ├── lib/            # Utilitaires et fonctions d'aide
│   ├── pages/          # Pages par domaine
│   │   ├── Admin/      # Pages Admin
│   │   ├── HR/         # Pages RH
│   │   ├── Student/    # Pages Étudiant
│   │   ├── SuperAdmin/ # Pages Super Admin
│   │   ├── Teacher/    # Pages Formateur
│   │   └── User/       # Pages Utilisateur
│   ├── services/       # Services (API, authentification, etc.)
│   ├── layouts/        # Layouts de l'application
│   ├── hooks/          # Hooks React personnalisés
│   ├── contexts/        # contextses React
│   ├── App.jsx         # Composant racine
│   └── main.jsx        # Point d'entrée de l'application
├── .eslintrc.js        # Configuration ESLint
├── vite.config.js      # Configuration Vite
├── tailwind.config.js  # Configuration Tailwind CSS
└── package.json        # Dépendances et scripts NPM


# Structure du backend
backend/
├── bin/                # Exécutables console (bin/console)
├── config/             # Configuration de l'application
│   ├── packages/       # Configuration des packages
│   ├── jwt/            # Configuration pour le JWT
│   ├── routes/         # Configuration des routes
│   └── services.yaml   # Configuration des services
├── migrations/         # Migrations de base de données
├── public/             # Point d'entrée public (index.php)
├── src/                # Code source de l'application
│   ├── Domains/        # Dossier pour 
│       └── Admin/      # Dossier pour les domaines Admin 
            ├──Controller
            ├──Repository
            └──Entity
│   ├── EventListener/  # Écouteurs d'événements
│   ├── Exception/      # Exceptions personnalisées
│   ├── Security/       # Classes liées à la sécurité
│   └── DataFixtures/   # Fixtures pour les données de test
├── templates/          # Templates Twig (si utilisés)
├── tests/              # Tests automatisés
├── var/                # Fichiers temporaires (cache, logs)
│   ├── cache/          # Cache de l'application
│   └── log/            # Logs de l'application
├── vendor/             # Dépendances installées par Composer
├── .env                # Variables d'environnement
├── .env.test           # Variables d'environnement pour les tests
├── composer.json       # Dépendances PHP
└── phpunit.xml.dist    # Configuration PHPUnit pour les tests


