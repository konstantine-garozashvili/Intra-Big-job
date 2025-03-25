import React, { useState, useEffect } from 'react';
import { Bell, Mail, MessageSquare, Calendar, Clock, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { authService } from '@/lib/services/authService';
import ProfileSettingsSkeleton from '../components/ProfileSettingsSkeleton';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationSettings = () => {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [savingChanges, setSavingChanges] = useState(false);
  const [lastToggled, setLastToggled] = useState(null);

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
      } catch (error) {
        toast.error('Erreur lors du chargement des paramètres');
      } finally {
        setLoading(false);
      }
    };

    loadNotificationSettings();
  }, []);

  const handleToggleChange = (category, setting) => {
    setLastToggled({ category, setting });
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !prev[category][setting]
      }
    }));

    // Réinitialiser lastToggled après l'animation
    setTimeout(() => {
      setLastToggled(null);
    }, 1000);
  };

  const saveChanges = async () => {
    setSavingChanges(true);
    try {
      toast.success('Paramètres de notification mis à jour');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour des paramètres');
    } finally {
      setSavingChanges(false);
    }
  };

  const NotificationSwitch = ({ category, setting, label, description }) => {
    const isToggled = settings[category][setting];
    const isLastToggled = lastToggled && lastToggled.category === category && lastToggled.setting === setting;
    
    return (
      <div className={`flex items-center justify-between p-2 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${isLastToggled ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}`}>
        <div className="space-y-0.5 flex-1 mr-4">
          <Label 
            htmlFor={`${category}-${setting}`} 
            className="text-gray-900 dark:text-gray-100 font-medium cursor-pointer"
          >
            {label}
          </Label>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>
        <div className="flex items-center">
          <Switch
            id={`${category}-${setting}`}
            checked={isToggled}
            onCheckedChange={() => handleToggleChange(category, setting)}
            className={`${isToggled ? 'dark:bg-blue-500' : 'dark:bg-gray-600'} transition-all duration-200`}
          />
          <div className="ml-2 w-16 text-right relative h-5">
            <AnimatePresence mode="wait">
              <motion.span
                key={isToggled ? 'on' : 'off'}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 10, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={`absolute right-0 text-xs font-medium ${
                  isToggled 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {isToggled ? 'Activé' : 'Désactivé'}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-blue-900/10">
        <ProfileSettingsSkeleton type="notifications" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Bell className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
      </div>

      <Alert className="border dark:border-blue-800 dark:bg-blue-900/20">
        <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertTitle className="dark:text-white">Gérez vos notifications</AlertTitle>
        <AlertDescription className="dark:text-gray-300">
          Personnalisez la façon dont vous souhaitez être informé des activités importantes.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6">
        {/* Email Notifications */}
        <Card className="border dark:border-gray-700 transition-all hover:shadow-md dark:hover:shadow-blue-900/10">
          <CardHeader className="dark:border-b dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <CardTitle className="dark:text-white">Notifications par email</CardTitle>
            </div>
            <CardDescription className="dark:text-gray-400">
              Gérez les emails que vous recevez de notre part.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <NotificationSwitch
              category="email"
              setting="newDocuments"
              label="Nouveaux documents"
              description="Recevez des notifications pour les nouveaux documents."
            />
            <Separator className="bg-gray-200 dark:bg-gray-700" />
            <NotificationSwitch
              category="email"
              setting="loginAlerts"
              label="Alertes de connexion"
              description="Recevez des notifications pour les alertes de connexion."
            />
            <Separator className="bg-gray-200 dark:bg-gray-700" />
            <NotificationSwitch
              category="email"
              setting="announcements"
              label="Annonces"
              description="Recevez des notifications pour les annonces importantes."
            />
            <Separator className="bg-gray-200 dark:bg-gray-700" />
            <NotificationSwitch
              category="email"
              setting="courseUpdates"
              label="Mises à jour de cours"
              description="Recevez des notifications pour les mises à jour de cours."
            />
          </CardContent>
        </Card>

        {/* Push Notifications */}
        <Card className="border dark:border-gray-700 transition-all hover:shadow-md dark:hover:shadow-blue-900/10">
          <CardHeader className="dark:border-b dark:border-gray-700">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <CardTitle className="dark:text-white">Notifications push</CardTitle>
            </div>
            <CardDescription className="dark:text-gray-400">
              Configurez les notifications instantanées sur votre appareil.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <NotificationSwitch
              category="app"
              setting="newMessages"
              label="Nouveaux messages"
              description="Recevez des notifications pour les nouveaux messages."
            />
            <Separator className="bg-gray-200 dark:bg-gray-700" />
            <NotificationSwitch
              category="app"
              setting="eventReminders"
              label="Rappels d'événement"
              description="Recevez des notifications pour les rappels d'événement."
            />
            <Separator className="bg-gray-200 dark:bg-gray-700" />
            <NotificationSwitch
              category="app"
              setting="systemUpdates"
              label="Mises à jour du système"
              description="Recevez des notifications pour les mises à jour du système."
            />
          </CardContent>
        </Card>

        {/* Schedule Preferences */}
        <Card className="border dark:border-gray-700 transition-all hover:shadow-md dark:hover:shadow-blue-900/10">
          <CardHeader className="dark:border-b dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <CardTitle className="dark:text-white">Préférences de planning</CardTitle>
            </div>
            <CardDescription className="dark:text-gray-400">
              Définissez quand vous souhaitez recevoir les notifications.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <NotificationSwitch
              category="schedule"
              setting="daily"
              label="Résumé quotidien"
              description="Recevez un résumé quotidien de vos notifications."
            />
            <Separator className="bg-gray-200 dark:bg-gray-700" />
            <NotificationSwitch
              category="schedule"
              setting="weekly"
              label="Résumé hebdomadaire"
              description="Recevez un résumé hebdomadaire de vos activités."
            />
            <Separator className="bg-gray-200 dark:bg-gray-700" />
            <NotificationSwitch
              category="schedule"
              setting="immediate"
              label="Notifications immédiates"
              description="Recevez les notifications en temps réel."
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          onClick={() => toast.success('Paramètres réinitialisés aux valeurs par défaut')}
          disabled={savingChanges}
          className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Réinitialiser les paramètres
        </Button>
        <Button 
          onClick={saveChanges} 
          disabled={savingChanges}
          className="transition-all"
        >
          {savingChanges ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </Button>
      </div>
    </div>
  );
};

export default NotificationSettings; 