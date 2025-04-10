# Guide de déploiement sur OVH VPS (Symfony + React + Docker)

Ce guide détaille toutes les étapes nécessaires pour déployer votre application Symfony/React avec Docker sur un VPS OVH.

## 1. Commande et configuration initiale du VPS

### 1.1 Commander un VPS OVH
- **Configuration minimale recommandée**:
  - RAM: 2GB minimum
  - CPU: 1 vCore minimum
  - Stockage: 20GB SSD minimum
  - OS: Ubuntu 22.04 LTS

### 1.2 Connexion SSH au VPS
```bash
ssh root@votre-ip-vps
```

### 1.3 Mise à jour du système
```bash
apt update && apt upgrade -y
```

### 1.4 Installation de Docker et Docker Compose
```bash
apt install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
apt update
apt install -y docker-ce docker-compose
```

### 1.5 Créer un utilisateur non-root (sécurité)
```bash
adduser deploy
usermod -aG docker deploy
usermod -aG sudo deploy
```

## 2. Configuration du domaine et DNS

### 2.1 Configuration du nom de domaine
- Pointer l'enregistrement A vers l'IP de votre VPS
- Ajouter les sous-domaines nécessaires (www, api, etc.)

### 2.2 Installation de Nginx comme reverse proxy
```bash
apt install -y nginx
```

## 3. Préparation du projet pour la production

### 3.1 Se connecter avec l'utilisateur créé
```bash
su - deploy
```

### 3.2 Créer et accéder au répertoire du projet
```bash
mkdir -p /var/www/bigproject
cd /var/www/bigproject
```

### 3.3 Cloner le projet depuis Git
```bash
git clone https://url-de-votre-repo.git .
```

### 3.4 Créer le fichier docker-compose.prod.yml
```bash
nano docker-compose.prod.yml
```

Contenu du fichier:
```yaml
version: '3'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    restart: always
    networks:
      - app-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    volumes:
      - backend_var:/var/www/symfony/var
      - backend_vendor:/var/www/symfony/vendor
      - jwt_keys:/var/www/symfony/config/jwt
    restart: always
    environment:
      APP_ENV: prod
      APP_SECRET: votre_secret_symfony
      DATABASE_URL: mysql://user:password@database:3306/bigproject
      REDIS_URL: redis://redis:6379
    networks:
      - app-network
    depends_on:
      - database
      - redis

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./frontend/dist:/var/www/frontend
      - ./backend:/var/www/symfony
      - ./infrastructure/nginx/prod.conf:/etc/nginx/conf.d/default.conf
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    depends_on:
      - frontend
      - backend
    networks:
      - app-network
    restart: always

  database:
    image: mysql:8.0
    command: --default-authentication-plugin=mysql_native_password
    environment:
      MYSQL_ROOT_PASSWORD: root_password_securisé
      MYSQL_DATABASE: bigproject
      MYSQL_USER: user
      MYSQL_PASSWORD: password_securisé
    volumes:
      - database_data:/var/lib/mysql
    networks:
      - app-network
    restart: always

  redis:
    image: redis:alpine
    volumes:
      - redis_data:/data
    networks:
      - app-network
    command: redis-server --appendonly yes
    restart: always

networks:
  app-network:
    driver: bridge

volumes:
  backend_var:
  backend_vendor:
  jwt_keys:
  database_data:
  redis_data:
```

### 3.5 Créer Dockerfile.prod pour le frontend
```bash
nano frontend/Dockerfile.prod
```

Contenu du fichier:
```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 3.6 Créer la configuration Nginx pour la production
```bash
mkdir -p infrastructure/nginx
nano infrastructure/nginx/prod.conf
```

Contenu du fichier:
```nginx
upstream backend {
    server backend:9000;
}

server {
    listen 80;
    server_name votre-domaine.com www.votre-domaine.com;

    # Redirection vers HTTPS (à activer après configuration SSL)
    # return 301 https://$host$request_uri;

    location / {
        root /var/www/frontend;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        rewrite ^/api(/.*)$ $1 break;
        fastcgi_pass backend;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME /var/www/symfony/public/index.php;
        fastcgi_param DOCUMENT_ROOT /var/www/symfony/public;
    }

    # Pour Let's Encrypt
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
}

# Configuration HTTPS (à décommenter après obtention des certificats)
# server {
#     listen 443 ssl;
#     server_name votre-domaine.com www.votre-domaine.com;
#
#     ssl_certificate /etc/letsencrypt/live/votre-domaine.com/fullchain.pem;
#     ssl_certificate_key /etc/letsencrypt/live/votre-domaine.com/privkey.pem;
#
#     location / {
#         root /var/www/frontend;
#         try_files $uri $uri/ /index.html;
#     }
#
#     location /api {
#         rewrite ^/api(/.*)$ $1 break;
#         fastcgi_pass backend;
#         include fastcgi_params;
#         fastcgi_param SCRIPT_FILENAME /var/www/symfony/public/index.php;
#         fastcgi_param DOCUMENT_ROOT /var/www/symfony/public;
#     }
# }
```

### 3.7 Créer un fichier .env.prod pour le backend
```bash
cp backend/.env backend/.env.prod
nano backend/.env.prod
```

Contenu à modifier:
```
APP_ENV=prod
APP_SECRET=votre_secret_symfony
DATABASE_URL=mysql://user:password@database:3306/bigproject
REDIS_URL=redis://redis:6379
CORS_ALLOW_ORIGIN=^https?://(localhost|127\.0\.0\.1|votre-domaine\.com)(:[0-9]+)?$
```

## 4. Déploiement du projet

### 4.1 Build et démarrage des conteneurs
```bash
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

### 4.2 Initialisation de la base de données Symfony
```bash
docker-compose -f docker-compose.prod.yml exec backend bash -c "
php bin/console doctrine:database:create --if-not-exists --no-interaction &&
php bin/console doctrine:migrations:migrate --no-interaction &&
php bin/console cache:clear"
```

### 4.3 Configuration de Let's Encrypt pour HTTPS
```bash
apt install -y certbot
mkdir -p certbot/conf certbot/www

# Obtenir certificat
certbot certonly --webroot -w certbot/www -d votre-domaine.com -d www.votre-domaine.com

# Activer HTTPS dans nginx/prod.conf en décommentant la section appropriée
```

### 4.4 Redémarrer Nginx après activation HTTPS
```bash
docker-compose -f docker-compose.prod.yml restart nginx
```

### 4.5 Configuration des sauvegardes automatiques
```bash
mkdir -p /var/backups/bigproject

# Créer script de backup
nano /usr/local/bin/backup-bigproject.sh
```

Contenu du script:
```bash
#!/bin/bash
DATE=$(date +%Y-%m-%d_%H-%M)
BACKUP_DIR=/var/backups/bigproject

# Backup base de données
docker-compose -f /var/www/bigproject/docker-compose.prod.yml exec -T database \
  mysqldump -u root -proot_password_securisé bigproject > $BACKUP_DIR/db_$DATE.sql

# Compresser
gzip $BACKUP_DIR/db_$DATE.sql

# Backup fichiers uploads
tar -zcf $BACKUP_DIR/files_$DATE.tar.gz /var/www/bigproject/backend/public/uploads

# Supprimer backups de plus de 7 jours
find $BACKUP_DIR -name "*.gz" -type f -mtime +7 -delete
```

Rendre le script exécutable et ajouter au crontab:
```bash
chmod +x /usr/local/bin/backup-bigproject.sh
crontab -e
# Ajouter la ligne:
0 2 * * * /usr/local/bin/backup-bigproject.sh
```

## 5. Configurer le déploiement continu (optionnel)

### 5.1 Créer un script de déploiement automatique
```bash
nano /var/www/bigproject/deploy.sh
```

Contenu du script:
```bash
#!/bin/bash
cd /var/www/bigproject

# Récupérer les changements
git pull

# Reconstruire et redémarrer les conteneurs
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Mettre à jour la base de données
docker-compose -f docker-compose.prod.yml exec -T backend bash -c "
php bin/console doctrine:migrations:migrate --no-interaction &&
php bin/console cache:clear"

# Vider le cache Redis
docker-compose -f docker-compose.prod.yml exec -T redis redis-cli FLUSHALL

echo "Déploiement terminé à $(date)"
```

Rendre le script exécutable:
```bash
chmod +x /var/www/bigproject/deploy.sh
```

### 5.2 Configurer webhook GitHub/GitLab
- Installer webhook listener ou configurer avec GitHub Actions/GitLab CI

## 6. Test et maintenance

### 6.1 Vérifier que le site est accessible
- Frontend: https://votre-domaine.com
- API: https://votre-domaine.com/api

### 6.2 Surveiller les logs
```bash
docker-compose -f docker-compose.prod.yml logs -f
```

### 6.3 Configurer monitoring de base
```bash
apt install -y htop iotop
```

## 7. Conseils et astuces

### 7.1 Commandes utiles
```bash
# Redémarrer un service spécifique
docker-compose -f docker-compose.prod.yml restart [service]

# Vérifier l'état des conteneurs
docker-compose -f docker-compose.prod.yml ps

# Voir les logs d'un service spécifique
docker-compose -f docker-compose.prod.yml logs -f [service]

# Accéder au shell d'un conteneur
docker-compose -f docker-compose.prod.yml exec [service] bash
```

### 7.2 Résolution de problèmes courants
- **Erreur 502 Bad Gateway** : Vérifier que le backend est en cours d'exécution
- **Erreur 404 pour les routes React** : Vérifier la configuration Nginx pour le frontend
- **Problèmes de base de données** : Vérifier les logs du service database

### 7.3 Sécurité
- Activer un pare-feu avec UFW
- Configurer fail2ban pour protéger SSH
- Envisager l'utilisation de Docker secrets pour les informations sensibles 