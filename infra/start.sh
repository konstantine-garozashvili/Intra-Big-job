#!/bin/bash
# Script de demarrage de l'environnement pour Bash

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Chemins
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo -e "${CYAN}🚀 Demarrage de l'environnement de developpement...${NC}"

# Verifier si Docker est en cours d'execution
if ! docker info >/dev/null 2>&1; then
  echo -e "${RED}❌ Docker n'est pas en cours d'execution. Veuillez demarrer Docker.${NC}"
  exit 1
fi

cd "$SCRIPT_DIR" || exit

# Demarrer les containers
echo -e "${YELLOW}📦 Demarrage des containers...${NC}"
docker-compose up -d

# Attendre que les containers soient prets
echo -e "${YELLOW}⏳ Attente du demarrage des services...${NC}"
sleep 10

# Demarrer Mutagen
echo -e "${YELLOW}🔄 Configuration de la synchronisation Mutagen...${NC}"
bash "$SCRIPT_DIR/setup-mutagen.sh"

echo -e "\n${GREEN}✅ Environnement de developpement pret!${NC}"
echo -e "${CYAN}📝 URLs disponibles:${NC}"
echo -e "   Frontend: http://localhost:5173"
echo -e "   Backend API: http://localhost:8000"
echo -e "   PHPMyAdmin: http://localhost:8080" 