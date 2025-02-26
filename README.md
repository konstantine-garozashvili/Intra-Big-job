# Projet Intra-BigProject

## 🚀 Guide de démarrage rapide

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
docker-compose -f infra/docker-compose.yml up --build -d
```

3. **Vérifier que tout fonctionne**

- Frontend : [http://localhost:5173](http://localhost:5173)
- Backend API : [http://localhost:8000](http://localhost:8000)
- PHPMyAdmin : [http://localhost:8080](http://localhost:8080) (utilisateur: root, mot de passe: root)

## 📚 Documentation

Ce projet dispose d'une documentation complète pour aider les nouveaux développeurs :

### 📋 Guides généraux

- [Vue d'ensemble de l'architecture](docs/architecture.md) - Comprendre comment le projet est structuré
- [Guide de contribution](docs/contributing.md) - Comment contribuer au projet
- [Standards de code](docs/code-standards.md) - Conventions de code à respecter

### 🔧 Guides techniques

- [Guide Docker](docs/docker-guide.md) - Tout ce que vous devez savoir sur l'environnement Docker
- [Guide Frontend (React)](docs/frontend-guide.md) - Guide pour travailler avec React et Tailwind
- [Guide Backend (Symfony)](docs/backend-guide.md) - Guide pour travailler avec Symfony
- [Guide Base de données](docs/database-guide.md) - Comment travailler avec la base de données

### 🛠️ Workflow de développement

- [Guide Git](docs/git-workflow.md) - Workflow Git et bonnes pratiques
- [Déploiement](docs/deployment.md) - Comment déployer l'application

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
npx shadcn@latest add [nom-du-composant] --legacy-peer-deps
```

## 🆘 Résolution des problèmes courants

Consultez notre [guide de dépannage](docs/troubleshooting.md) pour les solutions aux problèmes fréquemment rencontrés.

## 👥 Support

Si vous rencontrez des difficultés ou avez des questions :

1. Consultez d'abord la documentation dans le dossier `docs/`
2. Demandez de l'aide à vos collègues via le canal Slack `#bigproject-support`
3. Signalez les bugs en créant une issue sur GitHub

## 📅 Planning et jalons du projet

- Phase 1 (Semaines 1-2) : Configuration et mise en place des fonctionnalités de base
- Phase 2 (Semaines 3-5) : Développement des fonctionnalités principales
- Phase 3 (Semaines 6-7) : Tests et corrections de bugs
- Phase 4 (Semaine 8) : Finalisation et déploiement

## 📄 Licence

Ce projet est soumis à des restrictions d'utilisation. Consultez le fichier LICENSE pour plus d'informations. 