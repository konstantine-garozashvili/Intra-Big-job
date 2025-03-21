import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, UserX, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { authService } from '@/lib/services/authService';

/**
 * Bouton permettant aux invités de désactiver leur compte
 * Affiche une boîte de dialogue de confirmation avant de procéder
 */
const DeactivateAccountButton = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Ouvre la boîte de dialogue de confirmation
   */
  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  /**
   * Ferme la boîte de dialogue de confirmation
   */
  const handleCloseDialog = () => {
    if (!isLoading) {
      setIsDialogOpen(false);
    }
  };

  /**
   * Désactive le compte de l'utilisateur après confirmation
   */
  const handleDeactivateAccount = async () => {
    try {
      setIsLoading(true);
      
      // Appel à l'API de désactivation
      const response = await authService.deactivateAccount();
      
      // Le service authService gère déjà la déconnexion en cas de succès
      // Nous n'avons besoin que d'afficher un toast de confirmation
      toast.success('Votre compte a été désactivé avec succès. Vous allez être déconnecté.', {
        icon: <CheckCircle2 className="h-4 w-4" />
      });
      
      // Note: La redirection est gérée par authService.deactivateAccount via logout
    } catch (error) {
      console.error('Erreur lors de la désactivation du compte:', error);
      
      // Afficher un message d'erreur approprié
      const errorMessage = 
        error.response?.data?.message || 
        error.message || 
        'Une erreur est survenue lors de la désactivation de votre compte';
      
      toast.error(errorMessage, {
        icon: <AlertCircle className="h-4 w-4" />
      });
    } finally {
      setIsLoading(false);
      setIsDialogOpen(false);
    }
  };

  return (
    <>
      {/* Bouton principal qui ouvre la boîte de dialogue */}
      <div className="w-full px-1 md:px-4 py-4 flex justify-center">
        <div className="p-4 border border-red-100 bg-red-50 rounded-lg max-w-md w-full">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100">
              <UserX className="h-5 w-5 text-red-600" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-red-800">Désactivation du compte</h3>
              <p className="mt-1 text-sm text-red-600">
                Si vous souhaitez désactiver votre compte, toutes vos données seront conservées mais vous ne pourrez plus vous connecter.
              </p>
            </div>
            <Button 
              variant="destructive" 
              size="sm" 
              className="mt-4"
              onClick={handleOpenDialog}
            >
              Désactiver mon compte
            </Button>
          </div>
        </div>
      </div>

      {/* Boîte de dialogue de confirmation */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-700 flex items-center gap-2">
              <UserX className="h-5 w-5" />
              Confirmer la désactivation du compte
            </DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir désactiver votre compte ? Toutes vos données seront conservées, mais vous ne pourrez plus vous connecter.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-gray-500">
              Si vous souhaitez réactiver votre compte ultérieurement, vous devrez contacter l'administrateur.
            </p>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseDialog}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeactivateAccount}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">●</span>
                  Désactivation...
                </>
              ) : (
                'Confirmer la désactivation'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DeactivateAccountButton; 