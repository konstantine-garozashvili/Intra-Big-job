# Projet Intra-BigProject

## 🚀 Guide de démarrage rapide

### Préparation initiale

Avant de commencer, assurez-vous d'avoir un environnement propre (Attention cette action supprimera les volumes de vos anciens projets) :

```bash
# Nettoyer le cache Docker et les volumes
docker-compose down -v && docker system prune -a --volumes
```

2. **Lancer les conteneurs Docker**

```bash
# Reconstruire les images Docker
docker-compose build --no-cache

# Démarrer les conteneurs
docker-compose up -d

## 📝 Commandes fréquentes

### Gestion des conteneurs Docker

```bash

# Arrêter les conteneurs
docker-compose -f infra/docker-compose.yml down
```

### Commandes Backend (Symfony)

```bash
# Se connecter au conteneur backend
docker exec -it infra-backend-1 bash
```

### Commandes Frontend (React)

```bash
# Se connecter au conteneur frontend
docker exec -it infra-frontend-1 sh

# Ajouter un composant Shadcn UI
npx shadcn@latest add [nom-du-composant] 

# Puis choisir :
 "legacy-peer-deps"
```