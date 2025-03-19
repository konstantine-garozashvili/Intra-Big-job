# Guide Frontend pour le Projet BigProject

Ce guide vous aidera à comprendre et à travailler efficacement avec la partie frontend du projet BigProject, qui est basée sur React et Tailwind CSS.

## 📖 Vue d'ensemble

Le frontend du projet BigProject est une application React moderne qui utilise:

- **React 19.0.0** comme framework principal
- **Vite** comme outil de build et serveur de développement
- **Tailwind CSS** pour le styling
- **Shadcn UI** pour les composants d'interface
- **React Router** pour la navigation
- **Axios** pour les requêtes HTTP

## 🏗️ Structure du projet frontend

```
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
```

## 🎨 Guide des Couleurs

Les variables de couleurs sont définies dans `src/index.css` :

```css
:root {
  /* Couleurs Principales */
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
  --chart-1: #528eb2        /* Principal */
  --chart-2: #003366        /* Foncé */
  --chart-3: #02284f        /* Secondaire */
  --chart-4: #235465        /* Variante */
  --chart-5: #addde6        /* Clair */
}
```

## 🧩 Organisation des Composants

### Composants Publics

Les composants publics sont organisés en deux catégories :

1. **Composants UI (`/components/ui/`)** :
   - Composants de base réutilisables (Shadcn)
   - Éléments d'interface génériques
   - Styles cohérents avec le design system

2. **Composants Partagés (`/components/shared/`)** :
   - Composants métier réutilisables
   - Fonctionnalités communes à plusieurs domaines
   - Composants de layout partagés

### Services Partagés

Les services partagés (`/services/`) gèrent :
- Appels API communs
- Authentification
- Utilitaires partagés
- Gestion d'état globale

## 🚀 Démarrage rapide

### Accéder à l'application

L'application frontend est accessible à l'adresse:
[http://localhost:5173](http://localhost:5173)

Si vous avez besoin de redémarrer le serveur:

```bash
docker-compose -f infra/docker-compose.yml restart frontend
```

### Se connecter au conteneur

Pour exécuter des commandes dans le conteneur frontend:

```bash
docker exec -it infra-frontend-1 sh
```

## 🧩 Utilisation des composants

### Composants Shadcn UI

Ce projet utilise la bibliothèque de composants [Shadcn UI](https://ui.shadcn.com/), qui est une collection de composants réutilisables construits avec Radix UI et stylisés avec Tailwind CSS.

#### Ajouter un nouveau composant Shadcn

```bash
docker exec -it infra-frontend-1 sh
npx shadcn-ui@latest add <nom-du-composant>

```

> Note: L'option `--legacy-peer-deps` est nécessaire en raison de certaines incompatibilités de dépendances.

#### Utiliser un composant Shadcn

```jsx
// Importer le composant depuis le dossier ui
import { Button } from "@/components/ui/button";

function MonComposant() {
  return (
    <Button variant="outline">Cliquer ici</Button>
  );
}
```

### Créer un composant personnalisé

Voici un exemple de structure pour un composant React personnalisé:

```jsx
// src/components/TaskCard.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const TaskCard = ({ title, description, status }) => {
  return (
    <Card className="w-full mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Badge variant={status === 'completed' ? 'success' : 'default'}>
            {status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">{description}</p>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
```

## 🧭 Routing avec React Router

Le projet utilise React Router pour gérer la navigation. Voici un exemple de configuration de base:

```jsx
// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import TaskList from './pages/TaskList';
import TaskDetail from './pages/TaskDetail';
import NotFound from './pages/NotFound';
import Layout from './layouts/MainLayout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="tasks" element={<TaskList />} />
          <Route path="tasks/:id" element={<TaskDetail />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
```

## 🔄 Appels API avec Axios

Le projet utilise Axios pour les appels API. Voici comment configurer et utiliser Axios:

### Configuration de base

```jsx
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

### Exemple d'utilisation avec un hook personnalisé

```jsx
// src/hooks/useTasks.js
import { useState, useEffect } from 'react';
import api from '../services/api';

export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response = await api.get('/tasks');
        setTasks(response.data);
        setError(null);
      } catch (err) {
        setError('Erreur lors du chargement des tâches');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const createTask = async (taskData) => {
    try {
      const response = await api.post('/tasks', taskData);
      setTasks([...tasks, response.data]);
      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return { tasks, loading, error, createTask };
}
```

### Utilisation dans un composant

```jsx
// src/pages/TaskList.jsx
import React from 'react';
import { useTasks } from '../hooks/useTasks';
import TaskCard from '../components/TaskCard';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

const TaskList = () => {
  const { tasks, loading, error, createTask } = useTasks();

  if (loading) return <Spinner />;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Liste des tâches</h1>
      
      <Button 
        onClick={() => createTask({ title: 'Nouvelle tâche', status: 'pending' })}
        className="mb-4"
      >
        Ajouter une tâche
      </Button>
      
      {tasks.length === 0 ? (
        <p className="text-gray-500">Aucune tâche disponible</p>
      ) : (
        <div className="space-y-4">
          {tasks.map(task => (
            <TaskCard 
              key={task.id}
              title={task.title}
              description={task.description}
              status={task.status}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskList;
```

## 🎨 Styling avec Tailwind CSS

Le projet utilise Tailwind CSS pour le styling. Tailwind est un framework CSS utilitaire qui vous permet de styliser vos éléments directement dans vos fichiers JSX.

### Concepts clés de Tailwind CSS

- **Utility-first** : Utilisez des classes utilitaires directement dans votre HTML
- **Responsive Design** : Utilisez des préfixes comme `sm:`, `md:`, `lg:` pour le design responsive
- **Hover, Focus, etc.** : Utilisez des préfixes comme `hover:`, `focus:` pour les états
- **Customization** : Le fichier `tailwind.config.js` permet de personnaliser les couleurs, les tailles, etc.

### Exemple de styling avec Tailwind

```jsx
<div className="flex flex-col md:flex-row items-center justify-between p-4 bg-white rounded-lg shadow">
  <div className="mb-4 md:mb-0">
    <h2 className="text-xl font-semibold text-gray-800">Titre de la carte</h2>
    <p className="text-gray-600">Description de la carte</p>
  </div>
  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
    Action
  </button>
</div>
```

### Personnalisation de Tailwind

Le fichier `tailwind.config.js` permet de personnaliser votre configuration Tailwind:

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#02284f',
          light: '#528eb2',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
```

## 🐞 Résolution des problèmes courants

### L'application ne charge pas correctement

```bash
# Vérifiez les logs du conteneur frontend
docker-compose -f infra/docker-compose.yml logs frontend

# Redémarrez le conteneur
docker-compose -f infra/docker-compose.yml restart frontend
```

### Erreurs liées aux dépendances

```bash
# Réinstallez les dépendances
docker exec -it infra-frontend-1 npm install

# Si le problème persiste, supprimez node_modules et réinstallez
docker exec -it infra-frontend-1 rm -rf node_modules
docker exec -it infra-frontend-1 npm install
```

### Les composants Shadcn UI ne s'affichent pas correctement

Assurez-vous que vous avez correctement configuré Tailwind et que vous avez importé les styles nécessaires:

```jsx
// src/index.css ou src/App.css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## 📚 Ressources utiles

- [Documentation React](https://reactjs.org/docs/getting-started.html)
- [Documentation Tailwind CSS](https://tailwindcss.com/docs)
- [Documentation Shadcn UI](https://ui.shadcn.com/docs)
- [Documentation React Router](https://reactrouter.com/docs/en/v6)
- [Documentation Axios](https://axios-http.com/docs/intro)
- [Documentation Vite](https://vitejs.dev/guide/) 