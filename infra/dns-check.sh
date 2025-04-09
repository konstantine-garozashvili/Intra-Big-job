#!/bin/bash
# Script pour vérifier les problèmes DNS dans Docker

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}🔍 Diagnostic DNS pour Docker sur Windows 10...${NC}\n"

# Vérifier si netshoot est disponible ou utiliser un container temporaire
echo -e "${YELLOW}1. Vérification de la résolution DNS dans le réseau Docker...${NC}"
if docker ps --format "{{.Names}}" | grep -q "infra-dns-checker"; then
  container="infra-dns-checker-1"
else
  echo -e "${YELLOW}Container netshoot non trouvé, création d'un container temporaire...${NC}"
  docker run -d --rm --name dns-test --network infra_app-network nicolaka/netshoot sleep 300
  container="dns-test"
  sleep 2
fi

# Tester la résolution DNS dans le réseau Docker
echo -e "${YELLOW}2. Test de résolution du nom de domaine 'database'...${NC}"
DNS_TEST=$(docker exec $container bash -c "dig database +short")
if [ -z "$DNS_TEST" ]; then
  echo -e "${RED}❌ Le nom 'database' n'a pas pu être résolu dans le réseau Docker.${NC}"
else
  echo -e "${GREEN}✅ Résolution DNS réussie: 'database' -> ${BLUE}$DNS_TEST${NC}\n"
fi

# Tester la connexion ping
echo -e "${YELLOW}3. Test de connectivité vers database...${NC}"
PING_TEST=$(docker exec $container bash -c "ping -c 2 database")
echo -e "${BLUE}$PING_TEST${NC}\n"

# Vérifier si le service MySQL est accessible
echo -e "${YELLOW}4. Test d'accessibilité du port MySQL (3306)...${NC}"
MYSQL_PORT_TEST=$(docker exec $container bash -c "nc -zv database 3306 2>&1")
if echo "$MYSQL_PORT_TEST" | grep -q "succeeded"; then
  echo -e "${GREEN}✅ Le port MySQL (3306) est accessible.${NC}"
  echo -e "${BLUE}$MYSQL_PORT_TEST${NC}\n"
else
  echo -e "${RED}❌ Le port MySQL (3306) n'est pas accessible.${NC}"
  echo -e "${BLUE}$MYSQL_PORT_TEST${NC}\n"
fi

# Vérifier les interfaces réseau dans les containers
echo -e "${YELLOW}5. Interfaces réseau du container 'database'...${NC}"
IFACES_DB=$(docker exec infra-database-1 ip addr show 2>/dev/null || echo "Commande non disponible")
echo -e "${BLUE}$IFACES_DB${NC}\n"

# Vérifier le tableau de routage dans les containers
echo -e "${YELLOW}6. Table de routage du container 'database'...${NC}"
ROUTE_DB=$(docker exec infra-database-1 ip route 2>/dev/null || echo "Commande non disponible")
echo -e "${BLUE}$ROUTE_DB${NC}\n"

# Vérifier le fichier hosts dans les containers
echo -e "${YELLOW}7. Fichier /etc/hosts du container 'database'...${NC}"
HOSTS_DB=$(docker exec infra-database-1 cat /etc/hosts)
echo -e "${BLUE}$HOSTS_DB${NC}\n"

# Tester une connexion MySQL directe
echo -e "${YELLOW}8. Tentative de connexion MySQL directe...${NC}"
MYSQL_TEST=$(docker exec $container bash -c "apt-get update > /dev/null 2>&1 && apt-get install -y mysql-client > /dev/null 2>&1 && mysql -h database -u root -proot -e 'SELECT 1;' 2>&1")
if echo "$MYSQL_TEST" | grep -q "ERROR"; then
  echo -e "${RED}❌ Erreur de connexion MySQL:${NC}"
  echo -e "${BLUE}$MYSQL_TEST${NC}\n"
else
  echo -e "${GREEN}✅ Connexion MySQL réussie.${NC}"
  echo -e "${BLUE}$MYSQL_TEST${NC}\n"
fi

# Vérifier la configuration du réseau Docker
echo -e "${YELLOW}9. Configuration du réseau Docker:${NC}"
DOCKER_NETWORK=$(docker network inspect infra_app-network)
echo -e "${BLUE}$DOCKER_NETWORK${NC}\n"

# Nettoyer le container temporaire si nécessaire
if [ "$container" = "dns-test" ]; then
  echo -e "${YELLOW}Nettoyage du container temporaire...${NC}"
  docker stop dns-test >/dev/null 2>&1
fi

echo -e "${GREEN}✅ Diagnostic DNS terminé.${NC}"
echo -e "${CYAN}ℹ️ Conseils pour résoudre les problèmes de DNS:${NC}"
echo -e "${CYAN}  - Assurez-vous que le service DNS de Docker fonctionne correctement${NC}"
echo -e "${CYAN}  - Redémarrez Docker Desktop si nécessaire${NC}"
echo -e "${CYAN}  - Vérifiez qu'il n'y a pas de pare-feu ou d'antivirus bloquant les connexions entre containers${NC}" 