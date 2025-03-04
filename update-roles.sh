#!/bin/bash

echo "🔄 Mise à jour des rôles dans la base de données..."

# Vérifier si les conteneurs sont en cours d'exécution
if ! docker-compose -f infra/docker-compose.yml ps | grep -q "Up"; then
    echo "⚠️ Les conteneurs Docker ne semblent pas en cours d'exécution."
    echo "Démarrage des conteneurs..."
    docker-compose -f infra/docker-compose.yml up -d
fi

echo "🧹 Nettoyage des anciens rôles..."
docker-compose -f infra/docker-compose.yml exec database mysql -uroot -proot bigproject -e "SET FOREIGN_KEY_CHECKS=0; TRUNCATE TABLE role; SET FOREIGN_KEY_CHECKS=1;"

echo "🌱 Chargement des nouveaux rôles..."
docker-compose -f infra/docker-compose.yml exec backend php bin/console doctrine:fixtures:load --group=role --append

echo "✅ Mise à jour des rôles terminée !"
echo "Les nouveaux rôles (ADMIN, MODERATOR, HR, TEACHER, STUDENT, GUEST) sont maintenant disponibles." 