
## Commandes essentielles

### Docker
```bash
# Redémarrer le serveur
docker compose -f infra/docker-compose.yml restart backend

# Accéder au conteneur
docker exec -it infra-backend-1 bash

# Vider le cache
docker exec -it infra-backend-1 php bin/console cache:clear

# Générer les clés JWT
docker exec -it infra-backend-1 php bin/console lexik:jwt:generate-keypair

# Exécuter les tests
docker exec -it infra-backend-1 php bin/phpunit

# Installer un package
docker exec -it infra-backend-1 composer require <package-name>
```


# Créer un contrôleur
```bash
php bin/console make:controller NomDuController
```

# Créer une entité
```bash
php bin/console make:entity NomDeLaTable
```
