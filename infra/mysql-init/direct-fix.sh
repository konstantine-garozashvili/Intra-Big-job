#!/bin/bash
# Ce script sera copié dans le container MySQL et exécuté manuellement si nécessaire

echo "Exécution de corrections manuelles pour MySQL..."

# Attendre que MySQL soit prêt (max 30 secondes)
max_attempts=30
counter=0
until mysql -uroot -proot -e "SELECT 1" &>/dev/null
do
    sleep 1
    counter=$((counter + 1))
    if [ $counter -ge $max_attempts ]; then
        echo "Erreur: MySQL n'est pas disponible après $max_attempts secondes"
        exit 1
    fi
    echo "Attente que MySQL soit prêt... ($counter/$max_attempts)"
done

# Exécuter les commandes SQL pour corriger les permissions
mysql -uroot -proot << 'EOSQL'
-- Permettre à tous les utilisateurs de se connecter depuis n'importe quelle adresse IP
CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED BY 'root';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;
ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'root';

CREATE USER IF NOT EXISTS 'root'@'172.18.0.%' IDENTIFIED BY 'root';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'172.18.0.%' WITH GRANT OPTION;

CREATE USER IF NOT EXISTS 'user'@'%' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON *.* TO 'user'@'%';
ALTER USER 'user'@'%' IDENTIFIED WITH mysql_native_password BY 'password';

CREATE USER IF NOT EXISTS 'user'@'172.18.0.%' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON *.* TO 'user'@'172.18.0.%';

-- S'assurer que les privilèges sont appliqués
FLUSH PRIVILEGES;

-- Vérifier les utilisateurs créés
SELECT user, host FROM mysql.user;
EOSQL

echo "Correction terminée!"
