# Guide de dépannage pour le Projet BigProject

Ce guide vous aidera à résoudre les problèmes courants que vous pourriez rencontrer lors du développement du projet BigProject.

## 🔄 Problèmes généraux de Docker

### 🐞 Les conteneurs ne démarrent pas

**Symptôme**: Après avoir exécuté `docker-compose -f infra/docker-compose.yml up -d`, certains ou tous les conteneurs ne démarrent pas.

**Solutions possibles**:

1. **Vérifier les logs pour identifier le problème**:
   ```bash
   docker-compose -f infra/docker-compose.yml logs
   ```

2. **Ports déjà utilisés**:
   ```bash
   # Sur Windows
   netstat -ano | findstr :8000
   netstat -ano | findstr :5173
   netstat -ano | findstr :8080
   netstat -ano | findstr :3306
   
   # Arrêter Laragon ou tout autre serveur local
   ```

3. **Permissions insuffisantes**:
   ```bash
   # Sous Linux/Mac, essayez avec sudo
   sudo docker-compose -f infra/docker-compose.yml up -d
   ```

4. **Reconstruire les images**:
   ```bash
   docker-compose -f infra/docker-compose.yml down
   docker-compose -f infra/docker-compose.yml build --no-cache
   docker-compose -f infra/docker-compose.yml up -d
   ```

### 🐞 Le conteneur s'arrête immédiatement après le démarrage

**Symptôme**: Un conteneur démarre puis s'arrête tout de suite.

**Solutions possibles**:

1. **Vérifier les logs du conteneur spécifique**:
   ```bash
   docker-compose -f infra/docker-compose.yml logs <nom-du-service>
   ```

2. **Pour le conteneur frontend**:
   ```bash
   # Vérifier que le package.json est valide
   docker-compose -f infra/docker-compose.yml exec frontend cat package.json
   
   # Réinstaller les dépendances
   docker-compose -f infra/docker-compose.yml exec frontend npm install
   ```

3. **Pour le conteneur backend**:
   ```bash
   # Vérifier que le composer.json est valide
   docker-compose -f infra/docker-compose.yml exec backend cat composer.json
   
   # Réinstaller les dépendances
   docker-compose -f infra/docker-compose.yml exec backend composer install
   ```

## 🌐 Problèmes de frontend

### 🐞 Les changements de code ne sont pas appliqués

**Symptôme**: Vous modifiez un fichier source dans le frontend mais les changements n'apparaissent pas dans le navigateur.

**Solutions possibles**:

1. **Vider le cache du navigateur** (Ctrl+F5 ou Cmd+Shift+R)

2. **Redémarrer le conteneur frontend**:
   ```bash
   docker-compose -f infra/docker-compose.yml restart frontend
   ```

3. **Vérifier que le hot-reloading est activé**:
   ```bash
   # Vérifier que le développement utilise l'option --host
   docker-compose -f infra/docker-compose.yml logs frontend
   ```

### 🐞 Erreurs avec les composants Shadcn UI

**Symptôme**: Les composants Shadcn UI ne fonctionnent pas ou causent des erreurs.

**Solutions possibles**:

1. **Installer les dépendances avec --legacy-peer-deps**:
   ```bash
   docker exec -it infra-frontend-1 npm install --legacy-peer-deps
   ```

2. **Vérifier l'importation des styles Tailwind**:
   ```jsx
   // Vérifier que ces lignes sont dans src/index.css ou équivalent
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

3. **Réinstaller le composant spécifique**:
   ```bash
   docker exec -it infra-frontend-1 npx shadcn-ui@latest add <nom-composant> --legacy-peer-deps
   ```

### 🐞 Erreurs lors des appels API

**Symptôme**: Vous obtenez des erreurs CORS ou des erreurs de connexion lors des appels au backend.

**Solutions possibles**:

1. **Vérifier que le backend est en cours d'exécution**:
   ```bash
   docker-compose -f infra/docker-compose.yml ps
   ```

2. **Vérifier les URL d'API**:
   ```jsx
   // Vérifier que l'URL de base est correcte
   const api = axios.create({
     baseURL: 'http://localhost:8000/api', // Doit correspondre à votre backend
   });
   ```

3. **Pour les erreurs CORS, vérifier la configuration du backend**:
   ```bash
   docker exec -it infra-backend-1 composer require nelmio/cors-bundle
   ```
   Puis configurer correctement le bundle CORS.

## 🖥️ Problèmes de backend

### 🐞 Erreurs avec Symfony

**Symptôme**: Le backend renvoie des erreurs 500 ou des exceptions de Symfony.

**Solutions possibles**:

1. **Vérifier les logs Symfony**:
   ```bash
   docker exec -it infra-backend-1 tail -f var/log/dev.log
   ```

2. **Vider le cache Symfony**:
   ```bash
   docker exec -it infra-backend-1 php bin/console cache:clear
   ```

3. **Vérifier la configuration de l'environnement**:
   ```bash
   docker exec -it infra-backend-1 cat .env
   ```

### 🐞 Problèmes avec Doctrine/Base de données

**Symptôme**: Erreurs liées à la structure de la base de données ou aux entités.

**Solutions possibles**:

1. **Mettre à jour le schéma de la base de données**:
   ```bash
   # Exécuter les migrations
   docker exec -it infra-backend-1 php bin/console doctrine:migrations:migrate
   ```

2. **Réinitialiser complètement la base de données** (⚠️ perte de données):
   ```bash
   docker exec -it infra-backend-1 php bin/console doctrine:schema:drop --force
   docker exec -it infra-backend-1 php bin/console doctrine:migrations:migrate
   ```

3. **Vérifier les erreurs dans les entités**:
   ```bash
   docker exec -it infra-backend-1 php bin/console doctrine:schema:validate
   ```

### 🐞 Problèmes d'autoloading PHP

**Symptôme**: Erreurs "Class not found" même si la classe existe.

**Solutions possibles**:

1. **Régénérer l'autoloader**:
   ```bash
   docker exec -it infra-backend-1 composer dump-autoload
   ```

2. **Vérifier les namespaces**:
   ```bash
   # S'assurer que le namespace correspond à la structure des dossiers
   docker exec -it infra-backend-1 cat src/Entity/MyClass.php
   ```

## 🗄️ Problèmes de base de données

### 🐞 Impossible de se connecter à la base de données

**Symptôme**: Les connexions à la base de données échouent.

**Solutions possibles**:

1. **Vérifier que le conteneur MySQL est en cours d'exécution**:
   ```bash
   docker-compose -f infra/docker-compose.yml ps database
   ```

2. **Vérifier les logs du conteneur MySQL**:
   ```bash
   docker-compose -f infra/docker-compose.yml logs database
   ```

3. **Vérifier les informations de connexion**:
   ```bash
   docker exec -it infra-backend-1 cat .env | grep DATABASE_URL
   ```

4. **Redémarrer le conteneur de base de données**:
   ```bash
   docker-compose -f infra/docker-compose.yml restart database
   ```

### 🐞 Problèmes de migration

**Symptôme**: Les migrations Doctrine échouent ou causent des erreurs.

**Solutions possibles**:

1. **Vérifier l'état des migrations**:
   ```bash
   docker exec -it infra-backend-1 php bin/console doctrine:migrations:status
   ```

2. **Réexécuter la dernière migration**:
   ```bash
   docker exec -it infra-backend-1 php bin/console doctrine:migrations:execute --up 'DoctrineMigrations\Version20240101123456'
   ```

3. **Réinitialiser la table de migrations**:
   ```bash
   # Dans PHPMyAdmin, supprimer la table doctrine_migration_versions
   # Puis recréer les migrations
   docker exec -it infra-backend-1 php bin/console doctrine:migrations:version --add --all
   ```

## 🛠️ Problèmes de sécurité

### 🐞 Problèmes d'authentification JWT

**Symptôme**: Erreurs lors de l'authentification ou tokens non valides.

**Solutions possibles**:

1. **Vérifier que les clés JWT sont générées**:
   ```bash
   docker exec -it infra-backend-1 ls -la config/jwt/
   ```

2. **Générer de nouvelles clés JWT**:
   ```bash
   docker exec -it infra-backend-1 php bin/console lexik:jwt:generate-keypair --overwrite
   ```

3. **Vérifier la configuration JWT**:
   ```bash
   docker exec -it infra-backend-1 cat config/packages/lexik_jwt_authentication.yaml
   ```

## 🧹 Comment nettoyer complètement et redémarrer

Si vous rencontrez des problèmes persistants, suivez ces étapes pour repartir sur une base propre:

### ⚠️ Cette procédure réinitialise tout, y compris la base de données

```bash
# 1. Arrêter tous les conteneurs
docker-compose -f infra/docker-compose.yml down

# 2. Supprimer les volumes (⚠️ supprime toutes les données de la base de données)
docker-compose -f infra/docker-compose.yml down -v

# 3. Nettoyer les caches et fichiers temporaires générés
rm -rf backend/var/cache/*
rm -rf backend/var/log/*
rm -rf frontend/node_modules/.vite

# 4. Reconstruire les conteneurs
docker-compose -f infra/docker-compose.yml build --no-cache

# 5. Redémarrer les conteneurs
docker-compose -f infra/docker-compose.yml up -d

# 6. Attendre que tous les services démarrent
sleep 20

# 7. Installer les dépendances frontend
docker exec -it infra-frontend-1 npm install --legacy-peer-deps

# 8. Installer les dépendances backend
docker exec -it infra-backend-1 composer install

# 9. Exécuter les migrations
docker exec -it infra-backend-1 php bin/console doctrine:migrations:migrate --no-interaction
```

## 🆘 Contacter l'équipe de support

Si vous ne parvenez toujours pas à résoudre votre problème, contactez l'équipe de support:

1. **Canal Slack**: `#bigproject-support`
2. **Email**: `support@bigproject.example.com`
3. **Ticket GitHub**: Créez une issue dans le projet

Quand vous demandez de l'aide, fournissez toujours:
- Une description claire du problème
- Les étapes pour reproduire le problème
- Les logs pertinents
- Votre environnement (OS, version Docker, etc.) 