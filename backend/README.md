# Backend du Projet BigProject

Ce dossier contient la partie backend du projet BigProject, construite avec Symfony 7 et Doctrine ORM.

## 🚀 Technologies utilisées

- **PHP 8.2** - Langage de programmation
- **Symfony 7.2** - Framework PHP moderne
- **Doctrine ORM** - Couche d'abstraction de base de données
- **MySQL 8.0** - Système de gestion de base de données
- **Symfony CLI** - Outil en ligne de commande pour Symfony
- **Composer** - Gestionnaire de dépendances PHP

## 🏗️ Structure du projet

```
backend/
├── bin/                # Exécutables console (bin/console)
├── config/             # Configuration de l'application
│   ├── packages/       # Configuration des packages
│   ├── routes.yaml     # Configuration des routes
│   └── services.yaml   # Configuration des services
├── migrations/         # Migrations de base de données
├── public/             # Point d'entrée public (index.php)
├── src/                # Code source de l'application
│   ├── Controller/     # Contrôleurs
│   ├── Entity/         # Entités Doctrine (modèles)
│   ├── Repository/     # Repositories Doctrine
│   ├── Service/        # Services métier
│   └── ...
├── templates/          # Templates Twig (si utilisés)
├── tests/              # Tests automatisés
├── var/                # Fichiers temporaires (cache, logs)
├── vendor/             # Dépendances installées par Composer
├── .env                # Variables d'environnement
└── composer.json       # Dépendances PHP
```

## 💻 Démarrage rapide

### Utilisation via Docker (recommandé)

Le backend fonctionne au sein de l'environnement Docker du projet. Pour le démarrer :

```bash
# À la racine du projet
docker-compose -f infra/docker-compose.yml up -d
```

L'API sera accessible à l'adresse : [http://localhost:8000](http://localhost:8000)

### Se connecter au conteneur backend

Pour exécuter des commandes dans le conteneur backend :

```bash
docker exec -it infra-backend-1 bash
```

### Installer des dépendances

```bash
docker exec -it infra-backend-1 composer require <package-name>

# Exemple :
docker exec -it infra-backend-1 composer require symfony/serializer
```

## 🛠️ Développement avec Symfony

### Commandes Symfony courantes

Toutes ces commandes doivent être exécutées à l'intérieur du conteneur backend :

```bash
# Lister toutes les commandes disponibles
php bin/console list

# Vider le cache
php bin/console cache:clear

# Créer un contrôleur
php bin/console make:controller NomDuController

# Créer une entité
php bin/console make:entity NomDeLaTable

# Créer une migration
php bin/console make:migration

# Exécuter les migrations
php bin/console doctrine:migrations:migrate

# Valider le schéma de la base de données
php bin/console doctrine:schema:validate
```

### Travailler avec les entités et la base de données

Le projet utilise Doctrine ORM pour la gestion de la base de données. Voici le workflow typique pour créer/modifier des entités :

1. **Créer ou modifier une entité**
   ```bash
   php bin/console make:entity NomDeLaTable
   ```

2. **Générer une migration**
   ```bash
   php bin/console doctrine:migrations:diff
   ```

3. **Exécuter la migration**
   ```bash
   php bin/console doctrine:migrations:migrate
   ```

## 🔒 Sécurité et authentification

Le projet utilise JWT pour l'authentification API. Pour configurer :

```bash
# Installer le bundle JWT
composer require lexik/jwt-authentication-bundle

# Générer les clés SSL
php bin/console lexik:jwt:generate-keypair
```

## 📝 Tests

### Exécuter les tests

```bash
# Exécuter tous les tests
php bin/phpunit

# Exécuter un test spécifique
php bin/phpunit tests/Controller/NomDuControllerTest.php
```

## 🐞 Résolution des problèmes

### Erreur "Class not found"

```bash
composer dump-autoload
```

### Erreur de cache

```bash
php bin/console cache:clear
```

### Erreurs de base de données

```bash
# Vérifier le schéma
php bin/console doctrine:schema:validate

# Recréer la base de données (⚠️ perte de données)
php bin/console doctrine:schema:drop --force
php bin/console doctrine:migrations:migrate --no-interaction
```

### Erreurs CORS

Si vous avez des erreurs CORS lors des appels depuis le frontend :

```bash
composer require nelmio/cors-bundle
```

Puis configurez le bundle dans `config/packages/nelmio_cors.yaml` pour autoriser les requêtes depuis `http://localhost:5173`.

## 🔍 Déboguer votre application

### Utiliser Symfony Profiler

Le Symfony Profiler est accessible à l'URL `/_profiler` de votre application (ex: http://localhost:8000/_profiler).

### Logs Symfony

```bash
# Voir les logs de développement
tail -f var/log/dev.log
```

## 📚 Ressources utiles

- [Documentation Symfony](https://symfony.com/doc/current/index.html)
- [Documentation Doctrine](https://www.doctrine-project.org/projects/doctrine-orm/en/2.10/index.html)
- [Documentation API Platform](https://api-platform.com/docs/) (si utilisé)
- [Symfony Best Practices](https://symfony.com/doc/current/best_practices.html)
- [Symfony Maker Bundle](https://symfony.com/bundles/SymfonyMakerBundle/current/index.html) 