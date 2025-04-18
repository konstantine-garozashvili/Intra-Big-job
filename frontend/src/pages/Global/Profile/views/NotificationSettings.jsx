import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ProfileSettingsSkeleton from '../components/ProfileSettingsSkeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/services/firebase';
import { useAuth } from '@/contexts/AuthContext';

const NotificationSettings = () => {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    app: {
      ROLE_UPDATE: true, // Valeur par défaut, sera remplacée lors du chargement
      INFO_UPDATE: true  // Ajout d'une préférence pour les mises à jour de profil
    }
  });
  const [savingChanges, setSavingChanges] = useState(false);
  const [lastToggled, setLastToggled] = useState(null);
  const { updateNotificationPreference } = useNotifications();
  const { user } = useAuth();

  useEffect(() => {
    const loadNotificationSettings = async () => {
      setLoading(true);
      try {
        if (user?.id) {
          console.log('Chargement des préférences pour l\'utilisateur ID:', user.id);
          
          // Charger les préférences depuis Firestore
          const preferencesRef = doc(db, 'notificationPreferences', String(user.id));
          const preferencesSnap = await getDoc(preferencesRef);
          
          if (preferencesSnap.exists()) {
            const preferences = preferencesSnap.data();
            console.log('Préférences chargées depuis Firestore:', preferences);
            
            // Mettre à jour le state avec les valeurs exactes de Firestore
            setSettings({
              app: {
                ROLE_UPDATE: preferences.ROLE_UPDATE !== false, // true par défaut sauf si explicitement false
                INFO_UPDATE: preferences.INFO_UPDATE !== false  // true par défaut sauf si explicitement false
              }
            });
          } else {
            console.log('Aucune préférence trouvée pour cet utilisateur, utilisation des valeurs par défaut');
            
            // Si pas de préférences, on utilise les valeurs par défaut déjà définies
            setSettings({
              app: {
                ROLE_UPDATE: true,
                INFO_UPDATE: true
              }
            });
          }
        } else {
          console.log('Pas d\'utilisateur, utilisation des valeurs par défaut');
        }
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres:', error);
        toast.error('Erreur lors du chargement des paramètres');
      } finally {
        setLoading(false);
      }
    };

    loadNotificationSettings();
  }, [user]);

  const handleToggleChange = (category, setting) => {
    setLastToggled({ category, setting });
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !prev[category][setting]
      }
    }));

    setTimeout(() => {
      setLastToggled(null);
    }, 1000);
  };

  const saveChanges = async () => {
    setSavingChanges(true);
    try {
      await updateNotificationPreference('ROLE_UPDATE', settings.app.ROLE_UPDATE);
      await updateNotificationPreference('INFO_UPDATE', settings.app.INFO_UPDATE);
      toast.success('Paramètres de notification mis à jour');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la mise à jour des paramètres');
    } finally {
      setSavingChanges(false);
    }
  };

  const NotificationSwitch = ({ category, setting, label, description }) => {
    // Utiliser la valeur actuelle du state settings au lieu d'une valeur par défaut
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
        <Card className="border dark:border-gray-700 transition-all hover:shadow-md dark:hover:shadow-blue-900/10">
          <CardHeader className="dark:border-b dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <CardTitle className="dark:text-white">Notifications système</CardTitle>
            </div>
            <CardDescription className="dark:text-gray-400">
              Gérez vos notifications système.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <NotificationSwitch
              category="app"
              setting="ROLE_UPDATE"
              label="Changements de rôle"
              description="Recevez des notifications lorsque votre rôle est modifié."
            />
            <NotificationSwitch
              category="app"
              setting="INFO_UPDATE"
              label="Mises à jour de profil"
              description="Recevez des notifications lorsque votre profil est mis à jour."
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-2">
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