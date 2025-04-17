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
  "INFO"                    // Type optionnel
);
```

## Structure de base

Les notifications sont stockées dans la collection `notifications` de la base de donnée firebase une structure comme celle ci :

```javascript
{
  recipientId: "ID_UTILISATEUR",    // ID de l'utilisateur destinataire
  title: "Titre",                   // Titre de la notification
  message: "Message",               // Contenu de la notification
  timestamp: new Date(),            // Date de création
  read: false,                      // État de lecture
  type: "INFO"                      // Type de notification (optionnel)
}
```


## Fonctionnalités disponibles

Le hook `useNotifications` fournit :
- `notifications`: Liste des notifications
- `loading`: État de chargement
- `unreadCount`: Nombre de notifications non lues
- `markAsRead`: Marquer une notification comme lue
- `markAllAsRead`: Marquer toutes les notifications comme lues
- `createNotification`: Créer une nouvelle notification

## Exemple d'utilisation


Voici un exemple :
```javascript
const { notifications, markAsRead } = useNotifications();

// Marquer une notification comme lue
await markAsRead(notificationId);

// Afficher le nombre de notifications non lues
const unreadCount = notifications.filter(n => !n.read).length;
```

Les notifications s'actualisent automatiquement grâce à l'écouteur Firestore. 