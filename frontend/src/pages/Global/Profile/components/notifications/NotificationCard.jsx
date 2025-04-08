import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Calendar, Clock, MailCheck, UserCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import PropTypes from "prop-types";

/**
 * Composant d'affichage d'une notification
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {Object} props.notification - Données de la notification
 * @param {Function} props.onMarkAsRead - Fonction appelée pour marquer comme lue
 * @param {Function} props.onDelete - Fonction appelée pour supprimer
 * @returns {JSX.Element} - Composant de notification
 */
export function NotificationCard({ notification, onMarkAsRead, onDelete }) {
  // Déterminer l'icône en fonction du type de notification
  const getIcon = () => {
    switch (notification.type) {
      case "message":
        return <MailCheck className="h-5 w-5" />;
      case "event":
        return <Calendar className="h-5 w-5" />;
      case "user":
        return <UserCheck className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  // Formater la date relative (il y a X temps)
  const getRelativeTime = (date) => {
    try {
      return formatDistanceToNow(new Date(date), {
        addSuffix: true,
        locale: fr,
      });
    } catch {
      return "Date inconnue";
    }
  };

  // Déterminer la couleur de l'icône et du badge en fonction du type
  const getTypeStyles = () => {
    switch (notification.type) {
      case "message":
        return {
          iconClass: "bg-blue-100 text-blue-600",
          badgeClass: "bg-blue-50 text-blue-600 hover:bg-blue-100",
          badgeText: "Message",
        };
      case "event":
        return {
          iconClass: "bg-purple-100 text-purple-600",
          badgeClass: "bg-purple-50 text-purple-600 hover:bg-purple-100",
          badgeText: "Événement",
        };
      case "user":
        return {
          iconClass: "bg-green-100 text-green-600",
          badgeClass: "bg-green-50 text-green-600 hover:bg-green-100",
          badgeText: "Utilisateur",
        };
      default:
        return {
          iconClass: "bg-gray-100 text-gray-600",
          badgeClass: "bg-gray-50 text-gray-600 hover:bg-gray-100",
          badgeText: "Système",
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <Card className={`mb-3 ${notification.read ? "bg-gray-50" : "bg-white"}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Icône de la notification */}
          <div className={`mt-1 rounded-full p-2 ${styles.iconClass}`}>
            {getIcon()}
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                {/* Titre de la notification */}
                <h3 className={`font-medium ${notification.read ? "text-gray-600" : "text-gray-900"}`}>
                  {notification.title}
                </h3>

                {/* Message de la notification */}
                <p className="mt-1 text-sm text-gray-500">
                  {notification.message}
                </p>

                {/* Date de la notification */}
                <div className="mt-2 flex items-center text-xs text-gray-400">
                  <Clock className="mr-1 h-3 w-3" />
                  {getRelativeTime(notification.date)}
                </div>
              </div>

              {/* Badge de type de notification */}
              <Badge variant="outline" className={styles.badgeClass}>
                {styles.badgeText}
              </Badge>
            </div>

            {/* Actions sur la notification */}
            <div className="mt-3 flex justify-end gap-2">
              {!notification.read && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-xs"
                  onClick={() => onMarkAsRead(notification.id)}
                >
                  Marquer comme lu
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="h-8 text-xs text-red-500 hover:bg-red-50 hover:text-red-600"
                onClick={() => onDelete(notification.id)}
              >
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

NotificationCard.propTypes = {
  notification: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    type: PropTypes.oneOf(["message", "event", "user", "system"]),
    date: PropTypes.string.isRequired,
    read: PropTypes.bool
  }).isRequired,
  onMarkAsRead: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
}; 