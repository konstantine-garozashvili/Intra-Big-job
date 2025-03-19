#!/bin/bash

echo "🔄 Configuration de la base de données avec la structure complète..."

# Vérifier si les conteneurs sont en cours d'exécution
if ! docker-compose -f infra/docker-compose.yml ps | grep -q "Up"; then
    echo "⚠️ Les conteneurs Docker ne semblent pas en cours d'exécution."
    echo "Démarrage des conteneurs..."
    docker-compose -f infra/docker-compose.yml up -d
fi

# Vérifier si la base de données existe déjà
DB_EXISTS=$(docker-compose -f infra/docker-compose.yml exec -T database mysql -uroot -proot -e "SHOW DATABASES LIKE 'bigproject';" | grep -c "bigproject")

if [ "$DB_EXISTS" -gt 0 ]; then
    echo "📊 Base de données existante détectée."
    
    # Demander confirmation avant de continuer
    read -p "❓ Voulez-vous sauvegarder les données existantes avant de réinitialiser la base de données? (o/n): " BACKUP
    
    if [[ "$BACKUP" == "o" || "$BACKUP" == "O" || "$BACKUP" == "oui" ]]; then
        echo "💾 Sauvegarde des données existantes..."
        BACKUP_DATE=$(date +"%Y%m%d_%H%M%S")
        BACKUP_DIR="database_backups"
        mkdir -p $BACKUP_DIR
        
        docker-compose -f infra/docker-compose.yml exec -T database mysqldump -uroot -proot bigproject > "$BACKUP_DIR/bigproject_$BACKUP_DATE.sql"
        echo "✅ Sauvegarde créée: $BACKUP_DIR/bigproject_$BACKUP_DATE.sql"
    fi
    
    read -p "⚠️ Cette opération va réinitialiser TOUTE la base de données. Continuer? (o/n): " CONFIRM
    
    if [[ "$CONFIRM" != "o" && "$CONFIRM" != "O" && "$CONFIRM" != "oui" ]]; then
        echo "❌ Opération annulée."
        exit 1
    fi
fi

echo "🧹 Nettoyage de la base de données existante..."
docker-compose -f infra/docker-compose.yml exec database mysql -uroot -proot -e "DROP DATABASE IF EXISTS bigproject; CREATE DATABASE bigproject CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

echo "🔧 Réinitialisation de la table de migrations..."
docker-compose -f infra/docker-compose.yml exec database mysql -uroot -proot bigproject -e "DROP TABLE IF EXISTS doctrine_migration_versions;"

echo "📦 Application de la migration complète..."
docker-compose -f infra/docker-compose.yml exec backend php bin/console doctrine:migrations:migrate --no-interaction

echo "🌱 Chargement des fixtures..."
docker-compose -f infra/docker-compose.yml exec backend php bin/console doctrine:fixtures:load --no-interaction

echo "✅ Configuration de la base de données terminée !"
echo "La structure complète de la base de données a été créée et les données initiales ont été chargées." 