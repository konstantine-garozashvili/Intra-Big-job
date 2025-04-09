# Configuration spéciale pour Windows 10

Ce document explique comment utiliser les outils spéciaux créés pour faire fonctionner l'environnement Docker sur Windows 10.

## Problème identifié

Les ordinateurs sous Windows 10 rencontrent des problèmes spécifiques avec Docker et MySQL, notamment:
- Host '172.18.0.x' is not allowed to connect to this MySQL server
- Problèmes de montage de volumes sous Windows 10
- Problèmes de résolution DNS sous Docker Desktop

## Solution recommandée

Nous avons créé une configuration spéciale pour Windows 10 qui résout ces problèmes. Suivez ces étapes:

### Option 1: Utiliser les scripts de démarrage automatiques

1. **Pour les utilisateurs de Windows (cmd):**
   ```
   cd infra
   win10-start.cmd
   ```

2. **Pour les utilisateurs de Git Bash:**
   ```bash
   cd infra
   bash win10-start.sh
   ```

Ces scripts:
- Configurent correctement les permissions de dossiers
- Suppriment les volumes problématiques
- Démarrent les conteneurs avec une configuration optimisée pour Windows 10
- Ajoutent un conteneur de diagnostic qui s'assure que MySQL accepte les connexions

### Option 2: Utiliser les outils de diagnostic pour trouver la source précise du problème

Si vous préférez comprendre et résoudre le problème vous-même:

1. **Diagnostic MySQL:**
   ```bash
   cd infra
   bash mysql-debug.sh
   ```

2. **Vérification des scripts d'initialisation:**
   ```bash
   bash check-volume-init.sh
   ```

3. **Vérification DNS:**
   ```bash
   bash dns-check.sh
   ```

4. **Fix automatique:**
   ```bash
   bash mysql-fix.sh
   ```

## Différences techniques par rapport à la configuration standard

La configuration Windows 10 inclut:

1. **Configuration MySQL améliorée:**
   - Configuration bind-address explicite
   - Utilisateurs MySQL pour toutes les adresses IP possibles
   - Logs plus détaillés pour le débogage

2. **Dépendances explicites:**
   - Le backend attend que MySQL soit complètement démarré
   - Vérification active des connexions

3. **Conteneur de correction:**
   - Un conteneur dédié qui exécute les scripts SQL de correction

4. **Volume simplifié:**
   - Utilisation de volumes Docker standards au lieu de bind mounts
   - Évite les problèmes de permissions sous Windows 10

## Si les problèmes persistent

1. **Vérifiez Docker Desktop:**
   - Assurez-vous d'utiliser la dernière version
   - Vérifiez que WSL2 est activé (si disponible)
   - Allouez plus de mémoire à Docker (au moins 4GB)

2. **Vérifiez l'antivirus:**
   - Certains antivirus peuvent bloquer les connexions entre conteneurs
   - Ajoutez des exceptions pour Docker

3. **Nettoyage complet:**
   ```bash
   # Arrêter tous les conteneurs Docker
   docker-compose down
   
   # Supprimer tous les volumes Docker
   docker volume prune -f
   
   # Supprimer toutes les images Docker (optionnel)
   docker system prune -a
   
   # Redémarrer Docker Desktop
   # Puis relancer le script Windows 10
   cd infra
   bash win10-start.sh
   ```

## Utilisation de PHPMyAdmin

Pour vérifier si vos corrections ont fonctionné, vous pouvez utiliser PHPMyAdmin:

1. Ouvrez http://localhost:8080 dans votre navigateur
2. Connectez-vous avec:
   - Utilisateur: root
   - Mot de passe: root
3. Vérifiez les utilisateurs MySQL dans l'onglet "Utilisateurs"

## Logs et débogage

Si vous avez besoin de voir les logs détaillés:

```bash
# Logs de tous les conteneurs
docker-compose logs

# Logs spécifiques de MySQL
docker-compose logs database

# Logs en temps réel
docker-compose logs -f
``` 