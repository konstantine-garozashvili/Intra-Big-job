import React from 'react';
import { Button } from "@/components/ui/button";
import { Label } from '@/components/ui/label';
import { Pencil } from 'lucide-react';
import { SimpleDatePicker } from './SimpleDatePicker';
import { formatDate } from './utils';

export const DatePickerField = ({ 
  field, 
  label, 
  icon, 
  userData, 
  editedData, 
  editMode, 
  setEditMode, 
  handleInputChange, 
  handleCancelField, 
  onSave,
  isAdmin
}) => {
  const isEditing = editMode[field];
  const value = userData[field];
  
  // Handle save with optimistic update
  const handleSaveDate = async () => {
    // Exit edit mode immediately for better UX
    setEditMode(prev => ({
      ...prev,
      [field]: false
    }));
    
    // Call the save function in the background
    await onSave(field);
  };
  
  // Toggle edit mode for this field
  const toggleFieldEdit = () => {
    setEditMode(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };
  
  return (
    <div className={`
      rounded-lg transition-all duration-200 
      ${isEditing ? 'bg-white border-2 border-blue-200 shadow-sm' : 'bg-gray-50'} 
      ${!isEditing ? 'hover:bg-gray-100' : ''} 
      p-4 sm:p-5
    `}>
      <Label className="text-sm font-medium text-gray-700 flex items-center justify-between">
        <span>{label}</span>
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
            <SimpleDatePicker
              selected={editedData.personal[field] ? new Date(editedData.personal[field]) : null}
              onSelect={(date) => handleInputChange(field, date.toISOString().split('T')[0])}
              className="w-full"
            />
            {field === 'birthDate' && (
              <p className="text-xs text-gray-500">Vous devez avoir au moins 16 ans.</p>
            )}
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleSaveDate}
                size="sm"
                className="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 min-w-[100px]"
              >
                Enregistrer
              </Button>
              <Button
                onClick={() => handleCancelField(field)}
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
            {icon}
            <span className="text-sm truncate flex-1 text-gray-900">
              {formatDate(value)}
              {userData.age && <span className="ml-2 text-gray-500">({userData.age} ans)</span>}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}; 