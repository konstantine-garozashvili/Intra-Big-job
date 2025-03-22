#!/bin/bash

# Script pour lancer l'application en mode normal
# Utilisation: ./dev-normal.sh

# Définir les couleurs pour une meilleure lisibilité
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}=======================================================${NC}"
echo -e "${GREEN}   Démarrage en mode normal (performances complètes)   ${NC}"
echo -e "${GREEN}=======================================================${NC}"

# Vérifier si Docker est en cours d'exécution
if ! docker info > /dev/null 2>&1; then
    echo -e "${YELLOW}Docker n'est pas en cours d'exécution. Veuillez démarrer Docker et réessayer.${NC}"
    exit 1
fi

# Exporter les variables d'environnement pour le mode normal
export LOW_POWER_MODE=false
export CHOKIDAR_USEPOLLING=1

echo -e "${BLUE}Configuration des paramètres normaux...${NC}"

# Démarrer tous les services
echo -e "${BLUE}Redémarrage de tous les services...${NC}"
docker-compose -f infra/docker-compose.yml up -d

echo -e "${GREEN}=======================================================${NC}"
echo -e "${GREEN}   Mode normal activé avec succès!   ${NC}"
echo -e "${GREEN}=======================================================${NC}"
echo -e "${YELLOW}Notes:${NC}"
echo -e "• ${YELLOW}Tous les services sont actifs, y compris PHPMyAdmin${NC}"
echo -e "• ${YELLOW}Le hot reload est activé et réactif${NC}"
echo -e "• ${YELLOW}Utilisation optimale des ressources disponibles${NC}"
echo -e ""
echo -e "Pour passer en mode économie de ressources, utilisez: ${GREEN}./dev-low-power.sh${NC}"
echo -e "Accédez à l'application: ${GREEN}http://localhost:5173${NC}"
echo -e "Accédez à PHPMyAdmin: ${GREEN}http://localhost:8080${NC} (utilisateur: root, mot de passe: root)"