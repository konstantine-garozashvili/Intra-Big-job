#!/bin/bash
# Script de configuration Mutagen pour le container backend

# Couleurs pour les messages
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Chemins
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
MUTAGEN_PATH="$SCRIPT_DIR/../mutagen/mutagen"

echo -e "${CYAN}🔄 Configuration de la synchronisation Mutagen...${NC}"

# Vérifier si l'exécutable Mutagen existe
if [ ! -f "$MUTAGEN_PATH" ]; then
    echo -e "${RED}❌ ERROR: Executable Mutagen non trouve a: $MUTAGEN_PATH${NC}"
    exit 1
fi

# Vérifier la version de Mutagen
if ! "$MUTAGEN_PATH" version >/dev/null 2>&1; then
    echo -e "${RED}❌ ERROR: Impossible d'executer Mutagen. Verifiez les permissions.${NC}"
    exit 1
fi

# Arrêter toute synchronisation existante
echo -e "${YELLOW}🔄 Arret de la synchronisation existante...${NC}"
"$MUTAGEN_PATH" sync terminate backend-sync 2>/dev/null

# Redémarrer les containers
echo -e "${YELLOW}📦 Redemarrage des containers...${NC}"
docker-compose down
docker-compose up -d

# Attendre que le container database soit prêt
echo -e "${YELLOW}⏳ Attente du container database...${NC}"
MAX_RETRIES=30
RETRY_COUNT=0

while ! docker exec infra-database-1 mysqladmin ping -h localhost -u user -ppassword --silent &> /dev/null; do
    RETRY_COUNT=$((RETRY_COUNT+1))
    if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
        echo -e "${RED}❌ ERROR: Délai d'attente dépassé pour le container database${NC}"
        exit 1
    fi
    echo -e "${YELLOW}⏳ Tentative $RETRY_COUNT/$MAX_RETRIES - Attente de la base de données...${NC}"
    sleep 3
done

echo -e "${GREEN}✅ Container database prêt!${NC}"

# Attendre que le container backend soit prêt
echo -e "${YELLOW}⏳ Attente du container backend...${NC}"
sleep 10

# Vérifier si le container backend est en cours d'exécution
if ! docker ps --filter "name=infra-backend-1" --format "{{.Names}}" | grep -q "infra-backend-1"; then
    echo -e "${RED}❌ ERROR: Container 'infra-backend-1' non trouve. Verifiez votre configuration Docker.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Container backend 'infra-backend-1' en cours d'execution.${NC}"

# Démarrer la synchronisation Mutagen
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"

echo -e "${YELLOW}🔄 Demarrage de la synchronisation Mutagen...${NC}"
"$MUTAGEN_PATH" sync create --name=backend-sync \
    --default-file-mode=0644 \
    --default-directory-mode=0755 \
    --symlink-mode=portable \
    --ignore=/vendor \
    --ignore=/var \
    --ignore=/config/jwt \
    --ignore=/.git \
    --ignore=/.idea \
    --ignore=/.vscode \
    --ignore=/.env.local \
    --ignore="**/*.log" \
    "$BACKEND_DIR" "docker://infra-backend-1/var/www/symfony"

# Création du forwarding pour la base de données
echo -e "${YELLOW}🔄 Mise en place du forwarding pour la base de données...${NC}"
"$MUTAGEN_PATH" forward terminate database-forward 2>/dev/null
"$MUTAGEN_PATH" forward create --name=database-forward \
    tcp:localhost:3307 "docker://infra-database-1:tcp:3306"

# Vérifier le statut
echo -e "${YELLOW}📊 Verification du statut de la synchronisation...${NC}"
sleep 2
"$MUTAGEN_PATH" sync list
"$MUTAGEN_PATH" forward list

echo -e "\n${GREEN}✅ Configuration terminee!${NC}"
echo -e "${CYAN}ℹ️ Vos fichiers backend sont maintenant synchronises avec le container.${NC}" 