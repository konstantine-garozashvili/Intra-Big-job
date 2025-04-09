#!/bin/bash
# Script pour corriger le problème de connexion MySQL dans Docker sur Windows 10

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${CYAN}🔧 Correction du problème de connexion MySQL sur Windows 10...${NC}\n"

# Vérifier si Docker est en cours d'exécution
if ! docker info >/dev/null 2>&1; then
  echo -e "${RED}❌ Docker n'est pas en cours d'exécution. Veuillez démarrer Docker.${NC}"
  exit 1
fi

# Arrêter les containers pour éviter tout conflit
echo -e "${YELLOW}📦 Arrêt des containers en cours...${NC}"
docker-compose down

# Supprimer le volume MySQL pour forcer sa recréation
echo -e "${YELLOW}🗑️ Suppression du volume MySQL...${NC}"
docker volume rm infra_database_data 2>/dev/null || true

# Recréer le répertoire de montage avec les bonnes permissions
MYSQL_VOLUME_PATH="C:/DockerVolumes/mysql-data"
echo -e "${YELLOW}📁 Recréation du répertoire pour MySQL: ${BLUE}$MYSQL_VOLUME_PATH${NC}"
rm -rf "$MYSQL_VOLUME_PATH" 2>/dev/null || true
mkdir -p "$MYSQL_VOLUME_PATH"

# Définir les permissions du dossier
echo -e "${YELLOW}🔒 Ajustement des permissions...${NC}"
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    echo -e "${YELLOW}🔧 Système Windows détecté, utilisation de icacls...${NC}"
    WINDOWS_PATH=$(echo "$MYSQL_VOLUME_PATH" | sed 's|/|\\|g')
    icacls "$WINDOWS_PATH" /grant:r "Everyone:(OI)(CI)F" /T
else
    echo -e "${YELLOW}🔧 Système Unix détecté, utilisation de chmod...${NC}"
    chmod -R 777 "$MYSQL_VOLUME_PATH"
fi

# Créer un script SQL plus robuste pour corriger les permissions
echo -e "${YELLOW}📝 Création d'un script MySQL amélioré...${NC}"
mkdir -p infra/mysql-init
cat > infra/mysql-init/init.sql << 'EOF'
-- Permettre à tous les utilisateurs de se connecter depuis n'importe quelle adresse IP
-- Créer/mettre à jour l'utilisateur root pour accepter les connexions de n'importe où
CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED BY 'root';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;
ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'root';

-- Créer/mettre à jour l'utilisateur standard
CREATE USER IF NOT EXISTS 'user'@'%' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON *.* TO 'user'@'%';
ALTER USER 'user'@'%' IDENTIFIED WITH mysql_native_password BY 'password';

-- S'assurer que les privilèges sont appliqués
FLUSH PRIVILEGES;

-- Vérifier les utilisateurs créés (pour le debug)
SELECT user, host FROM mysql.user;
EOF

# Créer un script pour exécuter directement dans le container
echo -e "${YELLOW}📝 Création d'un script pour exécution directe dans le container...${NC}"
cat > infra/mysql-init/direct-fix.sh << 'EOF'
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
EOF

chmod +x infra/mysql-init/direct-fix.sh

# Modifier le docker-compose.yml pour ajouter une instruction spécifique pour Windows 10
echo -e "${YELLOW}📝 Amélioration de docker-compose.yml...${NC}"

# Créer un script pour rendre les scripts d'initialisation exécutables
cat > infra/mysql-init/make-executable.sh << 'EOF'
#!/bin/bash
echo "Définition des permissions d'exécution sur les scripts..."
chmod +x /docker-entrypoint-initdb.d/*.sh
ls -la /docker-entrypoint-initdb.d/
EOF

chmod +x infra/mysql-init/make-executable.sh

# Redémarrer les containers
echo -e "${YELLOW}🚀 Redémarrage des containers...${NC}"
docker-compose up -d

# Attendre que le container MySQL soit prêt
echo -e "${YELLOW}⏳ Attente du démarrage de MySQL...${NC}"
sleep 20

# Exécuter le script de correction directement dans le container
echo -e "${YELLOW}🔧 Exécution du script de correction directement dans le container...${NC}"
docker exec infra-database-1 bash -c "chmod +x /docker-entrypoint-initdb.d/direct-fix.sh && /docker-entrypoint-initdb.d/direct-fix.sh"

echo -e "\n${GREEN}✅ Correction terminée!${NC}"
echo -e "${CYAN}ℹ️ Si le problème persiste, redémarrez complètement Docker Desktop.${NC}"
echo -e "${CYAN}ℹ️ Vous pouvez également essayer: docker exec infra-database-1 bash -c '/docker-entrypoint-initdb.d/direct-fix.sh'${NC}" 