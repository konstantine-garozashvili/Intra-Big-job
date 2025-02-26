# Intra Big Project - Symfony 6.4

Une application web moderne construite avec Symfony 6.4, utilisant Docker pour l'environnement de développement.

## Prérequis

Avant de commencer, assurez-vous d'avoir installé les éléments suivants sur votre système :
- [Docker](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/downloads)
- Un éditeur de texte ou IDE (VS Code, PHPStorm, etc.)

## Ports Requis

Assurez-vous que ces ports sont disponibles sur votre système :
- `8080` - Application principale
- `8081` - PHPMyAdmin
- `3306` - MySQL

## Guide d'Installation Étape par Étape

### 1. Cloner le Dépôt

```bash
git clone [repository-url]
cd [repository-name]
```

### 2. Configuration de l'Environnement

```bash
# Copier le fichier d'environnement
cp .env.local.example .env.local

# Modifier .env.local avec vos identifiants de base de données si nécessaire
# Les valeurs par défaut sont :
# MYSQL_DATABASE=Bigproject
# MYSQL_USER=symfony_user
# MYSQL_PASSWORD=your_password
# MYSQL_ROOT_PASSWORD=your_root_password
```

### 3. Démarrer les Services Docker

```bash
# Première installation ou reconstruction :
docker-compose up -d --build

# Pour les démarrages suivants :
docker-compose up -d
```

### 4. Installer les Dépendances et Configurer la Base de Données

```bash
# Installer les dépendances PHP
docker-compose exec app composer install

# Créer le schéma de base de données
docker-compose exec app php bin/console doctrine:schema:create

# Vider le cache
docker-compose exec app php bin/console cache:clear
```

### 5. Travailler avec les Bundles

```bash
# Installer un nouveau bundle
docker-compose exec app composer require nom-du-bundle

# Installer un bundle de développement
docker-compose exec app composer require --dev nom-du-bundle

# Mettre à jour tous les packages
docker-compose exec app composer update

# Vider le cache après l'installation d'un bundle
docker-compose exec app php bin/console cache:clear
```

### 6. Opérations sur la Base de Données

```bash
# Créer une nouvelle migration
docker-compose exec app php bin/console make:migration

# Exécuter les migrations
docker-compose exec app php bin/console doctrine:migrations:migrate

# Créer une nouvelle entité
docker-compose exec app php bin/console make:entity
```

### 7. Commandes Docker Courantes

```bash
# Voir les logs
docker-compose logs

# Voir les logs d'un service spécifique
docker-compose logs app    # Logs PHP-FPM
docker-compose logs nginx  # Logs Nginx
docker-compose logs db     # Logs MySQL

# Redémarrer les services
docker-compose restart

# Arrêter tous les services
docker-compose down

# Reconstruire les conteneurs
docker-compose down -v
docker-compose up -d --build
```

## Structure des Répertoires

```
.
├── docker/
│   ├── nginx/
│   │   └── conf.d/
│   │       └── app.conf    # Configuration Nginx
│   └── php/
│       ├── php.ini         # Configuration PHP
│       └── php-fpm.conf    # Configuration PHP-FPM
├── symfony/                # Code de l'application Symfony
├── docker-compose.yml      # Configuration des services Docker
└── Dockerfile             # Configuration du conteneur PHP
```

## Résolution des Problèmes

### Problèmes de Performance
1. Vérifier que le volume vendor est correctement monté
2. Vérifier que OPcache fonctionne
3. Vérifier l'état du gestionnaire de processus PHP-FPM

### Erreur 502 Bad Gateway
1. Vérifier si tous les conteneurs sont en cours d'exécution : `docker-compose ps`
2. Vérifier les logs : `docker-compose logs nginx app`
3. Vérifier qu'aucun autre service n'utilise les ports requis

### Problèmes de Connexion à la Base de Données
1. Vérifier que MySQL est en cours d'exécution : `docker-compose ps db`
2. Vérifier les logs de la base de données : `docker-compose logs db`
3. Vérifier les identifiants dans .env.local

### Problèmes de Permissions
1. Les conteneurs fonctionnent avec UID/GID 1000 par défaut
2. Vérifier que votre utilisateur a les bonnes permissions
3. Si nécessaire, ajuster USER_ID et GROUP_ID dans docker-compose.yml

## Bonnes Pratiques de Développement

1. Toujours travailler dans des branches de fonctionnalités
2. Exécuter les tests avant de commiter : `docker-compose exec app php bin/phpunit`
3. Maintenir les dépendances à jour
4. Vider le cache après des changements majeurs
5. Utiliser des messages de commit Git appropriés

## Stack Technique

- PHP 8.2
- Symfony 6.4
- MySQL 8.2
- Nginx 1.24
- Docker & Docker Compose 