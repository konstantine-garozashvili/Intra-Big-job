1. **Nettoyer le cache Docker et les volumes**

```bash
docker system prune -a --volumes
```





2. **Cloner le projet**

```bash
git clone <URL_DU_DÉPÔT>
cd Intra-BigProject
```




3. **Reconstruire les images**

```bash
docker-compose -f infra/docker-compose.yml build --no-cache
```




4. **Créer et lancer les conteneurs Docker**

```bash
docker-compose -f infra/docker-compose.yml up -d
```




5. **Reconstruire la base de donnée**

- 1 : Se connecter au conteneur backend :

```bash
docker exec -it infra-backend-1 bash
```

- 2 : Générer une nouvelle migration :
```bash
php bin/console doctrine:migrations:diff
```

- 3 : Exécuter la mgration :
```bash
php bin/console doctrine:migrations:migrate
```

- 4 : Sortir du conteneur :
```bash
exit
```




5. **Réinserer les fixture**
```bash
docker exec -it infra-backend-1 php bin/console doctrine:fixtures:load --no-interaction
```

