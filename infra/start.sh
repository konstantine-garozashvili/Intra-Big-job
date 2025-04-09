#!/bin/bash
# Script de démarrage de l'environnement pour Bash

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Chemins
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo -e "${CYAN}🚀 Démarrage de l'environnement de développement...${NC}"

# Vérifier si Docker est en cours d'exécution
if ! docker info >/dev/null 2>&1; then
  echo -e "${RED}❌ Docker n'est pas en cours d'exécution. Veuillez démarrer Docker.${NC}"
  exit 1
fi

cd "$SCRIPT_DIR" || exit



# Pour les autres systèmes, utiliser le démarrage standard
echo -e "${YELLOW}📦 Démarrage des containers...${NC}"
docker-compose up -d

# Attendre que les containers soient prêts
echo -e "${YELLOW}⏳ Attente du démarrage des services...${NC}"
sleep 10

# Démarrer Mutagen
echo -e "${YELLOW}🔄 Configuration de la synchronisation Mutagen...${NC}"
bash "$SCRIPT_DIR/setup-mutagen.sh"

echo -e "\n${GREEN}✅ Environnement de développement prêt!${NC}"
echo -e "${CYAN}📝 URLs disponibles:${NC}"
echo -e "   Frontend: http://localhost:5173"
echo -e "   Backend API: http://localhost:8000"
echo -e "   PHPMyAdmin: http://localhost:8080" 