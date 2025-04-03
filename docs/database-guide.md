### 1. Générer une migration

```bash
# Dans le conteneur backend
docker exec -it infra-backend-1 php bin/console doctrine:migrations:diff
```

### 2. Exécuter la migration

```bash
docker exec -it infra-backend-1 php bin/console doctrine:migrations:migrate
```

### Pour charger toutes les fixtures :

```bash
docker exec -it infra-backend-1 php bin/console doctrine:fixtures:load --no-interaction
```


# Supprimer la base de données

```bash
docker exec -it infra-backend-1 php bin/console doctrine:database:drop --force
```
php bin/console doctrine:database:drop --force
