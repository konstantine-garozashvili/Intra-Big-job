# Projet Intra-BigProject

## 🚀 Guide de démarrage rapide

### Préparation initiale

Avant de commencer, assurez-vous d'avoir un environnement propre (Attention cette action supprimera les volumes de vos anciens projets) :

```bash
# Nettoyer le cache Docker et les volumes
docker system prune -a --volumes

```

### Prérequis

- Docker et Docker Compose installés sur votre machine
- Git
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
