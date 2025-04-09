import { useState, useEffect } from 'react';
import { Bell, Mail, MessageSquare, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ProfileSettingsSkeleton from '../components/ProfileSettingsSkeleton';
import PropTypes from 'prop-types';

/**
 * Composant représentant un interrupteur de notification
 * @param {Object} props - Les propriétés du composant
 * @returns {JSX.Element} - Le composant d'interrupteur
 */
function NotificationSwitch({ category, setting, label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between space-y-2">
      <div className="space-y-0.5">
        <Label htmlFor={`${category}-${setting}`}>{label}</Label>
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      </div>
      <Switch
        id={`${category}-${setting}`}
        checked={checked}
        onCheckedChange={onChange}
      />
    </div>
  );
}

NotificationSwitch.propTypes = {
  category: PropTypes.string.isRequired,
  setting: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired
};

/**
 * Page de paramètres des notifications
 * @returns {JSX.Element} - La page de paramètres des notifications
 */
export default function NotificationSettings() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [savingChanges, setSavingChanges] = useState(false);

  useEffect(() => {
    const loadNotificationSettings = async () => {
      setLoading(true);
      try {
        // Mock data - added the 'schedule' category
        setSettings({
          email: {
            newDocuments: true,
            loginAlerts: true,
            announcements: false,
            courseUpdates: true
          },
          app: {
            newMessages: true,
            eventReminders: true,
            systemUpdates: false
          },
          schedule: {
            daily: false,
            weekly: true,
            immediate: true
          }
        });
      } catch {
        toast.error('Erreur lors du chargement des paramètres');
      } finally {
        setLoading(false);
      }
    };

    loadNotificationSettings();
  }, []);

  const handleToggleChange = (category, setting) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !prev[category][setting]
      }
    }));
  };

  const saveChanges = async () => {
    setSavingChanges(true);
    try {
      // Simuler une requête d'API pour enregistrer les paramètres
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Paramètres de notification mis à jour');
    } catch {
      toast.error('Erreur lors de la mise à jour des paramètres');
    } finally {
      setSavingChanges(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 bg-white p-6 rounded-lg shadow">
        <ProfileSettingsSkeleton type="notifications" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Bell className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Notifications</h1>
      </div>

      <Alert>
        <Bell className="h-4 w-4" />
        <AlertTitle>Gérez vos notifications</AlertTitle>
        <AlertDescription>
          Personnalisez la façon dont vous souhaitez être informé des activités importantes.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6">
        {/* Email Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              <CardTitle>Notifications par email</CardTitle>
            </div>
            <CardDescription>
              Gérez les emails que vous recevez de notre part.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <NotificationSwitch
              category="email"
              setting="newDocuments"
              label="Nouveaux documents"
              description="Recevez des notifications pour les nouveaux documents."
              checked={settings.email.newDocuments}
              onChange={() => handleToggleChange('email', 'newDocuments')}
            />
            <Separator />
            <NotificationSwitch
              category="email"
              setting="loginAlerts"
              label="Alertes de connexion"
              description="Recevez des notifications pour les alertes de connexion."
              checked={settings.email.loginAlerts}
              onChange={() => handleToggleChange('email', 'loginAlerts')}
            />
            <Separator />
            <NotificationSwitch
              category="email"
              setting="announcements"
              label="Annonces"
              description="Recevez des notifications pour les annonces importantes."
              checked={settings.email.announcements}
              onChange={() => handleToggleChange('email', 'announcements')}
            />
            <Separator />
            <NotificationSwitch
              category="email"
              setting="courseUpdates"
              label="Mises à jour de cours"
              description="Recevez des notifications pour les mises à jour de cours."
              checked={settings.email.courseUpdates}
              onChange={() => handleToggleChange('email', 'courseUpdates')}
            />
          </CardContent>
        </Card>

        {/* Push Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <CardTitle>Notifications push</CardTitle>
            </div>
            <CardDescription>
              Configurez les notifications instantanées sur votre appareil.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <NotificationSwitch
              category="app"
              setting="newMessages"
              label="Nouveaux messages"
              description="Recevez des notifications pour les nouveaux messages."
              checked={settings.app.newMessages}
              onChange={() => handleToggleChange('app', 'newMessages')}
            />
            <Separator />
            <NotificationSwitch
              category="app"
              setting="eventReminders"
              label="Rappels d&apos;événement"
              description="Recevez des notifications pour les rappels d&apos;événement."
              checked={settings.app.eventReminders}
              onChange={() => handleToggleChange('app', 'eventReminders')}
            />
            <Separator />
            <NotificationSwitch
              category="app"
              setting="systemUpdates"
              label="Mises à jour du système"
              description="Recevez des notifications pour les mises à jour du système."
              checked={settings.app.systemUpdates}
              onChange={() => handleToggleChange('app', 'systemUpdates')}
            />
          </CardContent>
        </Card>

        {/* Schedule Preferences */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <CardTitle>Préférences de planning</CardTitle>
            </div>
            <CardDescription>
              Définissez quand vous souhaitez recevoir les notifications.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <NotificationSwitch
              category="schedule"
              setting="daily"
              label="Résumé quotidien"
              description="Recevez un résumé quotidien de vos notifications."
              checked={settings.schedule.daily}
              onChange={() => handleToggleChange('schedule', 'daily')}
            />
            <Separator />
            <NotificationSwitch
              category="schedule"
              setting="weekly"
              label="Résumé hebdomadaire"
              description="Recevez un résumé hebdomadaire de vos activités."
              checked={settings.schedule.weekly}
              onChange={() => handleToggleChange('schedule', 'weekly')}
            />
            <Separator />
            <NotificationSwitch
              category="schedule"
              setting="immediate"
              label="Notifications immédiates"
              description="Recevez les notifications en temps réel."
              checked={settings.schedule.immediate}
              onChange={() => handleToggleChange('schedule', 'immediate')}
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          onClick={() => toast.success('Paramètres réinitialisés aux valeurs par défaut')}
          disabled={savingChanges}
        >
          Réinitialiser les paramètres
        </Button>
        <Button 
          onClick={saveChanges} 
          disabled={savingChanges}
        >
          {savingChanges ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </Button>
      </div>
    </div>
  );
} 