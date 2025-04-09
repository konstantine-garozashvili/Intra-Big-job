# Correctifs pour Windows 10

Ce dossier contient des scripts pour résoudre les problèmes de compatibilité Docker/Mutagen sur Windows 10.

## Problèmes identifiés

1. **Problème de permission MySQL**: Le serveur MySQL refuse les connexions depuis les autres conteneurs
2. **Problème de volumes sur Windows 10**: Les volumes ne sont pas correctement montés 
3. **Problème de nœuds npm**: Erreurs lors de l'installation des dépendances frontend

## Solution

Nous avons créé plusieurs scripts pour résoudre ces problèmes :

### 1. Correction des problèmes de volumes

#### Pour les utilisateurs Windows 10 :

1. Exécutez simplement le fichier `fix-volumes.cmd` avec des droits d'administrateur
   - Clic droit sur `fix-volumes.cmd` → "Exécuter en tant qu'administrateur"

Ce script va :
- Arrêter tous les conteneurs Docker
- Supprimer les volumes problématiques
- Créer un répertoire pour le volume MySQL avec les bonnes permissions
- Redémarrer les conteneurs

#### Pour les utilisateurs de PowerShell :

```powershell
.\fix-volumes.ps1
```

#### Pour les utilisateurs de Git Bash / WSL :

```bash
bash fix-volumes.sh
```

### 2. Modifications apportées au docker-compose.yml

Nous avons modifié le fichier `docker-compose.yml` pour :
- Ajouter `--bind-address=0.0.0.0` pour permettre les connexions à MySQL depuis tous les hôtes
- Ajouter `MYSQL_ROOT_HOST: "%"` pour autoriser les connexions root depuis n'importe où
- Ajouter un script d'initialisation SQL pour configurer les utilisateurs MySQL

### 3. Si les problèmes persistent

Si les problèmes persistent après l'exécution des scripts, essayez ces étapes :

1. Nettoyez complètement Docker :
   ```bash
   docker-compose down -v
   docker system prune -a
   ```

2. Vérifiez que le WSL2 est correctement configuré (recommandé pour Docker sur Windows 10) :
   ```
   wsl --status
   ```

3. Redémarrez Docker Desktop et votre ordinateur

4. Réexécutez le script de correction :
   ```
   fix-volumes.cmd
   ```

## Remarques importantes

- Ces correctifs sont spécifiques à Windows 10 et peuvent ne pas être nécessaires sur Windows 11
- Vérifiez que Docker Desktop a suffisamment de ressources allouées (mémoire, CPU)
- Assurez-vous que l'intégration WSL2 est activée dans Docker Desktop 