import { notificationService } from '@/lib/services/notificationService';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/services/firebase';
import { fetchUsers } from '@/pages/Global/UsersList/services/usersListService';
import { ROLES } from '@/features/roles/roleContext';

/**
 * Crée une notification d'inscription à une formation (Firestore + cache local)
 * @param {Object} params - { formationName, formationId, userId }
 * @param {boolean} forceCreate - Forcer la création même si le backend gère ce type
 */
export const formationNotifications = {
  requested: async ({ formationName, formationId, userId }, forceCreate = true) => {
    try {
      console.log('[formationNotifications.requested] Début', { formationName, formationId, userId });
      // Récupérer l'id utilisateur
      let recipientId = userId || localStorage.getItem('userId') || localStorage.getItem('user_id');
      if (!recipientId) {
        try {
          const userString = localStorage.getItem('user');
          if (userString) {
            const userObj = JSON.parse(userString);
            if (userObj && userObj.id) recipientId = userObj.id;
          }
        } catch (e) {
          console.warn('[formationNotifications.requested] Erreur parsing user localStorage', e);
        }
      }
      if (!recipientId) {
        console.warn('[formationNotifications.requested] Pas de recipientId');
        return;
      }
      recipientId = String(recipientId);
      console.log('[formationNotifications.requested] recipientId:', recipientId);

      // Vérifier les préférences de notification
      let preferences = {};
      try {
        const preferencesRef = doc(db, 'notificationPreferences', recipientId);
        const preferencesSnap = await getDoc(preferencesRef);
        preferences = preferencesSnap.data() || {};
        console.log('[formationNotifications.requested] Préférences récupérées:', preferences);
        if (preferences['INFO'] === false) {
          // L'utilisateur a désactivé ce type de notification
          console.log('[formationNotifications.requested] Notification INFO désactivée, on arrête');
          return;
        }
      } catch (e) {
        console.warn('[formationNotifications.requested] Erreur récupération préférences', e);
        // Si erreur, on continue quand même
      }

      // Créer la notification dans Firestore
      const now = new Date();
      const notificationData = {
        recipientId,
        title: "Demande d'inscription envoyée",
        message: `Votre demande pour rejoindre la formation ${formationName} a bien été prise en compte.`,
        type: 'INFO',
        targetUrl: '/formations',
        timestamp: now,
        read: false
      };
      console.log('[formationNotifications.requested] Ajout Firestore:', notificationData);
      await addDoc(collection(db, 'notifications'), notificationData);
      console.log('[formationNotifications.requested] Notification ajoutée à Firestore');

      // Ajouter dans le cache local (notificationService)
      const newNotification = {
        id: `local-${now.getTime()}`,
        ...notificationData,
        createdAt: now.toISOString()
      };
      if (notificationService.cache.notifications && notificationService.cache.notifications.notifications) {
        notificationService.cache.notifications.notifications.unshift(newNotification);
        notificationService.cache.unreadCount = (notificationService.cache.unreadCount || 0) + 1;
        if (notificationService.cache.notifications.pagination) {
          notificationService.cache.notifications.pagination.total += 1;
        }
        notificationService.notifySubscribers();
        setTimeout(() => {
          notificationService.getNotifications(1, 10, true, true)
            .then(() => notificationService.getUnreadCount(true))
            .catch(console.error);
        }, 300);
        console.log('[formationNotifications.requested] Notification ajoutée au cache local');
      } else {
        console.warn('[formationNotifications.requested] Cache local notificationService non initialisé');
      }
    } catch (error) {
      console.error('[formationNotifications.requested] Error:', error);
    }
  },
  /**
   * Notifie le recruteur lorsqu'un guest fait une demande d'inscription à une formation
   * @param {Object} params - { formationName, guestId }
   */
  guestApplication: async ({ formationName, guestId }) => {
    try {
      // Récupérer tous les utilisateurs
      const users = await fetchUsers();
      // Filtrer les recruteurs côté JS avec la logique de roleContext
      const recruiters = users.filter(user => {
        if (!user.roles) return false;
        return user.roles.some(r => {
          if (typeof r === 'object' && r.name) r = r.name;
          if (typeof r !== 'string') return false;
          // Vérifie les variantes avec ou sans ROLE_ et insensible à la casse
          const roleNorm = r.toUpperCase().replace('ROLE_', '');
          const targetNorm = ROLES.RECRUITER.toUpperCase().replace('ROLE_', '');
          return roleNorm === targetNorm;
        });
      });
      if (!Array.isArray(recruiters) || recruiters.length === 0) {
        console.warn('[formationNotifications.guestApplication] Aucun recruteur trouvé');
        return;
      }
      for (const recruiter of recruiters) {
        const recruiterId = recruiter.id;
        // Vérifier la préférence du recruteur
        let preferences = {};
        try {
          const preferencesRef = doc(db, 'notificationPreferences', recruiterId);
          const preferencesSnap = await getDoc(preferencesRef);
          preferences = preferencesSnap.data() || {};
          if (preferences['GUEST_APPLICATION'] === false) {
            console.log(`[formationNotifications.guestApplication] Notification GUEST_APPLICATION désactivée pour recruiterId ${recruiterId}, on skip`);
            continue;
          }
        } catch (e) {
          console.warn(`[formationNotifications.guestApplication] Erreur récupération préférences pour recruiterId ${recruiterId}`, e);
          // Si erreur, on continue quand même
        }
        // Créer la notification dans Firestore
        const now = new Date();
        const notificationData = {
          recipientId: recruiterId,
          title: "Nouvelle demande d'inscription invité",
          message: `Un invité a demandé à rejoindre la formation ${formationName}.`,
          type: 'GUEST_APPLICATION',
          targetUrl: '/formations',
          timestamp: now,
          read: false,
          guestId: guestId || null
        };
        await addDoc(collection(db, 'notifications'), notificationData);
        console.log('[formationNotifications.guestApplication] Notification envoyée au recruteur', recruiterId);
      }
    } catch (error) {
      console.error('[formationNotifications.guestApplication] Error:', error);
    }
  }
}; 