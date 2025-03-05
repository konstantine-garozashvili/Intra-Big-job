# Guide de la Base de Données

Ce guide explique en détail comment travailler avec la base de données MySQL du projet BigProject.

## 📖 Vue d'ensemble

Le projet utilise **MySQL 8.0** comme système de gestion de base de données, avec **Doctrine ORM** comme couche d'abstraction dans Symfony. Cette combinaison vous permet de travailler avec des objets PHP plutôt qu'avec des requêtes SQL directes.

## 🏗️ Structure du projet

- **Entités (tables)**: définies dans `backend/src/Entity/`
- **Migrations**: stockées dans `backend/migrations/`
- **Configuration**:
  - `infra/docker-compose.yml` (configuration Docker)
  - `backend/.env` (paramètres de connexion)
  - `backend/config/packages/doctrine.yaml` (configuration Doctrine)

## 🚀 Démarrage rapide

### Accéder à la base de données

Vous pouvez accéder à la base de données de plusieurs façons:

1. **PHPMyAdmin**:
   - URL: [http://localhost:8080](http://localhost:8080)
   - Utilisateur: `root`
   - Mot de passe: `root`

2. **En ligne de commande**:
   ```bash
   docker exec -it infra-database-1 mysql -uroot -proot bigproject
   ```

3. **DBeaver ou autre client SQL**:
   - Hôte: `localhost`
   - Port: `3306`
   - Utilisateur: `root`
   - Mot de passe: `root`
   - Base de données: `bigproject`

## 🔄 Workflow de base de données

### 1. Créer ou modifier une entité

Avant de créer une nouvelle table, vérifiez si une entité similaire n'existe pas déjà.

#### Option 1: Utiliser la commande de création d'entité (recommandé pour les débutants)

```bash
# Se connecter au conteneur backend
docker exec -it infra-backend-1 bash

# Créer une nouvelle entité
php bin/console make:entity

# Suivre les instructions interactives
```

Exemple d'utilisation de `make:entity`:

```
$ php bin/console make:entity

 Class name of the entity to create or update (e.g. GrumpyPuppy):
 > Task

 created: src/Entity/Task.php
 created: src/Repository/TaskRepository.php
 
 Entity generated! Now let's add some fields!
 You can always add more fields later manually or by re-running this command.

 New property name (press <return> to stop adding fields):
 > title

 Field type (enter ? to see all types) [string]:
 > string

 Field length [255]:
 > 100

 Can this field be null in the database (nullable) (yes/no) [no]:
 > no

 New property name (press <return> to stop adding fields):
 > description

 Field type (enter ? to see all types) [string]:
 > text

 Can this field be null in the database (nullable) (yes/no) [no]:
 > yes

 New property name (press <return> to stop adding fields):
 > dueDate

 Field type (enter ? to see all types) [string]:
 > datetime

 Can this field be null in the database (nullable) (yes/no) [no]:
 > yes

 New property name (press <return> to stop adding fields):
 > 
```

#### Option 2: Créer manuellement le fichier d'entité (pour utilisateurs avancés)

Pour les développeurs expérimentés, vous pouvez créer directement les fichiers dans `backend/src/Entity/`.

Exemple de fichier d'entité `Task.php`:

```php
<?php

namespace App\Entity;

use App\Repository\TaskRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: TaskRepository::class)]
class Task
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 100)]
    private ?string $title = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $description = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $dueDate = null;

    // Getters and setters...
}
```

### 2. Générer une migration

Après avoir créé ou modifié une entité:

```bash
# Dans le conteneur backend
docker exec -it infra-backend-1 php bin/console doctrine:migrations:diff
```

Cette commande génère un fichier PHP dans le dossier `backend/migrations/` qui contient le code SQL nécessaire pour mettre à jour la base de données.

### 3. Exécuter la migration

```bash
docker exec -it infra-backend-1 php bin/console doctrine:migrations:migrate
```

Cette commande applique toutes les migrations en attente à la base de données.

### 4. Vérifier l'état des migrations

Pour voir quelles migrations ont été appliquées:

```bash
docker exec -it infra-backend-1 php bin/console doctrine:migrations:status
```

## 🔗 Relations entre entités

Doctrine permet de définir facilement des relations entre entités:

### Relation Many-to-One (N:1)

```php
#[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'tasks')]
#[ORM\JoinColumn(nullable: false)]
private ?User $user = null;
```

### Relation One-to-Many (1:N)

```php
#[ORM\OneToMany(mappedBy: 'user', targetEntity: Task::class, orphanRemoval: true)]
private Collection $tasks;
```

### Relation Many-to-Many (N:M)

```php
#[ORM\ManyToMany(targetEntity: Tag::class, inversedBy: 'tasks')]
private Collection $tags;
```

## 🛠️ Commandes Doctrine utiles

```bash
# Créer une entité
php bin/console make:entity

# Créer un repository
php bin/console make:repository

# Générer une migration
php bin/console doctrine:migrations:diff

# Exécuter les migrations
php bin/console doctrine:migrations:migrate

# Revenir en arrière d'une migration
php bin/console doctrine:migrations:migrate prev

# Voir l'état des migrations
php bin/console doctrine:migrations:status

# Créer la base de données
php bin/console doctrine:database:create

# Supprimer la base de données
php bin/console doctrine:database:drop --force

# Réinitialiser le schéma (attention: supprime toutes les données)
php bin/console doctrine:schema:drop --force
php bin/console doctrine:schema:create
```

## 🔍 Utiliser le Repository pour les requêtes

Les repositories sont utilisés pour récupérer des données de la base de données:

```php
// Dans un contrôleur
public function index(TaskRepository $taskRepository): Response
{
    // Récupérer toutes les tâches
    $tasks = $taskRepository->findAll();
    
    // Récupérer une tâche par son ID
    $task = $taskRepository->find($id);
    
    // Récupérer des tâches avec des critères
    $tasks = $taskRepository->findBy(['user' => $user, 'status' => 'pending']);
    
    // Récupérer une seule tâche avec des critères
    $task = $taskRepository->findOneBy(['title' => 'Tâche importante']);
}
```

### Créer des méthodes de requête personnalisées

Dans votre fichier repository, vous pouvez ajouter des méthodes personnalisées:

```php
// src/Repository/TaskRepository.php
public function findCompletedTasks()
{
    return $this->createQueryBuilder('t')
        ->andWhere('t.status = :status')
        ->setParameter('status', 'completed')
        ->orderBy('t.completedAt', 'DESC')
        ->getQuery()
        ->getResult();
}
```

## 🐞 Résolution des problèmes courants

### La base de données n'est pas à jour

Si vous avez des erreurs liées à la structure de la base de données:

```bash
# Forcer l'exécution de toutes les migrations
docker exec -it infra-backend-1 php bin/console doctrine:migrations:migrate --no-interaction
```

### Erreur "Table already exists"

```bash
# Supprimer le schéma et le recréer
docker exec -it infra-backend-1 php bin/console doctrine:schema:drop --force
docker exec -it infra-backend-1 php bin/console doctrine:migrations:migrate --no-interaction
```

### Réinitialiser complètement la base de données

```bash
# Attention: cela supprimera toutes les données!
docker exec -it infra-backend-1 php bin/console doctrine:schema:drop --force
docker exec -it infra-backend-1 php bin/console doctrine:migrations:migrate --no-interaction
```

### Conflit de migrations

Si vous avez des conflits de migration:

1. Supprimez les fichiers de migration problématiques dans `backend/migrations/`
2. Réinitialisez la table de migration dans PHPMyAdmin (supprimez la table `doctrine_migration_versions`)
3. Recréez une migration à partir du schéma actuel:
   ```bash
   docker exec -it infra-backend-1 php bin/console doctrine:migrations:generate
   docker exec -it infra-backend-1 php bin/console doctrine:migrations:migrate
   ```


### Entités principales

- **User** : Utilisateurs de l'application
- **City** : Villes françaises
- **PostalCode** : Codes postaux avec relation vers les villes (plusieurs codes postaux peuvent être associés à une ville)
- **Address** : Adresses complètes liées à un utilisateur, une ville et un code postal

### Points importants de la nouvelle structure

1. Une ville peut avoir plusieurs codes postaux (cas de Paris, Lyon, Marseille avec arrondissements)
2. Une adresse appartient à une ville ET à un code postal spécifique
3. Le champ `district` dans PostalCode peut contenir les arrondissements pour les grandes villes

## Gestion des fixtures

Les fixtures sont organisées avec des dépendances entre elles :
- CityFixtures : Crée les villes principales
- PostalCodeFixtures : Ajoute les codes postaux (dépend de CityFixtures)
- NationalityFixtures : Ajoute les nationalités disponibles
- RoleFixtures : Définit les rôles utilisateurs (ADMIN, USER, MANAGER)
- ThemeFixtures : Définit les thèmes d'interface (light, dark, system)

Pour charger toutes les fixtures :

```bash
docker-compose -f infra/docker-compose.yml exec backend php bin/console doctrine:fixtures:load
```

Pour charger seulement certaines fixtures (par groupe) :

```bash
docker-compose -f infra/docker-compose.yml exec backend php bin/console doctrine:fixtures:load --group=city

docker exec -it infra-backend-1 php bin/console doctrine:fixtures:load --no-interaction
```

## Utilisation avec l'API Adresse du gouvernement

La structure a été conçue pour être compatible avec l'API Adresse (Base Adresse Nationale) :
- Les réponses de l'API peuvent être facilement mappées vers nos entités
- Le champ `district` est optionnel car tous les lieux n'ont pas d'arrondissement 