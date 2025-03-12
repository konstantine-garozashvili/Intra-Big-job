import React, { memo, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from '@/components/ui/phone-input';
import { Label } from '@/components/ui/label';
import { Pencil, Loader2 } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { formatFrenchPhoneNumber } from '@/lib/utils/formatting';

const EditableField = memo(({
  field,
  label,
  icon,
  value,
  type = 'text',
  isEditing,
  isEditable,
  editedValue,
  onEdit,
  onSave,
  onCancel,
  onChange,
  className = '',
  isSaving = false,
  isLoading = false
}) => {
  // Local state for optimistic updates
  const [localValue, setLocalValue] = useState(value);
  
  // Handle save with optimistic update
  const handleSave = React.useCallback(async () => {
    // Update local value immediately for optimistic UI
    setLocalValue(editedValue);
    
    // Exit edit mode immediately for better UX
    if (onEdit) {
      onEdit(); // This will toggle edit mode off
    }
    
    // Call the save function in the background
    await onSave(field);
  }, [onSave, field, editedValue, onEdit]);

  // Update local value when the actual value changes
  React.useEffect(() => {
    if (!isEditing) {
      setLocalValue(value);
    }
  }, [value, isEditing]);

  // Always display the most up-to-date value (either edited or saved)
  const displayValue = isEditing ? editedValue : (localValue || value);

  // Format the display value based on the field type
  const getFormattedDisplayValue = () => {
    if (type === 'phone' && displayValue) {
      return formatFrenchPhoneNumber(displayValue);
    }
    return displayValue;
  };

  return (
    <div 
      className={`
        rounded-lg transition-all duration-200 
        ${isEditing ? 'bg-white border-2 border-blue-200 shadow-sm' : 'bg-gray-50'} 
        ${!isEditing ? 'hover:bg-gray-100' : ''} 
        p-3 sm:p-4 md:p-5 
        ${className}
      `}
    >
      <Label className="text-xs sm:text-sm font-medium text-gray-700 flex items-center justify-between">
        <span>{label}</span>
        {isEditable && !isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="h-7 w-7 p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
          >
            <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
        )}
      </Label>
      <div className="mt-1.5 sm:mt-2">
        {isEditing ? (
          <div className="space-y-2 sm:space-y-3">
            {type === 'phone' ? (
              <PhoneInput
                value={editedValue || ''}
                onChange={onChange}
                placeholder={`Votre ${label.toLowerCase()}`}
                className="w-full text-sm"
              />
            ) : (
              <Input
                value={editedValue || ''}
                onChange={(e) => onChange(e.target.value)}
                type={type}
                placeholder={`Votre ${label.toLowerCase()}`}
                className="w-full text-sm"
                autoFocus
              />
            )}
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleSave}
                size="sm"
                className="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 min-w-[80px] sm:min-w-[100px] text-xs sm:text-sm h-8 sm:h-9"
              >
                Enregistrer
              </Button>
              <Button
                onClick={onCancel}
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 text-xs sm:text-sm h-8 sm:h-9"
              >
                Annuler
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center min-w-0">
            {icon}
            <span className="text-xs sm:text-sm truncate flex-1 text-gray-900">
              {getFormattedDisplayValue() || <span className="text-gray-500 italic">Non renseigné</span>}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for memo
  return (
    prevProps.value === nextProps.value &&
    prevProps.isEditing === nextProps.isEditing &&
    prevProps.editedValue === nextProps.editedValue
  );
});

EditableField.displayName = 'EditableField';

export default EditableField;