# Guide Backend pour le Projet BigProject

<<<<<<< HEAD
## 📖 Vue d'ensemble

Ce guide vous aidera à comprendre et à travailler efficacement avec la partie backend du projet BigProject, qui est basée sur Symfony 7.

## 🏗️ Structure du projet backend

=======
Ce guide vous aidera à comprendre et à travailler efficacement avec la partie backend du projet BigProject, qui est basée sur Symfony 7.

## 📖 Vue d'ensemble

Le backend du projet BigProject est une API RESTful construite avec:

- **PHP 8.2** comme langage de programmation
- **Symfony 7.2** comme framework principal
- **Doctrine ORM** pour la gestion de la base de données
- **API Platform** pour la création d'API REST
- **JWT** pour l'authentification

## 🏗️ Structure du projet backend

```
backend/
├── bin/                # Exécutables console (bin/console)
├── config/             # Configuration de l'application
│   ├── packages/       # Configuration des packages
│   ├── routes.yaml     # Configuration des routes
│   └── services.yaml   # Configuration des services
├── migrations/         # Migrations de base de données
├── public/             # Point d'entrée public (index.php)
├── src/
│   ├── Domain/         # Logique métier par domaine
│   │   ├── Admin/      # Fonctionnalités Admin
│   │   ├── HR/         # Fonctionnalités RH
│   │   ├── Student/    # Fonctionnalités Étudiant
│   │   ├── SuperAdmin/ # Fonctionnalités Super Admin
│   │   ├── Teacher/    # Fonctionnalités Professeur
│   │   └── User/       # Fonctionnalités Utilisateur
│   ├── Controller/     # Contrôleurs publics partagés
│   ├── Entity/         # Entités Doctrine (modèles)
│   ├── Repository/     # Repositories Doctrine
│   ├── Service/        # Services publics partagés
│   └── EventSubscriber/# Event subscribers
├── templates/          # Templates Twig (si utilisés)
├── tests/              # Tests automatisés
├── var/               # Fichiers temporaires (cache, logs)
├── vendor/            # Dépendances installées par Composer
├── .env               # Variables d'environnement
└── composer.json      # Dépendances PHP
```

## 🔄 Organisation des Domaines

### Structure par Domaine

>>>>>>> group1/main
Chaque domaine métier (`Admin`, `HR`, `Student`, etc.) suit une structure similaire :

```
Domain/
└── [DomainName]/
    ├── Controller/    # Contrôleurs spécifiques au domaine
    ├── Entity/        # Entités spécifiques au domaine
    ├── Repository/    # Repositories spécifiques au domaine
    ├── Service/       # Services métier du domaine
    └── DTO/           # Objets de transfert de données
```

### Composants Publics

Les composants publics sont organisés en deux catégories :

1. **Services Publics (`/src/Service/`)** :
   - Services partagés entre domaines
   - Utilitaires communs
   - Services d'infrastructure

2. **Contrôleurs Publics (`/src/Controller/`)** :
   - Points d'entrée API partagés
   - Gestion de l'authentification
   - Routes communes

## 🚀 Démarrage rapide

<<<<<<< HEAD
=======
### Accéder à l'API

L'API backend est accessible à l'adresse:
[http://localhost:8000](http://localhost:8000)

>>>>>>> group1/main
Si vous avez besoin de redémarrer le serveur:

```bash
docker compose -f infra/docker-compose.yml restart backend
```

### Se connecter au conteneur

Pour exécuter des commandes dans le conteneur backend:

```bash
docker exec -it infra-backend-1 bash
```

### Installer des dépendances

```bash
docker exec -it infra-backend-1 composer require <package-name>

# Exemple:
docker exec -it infra-backend-1 composer require symfony/form
```

<<<<<<< HEAD
=======
## 🛠️ Développement avec Symfony

### Utiliser la console Symfony

Symfony fournit un outil en ligne de commande puissant pour diverses tâches:

```bash
# Lister toutes les commandes disponibles
php bin/console list

# Créer un contrôleur
php bin/console make:controller TaskController

# Créer une entité
php bin/console make:entity Task

# Créer un service
php bin/console make:service TaskService
```

### Créer un contrôleur RESTful

Voici un exemple de contrôleur RESTful pour gérer les tâches:

```php
<?php
// src/Controller/TaskController.php

namespace App\Controller;

use App\Entity\Task;
use App\Repository\TaskRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/tasks')]
class TaskController extends AbstractController
{
    private EntityManagerInterface $entityManager;
    private TaskRepository $taskRepository;
    private SerializerInterface $serializer;

    public function __construct(
        EntityManagerInterface $entityManager,
        TaskRepository $taskRepository,
        SerializerInterface $serializer
    ) {
        $this->entityManager = $entityManager;
        $this->taskRepository = $taskRepository;
        $this->serializer = $serializer;
    }

    #[Route('', name: 'get_tasks', methods: ['GET'])]
    public function index(): JsonResponse
    {
        $tasks = $this->taskRepository->findAll();
        $json = $this->serializer->serialize($tasks, 'json', ['groups' => 'task:read']);
        
        return new JsonResponse($json, Response::HTTP_OK, [], true);
    }

    #[Route('/{id}', name: 'get_task', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $task = $this->taskRepository->find($id);
        
        if (!$task) {
            return new JsonResponse(['message' => 'Task not found'], Response::HTTP_NOT_FOUND);
        }
        
        $json = $this->serializer->serialize($task, 'json', ['groups' => 'task:read']);
        
        return new JsonResponse($json, Response::HTTP_OK, [], true);
    }

    #[Route('', name: 'create_task', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        $task = new Task();
        $task->setTitle($data['title']);
        $task->setDescription($data['description'] ?? null);
        $task->setStatus($data['status'] ?? 'pending');
        
        $this->entityManager->persist($task);
        $this->entityManager->flush();
        
        $json = $this->serializer->serialize($task, 'json', ['groups' => 'task:read']);
        
        return new JsonResponse($json, Response::HTTP_CREATED, [], true);
    }

    #[Route('/{id}', name: 'update_task', methods: ['PUT'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $task = $this->taskRepository->find($id);
        
        if (!$task) {
            return new JsonResponse(['message' => 'Task not found'], Response::HTTP_NOT_FOUND);
        }
        
        $data = json_decode($request->getContent(), true);
        
        if (isset($data['title'])) {
            $task->setTitle($data['title']);
        }
        
        if (isset($data['description'])) {
            $task->setDescription($data['description']);
        }
        
        if (isset($data['status'])) {
            $task->setStatus($data['status']);
        }
        
        $this->entityManager->flush();
        
        $json = $this->serializer->serialize($task, 'json', ['groups' => 'task:read']);
        
        return new JsonResponse($json, Response::HTTP_OK, [], true);
    }

    #[Route('/{id}', name: 'delete_task', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $task = $this->taskRepository->find($id);
        
        if (!$task) {
            return new JsonResponse(['message' => 'Task not found'], Response::HTTP_NOT_FOUND);
        }
        
        $this->entityManager->remove($task);
        $this->entityManager->flush();
        
        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }
}
```

### Créer une entité

Voici un exemple d'entité pour représenter une tâche:

```php
<?php
// src/Entity/Task.php

namespace App\Entity;

use App\Repository\TaskRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: TaskRepository::class)]
class Task
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['task:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['task:read'])]
    private ?string $title = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['task:read'])]
    private ?string $description = null;

    #[ORM\Column(length: 20)]
    #[Groups(['task:read'])]
    private ?string $status = 'pending';

    #[ORM\Column]
    #[Groups(['task:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): self
    {
        $this->title = $title;
        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): self
    {
        $this->description = $description;
        return $this;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function setStatus(string $status): self
    {
        $this->status = $status;
        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): self
    {
        $this->createdAt = $createdAt;
        return $this;
    }
}
```

### Gérer la sérialisation avec les groupes

Pour contrôler quelles propriétés sont exposées dans l'API:

1. Ajouter des groupes de sérialisation dans les entités (comme montré ci-dessus)
2. Spécifier les groupes lors de la sérialisation dans le contrôleur

### Créer des services

Les services sont utilisés pour encapsuler la logique métier:

```php
<?php
// src/Service/TaskService.php

namespace App\Service;

use App\Entity\Task;
use App\Repository\TaskRepository;
use Doctrine\ORM\EntityManagerInterface;

class TaskService
{
    private EntityManagerInterface $entityManager;
    private TaskRepository $taskRepository;

    public function __construct(
        EntityManagerInterface $entityManager,
        TaskRepository $taskRepository
    ) {
        $this->entityManager = $entityManager;
        $this->taskRepository = $taskRepository;
    }

    public function getAllTasks(): array
    {
        return $this->taskRepository->findAll();
    }

    public function getTaskById(int $id): ?Task
    {
        return $this->taskRepository->find($id);
    }

    public function createTask(array $data): Task
    {
        $task = new Task();
        $task->setTitle($data['title']);
        $task->setDescription($data['description'] ?? null);
        $task->setStatus($data['status'] ?? 'pending');
        
        $this->entityManager->persist($task);
        $this->entityManager->flush();
        
        return $task;
    }

    public function updateTask(Task $task, array $data): Task
    {
        if (isset($data['title'])) {
            $task->setTitle($data['title']);
        }
        
        if (isset($data['description'])) {
            $task->setDescription($data['description']);
        }
        
        if (isset($data['status'])) {
            $task->setStatus($data['status']);
        }
        
        $this->entityManager->flush();
        
        return $task;
    }

    public function deleteTask(Task $task): void
    {
        $this->entityManager->remove($task);
        $this->entityManager->flush();
    }
}
```
>>>>>>> group1/main

## 🔒 Sécurité et authentification

### Configurer l'authentification JWT

1. Installer le bundle JWT:

```bash
docker exec -it infra-backend-1 composer require lexik/jwt-authentication-bundle
```

2. Générer les clés SSL:

```bash
docker exec -it infra-backend-1 php bin/console lexik:jwt:generate-keypair
```

<<<<<<< HEAD
=======
3. Configurer le firewall dans `config/packages/security.yaml`:

```yaml
security:
    password_hashers:
        App\Entity\User: 'auto'

    providers:
        app_user_provider:
            entity:
                class: App\Entity\User
                property: email

    firewalls:
        dev:
            pattern: ^/(_(profiler|wdt)|css|images|js)/
            security: false
        login:
            pattern: ^/api/login
            stateless: true
            json_login:
                check_path: /api/login_check
                success_handler: lexik_jwt_authentication.handler.authentication_success
                failure_handler: lexik_jwt_authentication.handler.authentication_failure
        api:
            pattern: ^/api
            stateless: true
            jwt: ~

    access_control:
        - { path: ^/api/login, roles: PUBLIC_ACCESS }
        - { path: ^/api, roles: IS_AUTHENTICATED_FULLY }
```

4. Créer une entité User:

```bash
docker exec -it infra-backend-1 php bin/console make:user
```
>>>>>>> group1/main

### Valider les données entrantes

Pour valider les données dans les requêtes:

1. Installer le composant Validator:

```bash
docker exec -it infra-backend-1 composer require symfony/validator
```

<<<<<<< HEAD


// tests/Service/TaskServiceTest.php

=======
2. Créer une classe DTO (Data Transfer Object):

```php
<?php
// src/DTO/TaskInput.php

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;

class TaskInput
{
    #[Assert\NotBlank]
    #[Assert\Length(min: 3, max: 255)]
    public string $title;

    #[Assert\Length(max: 1000)]
    public ?string $description = null;

    #[Assert\Choice(choices: ['pending', 'in_progress', 'completed'])]
    public string $status = 'pending';
}
```

3. Utiliser le DTO dans le contrôleur:

```php
#[Route('', name: 'create_task', methods: ['POST'])]
public function create(Request $request, ValidatorInterface $validator): JsonResponse
{
    $data = json_decode($request->getContent(), true);
    
    $taskInput = new TaskInput();
    $taskInput->title = $data['title'] ?? '';
    $taskInput->description = $data['description'] ?? null;
    $taskInput->status = $data['status'] ?? 'pending';
    
    $errors = $validator->validate($taskInput);
    
    if (count($errors) > 0) {
        $errorMessages = [];
        foreach ($errors as $error) {
            $errorMessages[$error->getPropertyPath()] = $error->getMessage();
        }
        return new JsonResponse(['errors' => $errorMessages], Response::HTTP_BAD_REQUEST);
    }
    
    // Créer la tâche à partir du DTO validé
    $task = new Task();
    $task->setTitle($taskInput->title);
    $task->setDescription($taskInput->description);
    $task->setStatus($taskInput->status);
    
    $this->entityManager->persist($task);
    $this->entityManager->flush();
    
    $json = $this->serializer->serialize($task, 'json', ['groups' => 'task:read']);
    
    return new JsonResponse($json, Response::HTTP_CREATED, [], true);
}
```

## 📝 Tests

### Écrire des tests unitaires

```php
<?php
// tests/Service/TaskServiceTest.php

namespace App\Tests\Service;

use App\Entity\Task;
use App\Repository\TaskRepository;
use App\Service\TaskService;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\TestCase;

class TaskServiceTest extends TestCase
{
    private $entityManager;
    private $taskRepository;
    private $taskService;

    protected function setUp(): void
    {
        $this->entityManager = $this->createMock(EntityManagerInterface::class);
        $this->taskRepository = $this->createMock(TaskRepository::class);
        $this->taskService = new TaskService($this->entityManager, $this->taskRepository);
    }

    public function testGetAllTasks(): void
    {
        $task1 = new Task();
        $task1->setTitle('Task 1');
        
        $task2 = new Task();
        $task2->setTitle('Task 2');
        
        $expectedTasks = [$task1, $task2];
        
        $this->taskRepository->expects($this->once())
            ->method('findAll')
            ->willReturn($expectedTasks);
        
        $result = $this->taskService->getAllTasks();
        
        $this->assertSame($expectedTasks, $result);
    }

    // Plus de tests...
}
>>>>>>> group1/main
```

### Exécuter les tests

```bash
docker exec -it infra-backend-1 php bin/phpunit
```

## 🐞 Résolution des problèmes courants

### Erreur "Class not found"

Probablement un problème d'autoloading. Essayez:

```bash
docker exec -it infra-backend-1 composer dump-autoload
```

### Vider le cache :

```bash
<<<<<<< HEAD
docker exec -it infra-backend-1 php bin/console cache:clear
```
Ou bien :

```bash
docker exec -it infra-backend-1 php bin/console cache:pool:clear cache.global_clearer
=======
docker exec -it infra-backend-1 bash 
php bin/console cache:clear
>>>>>>> group1/main
```

### Erreur d'annotation/attribut

Assurez-vous d'utiliser la bonne syntaxe pour Symfony 7 (attributs PHP 8 au lieu des annotations).

<<<<<<< HEAD
=======
### Erreur de CORS

Si vous avez des erreurs CORS lorsque vous appelez l'API depuis le frontend:

```bash
docker exec -it infra-backend-1 composer require nelmio/cors-bundle
```

Puis configurez le bundle dans `config/packages/nelmio_cors.yaml`:

```yaml
nelmio_cors:
    defaults:
        origin_regex: true
        allow_origin: ['%env(CORS_ALLOW_ORIGIN)%']
        allow_methods: ['GET', 'OPTIONS', 'POST', 'PUT', 'PATCH', 'DELETE']
        allow_headers: ['Content-Type', 'Authorization']
        expose_headers: ['Link']
        max_age: 3600
    paths:
        '^/api/':
            allow_origin: ['http://localhost:5173']
            allow_headers: ['X-Custom-Auth']
            allow_methods: ['POST', 'PUT', 'GET', 'DELETE']
            max_age: 3600
```

>>>>>>> group1/main
## 📚 Ressources utiles

- [Documentation Symfony](https://symfony.com/doc/current/index.html)
- [Documentation Doctrine](https://www.doctrine-project.org/projects/doctrine-orm/en/2.10/index.html)
- [Documentation API Platform](https://api-platform.com/docs/) (si utilisé)
- [Documentation JWT Authentication](https://github.com/lexik/LexikJWTAuthenticationBundle)
- [Symfony Best Practices](https://symfony.com/doc/current/best_practices.html)
- [Symfony Maker Bundle](https://symfony.com/bundles/SymfonyMakerBundle/current/index.html) 