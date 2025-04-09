#!/bin/bash
# Script de configuration Mutagen pour les containers frontend et backend

# Couleurs pour les messages
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Chemins
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
MUTAGEN_PATH="$SCRIPT_DIR/../mutagen/mutagen"

echo -e "${CYAN}🔄 Configuration de la synchronisation Mutagen pour frontend et backend...${NC}"

# Vérifier si l'exécutable Mutagen existe
if [ ! -f "$MUTAGEN_PATH" ]; then
    echo -e "${RED}❌ ERROR: Executable Mutagen non trouve a: $MUTAGEN_PATH${NC}"
    echo -e "${YELLOW}Essai avec la commande 'mutagen' globale...${NC}"
    MUTAGEN_PATH="mutagen"
    
    if ! command -v mutagen &> /dev/null; then
        echo -e "${RED}❌ ERROR: Mutagen n'est pas installé ou n'est pas dans le PATH.${NC}"
        exit 1
    fi
fi

# Vérifier la version de Mutagen
echo -e "${YELLOW}🔍 Vérification de la version de Mutagen...${NC}"
if ! "$MUTAGEN_PATH" version; then
    echo -e "${RED}❌ ERROR: Impossible d'executer Mutagen. Verifiez les permissions.${NC}"
    exit 1
fi

# Arrêter toute synchronisation existante
echo -e "${YELLOW}🔄 Arret des synchronisations existantes...${NC}"
"$MUTAGEN_PATH" project terminate --force 2>/dev/null || true

# Redémarrer les containers
echo -e "${YELLOW}📦 Redemarrage des containers...${NC}"
cd "$SCRIPT_DIR"
docker compose down
docker compose up -d

# Attendre que les containers soient prêts
echo -e "${YELLOW}⏳ Attente des containers...${NC}"
sleep 15

# Vérifier si les containers sont en cours d'exécution
if ! docker ps --filter "name=infra-backend-1" --format "{{.Names}}" | grep -q "infra-backend-1"; then
    echo -e "${RED}❌ ERROR: Container 'infra-backend-1' non trouve. Verifiez votre configuration Docker.${NC}"
    exit 1
fi

if ! docker ps --filter "name=infra-frontend-1" --format "{{.Names}}" | grep -q "infra-frontend-1"; then
    echo -e "${RED}❌ ERROR: Container 'infra-frontend-1' non trouve. Verifiez votre configuration Docker.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Containers backend et frontend en cours d'execution.${NC}"

# Démarrer la synchronisation Mutagen avec le fichier de configuration
echo -e "${YELLOW}🔄 Demarrage des synchronisations Mutagen...${NC}"
cd "$SCRIPT_DIR"
"$MUTAGEN_PATH" project start

# Vérifier le statut
echo -e "${YELLOW}📊 Verification du statut des synchronisations...${NC}"
sleep 3
"$MUTAGEN_PATH" sync list

echo -e "\n${GREEN}✅ Configuration terminee!${NC}"
echo -e "${CYAN}ℹ️ Vos fichiers frontend et backend sont maintenant synchronises avec les containers.${NC}" 