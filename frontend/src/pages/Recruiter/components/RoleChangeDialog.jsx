import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function RoleChangeDialog({
  open,
  onOpenChange,
  user,
  getCurrentRole,
  getNewRole,
  onConfirm,
  isProcessing
}) {
  if (!user) return null;

  const currentRoleName = getCurrentRole(user);
  const newRoleName = getNewRole(user);
  const isPromotion = currentRoleName.toLowerCase().includes('guest');

  const formatRoleName = (roleName) => {
    if (roleName === "ROLE_GUEST") return "Invité";
    if (roleName === "ROLE_STUDENT") return "Élève";
    return roleName;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Changement de rôle</DialogTitle>
          <DialogDescription>
            <p>
              Vous êtes sur le point de {isPromotion ? "promouvoir" : "rétrograder"} 
              <strong> {user.firstName} {user.lastName}</strong>.
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p>
            Rôle actuel : <strong>{formatRoleName(currentRoleName)}</strong>
          </p>
          <p className="mt-2">
            Nouveau rôle : <strong>{formatRoleName(newRoleName)}</strong>
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button 
            disabled={isProcessing} 
            onClick={onConfirm}
          >
            {isProcessing ? 
              'Traitement en cours...' : 
              isPromotion ? 'Promouvoir en élève' : 'Rétrograder en invité'
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
