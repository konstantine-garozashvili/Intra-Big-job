# Projet Intra-BigProject

## 🚀 Guide de démarrage rapide

### Préparation initiale

Avant de commencer, assurez-vous d'avoir un environnement propre (Attention cette action supprimera les volumes de vos anciens projets) :

```bash
# Nettoyer le cache Docker et les volumes
docker system prune -a --volumes

```

### Important

- **Important**: Arrêter Laragon ou tout autre serveur local qui pourrait utiliser les ports 3306, 8000, 8080 ou 5173

### Installation en 3 étapes

1. **Cloner le projet**

```bash
git clone <URL_DU_DÉPÔT>
cd Intra-BigProject
```

2. **Lancer les conteneurs Docker**

```bash
# Reconstruire les images Docker
docker-compose -f infra/docker-compose.yml build --no-cache

# Démarrer les conteneurs
docker-compose -f infra/docker-compose.yml up -d

docker exec -it infra-backend-1 php bin/console lexik:jwt:generate-keypair

docker exec -it infra-backend-1 php bin/console doctrine:fixtures:load --group=UserFixtures --append

```

3. **Vérifier que tout fonctionne**

- Frontend : [http://localhost:5173](http://localhost:5173)
- Backend API : [http://localhost:8000](http://localhost:8000)
- PHPMyAdmin : [http://localhost:8080](http://localhost:8080) (utilisateur: root, mot de passe: root)

## 📚 Documentation

Ce projet dispose d'une documentation complète pour aider les nouveaux développeurs :

### 📋 Guides généraux

- [Guide Docker](docs/docker-guide.md) - Tout ce que vous devez savoir sur l'environnement Docker
- [En cas d'erreurs](docs/en-cas-d'erreurs.md) - Solutions aux problèmes fréquents
- [Dépendances](docs/dépendances.md) - Liste des dépendances utilisées dans le projet

### 🔧 Guides techniques

- [Guide Frontend (React)](docs/frontend-guide.md) - Guide pour travailler avec React et Tailwind
- [Guide Backend (Symfony)](docs/backend-guide.md) - Guide pour travailler avec Symfony
- [Guide Base de données](docs/database-guide.md) - Comment travailler avec la base de données

### 🛠️ Documentation spécifique par composant

- [README Frontend](frontend/README.md) - Documentation spécifique au frontend
- [README Backend](backend/README.md) - Documentation spécifique au backend

## 📝 Commandes fréquentes

### Gestion des conteneurs Docker

```bash
# Démarrer les conteneurs
docker-compose -f infra/docker-compose.yml up -d

# Arrêter les conteneurs
docker-compose -f infra/docker-compose.yml down

# Voir les logs
docker-compose -f infra/docker-compose.yml logs

# Reconstruire les conteneurs (après modifications)
docker-compose -f infra/docker-compose.yml up --build -d
```

### Commandes Backend (Symfony)

```bash
# Se connecter au conteneur backend
docker exec -it infra-backend-1 bash

# Créer une nouvelle entité
php bin/console make:entity

# Générer une migration
php bin/console doctrine:migrations:diff

# Exécuter les migrations
php bin/console doctrine:migrations:migrate
```

### Commandes Frontend (React)

```bash
# Se connecter au conteneur frontend
docker exec -it infra-frontend-1 sh

# Ajouter un composant Shadcn UI
npx shadcn@latest add [nom-du-composant] 

# Puis choisir :
 "legacy-peer-deps"
```

## 🆘 Résolution des problèmes courants

Consultez notre [guide de dépannage](docs/en-cas-d'erreurs.md) pour les solutions aux problèmes fréquemment rencontrés.

## 👥 Support

Si vous rencontrez des difficultés ou avez des questions :

1. Consultez d'abord la documentation dans le dossier `docs/`
2. Demandez de l'aide à vos collègues
3. Signalez les bugs en créant une issue sur GitHub

## Dépendances et configuration du projet

### Prérequis système

- **Docker** et **Docker Compose** (version 20.10+ recommandée)
- **Git** pour le contrôle de version
- Un navigateur web moderne (Chrome, Firefox, Edge)
- 4GB de RAM minimum pour exécuter les conteneurs Docker

### Configuration des dépendances

#### Frontend (React 19.0.0)

Les dépendances frontend sont gérées via npm et installées automatiquement lors du build Docker. Les principales dépendances incluent :

```bash
# Installation manuelle des dépendances (si nécessaire)
cd frontend
npm install
```

**Dépendances principales** :
- React 19.0.0 et React DOM
- Axios pour les appels API
- Tailwind CSS pour le styling
- Shadcn UI pour les composants d'interface
- Framer Motion pour les animations
- React Router pour la navigation

#### Backend (Symfony 7.2)

Les dépendances backend sont gérées via Composer et installées automatiquement lors du build Docker. Les principales dépendances incluent :

```bash
# Installation manuelle des dépendances (si nécessaire)
cd backend
composer install
```

**Dépendances principales** :
- Symfony 7.2 Framework
- Doctrine ORM pour la base de données
- Symfony Security Bundle
- JWT Authentication
- Symfony Mailer pour l'envoi d'emails

### Variables d'environnement

#### Backend (.env)

Le fichier `.env` du backend contient les configurations importantes :

```
# Configuration de la base de données
DATABASE_URL=mysql://root:root@database:3306/app?serverVersion=8.0.32

# Configuration JWT
JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
JWT_PASSPHRASE=votre_passphrase

# Configuration SMTP pour les emails
MAILER_DSN=smtp://mailhog:1025
```

#### Frontend (.env)

Le fichier `.env` du frontend contient :

```
VITE_API_URL=http://localhost:8000/api
```

### Problèmes connus et solutions

#### Problème de CORS

Si vous rencontrez des problèmes CORS lors de l'utilisation de l'API d'adresse :
- Vérifiez que la configuration du proxy dans `vite.config.js` est correcte
- Utilisez l'API Fetch avec `mode: 'cors'` comme implémenté dans `api.js`

#### Problèmes de ports

Si certains ports sont déjà utilisés (3306, 8000, 8080, 5173) :
1. Arrêtez les services qui utilisent ces ports (Laragon, XAMPP, etc.)
2. Ou modifiez les ports dans le fichier `infra/docker-compose.yml`

### Après installation

Une fois le projet installé, vous pouvez vous connecter avec l'un des comptes suivants :

- **Admin** : admin@example.com / password
- **Utilisateur** : user@example.com / password

### Contribuer au projet

Pour contribuer au projet :

1. Créez une branche pour votre fonctionnalité
2. Faites vos modifications
3. Exécutez les tests
4. Soumettez une pull request

Pour toute question ou problème, veuillez créer une issue dans le dépôt GitHub.