#!/bin/bash

# Script pour lancer l'application en mode faible consommation de ressources
# Utilisation: ./dev-low-power.sh

# Définir les couleurs pour une meilleure lisibilité
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}=======================================================${NC}"
echo -e "${GREEN}   Démarrage en mode économie de ressources   ${NC}"
echo -e "${GREEN}=======================================================${NC}"

# Vérifier si Docker est en cours d'exécution
if ! docker info > /dev/null 2>&1; then
    echo -e "${YELLOW}Docker n'est pas en cours d'exécution. Veuillez démarrer Docker et réessayer.${NC}"
    exit 1
fi

# Exporter les variables d'environnement pour le mode faible consommation
export LOW_POWER_MODE=true
export CHOKIDAR_USEPOLLING=0

echo -e "${BLUE}Configuration des paramètres d'économie de ressources...${NC}"

# Arrêter PHPMyAdmin si déjà en cours d'exécution
if docker ps | grep -q "infra-phpmyadmin"; then
    echo -e "${YELLOW}Arrêt de PHPMyAdmin pour économiser des ressources...${NC}"
    docker-compose -f infra/docker-compose.yml stop phpmyadmin
fi

# Redémarrer uniquement les services nécessaires avec les nouvelles variables d'environnement
echo -e "${BLUE}Redémarrage des services avec les paramètres optimisés...${NC}"
docker-compose -f infra/docker-compose.yml up -d --no-deps frontend backend

echo -e "${GREEN}=======================================================${NC}"
echo -e "${GREEN}   Mode économie de ressources activé avec succès!   ${NC}"
echo -e "${GREEN}=======================================================${NC}"
echo -e "${YELLOW}Notes:${NC}"
echo -e "• ${YELLOW}PHPMyAdmin est désactivé pour économiser des ressources${NC}"
echo -e "• ${YELLOW}Les composants React sont chargés à la demande${NC}"
echo -e "• ${YELLOW}La vérification des fichiers est optimisée${NC}"
echo -e "• ${YELLOW}Le hot reload peut être légèrement plus lent${NC}"
echo -e ""
echo -e "Pour revenir au mode normal, utilisez: ${GREEN}./dev-normal.sh${NC}"
echo -e "Accédez à l'application: ${GREEN}http://localhost:5173${NC}"
