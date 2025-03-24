import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from '@/components/ui/label';
import { Pencil, MapPin } from 'lucide-react';
import { formatAddress } from './utils';

export const AddressField = ({ 
  userData, 
  editedData, 
  editMode, 
  setEditMode, 
  setEditedData, 
  onSaveAddress,
  isAdmin,
  handleCancelAddress
}) => {
  const field = 'address';
  const isEditing = editMode[field];
  const address = userData.addresses && userData.addresses.length > 0 ? userData.addresses[0] : null;
  
  // Toggle edit mode for this field
  const toggleFieldEdit = () => {
    setEditMode(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };
  
  // Handle save with optimistic update
  const handleSaveAddressOptimistic = async () => {
    // Exit edit mode immediately for better UX
    setEditMode(prev => ({
      ...prev,
      [field]: false
    }));
    
    // Call the save function in the background
    await onSaveAddress();
  };
  
  return (
    <div className={`
      rounded-lg transition-all duration-200 
      ${isEditing ? 'bg-white border-2 border-blue-200 shadow-sm' : 'bg-gray-50'} 
      ${!isEditing ? 'hover:bg-gray-100' : ''} 
      p-4 sm:p-5
    `}>
      <Label className="text-sm font-medium text-gray-700 flex items-center justify-between">
        <span>Adresse</span>
        {isAdmin && !isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFieldEdit}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </Label>
      <div className="mt-2">
        {isEditing ? (
          <div className="space-y-3">
            <div className="space-y-2">
              <Input
                id="address-line"
                value={editedData.address?.name || ''}
                onChange={(e) => setEditedData(prev => ({
                  ...prev,
                  address: { 
                    ...prev.address,
                    name: e.target.value
                  }
                }))}
                placeholder="Ligne d'adresse"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address-complement">Complément</Label>
              <Input
                id="address-complement"
                value={editedData.address?.complement || ''}
                onChange={(e) => setEditedData(prev => ({
                  ...prev,
                  address: { 
                    ...prev.address,
                    complement: e.target.value
                  }
                }))}
                placeholder="Complément d'adresse"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="address-postal">Code postal</Label>
                <Input
                  id="address-postal"
                  value={editedData.address?.postalCode?.code || ''}
                  onChange={(e) => setEditedData(prev => ({
                    ...prev,
                    address: { 
                      ...prev.address,
                      postalCode: { code: e.target.value }
                    }
                  }))}
                  placeholder="Code postal"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address-city">Ville</Label>
                <Input
                  id="address-city"
                  value={editedData.address?.city?.name || ''}
                  onChange={(e) => setEditedData(prev => ({
                    ...prev,
                    address: { 
                      ...prev.address,
                      city: { name: e.target.value }
                    }
                  }))}
                  placeholder="Ville"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleSaveAddressOptimistic}
                size="sm"
                className="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 min-w-[100px]"
              >
                Enregistrer
              </Button>
              <Button
                onClick={handleCancelAddress}
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              >
                Annuler
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center min-w-0">
            <MapPin className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0" />
            <span className="text-sm truncate flex-1 text-gray-900">
              {address ? formatAddress(address) : <span className="text-gray-500 italic">Aucune adresse renseignée</span>}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}; 