#!/bin/bash
# Script de diagnostic et correction rapide pour MySQL

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}🔍 Diagnostic et correction MySQL rapide${NC}\n"

# Vérifier si le container MySQL est en cours d'exécution
echo -e "${YELLOW}1. Vérification du container MySQL...${NC}"
if ! docker ps | grep -q "infra-database-1"; then
  echo -e "${RED}❌ Le container MySQL n'est pas en cours d'exécution.${NC}"
  echo -e "${YELLOW}Voulez-vous démarrer les containers? (o/n)${NC}"
  read -r response
  if [[ "$response" =~ ^([oO][uU][iI]|[oO])$ ]]; then
    docker-compose up -d
    echo -e "${YELLOW}Attente du démarrage de MySQL (30s)...${NC}"
    sleep 30
  else
    exit 1
  fi
else
  echo -e "${GREEN}✅ Container MySQL en cours d'exécution.${NC}\n"
fi

# Tester la connexion MySQL
echo -e "${YELLOW}2. Test de connexion MySQL...${NC}"
MYSQL_TEST=$(docker exec infra-database-1 mysql -uroot -proot -e "SELECT 1 as test;" 2>&1)
if echo "$MYSQL_TEST" | grep -q "ERROR"; then
  echo -e "${RED}❌ Erreur de connexion MySQL:${NC}"
  echo -e "${RED}$MYSQL_TEST${NC}\n"
else
  echo -e "${GREEN}✅ Connexion MySQL OK.${NC}\n"
fi

# Vérifier les utilisateurs MySQL
echo -e "${YELLOW}3. Vérification des utilisateurs MySQL...${NC}"
USERS_CHECK=$(docker exec infra-database-1 mysql -uroot -proot -e "SELECT user, host FROM mysql.user WHERE user IN ('root', 'user');" 2>&1)
if echo "$USERS_CHECK" | grep -q "ERROR"; then
  echo -e "${RED}❌ Erreur lors de la vérification des utilisateurs:${NC}"
  echo -e "${RED}$USERS_CHECK${NC}\n"
else
  echo -e "${GREEN}✅ Utilisateurs MySQL:${NC}"
  echo -e "$USERS_CHECK\n"
fi

# Proposer de corriger les autorisations MySQL
echo -e "${YELLOW}4. Voulez-vous corriger les autorisations MySQL? (o/n)${NC}"
read -r response
if [[ "$response" =~ ^([oO][uU][iI]|[oO])$ ]]; then
  echo -e "${YELLOW}Application des corrections...${NC}"
  docker exec -i infra-database-1 mysql -uroot -proot < mysql-init/init.sql
  echo -e "${GREEN}✅ Corrections appliquées.${NC}\n"
fi

# Vérifier la connexion depuis le backend
echo -e "${YELLOW}5. Test de connexion depuis le backend...${NC}"
if docker ps | grep -q "infra-backend-1"; then
  BACKEND_TEST=$(docker exec infra-backend-1 bash -c "apt-get update > /dev/null 2>&1 && apt-get install -y mysql-client > /dev/null 2>&1 && mysql -h database -u user -ppassword -e 'SELECT NOW() as time;'" 2>&1)
  if echo "$BACKEND_TEST" | grep -q "ERROR"; then
    echo -e "${RED}❌ Erreur de connexion depuis le backend:${NC}"
    echo -e "${RED}$BACKEND_TEST${NC}\n"
  else
    echo -e "${GREEN}✅ Connexion depuis le backend OK:${NC}"
    echo -e "$BACKEND_TEST\n"
  fi
else
  echo -e "${YELLOW}⚠️ Container backend non disponible pour le test.${NC}\n"
fi

echo -e "${CYAN}🔧 Diagnostic terminé.${NC}"
echo -e "${CYAN}💡 Pour redémarrer complètement l'environnement, utilisez le script win10-start.sh${NC}" 