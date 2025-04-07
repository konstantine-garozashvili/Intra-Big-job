import { useState, useEffect } from 'react';
import { authService } from '@/lib/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, KeyRound, Smartphone, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import ProfileSettingsSkeleton from '../components/ProfileSettingsSkeleton';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';
import { Switch } from '@/components/ui/switch';

const SecuritySettings = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  // State for password visibility toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({ security: true });
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(false);

  // Simulate data loading on component mount
  useEffect(() => {
    const loadSecuritySettings = async () => {
      try {
        // In a real app, you might load security settings data here
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

  const handleToggleNotification = (feature, checked) => {
    setNotificationSettings({ ...notificationSettings, [feature]: checked });
  };

  const handleToggleTwoFactor = (checked) => {
    setTwoFactorAuth(checked);
  };

  // Show skeleton while loading
  if (pageLoading) {
    return (
      <div className="space-y-6 bg-white p-6 rounded-lg shadow">
        <ProfileSettingsSkeleton type="security" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Sécurité</h1>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Sécurité du compte</AlertTitle>
        <AlertDescription>
          Protégez votre compte en utilisant un mot de passe fort et en activant l'authentification à deux facteurs.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6">
        {/* Password Change Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <KeyRound className="h-5 w-5" />
              <CardTitle>Changer le mot de passe</CardTitle>
            </div>
            <CardDescription>
              Choisissez un mot de passe fort et unique que vous n'utilisez pour aucun autre compte.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="currentPassword" className="text-sm font-medium">
                  Mot de passe actuel
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    id="currentPassword"
                    placeholder="Votre mot de passe actuel"
                    className="border rounded-md p-2 w-full pr-10"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    maxLength={50}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  >
                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="newPassword" className="text-sm font-medium">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    id="newPassword"
                    placeholder="Nouveau mot de passe"
                    className="border rounded-md p-2 w-full pr-10"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    maxLength={50}
                    onPaste={(e) => {
                      // Intercepter l'événement de collage
                      const clipboardData = e.clipboardData || window.clipboardData;
                      const pastedText = clipboardData.getData('text');
                      
                      // Vérifier si le texte collé dépasse la limite
                      if (pastedText.length > 50) {
                        // Empêcher le collage
                        e.preventDefault();
                        
                        // Afficher un message d'alerte
                        alert(`ATTENTION : Le mot de passe que vous tentez de coller (${pastedText.length} caractères) dépasse la limite de 50 caractères. Veuillez utiliser un mot de passe plus court.`);
                        
                        // Notification toast
                        toast.error("Le collage a été bloqué - le mot de passe dépassait 50 caractères");
                        
                        // Log de sécurité
                        console.error(`Tentative bloquée de collage d'un mot de passe trop long (${pastedText.length} caractères)`);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  <span className="font-semibold">Important :</span> Le mot de passe doit contenir entre 8 et 50 caractères.
                </p>
                {newPassword && (
                  <div className="mt-2">
                    <PasswordStrengthIndicator password={newPassword} />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmer le nouveau mot de passe</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex="-1"
                  >
                    {showConfirmPassword ? 
                      <EyeOff className="h-4 w-4 text-gray-500" /> : 
                      <Eye className="h-4 w-4 text-gray-500" />
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
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              <CardTitle>Authentification à deux facteurs</CardTitle>
            </div>
            <CardDescription>
              Ajoutez une couche de sécurité supplémentaire à votre compte en activant l'authentification à deux facteurs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              L'authentification à deux facteurs ajoute une couche de sécurité supplémentaire à votre compte en demandant un code en plus de votre mot de passe.
            </p>
            <div className="flex items-center space-x-2">
              <Switch
                id="notificationSettings"
                checked={notificationSettings.security}
                onCheckedChange={(checked) => handleToggleNotification('security', checked)}
              />
              <Label htmlFor="notificationSettings">
                M&apos;avertir des connexions depuis un nouvel appareil
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="twoFactorAuth"
                checked={twoFactorAuth}
                onCheckedChange={handleToggleTwoFactor}
                disabled
              />
              <div className="ml-2">
                <Label htmlFor="twoFactorAuth" className="cursor-pointer flex items-center">
                  Authentification à deux facteurs
                  <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">
                    À venir
                  </span>
                </Label>
                <p className="text-sm text-gray-500">
                  L&apos;authentification à deux facteurs sera bientôt disponible pour sécuriser davantage votre compte.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="sessionTimeout"
                checked={sessionTimeout}
                onCheckedChange={setSessionTimeout}
              />
              <div className="ml-2">
                <Label htmlFor="sessionTimeout" className="cursor-pointer">
                  Déconnexion automatique après inactivité
                </Label>
                <p className="text-sm text-gray-500">
                  Votre session sera automatiquement fermée après 30 minutes d&apos;inactivité.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/50">
            <p className="text-sm text-muted-foreground">
              Vous devrez entrer un code à chaque connexion une fois l'authentification à deux facteurs activée.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SecuritySettings; 