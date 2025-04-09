# Configuration pour Windows 10

Ce guide explique comment faire fonctionner ce projet sur des machines Windows 10 avec des performances limitées.

## Problèmes connus

Sur les machines Windows 10 avec des performances limitées, les problèmes suivants peuvent se produire :

1. **Erreur de connexion MySQL** : "Host '172.18.0.x' is not allowed to connect to this MySQL server"
2. **Backend incapable de se connecter à la base de données**
3. **Problèmes avec Mutagen et la synchronisation des fichiers**

## Solution mise en place

Nous avons modifié la configuration pour :

1. **Retarder le démarrage du backend** afin de s'assurer que MySQL est complètement prêt
2. **Ajouter des scripts d'initialisation MySQL** pour configurer correctement les utilisateurs
3. **Optimiser les temps d'attente** pour les machines moins performantes

## Comment utiliser cette configuration

### Démarrage normal

Pour démarrer l'environnement, utilisez simplement la commande habituelle :

```bash
# À la racine du projet
./start.cmd   # Pour Windows
./start.sh    # Pour Git Bash
```

Le script détectera automatiquement si vous êtes sur Windows 10 et utilisera les paramètres optimisés.

### En cas de problème

Si vous rencontrez des problèmes de connexion MySQL, utilisez le script de diagnostic :

```bash
# Dans le dossier infra
bash debug-mysql.sh
```

Ce script va :
1. Vérifier si MySQL est en cours d'exécution
2. Tester la connexion à MySQL
3. Vérifier les utilisateurs configurés
4. Proposer de corriger les problèmes d'autorisations
5. Tester la connexion depuis le backend

### Configuration manuelle (si nécessaire)

Si les scripts automatiques ne fonctionnent pas, vous pouvez appliquer les corrections manuellement :

1. Arrêtez tous les conteneurs :
   ```bash
   docker-compose down
   ```

2. Supprimez le volume MySQL :
   ```bash
   docker volume rm infra_database_data
   ```

3. Démarrez uniquement le conteneur MySQL :
   ```bash
   docker-compose up -d database
   ```

4. Attendez 30 secondes pour que MySQL démarre

5. Appliquez le script de correction des utilisateurs :
   ```bash
   docker exec -i infra-database-1 mysql -uroot -proot < infra/mysql-init/init.sql
   ```

6. Démarrez les autres conteneurs :
   ```bash
   docker-compose up -d
   ```

## Explication des modifications

1. **docker-compose.yml** :
   - Ajout d'une condition de dépendance explicite sur le service de base de données
   - Augmentation des délais d'attente
   - Ajout de tests actifs de disponibilité MySQL

2. **Scripts d'initialisation MySQL** :
   - Configuration des utilisateurs pour accepter les connexions depuis n'importe quelle adresse IP
   - Création d'utilisateurs spécifiques pour le réseau Docker (172.%)

3. **win10-start.sh** :
   - Script optimisé pour Windows 10
   - Configuration des permissions des volumes
   - Nettoyage des volumes problématiques

Ces modifications permettent au projet de fonctionner correctement même sur des machines Windows 10 avec des performances limitées. 