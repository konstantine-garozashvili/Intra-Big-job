# Centre Formation - Système de Gestion Scolaire

![Logo du Centre Formation](images/laplateforme.png)

Un système de gestion scolaire moderne inspiré de Pronote, permettant la gestion des accès et des utilisateurs dans un établissement scolaire comme la Plateforme.

## 🚀 Fonctionnalités Principales

### Système d'Authentification Multi-Profils

Le système permet une connexion sécurisée pour différents types d'utilisateurs :

- **Administrateurs** : Gestion complète du système
- **Formateurs** : Accès aux fonctionnalités pédagogiques
- **Étudiants** : Consultation de leur espace personnel en fonction de leur classe et de leur niveau
- **Invité** : Visite du site sans connexion ou presque

### Sécurité

- Authentification sécurisée avec une dépendance de base de Symphony
- Protection contre les attaques par force brute
- Gestion des sessions utilisateurs
- Cryptage des mots de passe
- Double authentification disponible (2FA)

### Interface de Connexion

- Interface intuitive et responsive
- Récupération de mot de passe
- Première connexion avec changement obligatoire du mot de passe
- Déconnexion automatique après période d'inactivité

## 🛠 Technologies Utilisées

- Frontend : React.js
- Backend : Symfony
- Base de données : SQLite
- Sécurité : JWT, Bcrypt

## 📋 Prérequis

- Symfony >= 7.x
- SQLite
- Composer

## 🚀 Installation

1. Cloner le repository

```bash
git clone https://github.com/username/centre-formation.git
```

2. Installer les dépendances

```bash
composer install
```

3. Configurer la base de données

```bash
php bin/console doctrine:database:create
```

4. Lancer le serveur

```bash
php bin/console server:start
```
