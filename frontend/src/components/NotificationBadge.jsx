import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '@/lib/services/notificationService';
import { cn } from '@/lib/utils';

/**
 * Badge affichant le nombre de notifications non lues
 */
const NotificationBadge = ({ className, limit = 99, onClick }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Charger le compteur initial
    notificationService.getUnreadCount()
      .then(count => setUnreadCount(count))
      .catch(error => console.error('Error loading notification count:', error));

    // S'abonner aux mises à jour
    const unsubscribe = notificationService.subscribe(data => {
      setUnreadCount(data.unreadCount);
    });

    // Démarrer le polling
    notificationService.startPolling();

    // Nettoyer à la désinscription
    return () => {
      unsubscribe();
    };
  }, []);

  const handleClick = (e) => {
    e.stopPropagation(); // Empêcher la propagation du clic au parent
    if (onClick) {
      onClick(e);
    } else {
      // Si aucun gestionnaire de clic n'est fourni, naviguer vers la page des notifications
      navigate('/notifications');
    }
  };

  if (unreadCount === 0) {
    return null;
  }

  const displayCount = unreadCount > limit ? `${limit}+` : unreadCount;

  return (
    <div
      className={cn(
        "absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white cursor-pointer hover:bg-red-600 transition-colors duration-200",
        className
      )}
      aria-label={`${unreadCount} notifications non lues`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick(e)}
    >
      {displayCount}
    </div>
  );
};

export default NotificationBadge; 