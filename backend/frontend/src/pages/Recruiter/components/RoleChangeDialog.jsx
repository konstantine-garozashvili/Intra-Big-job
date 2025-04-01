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
import RoleBadge from '@/components/ui/RoleBadge';

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
          <div className="flex items-center gap-2 mb-3">
            <p className="text-sm text-gray-600">Rôle actuel :</p>
            <RoleBadge role={currentRoleName} solid useVariant />
          </div>
          
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-600">Nouveau rôle :</p>
            <RoleBadge role={newRoleName} solid useVariant />
          </div>
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
