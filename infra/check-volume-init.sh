#!/bin/bash
# Script pour vérifier le montage et l'exécution des scripts init.sql

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}🔍 Vérification du montage et de l'exécution des scripts d'initialisation MySQL...${NC}\n"

MYSQL_CONTAINER="infra-database-1"

# Vérifier si le container est en cours d'exécution
echo -e "${YELLOW}1. Vérification du container MySQL...${NC}"
if ! docker ps --filter "name=$MYSQL_CONTAINER" --format "{{.Names}}" | grep -q "$MYSQL_CONTAINER"; then
  echo -e "${RED}❌ Le container MySQL '$MYSQL_CONTAINER' n'est pas en cours d'exécution.${NC}"
  exit 1
else
  echo -e "${GREEN}✅ Container MySQL en cours d'exécution.${NC}\n"
fi

# Vérifier si le répertoire d'initialisation est monté dans le container
echo -e "${YELLOW}2. Vérification du montage du répertoire d'initialisation...${NC}"
MOUNT_CHECK=$(docker exec $MYSQL_CONTAINER ls -la /docker-entrypoint-initdb.d/ 2>&1)
if echo "$MOUNT_CHECK" | grep -q "No such file"; then
  echo -e "${RED}❌ Le répertoire /docker-entrypoint-initdb.d/ n'est pas monté dans le container.${NC}"
else
  echo -e "${GREEN}✅ Le répertoire /docker-entrypoint-initdb.d/ est monté dans le container:${NC}"
  echo -e "${BLUE}$MOUNT_CHECK${NC}\n"
fi

# Vérifier le contenu du fichier init.sql dans le container
echo -e "${YELLOW}3. Vérification du contenu du fichier init.sql...${NC}"
SQL_CHECK=$(docker exec $MYSQL_CONTAINER cat /docker-entrypoint-initdb.d/init.sql 2>&1)
if echo "$SQL_CHECK" | grep -q "No such file"; then
  echo -e "${RED}❌ Le fichier init.sql n'existe pas dans le container.${NC}"
else
  echo -e "${GREEN}✅ Contenu du fichier init.sql:${NC}"
  echo -e "${BLUE}$SQL_CHECK${NC}\n"
fi

# Vérifier l'exécution du script d'initialisation dans les logs
echo -e "${YELLOW}4. Recherche de traces d'exécution du script d'initialisation dans les logs...${NC}"
INIT_LOGS=$(docker logs $MYSQL_CONTAINER 2>&1 | grep -E "Initializing database|init.sql|docker-entrypoint-initdb.d")
if [ -z "$INIT_LOGS" ]; then
  echo -e "${RED}❌ Aucune trace d'exécution du script d'initialisation trouvée dans les logs.${NC}\n"
  
  # Afficher les 20 dernières lignes de logs du container
  echo -e "${YELLOW}Dernières lignes de logs du container MySQL:${NC}"
  RECENT_LOGS=$(docker logs $MYSQL_CONTAINER --tail 20 2>&1)
  echo -e "${BLUE}$RECENT_LOGS${NC}\n"
else
  echo -e "${GREEN}✅ Traces d'exécution du script d'initialisation:${NC}"
  echo -e "${BLUE}$INIT_LOGS${NC}\n"
fi

# Vérifier si les utilisateurs créés par le script existent
echo -e "${YELLOW}5. Vérification de l'existence des utilisateurs créés par le script...${NC}"
USER_CHECK=$(docker exec $MYSQL_CONTAINER mysql -uroot -proot -e "SELECT user, host FROM mysql.user WHERE user='user' OR user='root';" 2>&1)
if echo "$USER_CHECK" | grep -q "ERROR"; then
  echo -e "${RED}❌ Erreur lors de la vérification des utilisateurs:${NC}"
  echo -e "${BLUE}$USER_CHECK${NC}\n"
else
  echo -e "${GREEN}✅ Utilisateurs existants:${NC}"
  echo -e "${BLUE}$USER_CHECK${NC}\n"
fi

# Vérifier l'emplacement où Docker monte les volumes
echo -e "${YELLOW}6. Vérification de l'emplacement des volumes Docker...${NC}"
VOLUME_INFO=$(docker volume inspect infra_database_data 2>&1)
echo -e "${BLUE}$VOLUME_INFO${NC}\n"

# Vérifier si le script peut être créé et exécuté directement dans le container
echo -e "${YELLOW}7. Test de création et d'exécution d'un script temporaire...${NC}"
TEST_SCRIPT=$(docker exec $MYSQL_CONTAINER bash -c "cat > /tmp/test.sql << 'EOF'
SHOW DATABASES;
SELECT user, host FROM mysql.user;
SHOW GRANTS FOR 'user'@'%';
EOF

mysql -uroot -proot < /tmp/test.sql 2>&1")

if echo "$TEST_SCRIPT" | grep -q "ERROR"; then
  echo -e "${RED}❌ Erreur lors de l'exécution du script temporaire:${NC}"
  echo -e "${BLUE}$TEST_SCRIPT${NC}\n"
else
  echo -e "${GREEN}✅ Résultat de l'exécution du script temporaire:${NC}"
  echo -e "${BLUE}$TEST_SCRIPT${NC}\n"
fi

echo -e "${GREEN}✅ Vérification terminée.${NC}"
echo -e "${CYAN}ℹ️ Si les scripts d'initialisation ne sont pas exécutés, essayez de:${NC}"
echo -e "${CYAN}  - Supprimer complètement le volume MySQL: docker volume rm infra_database_data${NC}"
echo -e "${CYAN}  - Vérifier les permissions sur le répertoire C:/DockerVolumes/mysql-data${NC}"
echo -e "${CYAN}  - Redémarrer complètement les containers: docker-compose down && docker-compose up -d${NC}" 