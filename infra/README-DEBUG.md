# Outils de diagnostics pour Docker sur Windows 10

Ce dossier contient plusieurs scripts de diagnostic créés pour résoudre les problèmes de connexion MySQL sur les machines Windows 10.

## Problèmes connus

Sur Windows 10, Docker peut rencontrer des problèmes spécifiques:
1. **Problèmes de permissions MySQL**: Le serveur MySQL refuse les connexions depuis d'autres conteneurs
2. **Problèmes de montage de volumes**: Les volumes ne sont pas correctement montés ou initialisés
3. **Problèmes de DNS**: Les conteneurs ne peuvent pas résoudre correctement les noms d'hôtes
4. **Problèmes de réseau Docker**: La communication réseau entre les conteneurs est interrompue

## Outils de diagnostic

### 1. Diagnostic MySQL

```bash
bash infra/mysql-debug.sh
```

Ce script effectue une analyse approfondie de la configuration MySQL:
- Vérifie l'état du conteneur MySQL
- Affiche les utilisateurs et leurs privilèges
- Teste la connexion depuis d'autres conteneurs
- Vérifie les variables de configuration MySQL 
- Examine les erreurs dans les logs

### 2. Vérification des scripts d'initialisation

```bash
bash infra/check-volume-init.sh
```

Ce script vérifie si les scripts SQL d'initialisation sont correctement montés et exécutés:
- Vérifie le montage du répertoire `/docker-entrypoint-initdb.d/`
- Affiche le contenu des scripts SQL
- Recherche des traces d'exécution des scripts dans les logs
- Teste l'exécution d'un script SQL directement

### 3. Vérification DNS

```bash
bash infra/dns-check.sh
```

Ce script diagnostique les problèmes de résolution DNS:
- Teste la résolution du nom 'database'
- Vérifie la connectivité entre les conteneurs
- Teste l'accessibilité du port MySQL
- Examine les interfaces réseau et tables de routage
- Vérifie les fichiers hosts dans les conteneurs

## Solution automatique

Si les problèmes persistent après les diagnostics, vous pouvez utiliser le script de correction automatique:

```bash
bash infra/mysql-fix.sh
```

Ce script:
1. Arrête tous les conteneurs
2. Supprime le volume MySQL problématique
3. Recrée le répertoire avec les bonnes permissions
4. Crée des scripts SQL améliorés pour configurer MySQL
5. Redémarre les conteneurs
6. Applique les correctifs directement dans le conteneur MySQL

## Procédure recommandée

1. Exécutez d'abord les scripts de diagnostic pour identifier le problème exact:
   ```bash
   bash infra/mysql-debug.sh
   bash infra/check-volume-init.sh
   bash infra/dns-check.sh
   ```

2. Si nécessaire, exécutez le script de correction automatique:
   ```bash
   bash infra/mysql-fix.sh
   ```

3. Si les problèmes persistent, une approche plus radicale peut être nécessaire:
   ```bash
   # Arrêter tous les conteneurs
   docker-compose down
   
   # Supprimer tous les volumes Docker
   docker volume prune -f
   
   # Redémarrer Docker Desktop (via l'interface)
   
   # Reconstruire les conteneurs
   docker-compose up -d --build
   ```

## Remarques importantes

1. Ces scripts sont spécifiques à l'environnement Docker sur Windows 10
2. La résolution de ces problèmes nécessite parfois un redémarrage complet de Docker Desktop
3. Sur certains systèmes antivirus, il peut être nécessaire de désactiver temporairement la protection pour permettre les communications réseau entre conteneurs 