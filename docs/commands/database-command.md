# Guide pour le développement :


### A - Couper les conteneurs

- Directement avec Docker Desktop ou en glissant `stop-mutagen.bat` dans le terminal.  

- Dans le terminal, à la racine du dossier pour relancer les conteneurs sans Mutagen :

```bash
docker-compose -f infra/docker-compose.yml up -d
```  
  
- Entrer dans le conteneur backend :  
```bash
docker exec -it infra-backend-1 bash
```  
  
  Le terminal devrait renvoyer ceci : 
   
  root@1991f5515ee1:/var/www/symfony# 




 

### B - Création d'une nouvelle Entity (Table dans la base de données)  
  
Ne pas effectuer de création de table directement dans phpMyAdmin.  
Exécutez la commande suivante :
```bash
php bin/console make:entity NomDeLaTable
```
Cette commande créera le fichier entity et le repository.  
  



### C- Creéation d'un Controller :
```bash
php bin/console make:controller NomDuController
```  



  
### D - Réaliser une migration :  
1 - Préparer la migration :  
```bash
php bin/console doctrine:migrations:diff
```  

2 - Exécuter la migration :  
```bash 
php bin/console doctrine:migrations:migrate
```  



### E - Réactiver Mutagen uniquemet pour les tests :  

Si vous avez besoin d'utiliser à nouveau Mutagen pour améliorer la vitesse pour faire des tests :  

1 - Coupez à nouveau vos conteneurs dans Docker Desktop.

2 - Glissez ce fichier dans le terminal à la racine du projet : `start-mutagen.bat`  


Remarque importante : A chaque fois que vous modifiez la base de données (tables et champs), ou que vous faites de nouvelle routes api vous devez couper Mutagen.