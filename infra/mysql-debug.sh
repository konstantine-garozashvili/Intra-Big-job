#!/bin/bash
# Script de diagnostic MySQL pour identifier les problèmes de connexion

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}🔍 Diagnostic MySQL pour Docker sur Windows 10...${NC}\n"

MYSQL_CONTAINER="infra-database-1"

# Vérifier si le container est en cours d'exécution
echo -e "${YELLOW}1. Vérification de l'état du container MySQL...${NC}"
if ! docker ps --filter "name=$MYSQL_CONTAINER" --format "{{.Names}}" | grep -q "$MYSQL_CONTAINER"; then
  echo -e "${RED}❌ Le container MySQL '$MYSQL_CONTAINER' n'est pas en cours d'exécution.${NC}"
  exit 1
else
  echo -e "${GREEN}✅ Container MySQL en cours d'exécution.${NC}\n"
fi

# Récupérer l'adresse IP du container MySQL
MYSQL_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $MYSQL_CONTAINER)
echo -e "${YELLOW}2. Adresse IP du container MySQL: ${BLUE}$MYSQL_IP${NC}\n"

# Récupérer l'adresse IP du container backend
BACKEND_CONTAINER=$(docker ps --filter "name=infra-backend" --format "{{.Names}}" | head -1)
if [ -z "$BACKEND_CONTAINER" ]; then
  echo -e "${RED}❌ Container backend non trouvé.${NC}"
else
  BACKEND_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $BACKEND_CONTAINER)
  echo -e "${YELLOW}3. Adresse IP du container backend: ${BLUE}$BACKEND_IP${NC}\n"
fi

# Récupérer la configuration du réseau Docker
echo -e "${YELLOW}4. Configuration du réseau Docker:${NC}"
NETWORK_NAME="infra_app-network"
docker network inspect $NETWORK_NAME | grep -E "Name|Driver|IPAM|Gateway|Subnet"
echo ""

# Vérifier les utilisateurs dans MySQL
echo -e "${YELLOW}5. Vérification des utilisateurs MySQL et leurs privilèges...${NC}"
USER_CHECK=$(docker exec $MYSQL_CONTAINER mysql -uroot -proot -e "SELECT user, host FROM mysql.user;")
echo -e "${BLUE}$USER_CHECK${NC}\n"

# Vérifier les privilèges des utilisateurs
echo -e "${YELLOW}6. Vérification des privilèges des utilisateurs:${NC}"
PRIV_CHECK=$(docker exec $MYSQL_CONTAINER mysql -uroot -proot -e "SHOW GRANTS FOR 'user'@'%';")
echo -e "${BLUE}$PRIV_CHECK${NC}\n"

# Tester la connexion depuis le container backend vers MySQL
echo -e "${YELLOW}7. Test de connexion depuis le backend vers MySQL...${NC}"
if [ -n "$BACKEND_CONTAINER" ]; then
  CONNECTION_TEST=$(docker exec $BACKEND_CONTAINER bash -c "apt-get update > /dev/null && apt-get install -y mysql-client > /dev/null && mysql -h database -u user -ppassword -e 'SHOW DATABASES;' 2>&1")
  if echo "$CONNECTION_TEST" | grep -q "ERROR"; then
    echo -e "${RED}❌ Échec de la connexion depuis le backend:${NC}"
    echo -e "${BLUE}$CONNECTION_TEST${NC}\n"
  else
    echo -e "${GREEN}✅ Connexion réussie depuis le backend.${NC}\n"
    echo -e "${BLUE}$CONNECTION_TEST${NC}\n"
  fi
else
  echo -e "${RED}❌ Container backend non disponible pour le test.${NC}\n"
fi

# Vérifier les logs détaillés de MySQL
echo -e "${YELLOW}8. Logs détaillés de MySQL (10 dernières erreurs):${NC}"
ERROR_LOGS=$(docker exec $MYSQL_CONTAINER bash -c "grep -i error /var/log/mysql/error.log 2>/dev/null || echo 'Logs non disponibles'")
if [ "$ERROR_LOGS" != "Logs non disponibles" ]; then
  echo -e "${BLUE}$ERROR_LOGS${NC}\n"
else
  echo -e "${BLUE}Aucun fichier de log d'erreur trouvé dans le container.${NC}\n"
  
  # Essayer de trouver où sont les logs
  echo -e "${YELLOW}Recherche des fichiers de log dans le container...${NC}"
  LOG_FILES=$(docker exec $MYSQL_CONTAINER bash -c "find /var -name '*.log' 2>/dev/null || echo 'Aucun fichier log trouvé'")
  echo -e "${BLUE}$LOG_FILES${NC}\n"
fi

# Vérifier la configuration de MySQL
echo -e "${YELLOW}9. Configuration de MySQL:${NC}"
CONFIG=$(docker exec $MYSQL_CONTAINER bash -c "mysqld --verbose --help 2>/dev/null | grep -E 'bind-address|host|skip-name-resolve|skip-host-cache'")
echo -e "${BLUE}$CONFIG${NC}\n"

# Vérifier les variables de MySQL en cours d'exécution
echo -e "${YELLOW}10. Variables MySQL pertinentes:${NC}"
VARS=$(docker exec $MYSQL_CONTAINER mysql -uroot -proot -e "SHOW VARIABLES LIKE '%host%';")
echo -e "${BLUE}$VARS${NC}\n"

echo -e "${GREEN}✅ Diagnostic terminé.${NC}"
echo -e "${CYAN}ℹ️ Si vous voyez des erreurs d'accès, vérifiez que:${NC}"
echo -e "${CYAN}  - L'utilisateur MySQL a les droits pour se connecter depuis l'adresse IP du backend${NC}"
echo -e "${CYAN}  - MySQL est configuré pour accepter les connexions distantes (bind-address)${NC}"
echo -e "${CYAN}  - Le réseau Docker est correctement configuré${NC}"
echo -e "${CYAN}  - Le container MySQL a bien démarré et initialisé les bases de données${NC}" 