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

# Générer les clés JWT
docker exec -it infra-backend-1 php bin/console lexik:jwt:generate-keypair
```

3. **Initialiser complètement la base de données (si nécessaire)**

Si les tables ne sont pas créées automatiquement, utilisez le script d'initialisation :
```bash
./init-database.sh
```

4. **Loading Sample Data**

If you need to load or reload sample data:
```bash
./load-fixtures.sh
```

4. **Vérifier que tout fonctionne**

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

## Installation et démarrage

1. Cloner le dépôt
2. Lancer les conteneurs avec Docker Compose :
   ```bash
   docker-compose -f infra/docker-compose.yml up -d --build
   ```
3. L'application sera accessible à :
   - Frontend : http://localhost:5173
   - Backend API : http://localhost:8000
   - PHPMyAdmin : http://localhost:8080 (root/root)

## Base de données

Les migrations et fixtures sont automatiquement appliquées au démarrage des conteneurs. Si vous rencontrez des problèmes avec les tables manquantes, utilisez :

1. Le script d'initialisation complète :
   ```bash
   ./init-database.sh
   ```
   Ce script réinitialise complètement la base de données en recréant toutes les tables à partir des entités.

2. Le script de configuration pour les changements mineurs :
   ```bash
   ./setup-database.sh
   ```

3. Ou les commandes individuelles :
   ```bash
   # Réinitialiser complètement la base de données
   docker exec -it infra-backend-1 php bin/console doctrine:database:drop --force --no-interaction
   docker exec -it infra-backend-1 php bin/console doctrine:database:create --no-interaction
   docker exec -it infra-backend-1 php bin/console doctrine:schema:update --force --no-interaction
   
   # Générer une migration après changement d'entités
   docker exec -it infra-backend-1 php bin/console doctrine:migrations:diff
   
   # Exécuter les migrations
   docker exec -it infra-backend-1 php bin/console doctrine:migrations:migrate --no-interaction
   
   # Charger les fixtures
   docker exec -it infra-backend-1 php bin/console doctrine:fixtures:load --no-interaction
   ```