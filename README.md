# Projet Intra-BigProject

Ce document explique comment configurer l'environnement de développement et travailler avec la base de données du projet.

## Prérequis

- Docker et Docker Compose installés sur votre machine
- Git
- Un éditeur de code (VSCode recommandé)
- Couper laragon si il tourne en fond

## Configuration initiale

### Étape 1 : Cloner le projet

```bash
git clone <URL_DU_DÉPÔT>
cd Intra-BigProject
```

### Étape 2 : Lancer les conteneurs Docker

```bash
# Démarrer les conteneurs Docker en étant dans le dossier "Intra-BigProject"
docker-compose -f infra/docker-compose.yml up --build -d
```

Cette commande va:
- Construire les images Docker si nécessaire
- Créer et démarrer tous les conteneurs (frontend, backend, base de données, nginx, phpmyadmin)
- Installer toutes les dépendances
- Créer la base de données et exécuter les migrations

### Étape 3 : Vérifier que tout fonctionne

- Frontend : http://localhost:5173
- Backend API : http://localhost:8000
- PHPMyAdmin : http://localhost:8080 (utilisateur: root, mot de passe: root)

## Travailler avec la base de données

### Structure du projet

Le projet utilise Doctrine ORM pour gérer les interactions avec la base de données MySQL:

- Les entités (tables) sont définies dans `backend/src/Entity/`
- Les migrations sont stockées dans `backend/migrations/`
- La configuration de la base de données se trouve dans:
  - `infra/docker-compose.yml` (configuration Docker)
  - `backend/.env` (paramètres de connexion)
  - `backend/config/packages/doctrine.yaml` (configuration Doctrine)

### Workflow lors de modifications de la base de données

#### 1. Créer ou modifier une entité

Pour créer une nouvelle table, vous pouvez:

**Option 1 : Utiliser la commande de création d'entité**
```bash
# Se connecter au conteneur backend
docker exec -it infra-backend-1 bash

# Créer une nouvelle entité
php bin/console make:entity

# Suivre les instructions interactives pour définir les champs
```

**Option 2 : Créer manuellement le fichier d'entité**
Créer un fichier PHP dans `backend/src/Entity/` en suivant le modèle des entités existantes.

#### 2. Générer une migration

Après avoir créé ou modifié une entité:

```bash
# Dans le conteneur backend
docker exec -it infra-backend-1 php bin/console doctrine:migrations:diff
```

Cette commande analyse les différences entre vos entités et la structure actuelle de la base de données, puis génère un fichier de migration dans `backend/migrations/`.

#### 3. Exécuter la migration

```bash
docker exec -it infra-backend-1 php bin/console doctrine:migrations:migrate
```

Cette commande applique toutes les migrations en attente à la base de données.

#### 4. Partager les changements

Après avoir validé que tout fonctionne:

```bash
git add * , 
git commit -m "Ajout de la nouvelle entité NouvelleEntite et sa migration"
git push
```

### Comment les autres membres de l'équipe récupèrent les changements

Quand un membre de l'équipe récupère des modifications qui incluent des changements de base de données:

```bash
# Récupérer les derniers changements
git pull

# Redémarrer les conteneurs Docker (cela appliquera automatiquement les migrations)
docker-compose -f infra/docker-compose.yml down
docker-compose -f infra/docker-compose.yml up -d
```

Aucune autre action n'est nécessaire car le conteneur backend exécute automatiquement toutes les migrations en attente au démarrage.

### Accéder à la base de données

Vous pouvez accéder à la base de données de plusieurs façons:

1. **PHPMyAdmin**: http://localhost:8080 (utilisateur: root, mot de passe: root)
2. **En ligne de commande**:
   ```bash
   docker exec -it infra-database-1 mysql -uroot -proot bigproject
   ```
3. **Avec DBeaver**: Connectez-vous à localhost:3306 avec l'utilisateur "root" et le mot de passe "root"

## Commandes utiles

### Commandes Docker

```bash
# Voir l'état des conteneurs
docker-compose -f infra/docker-compose.yml ps

# Logs des conteneurs
docker-compose -f infra/docker-compose.yml logs

# Logs d'un conteneur spécifique (ex: backend)
docker-compose -f infra/docker-compose.yml logs backend

# Redémarrer un conteneur spécifique
docker-compose -f infra/docker-compose.yml restart backend
```

### Commandes Doctrine

```bash
# Exécutées dans le conteneur backend (docker exec -it infra-backend-1 bash)

# Créer une entité
php bin/console make:entity

# Créer un repository
php bin/console make:repository

# Générer une migration
php bin/console doctrine:migrations:diff

# Exécuter les migrations
php bin/console doctrine:migrations:migrate

# Revenir en arrière d'une migration
php bin/console doctrine:migrations:migrate prev

# Voir l'état des migrations
php bin/console doctrine:migrations:status
```

## Résolution des problèmes courants

### La base de données n'est pas à jour

Si vous avez des erreurs liées à la structure de la base de données:

```bash
# Forcer l'exécution de toutes les migrations
docker exec -it infra-backend-1 php bin/console doctrine:migrations:migrate --no-interaction
```

### Erreurs de dépendances manquantes

```bash
# Réinstaller les dépendances
docker exec -it infra-backend-1 composer install
docker exec -it infra-frontend-1 npm install
```

### Réinitialiser complètement la base de données

```bash
# Attention: cela supprimera toutes les données!
docker exec -it infra-backend-1 php bin/console doctrine:schema:drop --force
docker exec -it infra-backend-1 php bin/console doctrine:migrations:migrate --no-interaction
```

## Utilisation de Shadcn UI

Ce projet utilise Shadcn UI pour les composants d'interface. Pour ajouter de nouveaux composants:

1. Connectez-vous au conteneur frontend:
   ```bash
   docker exec -it infra-frontend-1 sh
   ```

2. Installez le composant souhaité:
   ```bash
   npx shadcn@latest add [nom-du-composant] 
   
   use --legacy-peer-deps
   # exemple : npx shadcn@latest add button --legacy-peer-deps
   ```

3. Importez et utilisez le composant dans vos fichiers React:
   ```jsx
   import { Button } from "@/components/ui/button";
   
   function MonComposant() {
     return <Button>Cliquez-moi</Button>;
   }
   ```

Pour la liste complète des composants disponibles, consultez [la documentation de Shadcn UI](https://ui.shadcn.com/docs/components/accordion). 