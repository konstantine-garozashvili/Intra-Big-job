import { useState, useEffect } from 'react';
import { authService } from '@/lib/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, KeyRound, Smartphone, Eye, EyeOff, Power, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import ProfileSettingsSkeleton from '../components/ProfileSettingsSkeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import profilService from '@/lib/services/profilService';

const SecuritySettings = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [deactivateLoading, setDeactivateLoading] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [userRoles, setUserRoles] = useState([]);
  const [isGuest, setIsGuest] = useState(false);
  
  // State for password visibility toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Load data on component mount
  useEffect(() => {
    const loadSecuritySettings = async () => {
      try {
        // Get user roles from localStorage
        const storedRoles = localStorage.getItem('userRoles');
        const roles = storedRoles ? JSON.parse(storedRoles) : [];
        setUserRoles(roles);
        
        // Check if user has Guest/Invité role
        const hasGuestRole = roles.some(role => 
          typeof role === 'string' 
            ? role.includes('GUEST') || role.includes('INVITE') 
            : (role.name && (role.name.includes('GUEST') || role.name.includes('INVITE')))
        );
        setIsGuest(hasGuestRole);
      } catch (error) {
        toast.error('Erreur lors du chargement des paramètres de sécurité');
      } finally {
        setPageLoading(false);
      }
    };

    loadSecuritySettings();
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!currentPassword) {
      toast.error('Veuillez saisir votre mot de passe actuel');
      return;
    }
    
    if (!newPassword) {
      toast.error('Veuillez saisir un nouveau mot de passe');
      return;
    }
    
    if (newPassword.length < 8) {
      toast.error('Le nouveau mot de passe doit contenir au moins 8 caractères');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    // Check if new password is the same as current password
    if (currentPassword === newPassword) {
      toast.error('Le nouveau mot de passe doit être différent du mot de passe actuel');
      return;
    }

    setLoading(true);
    try {
      const result = await authService.changePassword({
        currentPassword,
        newPassword
      });
      
      if (result.success) {
        toast.success(result.message || 'Mot de passe modifié avec succès');
        // Reset form fields after successful password change
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(result.message || 'Erreur lors du changement de mot de passe');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeactivateAccount = async () => {
    setDeactivateLoading(true);
    try {
      const result = await profilService.deactivateAccount();
      
      if (result.success) {
        toast.success(result.message || 'Votre compte a été désactivé avec succès');
        setConfirmDeactivate(false);
        
        // Rediriger vers la page de connexion après un délai
        setTimeout(() => {
          authService.logout();
          window.location.href = '/login';
        }, 3000);
      } else {
        toast.error(result.message || 'Erreur lors de la désactivation du compte');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la désactivation du compte');
    } finally {
      setDeactivateLoading(false);
    }
  };

  // Show skeleton while loading
  if (pageLoading) {
    return (
      <div className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-blue-900/10">
        <ProfileSettingsSkeleton type="security" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sécurité</h1>
      </div>

      <Alert className="border dark:border-blue-800 dark:bg-blue-900/20">
        <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertTitle className="dark:text-white">Sécurité du compte</AlertTitle>
        <AlertDescription className="dark:text-gray-300">
          Protégez votre compte en utilisant un mot de passe fort et en activant l'authentification à deux facteurs.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6">
        {/* Password Change Card */}
        <Card className="border dark:border-gray-700">
          <CardHeader className="dark:border-b dark:border-gray-700">
            <div className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <CardTitle className="dark:text-white">Changer le mot de passe</CardTitle>
            </div>
            <CardDescription className="dark:text-gray-400">
              Choisissez un mot de passe fort et unique que vous n'utilisez pour aucun autre compte.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password" className="text-gray-700 dark:text-gray-300">Mot de passe actuel</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="pr-10 dark:bg-gray-700/50 dark:border-gray-600"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 dark:text-gray-300 dark:hover:bg-gray-700/50"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    tabIndex="-1"
                  >
                    {showCurrentPassword ? 
                      <EyeOff className="h-4 w-4 text-gray-500 dark:text-gray-400" /> : 
                      <Eye className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    }
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-gray-700 dark:text-gray-300">Nouveau mot de passe</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="pr-10 dark:bg-gray-700/50 dark:border-gray-600"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 dark:text-gray-300 dark:hover:bg-gray-700/50"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    tabIndex="-1"
                  >
                    {showNewPassword ? 
                      <EyeOff className="h-4 w-4 text-gray-500 dark:text-gray-400" /> : 
                      <Eye className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    }
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-gray-700 dark:text-gray-300">Confirmer le nouveau mot de passe</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pr-10 dark:bg-gray-700/50 dark:border-gray-600"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 dark:text-gray-300 dark:hover:bg-gray-700/50"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex="-1"
                  >
                    {showConfirmPassword ? 
                      <EyeOff className="h-4 w-4 text-gray-500 dark:text-gray-400" /> : 
                      <Eye className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    }
                  </Button>
                </div>
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? 'Modification en cours...' : 'Modifier le mot de passe'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 2FA Card */}
        <Card className="border dark:border-gray-700">
          <CardHeader className="dark:border-b dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <CardTitle className="dark:text-white">Authentification à deux facteurs</CardTitle>
            </div>
            <CardDescription className="dark:text-gray-400">
              Ajoutez une couche de sécurité supplémentaire à votre compte en activant l'authentification à deux facteurs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              L'authentification à deux facteurs ajoute une couche de sécurité supplémentaire à votre compte en demandant un code en plus de votre mot de passe.
            </p>
            <Button 
              variant="outline"
              className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Configurer l'authentification à deux facteurs
            </Button>
          </CardContent>
          <CardFooter className="bg-gray-50 dark:bg-gray-800/60 dark:border-t dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Vous devrez entrer un code à chaque connexion une fois l'authentification à deux facteurs activée.
            </p>
          </CardFooter>
        </Card>
        
        {/* Deactivate Account Card - Only shown for Guest users */}
        {isGuest && (
          <Card className="border-destructive dark:border-red-800">
            <CardHeader className="dark:border-b dark:border-red-800/70">
              <div className="flex items-center gap-2">
                <Power className="h-5 w-5 text-destructive dark:text-red-500" />
                <CardTitle className="text-destructive dark:text-red-500">Désactiver mon compte</CardTitle>
              </div>
              <CardDescription className="dark:text-gray-400">
                Désactivez temporairement votre compte. Vous pourrez le réactiver ultérieurement en contactant l'administration.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                La désactivation de votre compte conservera toutes vos données, mais vous n'aurez plus accès à l'application jusqu'à sa réactivation.
              </p>
              <Dialog open={confirmDeactivate} onOpenChange={setConfirmDeactivate}>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    Désactiver mon compte
                  </Button>
                </DialogTrigger>
                <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 dark:text-white">
                      <AlertCircle className="h-5 w-5 text-destructive dark:text-red-500" />
                      <span>Désactiver votre compte ?</span>
                    </DialogTitle>
                    <DialogDescription className="dark:text-gray-300">
                      Cette action va désactiver votre compte. Vous n'aurez plus accès à l'application jusqu'à ce qu'un administrateur réactive votre compte.
                      <br /><br />
                      Toutes vos données seront conservées mais inaccessibles jusqu'à la réactivation.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setConfirmDeactivate(false)}
                      className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Annuler
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleDeactivateAccount}
                      disabled={deactivateLoading}
                    >
                      {deactivateLoading ? 'Désactivation en cours...' : 'Confirmer la désactivation'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
            <CardFooter className="bg-destructive/10 dark:bg-red-900/20 dark:border-t dark:border-red-800/50">
              <p className="text-sm text-destructive dark:text-red-400">
                Attention : Un administrateur devra réactiver votre compte si vous souhaitez y accéder à nouveau.
              </p>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SecuritySettings; 