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
      await authService.changePassword({
        currentPassword,
        newPassword
      });
      toast.success('Mot de passe modifié avec succès');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setLoading(false);
    }
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
                <Label htmlFor="current-password">Mot de passe actuel</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    tabIndex="-1"
                  >
                    {showCurrentPassword ? 
                      <EyeOff className="h-4 w-4 text-gray-500" /> : 
                      <Eye className="h-4 w-4 text-gray-500" />
                    }
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Nouveau mot de passe</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    tabIndex="-1"
                  >
                    {showNewPassword ? 
                      <EyeOff className="h-4 w-4 text-gray-500" /> : 
                      <Eye className="h-4 w-4 text-gray-500" />
                    }
                  </Button>
                </div>
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
            <Button variant="outline">
              Configurer l'authentification à deux facteurs
            </Button>
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