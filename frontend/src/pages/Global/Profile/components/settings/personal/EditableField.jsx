import React, { memo, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from '@/components/ui/phone-input';
import { NameInput } from '@/components/ui/name-input';
import { Label } from '@/components/ui/label';
import { Pencil, Loader2 } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { formatFrenchPhoneNumber } from '@/lib/utils/formatting';
import { toast } from 'sonner';

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
  const [error, setError] = useState(null);
  
  // Handle save with optimistic update
  const handleSave = React.useCallback(async () => {
    try {
      // Update local value immediately for optimistic UI
      setLocalValue(editedValue);
      
      // Exit edit mode immediately for better UX
      if (onEdit) {
        onEdit(); // This will toggle edit mode off
      }
      
      // Call the save function in the background
      await onSave(field);
      setError(null);
    } catch (err) {
      // Revert optimistic update on error
      setLocalValue(value);
      setError(err.response?.data?.message || 'Une erreur est survenue');
      toast.error(err.response?.data?.message || 'Une erreur est survenue');
    }
  }, [onSave, field, editedValue, onEdit, value]);

  // Update local value when the actual value changes
  React.useEffect(() => {
    if (!isEditing) {
      setLocalValue(value);
      setError(null);
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

      {isEditing ? (
        <div className="mt-2 space-y-2">
          {type === 'phone' ? (
            <PhoneInput
              value={editedValue}
              onChange={onChange}
              className="w-full"
            />
          ) : (
            <Input
              type={type}
              value={editedValue}
              onChange={(e) => onChange(e.target.value)}
              className={`w-full ${error ? 'border-red-500' : ''}`}
            />
          )}
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          <div className="flex justify-end space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={isSaving}
            >
              Annuler
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                'Enregistrer'
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-1">
          {displayValue ? (
            type === 'url' ? (
              <a
                href={displayValue}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 break-all"
              >
                {displayValue}
              </a>
            ) : (
              <span className="text-gray-900">{getFormattedDisplayValue()}</span>
            )
          ) : (
            <span className="text-gray-500">Non renseigné</span>
          )}
        </div>
      )}
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