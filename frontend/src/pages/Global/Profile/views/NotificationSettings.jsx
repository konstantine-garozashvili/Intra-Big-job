import React, { useState, useEffect } from 'react';
import { Bell, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ProfileSettingsSkeleton from '../components/ProfileSettingsSkeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/services/firebase';
import { useAuth } from '@/contexts/AuthContext';

const NotificationSettings = () => {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    app: {
      ROLE_UPDATE: true, // Valeur par défaut, sera remplacée lors du chargement
      DOCUMENT_UPLOADED: true,
      DOCUMENT_DELETED: true,
      DOCUMENT_APPROVED: true,
      DOCUMENT_REJECTED: true
    }
  });
  const [initialSettings, setInitialSettings] = useState(null);
  const [savingChanges, setSavingChanges] = useState(false);
  const [lastToggled, setLastToggled] = useState(null);
  const [isResetting, setIsResetting] = useState(false);
  const { updateNotificationPreference, forceReinitializePreferences } = useNotifications();
  const { user } = useAuth();

  // Function to get user ID in a consistent way
  const getUserId = () => {
    let userId = null;
    
    // First try to get from user context
    if (user?.id) {
      userId = user.id;
    } 
    // Then from localStorage parsed object
    else if (localStorage.getItem('user')) {
      try {
        const localUser = JSON.parse(localStorage.getItem('user'));
        if (localUser?.id) {
          userId = localUser.id;
        }
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    }
    // Lastly from direct localStorage values
    if (!userId) {
      userId = localStorage.getItem('userId') || localStorage.getItem('user_id');
    }
    
    if (!userId) {
      console.error('No user ID found');
      return null;
    }
    
    // Always return as string
    return String(userId);
  };

  // Get the email associated with the current user
  const getUserEmail = () => {
    if (user?.email) {
      return user.email;
    }
    
    try {
      const localUser = JSON.parse(localStorage.getItem('user') || '{}');
      return localUser?.email || null;
    } catch (e) {
      console.warn('Error parsing user email from localStorage:', e);
      return null;
    }
  };

  useEffect(() => {
    const loadNotificationSettings = async () => {
      setLoading(true);
      try {
        const userId = getUserId();
        const userEmail = getUserEmail();
        
        if (!userId) {
          console.error('No user ID available, cannot load notification settings');
          toast.error('Erreur: Utilisateur non identifié');
          return;
        }

        console.log('Chargement des préférences pour l\'utilisateur ID:', userId);
        console.log('Informations utilisateur:', user);
          
          // Charger les préférences depuis Firestore
        const preferencesRef = doc(db, 'notificationPreferences', userId);
        console.log('Référence du document pour les préférences:', preferencesRef.path);
        
          const preferencesSnap = await getDoc(preferencesRef);
          
        // Loguer les données brutes pour débogage
        console.log('Préférences brutes depuis Firestore:', 
          preferencesSnap.exists() ? preferencesSnap.data() : 'Aucune préférence trouvée');
          
          if (preferencesSnap.exists()) {
            const preferences = preferencesSnap.data();
          
          // Security check: verify if preferences belong to this user
          if (preferences.userId && preferences.userId !== userId) {
            console.error('Erreur: Les préférences ne correspondent pas à l\'utilisateur actuel', {
              expectedId: userId,
              actualId: preferences.userId
            });
            
            // Reset preferences to ensure they're correctly associated with this user
            await createDefaultPreferences(userId, userEmail);
            return;
          }
          
          // Update user email if needed to ensure continuity across sessions
          if (userEmail && (!preferences.userEmail || preferences.userEmail !== userEmail)) {
            console.log('Mise à jour de l\'email utilisateur dans les préférences', {
              oldEmail: preferences.userEmail || 'none',
              newEmail: userEmail
            });
            
            // Update the email without changing other preferences
            await updateDoc(preferencesRef, {
              userEmail: userEmail,
              lastUpdated: new Date()
            });
          }
          
          console.log('Préférences chargées depuis Firestore:', preferences);
          
          // Mettre à jour le state avec les valeurs exactes de Firestore
          const newSettings = {
            app: {
              ROLE_UPDATE: preferences.ROLE_UPDATE !== false, // true par défaut sauf si explicitement false
              DOCUMENT_UPLOADED: preferences.DOCUMENT_UPLOADED !== false,
              DOCUMENT_DELETED: preferences.DOCUMENT_DELETED !== false,
              DOCUMENT_APPROVED: preferences.DOCUMENT_APPROVED !== false,
              DOCUMENT_REJECTED: preferences.DOCUMENT_REJECTED !== false
            }
          };
          
          console.log('Nouvelles préférences appliquées:', newSettings);
          setSettings(newSettings);
          setInitialSettings(JSON.stringify(newSettings));
        } else {
          console.log('Aucune préférence trouvée pour cet utilisateur, création des valeurs par défaut');
          await createDefaultPreferences(userId, userEmail);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres:', error);
        toast.error('Erreur lors du chargement des paramètres de notification');
      } finally {
        setLoading(false);
      }
    };
    
    // Helper function to create default preferences
    const createDefaultPreferences = async (userId, userEmail) => {
      try {
        // Si pas de préférences, on utilise les valeurs par défaut déjà définies
        const defaultSettings = {
          app: {
            ROLE_UPDATE: true,
            DOCUMENT_UPLOADED: true,
            DOCUMENT_DELETED: true,
            DOCUMENT_APPROVED: true,
            DOCUMENT_REJECTED: true
          }
        };
        
        // Créer les préférences par défaut dans Firestore
        const preferencesRef = doc(db, 'notificationPreferences', userId);
        
        const newPreferences = {
          userId: userId, // Store user ID in the document for security/verification
          userEmail: userEmail || null, // Store email for cross-session identification
          ROLE_UPDATE: true,
          DOCUMENT_UPLOADED: true,
          DOCUMENT_DELETED: true,
          DOCUMENT_APPROVED: true,
          DOCUMENT_REJECTED: true,
          createdAt: new Date(),
          lastLogin: new Date()
        };
        
        await setDoc(preferencesRef, newPreferences);
        
        console.log('Préférences par défaut créées dans Firestore pour utilisateur:', userId);
        
        setSettings(defaultSettings);
        setInitialSettings(JSON.stringify(defaultSettings));
      } catch (error) {
        console.error('Erreur lors de la création des préférences par défaut:', error);
        toast.error('Erreur lors de la création des préférences par défaut');
      }
    };

    loadNotificationSettings();
  }, [user]);

  // Enregistrer automatiquement les changements lorsqu'un switch est activé/désactivé
  const handleToggleChange = async (category, setting) => {
    setLastToggled({ category, setting });
    
    const userId = getUserId();
    if (!userId) {
      toast.error('Erreur: Utilisateur non identifié');
      return;
    }
    
    // Mettre à jour l'état local
    const newSettings = {
      ...settings,
      [category]: {
        ...settings[category],
        [setting]: !settings[category][setting]
      }
  };
    setSettings(newSettings);

    console.log(`Changement de préférence pour utilisateur ${userId}: ${setting} → ${!settings[category][setting]}`);

    // Enregistrer immédiatement le changement
    setSavingChanges(true);
    try {
      await updateNotificationPreference(setting, !settings[category][setting]);
      
      // Vérifier que la préférence a bien été mise à jour
      const preferencesRef = doc(db, 'notificationPreferences', userId);
      const preferencesSnap = await getDoc(preferencesRef);
      
      if (preferencesSnap.exists()) {
        const updatedPrefs = preferencesSnap.data();
        console.log('Préférences après mise à jour pour utilisateur', userId, ':', updatedPrefs);
        
        // Security check: verify if preferences belong to this user
        if (updatedPrefs.userId && updatedPrefs.userId !== userId) {
          console.error('Erreur: Les préférences ne correspondent pas à l\'utilisateur', {
            expectedId: userId,
            actualId: updatedPrefs.userId
          });
          toast.error('Erreur lors de la mise à jour des préférences');
          return;
        }
        
        // Verify the specific preference was correctly updated
        if (updatedPrefs[setting] !== !settings[category][setting]) {
          console.error('La préférence n\'a pas été correctement mise à jour:', {
            expected: !settings[category][setting],
            actual: updatedPrefs[setting]
          });
          toast.error('Erreur lors de la mise à jour des préférences');
          return;
        }
        
        // Store the new settings in local storage as a backup (will be used if Firestore is unavailable)
        try {
          localStorage.setItem('notificationPreferences', JSON.stringify({
            ...updatedPrefs,
            lastUpdated: new Date().toISOString() 
          }));
          console.log('Préférences sauvegardées dans le localStorage comme backup');
        } catch (e) {
          console.warn('Impossible de sauvegarder les préférences dans localStorage:', e);
        }
      }
      
      toast.success('Préférence de notification mise à jour');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la mise à jour des préférences');
      
      // En cas d'erreur, revenir à l'état précédent
      setSettings(settings);
    } finally {
      setSavingChanges(false);
    }

    setTimeout(() => {
      setLastToggled(null);
    }, 1000);
  };

  // Handler for the reset button
  const handleResetNotifications = async () => {
    setIsResetting(true);
    try {
      const success = await forceReinitializePreferences();
      if (success) {
        toast.success('Préférences de notification réinitialisées avec succès');
        // Reload the page to reflect the changes
        window.location.reload();
      } else {
        toast.error('Erreur lors de la réinitialisation des préférences');
      }
    } catch (error) {
      console.error('Erreur lors de la réinitialisation des préférences:', error);
      toast.error('Erreur lors de la réinitialisation des préférences');
    } finally {
      setIsResetting(false);
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
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Paramètres de notification</h2>
        
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={handleResetNotifications}
          disabled={isResetting || loading}
        >
          <RefreshCw className={`h-4 w-4 ${isResetting ? 'animate-spin' : ''}`} />
          Réinitialiser les notifications
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Bell className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
      </div>

      <Alert className="border dark:border-blue-800 dark:bg-blue-900/20">
        <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertTitle className="dark:text-white">Gérez vos notifications</AlertTitle>
        <AlertDescription className="dark:text-gray-300">
          Personnalisez la façon dont vous souhaitez être informé des activités importantes.
          Vos préférences seront conservées même après déconnexion.
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
              setting="DOCUMENT_UPLOADED"
              label="Ajout de documents"
              description="Recevez des notifications lorsqu'un document est ajouté à votre profil."
            />
            <NotificationSwitch
              category="app"
              setting="DOCUMENT_DELETED"
              label="Suppression de documents"
              description="Recevez des notifications lorsqu'un document est supprimé de votre profil."
            />
            <NotificationSwitch
              category="app"
              setting="DOCUMENT_APPROVED"
              label="Approbation de documents"
              description="Recevez des notifications lorsqu'un document est approuvé."
            />
            <NotificationSwitch
              category="app"
              setting="DOCUMENT_REJECTED"
              label="Rejet de documents"
              description="Recevez des notifications lorsqu'un document est rejeté."
            />
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default NotificationSettings; 