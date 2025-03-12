# Guide de la Base de Données

Ce guide explique en détail comment travailler avec la base de données MySQL du projet BigProject.

## 📖 Vue d'ensemble

Le projet utilise **MySQL 8.0** comme système de gestion de base de données, avec **Doctrine ORM** comme couche d'abstraction dans Symfony. Cette combinaison vous permet de travailler avec des objets PHP plutôt qu'avec des requêtes SQL directes.

## 🏗️ Structure du projet

- **Entités (tables)**: définies dans `backend/src/Entity/`
- **Migrations**: stockées dans `backend/migrations/`
- **Configuration**:
  - `infra/docker-compose.yml` (configuration Docker)
  - `backend/.env` (paramètres de connexion)
  - `backend/config/packages/doctrine.yaml` (configuration Doctrine)

## 🚀 Démarrage rapide

### Accéder à la base de données

Vous pouvez accéder à la base de données de plusieurs façons:

1. **PHPMyAdmin**:
   - URL: [http://localhost:8080](http://localhost:8080)
   - Utilisateur: `root`
   - Mot de passe: `root`

2. **En ligne de commande**:
   ```bash
   docker exec -it infra-database-1 mysql -uroot -proot bigproject
   ```

3. **DBeaver ou autre client SQL**:
   - Hôte: `localhost`
   - Port: `3306`
   - Utilisateur: `root`
   - Mot de passe: `root`
   - Base de données: `bigproject`

## 🔄 Workflow de base de données





## 🔗 Relations entre entités

Doctrine permet de définir facilement des relations entre entités:




## 🐞 Résolution des problèmes courants

### La base de données n'est pas à jour

Si vous avez des erreurs liées à la structure de la base de données:



```bash
# Supprimer le schéma et le recréer
docker exec -it infra-backend-1 php bin/console doctrine:schema:drop --force
docker exec -it infra-backend-1 php bin/console doctrine:migrations:migrate --no-interaction
```


