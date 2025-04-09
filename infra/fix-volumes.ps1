# Script pour corriger les problèmes de volumes sur Windows 10

# Couleurs pour les messages
$RED = [char]27 + "[0;31m"
$GREEN = [char]27 + "[0;32m"
$YELLOW = [char]27 + "[1;33m"
$CYAN = [char]27 + "[0;36m"
$NC = [char]27 + "[0m" # No Color

Write-Host "${CYAN}🔧 Correction des volumes Docker pour Windows 10...${NC}"

# Arrêter tous les containers
Write-Host "${YELLOW}📦 Arrêt des containers...${NC}"
docker-compose down

# Supprimer les volumes problématiques
Write-Host "${YELLOW}🗑️ Suppression des volumes problématiques...${NC}"
docker volume rm infra_database_data infra_backend_vendor infra_backend_var infra_jwt_keys infra_frontend_node_modules 2>$null

# Créer le répertoire pour le volume MySQL si nécessaire
$MYSQL_VOLUME_PATH = "C:\DockerVolumes\mysql-data"
Write-Host "${YELLOW}📁 Création du répertoire pour MySQL: $MYSQL_VOLUME_PATH${NC}"
New-Item -ItemType Directory -Force -Path $MYSQL_VOLUME_PATH | Out-Null

# Définir les permissions du dossier
Write-Host "${YELLOW}🔒 Ajustement des permissions...${NC}"
$acl = Get-Acl $MYSQL_VOLUME_PATH
$permission = "Everyone", "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow"
$accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule $permission
$acl.SetAccessRule($accessRule)
Set-Acl $MYSQL_VOLUME_PATH $acl

# Redémarrer tout
Write-Host "${YELLOW}🚀 Redémarrage des containers avec les nouveaux volumes...${NC}"
docker-compose up -d

Write-Host "${GREEN}✅ Correction des volumes terminée!${NC}"
Write-Host "${CYAN}ℹ️ Attendez quelques instants pour que les services démarrent complètement.${NC}"
Write-Host "${CYAN}ℹ️ Vous pouvez vérifier l'état avec: docker-compose ps${NC}" 