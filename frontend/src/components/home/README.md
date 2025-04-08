# Home Components Documentation

Ce dossier contient les composants utilisés dans la page d'accueil et les fonctionnalités de découverte de formations de l'application Intra-Bigjob.

## Composants Principaux

### 1. TechStackShowcase (Jeu de Mémoire)

Un jeu de mémoire interactif où les utilisateurs doivent associer des paires de cartes représentant différentes technologies de notre stack technique. Après avoir trouvé une paire, l'utilisateur reçoit une question sur la technologie pour renforcer l'apprentissage.

**Caractéristiques:**
- 9 paires de technologies à découvrir
- Questions interactives après chaque correspondance
- Animations fluides pour une expérience utilisateur engageante
- Système de score et de suivi de progression

**Technologies représentées:**
- JavaScript, React, HTML, CSS, PHP, Symfony, MySQL, Docker, Tailwind

### 2. TinDev (Swipe pour Trouver sa Formation)

Inspiré des applications de rencontres, TinDev permet aux utilisateurs de "swiper" sur des questions concernant leurs préférences technologiques pour découvrir les formations qui leur correspondent le mieux.

**Caractéristiques:**
- Interface de swipe intuitive (gauche pour "Non", droite pour "Oui")
- Questions personnalisées sur les préférences de développement
- Algorithme de correspondance qui analyse les réponses
- Recommandations de formations personnalisées
- Système de badges et de récompenses

**Fonctionnement:**
1. L'utilisateur répond à des questions comme "Aimez-vous créer des interfaces visuelles attrayantes?"
2. Chaque swipe à droite (Oui) augmente le score de correspondance avec certaines formations
3. À la fin, l'utilisateur reçoit des recommandations de formations avec un pourcentage de correspondance

### 3. CosmicBackground

Un arrière-plan animé avec des éléments cosmiques qui crée une atmosphère immersive pour l'application.

**Caractéristiques:**
- Animations fluides de particules
- Effets de profondeur et de parallaxe
- Optimisé pour les performances

### 4. Computer3D & Planet3D

Modèles 3D interactifs qui ajoutent une dimension visuelle à l'interface utilisateur.

**Caractéristiques:**
- Rendu 3D optimisé avec Three.js
- Animations réactives aux interactions utilisateur
- Intégration fluide avec l'interface utilisateur

## Structure de Navigation

La découverte des formations est maintenant organisée comme suit:

1. **Page d'accueil (Home)**: Présente un aperçu de la plateforme avec un bouton "Découvrir ma formation idéale" qui dirige vers la page des jeux.

2. **Page des Jeux (Games)**: Permet aux utilisateurs de choisir entre:
   - **MY TECHSTACK**: Jeu de mémoire pour découvrir les technologies
   - **TINDEV**: Swipe pour trouver la formation idéale

## Implémentation Technique

- Utilisation de React 19.0.0 et React Router DOM 6.29.0
- Animations avec Framer Motion
- Styles avec Tailwind CSS 3.4.17
- Rendu conditionnel pour afficher le jeu sélectionné
- Gestion d'état avec useState et useCallback pour une performance optimale

## Objectif Pédagogique

Ces composants ont été conçus pour:
1. Rendre l'apprentissage des technologies plus engageant
2. Aider les utilisateurs à découvrir les formations qui correspondent à leurs intérêts
3. Présenter notre stack technique de manière interactive
4. Créer une expérience utilisateur mémorable et immersive

## Maintenance et Évolution

Pour ajouter de nouvelles technologies ou formations:
- Dans TechStackShowcase: Modifier le tableau `techStack` 
- Dans TinDev: Ajouter des questions dans le tableau `questions` et des formations dans `courses`

---

Développé par l'équipe Intra-Bigjob Group 1 - 2025
