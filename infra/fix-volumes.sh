#!/bin/bash
# Script pour corriger les problèmes de volumes sur Windows 10

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}🔧 Correction des volumes Docker pour Windows 10...${NC}"

# Arrêter tous les containers
echo -e "${YELLOW}📦 Arrêt des containers...${NC}"
docker-compose down

# Supprimer les volumes problématiques
echo -e "${YELLOW}🗑️ Suppression des volumes problématiques...${NC}"
docker volume rm infra_database_data infra_backend_vendor infra_backend_var infra_jwt_keys infra_frontend_node_modules 2>/dev/null

# Créer le répertoire pour le volume MySQL si nécessaire
MYSQL_VOLUME_PATH="C:/DockerVolumes/mysql-data"
echo -e "${YELLOW}📁 Création du répertoire pour MySQL: $MYSQL_VOLUME_PATH${NC}"
mkdir -p "$MYSQL_VOLUME_PATH"

# Définir les permissions du dossier (Windows n'a pas chmod, mais on peut utiliser icacls)
echo -e "${YELLOW}🔒 Ajustement des permissions...${NC}"
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    echo -e "${YELLOW}🔧 Système Windows détecté, utilisation de icacls...${NC}"
    WINDOWS_PATH=$(echo "$MYSQL_VOLUME_PATH" | sed 's|/|\\|g')
    icacls "$WINDOWS_PATH" /grant:r "Everyone:(OI)(CI)F" /T
else
    echo -e "${YELLOW}🔧 Système Unix détecté, utilisation de chmod...${NC}"
    chmod -R 777 "$MYSQL_VOLUME_PATH"
fi

# Redémarrer tout
echo -e "${YELLOW}🚀 Redémarrage des containers avec les nouveaux volumes...${NC}"
docker-compose up -d

echo -e "${GREEN}✅ Correction des volumes terminée!${NC}"
echo -e "${CYAN}ℹ️ Attendez quelques instants pour que les services démarrent complètement.${NC}"
echo -e "${CYAN}ℹ️ Vous pouvez vérifier l'état avec: docker-compose ps${NC}" 