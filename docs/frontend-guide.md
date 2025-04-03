# Guide Frontend - BigProject

## Commandes essentielles

### Accéder au bash du conteneur
```bash
docker exec -it infra-frontend-1 sh
```
```bash
docker-compose -f infra/docker-compose.yml restart frontend
```
```bash
# Dans le conteneur frontend
docker exec -it infra-frontend-1 <commande-installation-nom-du-composant> 

#Choisir :
--legacy-peer-deps
```


## Structure du projet
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
│   ├── context/        # Contextes React
│   ├── App.jsx         # Composant racine
│   └── main.jsx        # Point d'entrée de l'application
├── .eslintrc.js        # Configuration ESLint
├── vite.config.js      # Configuration Vite
├── tailwind.config.js  # Configuration Tailwind CSS
└── package.json        # Dépendances et scripts NPM


