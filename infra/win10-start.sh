#!/bin/bash
# Script de démarrage simplifié pour Windows 10 avec Git Bash

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}========================================================${NC}"
echo -e "${CYAN}     DÉMARRAGE DE L'ENVIRONNEMENT POUR WINDOWS 10${NC}"
echo -e "${CYAN}========================================================${NC}"
echo ""

# Vérifier que Docker est en cours d'exécution
if ! docker info >/dev/null 2>&1; then
  echo -e "${RED}Docker n'est pas en cours d'exécution. Veuillez démarrer Docker Desktop.${NC}"
  read -p "Appuyez sur une touche pour continuer..."
  exit 1
fi

echo -e "${YELLOW}Préparation de l'environnement...${NC}"

# Créer le répertoire pour les volumes MySQL si nécessaire
if [ ! -d "C:/DockerVolumes/mysql-data" ]; then
  echo -e "${YELLOW}Création du répertoire pour MySQL...${NC}"
  mkdir -p "C:/DockerVolumes/mysql-data" 2>/dev/null
fi

# Configurer les permissions
echo -e "${YELLOW}Configuration des permissions...${NC}"
icacls "C:\\DockerVolumes\\mysql-data" /grant:r "Everyone:(OI)(CI)F" /T >/dev/null 2>&1

# Arrêter les conteneurs existants
echo -e "${YELLOW}Arrêt des conteneurs existants...${NC}"
docker-compose down

# Supprimer le volume MySQL problématique
echo -e "${YELLOW}Suppression du volume MySQL problématique...${NC}"
docker volume rm infra_database_data >/dev/null 2>&1 || true

# Démarrer les conteneurs
echo -e "${YELLOW}Démarrage des conteneurs...${NC}"
docker-compose up -d

echo -e "${YELLOW}Attente du démarrage de MySQL (30 secondes)...${NC}"
sleep 30

# Exécuter le script de correction MySQL si nécessaire
echo -e "${YELLOW}Vérification des connexions MySQL...${NC}"
MYSQL_CHECK=$(docker exec infra-database-1 mysql -uroot -proot -e "SELECT user, host FROM mysql.user WHERE user='user' AND host='%';" 2>&1)
if echo "$MYSQL_CHECK" | grep -q "ERROR"; then
  echo -e "${YELLOW}Correction des utilisateurs MySQL...${NC}"
  docker exec -i infra-database-1 mysql -uroot -proot < mysql-init/init.sql
  echo -e "${GREEN}Utilisateurs MySQL corrigés.${NC}"
fi

# Configuration de Mutagen
echo -e "${YELLOW}Configuration de Mutagen...${NC}"
bash ./setup-mutagen.sh

echo ""
echo -e "${GREEN}========================================================${NC}"
echo -e "${GREEN}     ENVIRONNEMENT DÉMARRÉ AVEC SUCCÈS${NC}"
echo -e "${GREEN}========================================================${NC}"
echo ""
echo -e "${CYAN}URLs disponibles:${NC}"
echo -e "  - Frontend: ${GREEN}http://localhost:5173${NC}"
echo -e "  - Backend API: ${GREEN}http://localhost:8000${NC}"
echo -e "  - PHPMyAdmin: ${GREEN}http://localhost:8080${NC}"
echo ""
echo -e "${CYAN}En cas de problème de connexion MySQL, exécutez:${NC}"
echo -e "  ${YELLOW}docker exec -i infra-database-1 mysql -uroot -proot < mysql-init/init.sql${NC}"
echo "" 