# Guide Backend pour le Projet BigProject

## 📖 Vue d'ensemble

Ce guide vous aidera à comprendre et à travailler efficacement avec la partie backend du projet BigProject, qui est basée sur Symfony 7.

## 🏗️ Structure du projet backend

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


### Valider les données entrantes

Pour valider les données dans les requêtes:

1. Installer le composant Validator:

```bash
docker exec -it infra-backend-1 composer require symfony/validator
```



// tests/Service/TaskServiceTest.php

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
docker exec -it infra-backend-1 php bin/console cache:clear
```

### Erreur d'annotation/attribut

Assurez-vous d'utiliser la bonne syntaxe pour Symfony 7 (attributs PHP 8 au lieu des annotations).

## 📚 Ressources utiles

- [Documentation Symfony](https://symfony.com/doc/current/index.html)
- [Documentation Doctrine](https://www.doctrine-project.org/projects/doctrine-orm/en/2.10/index.html)
- [Documentation API Platform](https://api-platform.com/docs/) (si utilisé)
- [Documentation JWT Authentication](https://github.com/lexik/LexikJWTAuthenticationBundle)
- [Symfony Best Practices](https://symfony.com/doc/current/best_practices.html)
- [Symfony Maker Bundle](https://symfony.com/bundles/SymfonyMakerBundle/current/index.html) 