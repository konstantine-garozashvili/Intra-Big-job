# Frontend du Projet BigProject

Ce dossier contient la partie frontend du projet BigProject, construite avec React et Tailwind CSS.

## 🚀 Technologies utilisées

- **React 19.0.0** - Framework JavaScript pour la construction d'interfaces utilisateur
- **Vite** - Outil de build et serveur de développement
- **Tailwind CSS** - Framework CSS utilitaire
- **Shadcn UI** - Bibliothèque de composants UI basée sur Radix UI
- **React Router** - Bibliothèque de routage pour React
- **Axios** - Client HTTP pour les requêtes API

## 🏗️ Structure du projet

```
frontend/
├── public/             # Fichiers statiques
├── src/                # Code source
│   ├── assets/         # Images, polices, etc.
│   │   ├── ui/         # Composants UI de base (Shadcn)
│   │   └── ...         # Autres composants spécifiques
│   ├── lib/            # Utilitaires et fonctions d'aide
│   ├── pages/          # Composants de pages
│   ├── services/       # Services (API, authentification, etc.)
│   ├── App.jsx         # Composant racine
│   └── main.jsx        # Point d'entrée de l'application
├── .eslintrc.js        # Configuration ESLint
├── vite.config.js      # Configuration Vite
├── tailwind.config.js  # Configuration Tailwind CSS
└── package.json        # Dépendances et scripts
```

## 💻 Démarrage rapide

### Utilisation via Docker (recommandé)

Le frontend fonctionne au sein de l'environnement Docker du projet. Pour le démarrer :

```bash
# À la racine du projet
docker-compose -f infra/docker-compose.yml up -d
```

L'application sera accessible à l'adresse : [http://localhost:5173](http://localhost:5173)

### Développement local (sans Docker)

Si vous souhaitez développer en dehors de Docker :

```bash
# Installer les dépendances
npm install --legacy-peer-deps

# Démarrer le serveur de développement
npm run dev
```

## 🧩 Composants Shadcn UI

Ce projet utilise la bibliothèque [Shadcn UI](https://ui.shadcn.com/) pour les composants d'interface. Il s'agit d'une collection de composants réutilisables construits avec Radix UI et stylisés avec Tailwind CSS.

### Ajouter un nouveau composant

```bash
# Si vous utilisez Docker
docker exec -it infra-frontend-1 npx shadcn-ui@latest add button --legacy-peer-deps

# Sans Docker
npx shadcn-ui@latest add button --legacy-peer-deps
```

### Liste des composants disponibles

Consultez la [documentation de Shadcn UI](https://ui.shadcn.com/docs/components/accordion) pour voir tous les composants disponibles.

## 📡 Communication avec le backend

Le frontend communique avec le backend via des requêtes API. La configuration de base des appels API se trouve dans `src/services/api.js`.

```javascript
// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
```

## 🛠️ Scripts disponibles

```bash
# Démarrer le serveur de développement
npm run dev

# Construire pour la production
npm run build

# Prévisualiser la build de production
npm run preview

# Linter
npm run lint
```

## 🐞 Résolution des problèmes

### Les dépendances ne s'installent pas correctement

Utilisez le flag `--legacy-peer-deps` lors de l'installation :

```bash
npm install --legacy-peer-deps
```

### Les composants Shadcn UI ne s'affichent pas correctement

Assurez-vous que vous avez importé les styles Tailwind :

```css
/* src/index.css ou équivalent */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Les changements de code ne sont pas détectés

Si le hot reloading ne fonctionne pas :

```bash
# Redémarrer le serveur de développement
npm run dev -- --force
```

### Erreurs CORS lors des appels API

Vérifiez que le backend est bien configuré pour accepter les requêtes depuis `http://localhost:5173`.

## 📚 Ressources utiles

- [Documentation React](https://react.dev/)
- [Documentation Tailwind CSS](https://tailwindcss.com/docs)
- [Documentation Shadcn UI](https://ui.shadcn.com/docs)
- [Documentation React Router](https://reactrouter.com/docs)
- [Documentation Axios](https://axios-http.com/docs/intro)
- [Documentation Vite](https://vitejs.dev/guide/)
