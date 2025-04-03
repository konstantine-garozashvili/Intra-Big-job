# Guide Docker - BigProject

## Commandes essentielles

### Gestion des conteneurs
```bash
# Démarrer les conteneurs
docker-compose -f infra/docker-compose.yml up -d

# Démarrer avec reconstruction
docker-compose -f infra/docker-compose.yml up --build -d

# Vérifier l'état
docker-compose -f infra/docker-compose.yml ps

# Arrêter les conteneurs
docker-compose -f infra/docker-compose.yml down

# Redémarrer les conteneurs
docker-compose -f infra/docker-compose.yml restart
```