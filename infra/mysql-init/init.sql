-- Script de correction des utilisateurs MySQL pour Windows 10
-- Ce script s'assure que tous les utilisateurs nécessaires sont créés avec les bonnes permissions

-- Permettre à l'utilisateur root de se connecter depuis n'importe où
CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED BY 'root';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;
ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'root';

-- Permettre à l'utilisateur standard de se connecter depuis n'importe où
CREATE USER IF NOT EXISTS 'user'@'%' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON *.* TO 'user'@'%';
ALTER USER 'user'@'%' IDENTIFIED WITH mysql_native_password BY 'password';

-- Créer des utilisateurs spécifiques pour le réseau Docker
CREATE USER IF NOT EXISTS 'root'@'172.%' IDENTIFIED BY 'root';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'172.%' WITH GRANT OPTION;

CREATE USER IF NOT EXISTS 'user'@'172.%' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON *.* TO 'user'@'172.%';

-- S'assurer que les privilèges sont appliqués
FLUSH PRIVILEGES;

-- Vérifier les utilisateurs créés (pour le debug)
SELECT user, host FROM mysql.user;
