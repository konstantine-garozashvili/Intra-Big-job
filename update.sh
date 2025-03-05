#!/bin/bash

echo "🔄 Mise à jour du projet Intra-BigProject..."

# Vérifier si les conteneurs sont en cours d'exécution
if ! docker-compose -f infra/docker-compose.yml ps | grep -q "Up"; then
    echo "⚠️ Les conteneurs Docker ne semblent pas en cours d'exécution."
    echo "Démarrage des conteneurs..."
    docker-compose -f infra/docker-compose.yml up -d
fi

echo "📝 Exécution des migrations de base de données..."
docker-compose -f infra/docker-compose.yml exec backend php bin/console doctrine:migrations:migrate --no-interaction

echo "🌱 Chargement des fixtures..."
docker-compose -f infra/docker-compose.yml exec backend php bin/console doctrine:fixtures:load --no-interaction

echo "✅ Mise à jour terminée !"
echo "La nouvelle structure de base de données avec City, PostalCode et Address est maintenant en place." 