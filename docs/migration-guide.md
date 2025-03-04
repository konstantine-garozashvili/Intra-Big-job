# Guide de migration rapide

## Après un git pull, exécutez ces commandes dans l'ordre:

```bash
# 1. Démarrer les conteneurs Docker
docker-compose -f infra/docker-compose.yml up -d

# 2. Configurer la base de données (structure complète)
chmod +x setup-database.sh
./setup-database.sh

# 3. Vérifier que tout fonctionne
docker-compose -f infra/docker-compose.yml exec database mysql -uroot -proot bigproject -e "SHOW TABLES;"
```

## Alternative: Mise à jour des rôles uniquement

```bash
# Si vous voulez uniquement mettre à jour les rôles
chmod +x update-roles.sh
./update-roles.sh
```

## En cas d'erreur

```bash
# Réinitialiser complètement le schéma
docker-compose -f infra/docker-compose.yml exec backend php bin/console doctrine:schema:drop --force
docker-compose -f infra/docker-compose.yml exec backend php bin/console doctrine:migrations:migrate --no-interaction
```

