# Configuration des Notifications Firebase

## Comment créer une notification

```javascript
// Importer le hook
import { useNotifications } from '@/lib/hooks/useNotifications';

// Utiliser la fonction createNotification
const { createNotification } = useNotifications();

// Créer une notification
await createNotification(
  userId,                    // ID du destinataire
  "Titre de la notification",
  "Message de la notification",
  "INFO"                    // Type de notification (voir types disponibles ci-dessous)
);
```

## Structure de base

Les notifications sont stockées dans la collection `notifications` de la base de donnée firebase avec une structure comme celle-ci :

```javascript
{
  recipientId: "ID_UTILISATEUR",    // ID de l'utilisateur destinataire
  title: "Titre",                   // Titre de la notification
  message: "Message",               // Contenu de la notification
  timestamp: new Date(),            // Date de création
  read: false,                      // État de lecture
  type: "INFO",                     // Type de notification
  targetUrl: "/some/path"          // URL de redirection (optionnel)
}
```

## Types de notifications disponibles

Les types de notifications supportés sont :
- `ROLE_UPDATE` : Notification de changement de rôle
- `SYSTEM` : Notifications système
- `INFO` : Informations générales
- `WARNING` : Avertissements
- `ALERT` : Alertes importantes
- `DOCUMENT_APPROVED` : Document approuvé
- `DOCUMENT_REJECTED` : Document rejeté
- `DOCUMENT_UPLOADED` : Nouveau document téléchargé

## Fonctionnalités disponibles

Le hook `useNotifications` fournit :
- `notifications`: Liste des notifications
- `loading`: État de chargement
- `unreadCount`: Nombre de notifications non lues
- `markAsRead`: Marquer une notification comme lue
- `markAllAsRead`: Marquer toutes les notifications comme lues
- `createNotification`: Créer une nouvelle notification

## Exemple d'utilisation

```javascript
const { notifications, markAsRead, unreadCount, markAllAsRead } = useNotifications();

// Marquer une notification comme lue
await markAsRead(notificationId);

// Marquer toutes les notifications comme lues
await markAllAsRead();

// Afficher le nombre de notifications non lues
console.log(`Vous avez ${unreadCount} notifications non lues`);
```

Les notifications s'actualisent automatiquement grâce à l'écouteur Firestore. 

# Accès à l'api

## Identifiants Google : 

email : bigprojectcdpi@gmail.com
mot de passe : Bigproject123@

Une fois connecté avec les identifiants, vous pouvez accéder à la base de donnée avec ce lien :

https://console.firebase.google.com/u/4/project/bigproject-d6daf/firestore/databases/-default-/data/~2FnotificationPreferences

# Les taches à faire

## Ce qui est déjà mis en place : 

- Notification pour l'utilisateur à qui on a changé le rôle avec activation/désactivation dans les settings
- Interface utilisateur moderne avec animations et badges
- Système de filtrage par type de notification
- Gestion des notifications non lues
- Accès rapide aux paramètres de notifications
- Modification de la notification de changement de rôle pour afficher : "Vous êtes maintenant étudiant/recruter/formateur" etc...

## Ce qu'il reste à faire :

- Notif quand il faut signer (matin et aprem)
- Notif quand l'admin modifie nos infos personnelles (Vos informations ont été mises à jour)
- Faire fonctionner les paramètres de notifs pour chacune de ces options (Activer/Désactiver)
- Faire fonctionner le système de tri pour chacune de ces options (Sur la page NotificationsPage)