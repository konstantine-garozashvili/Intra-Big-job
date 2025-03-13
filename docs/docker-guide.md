# Guide Docker pour le Projet BigProject

Ce guide vous aidera à comprendre et à utiliser efficacement Docker dans le cadre du projet BigProject.

## 📖 Introduction à Docker

Docker est une plateforme qui permet de développer, déployer et exécuter des applications dans des conteneurs. Les conteneurs sont légers, autonomes et contiennent tout ce dont l'application a besoin pour fonctionner.

### Pourquoi utiliser Docker dans ce projet?

- **Environnement identique pour tous les développeurs** - évite le problème "ça marche sur ma machine"
- **Installation simplifiée** - pas besoin d'installer séparément PHP, Node.js, MySQL, etc.
- **Isolation** - chaque service fonctionne dans son propre conteneur
- **Facilité de déploiement** - le même système peut être utilisé en production

## 🏗️ Architecture Docker du projet

Le projet BigProject utilise Docker Compose pour orchestrer plusieurs conteneurs qui fonctionnent ensemble:

- **frontend**: Conteneur Node.js pour l'application React
- **backend**: Conteneur PHP-FPM pour l'API Symfony
- **nginx**: Serveur web qui expose l'API et sert de proxy
- **database**: Serveur MySQL pour stocker les données
- **phpmyadmin**: Interface web pour gérer la base de données

## 🚀 Démarrage rapide

> **Prérequis**: Avant de commencer, assurez-vous d'avoir [Docker](https://www.docker.com/products/docker-desktop/) et [Docker Compose](https://docs.docker.com/compose/install/) installés sur votre machine.

### Démarrer les conteneurs

```bash
# Dans le dossier racine du projet
docker-compose -f infra/docker-compose.yml up --build -d
```

L'option `--build` reconstruit les images si nécessaire, et `-d` démarre les conteneurs en arrière-plan.

### Vérifier l'état des conteneurs

```bash
docker-compose -f infra/docker-compose.yml ps
```

Tous les conteneurs doivent avoir l'état `Up`. Exemple de sortie:

```
        Name                       Command               State                Ports              
-------------------------------------------------------------------------------------------------
infra-backend-1        docker-php-entrypoint php-fpm    Up      9000/tcp
infra-database-1       docker-entrypoint.sh mysqld      Up      0.0.0.0:3306->3306/tcp, 33060/tcp
infra-frontend-1       docker-entrypoint.sh sh -c ...   Up      0.0.0.0:5173->5173/tcp
infra-nginx-1          /docker-entrypoint.sh ngin ...   Up      0.0.0.0:8000->80/tcp
infra-phpmyadmin-1     /docker-entrypoint.sh apac ...   Up      0.0.0.0:8080->80/tcp
```

### Arrêter les conteneurs

```bash
docker-compose -f infra/docker-compose.yml down
```

### Redémarrer les conteneurs

```bash
docker-compose -f infra/docker-compose.yml restart
```

## 🔍 Examiner les logs des conteneurs

Pour voir les logs de tous les conteneurs:

```bash
docker-compose -f infra/docker-compose.yml logs
```

Pour suivre les logs en temps réel:

```bash
docker-compose -f infra/docker-compose.yml logs -f
```

Pour voir les logs d'un conteneur spécifique:

```bash
docker-compose -f infra/docker-compose.yml logs frontend
docker-compose -f infra/docker-compose.yml logs backend
```

## ⚙️ Configuration Docker

La configuration Docker du projet se trouve dans le dossier `infra/`. Les fichiers principaux sont:

- `infra/docker-compose.yml`: Définit tous les services (conteneurs) et leurs configurations
- `infra/docker/`: Contient les Dockerfiles et fichiers de configuration spécifiques à chaque service

### Le fichier docker-compose.yml expliqué

```yaml
version: '3'

services:
  # Serveur Web Nginx
  nginx:
    build:
      context: ./docker/nginx
    ports:
      - "8000:80"
    volumes:
      - ../backend:/var/www/html
    depends_on:
      - backend

  # Application Frontend (React)
  frontend:
    build:
      context: ./docker/frontend
    ports:
      - "5173:5173"
    volumes:
      - ../frontend:/app
    command: sh -c "npm install && npm run dev -- --host"

  # Application Backend (Symfony)
  backend:
    build:
      context: ./docker/backend
    volumes:
      - ../backend:/var/www/html
    depends_on:
      - database

  # Base de données MySQL
  database:
    image: mysql:8.0
    command: --default-authentication-plugin=mysql_native_password
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: bigproject
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql

  # Interface PHPMyAdmin
  phpmyadmin:
    image: phpmyadmin/phpmyadmin
    ports:
      - "8080:80"
    environment:
      PMA_HOST: database
      MYSQL_ROOT_PASSWORD: root
    depends_on:
      - database

volumes:
  mysql-data:
```

Ce fichier définit:
- Les services qui composent l'application
- Les ports exposés à l'hôte
- Les volumes pour persister les données
- Les dépendances entre les services

## 🛠️ Travailler avec les conteneurs

### Se connecter à un conteneur

Pour ouvrir un terminal dans un conteneur:

```bash
# Frontend (shell)
docker exec -it infra-frontend-1 sh

# Backend (bash)
docker exec -it infra-backend-1 bash

# Database (mysql client)
docker exec -it infra-database-1 mysql -uroot -proot bigproject
```

### Exécuter des commandes dans un conteneur

Vous pouvez exécuter des commandes directement dans un conteneur sans y accéder:

```bash
# Exécuter une commande npm dans le conteneur frontend
docker exec -it infra-frontend-1 npm install axios

# Exécuter une commande Symfony dans le conteneur backend
docker exec -it infra-backend-1 php bin/console cache:clear
```

### Installer des dépendances

#### Frontend (React):

```bash
docker exec -it infra-frontend-1 npm install <package-name>
```

#### Backend (Symfony):

```bash
docker exec -it infra-backend-1 composer require <package-name>
```

## 🔄 Reconstruire les conteneurs après des modifications

Si vous modifiez un Dockerfile ou docker-compose.yml:

```bash
docker-compose -f infra/docker-compose.yml down
docker-compose -f infra/docker-compose.yml up --build -d
```

### Cas spécifiques de reconstruction

#### Après modification des dépendances package.json:

```bash
docker-compose -f infra/docker-compose.yml restart frontend
```

#### Après modification des dépendances composer.json:

```bash
docker-compose -f infra/docker-compose.yml restart backend
```

## 📊 Surveiller les ressources des conteneurs

```bash
docker stats
```

Cela affiche l'utilisation CPU, mémoire et réseau de vos conteneurs.

## 🐞 Résolution des problèmes courants

### Le conteneur s'arrête immédiatement après le démarrage

Vérifiez les logs pour comprendre pourquoi:

```bash
docker-compose -f infra/docker-compose.yml logs <nom-service>
```

### Problèmes de permissions

Si vous avez des erreurs de permission dans les volumes montés:

```bash
# Pour corriger les permissions sur les fichiers backend
docker exec -it infra-backend-1 chown -R www-data:www-data /var/www/html
```

### Problèmes de port déjà utilisé

Si vous avez une erreur de type "port is already allocated":

1. Vérifiez si un autre processus utilise ce port:
   ```bash
   # Sur Linux/Mac:
   lsof -i :<port>
   
   # Sur Windows:
   netstat -ano | findstr :<port>
   ```

2. Arrêtez ce processus ou modifiez le port dans docker-compose.yml.

### Container qui ne se connecte pas à la base de données

```bash
# Vérifiez que le conteneur MySQL est bien démarré
docker-compose -f infra/docker-compose.yml ps database

# Regardez les logs du conteneur MySQL
docker-compose -f infra/docker-compose.yml logs database
```

## 🧹 Nettoyage

### Supprimer les conteneurs arrêtés

```bash
docker container prune
```

### Supprimer les images non utilisées

```bash
docker image prune
```

### Tout nettoyer (attention: cela supprime toutes les données!)

```bash
docker system prune -a --volumes
```

## 🔀 Docker dans le workflow quotidien

### Démarrer sa journée de travail

```bash
# Mettre à jour son code
git pull

# Démarrer les conteneurs
docker-compose -f infra/docker-compose.yml up -d
```

### Finir sa journée de travail

```bash
# Arrêter les conteneurs (optionnel)
docker-compose -f infra/docker-compose.yml down
```

### Après un pull avec des changements de dépendances

```bash
# Redémarrer les conteneurs pour installer les nouvelles dépendances
docker-compose -f infra/docker-compose.yml down
docker-compose -f infra/docker-compose.yml up -d
``` 