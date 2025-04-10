#!/bin/bash
# Script d'arret de l'environnement pour Bash

# Couleurs pour les messages
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Chemins
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
MUTAGEN_PATH="$SCRIPT_DIR/../mutagen/mutagen"

echo -e "${YELLOW}🛑 Arret de l'environnement de developpement...${NC}"

# Arreter Mutagen
echo -e "${YELLOW}🔄 Arret de la synchronisation Mutagen...${NC}"
if [ -f "$MUTAGEN_PATH" ]; then
    "$MUTAGEN_PATH" sync terminate backend-sync 2>/dev/null
else
    echo -e "${YELLOW}⚠️ Note: Executable Mutagen non trouve a: $MUTAGEN_PATH${NC}"
fi

cd "$SCRIPT_DIR" || exit

# Arreter les containers
echo -e "${YELLOW}📦 Arret des containers...${NC}"
docker-compose down

echo -e "\n${GREEN}✅ Environnement de developpement arrete!${NC}" 