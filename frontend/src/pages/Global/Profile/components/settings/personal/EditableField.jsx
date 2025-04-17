import React, { memo, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from '@/components/ui/phone-input';
import { NameInput } from '@/components/ui/name-input';
import { Label } from '@/components/ui/label';
import { Pencil, Loader2, ExternalLink } from 'lucide-react';
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
  loading = false
}) => {
  // Local state for optimistic updates
  const [localValue, setLocalValue] = useState(value);
  const [error, setError] = useState(null);
  
  // Update local value when the actual value changes (only if not in edit mode)
  useEffect(() => {
    if (!isEditing) {
      setLocalValue(value);
      setError(null);
      
      // Également synchroniser la valeur éditée avec la valeur actuelle quand on n'est pas en mode édition
      if (onChange && type === 'url' && !isEditing) {
        onChange(value);
      }
    }
  }, [value, isEditing, onChange, type]);
  
  // Always display the most up-to-date value (either edited or saved)
  const displayValue = isEditing ? editedValue : (localValue || value);
  
  // Format the display value based on the field type
  const getFormattedDisplayValue = () => {
    if (type === 'phone' && displayValue) {
      return formatFrenchPhoneNumber(displayValue);
    }
    return displayValue;
  };

  // Tronquer une URL longue pour l'affichage
  const getTruncatedUrl = (url) => {
    if (!url) return '';
    
    if (url.length > 40) {
      return url.substring(0, 37) + '...';
    }
    return url;
  };
  
  // Handle save with optimistic update
  const handleSave = React.useCallback(async () => {
    try {
      // Validation spécifique pour les URLs
      if (type === 'url' && editedValue && !editedValue.startsWith('https://')) {
        setError("L'URL doit commencer par https://");
        toast.error("L'URL doit commencer par https://");
        return;
      }
      
      // Update local value immediately for optimistic UI
      setLocalValue(editedValue);
      
      // Exit edit mode immediately for better UX
      if (onEdit) {
        onEdit(); // This will toggle edit mode off
      }
      
      // Call the save function in the background
      await onSave(field);
      setError(null);
      
      // Dispatch user:data-updated event when LinkedIn URL is updated
      if (field === 'linkedinUrl') {
        document.dispatchEvent(new CustomEvent('user:data-updated'));
      }
    } catch (err) {
      // Revert optimistic update on error
      setLocalValue(value);
      setError(err.response?.data?.message || 'Une erreur est survenue');
      toast.error(err.response?.data?.message || 'Une erreur est survenue');
    }
  }, [onSave, field, editedValue, onEdit, value, type]);

  return (
    <div 
      className={`
        rounded-lg transition-all duration-200 
        ${isEditing ? 'bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-[#78b9dd]/40 shadow-sm dark:shadow-[0_0_10px_rgba(120,185,221,0.15)]' : 'bg-gray-50 dark:bg-gray-800/60 dark:border dark:border-gray-700'} 
        ${!isEditing ? 'hover:bg-gray-100 dark:hover:bg-gray-700/70' : ''} 
        p-3 sm:p-4 md:p-5 
        ${className}
      `}
    >
      <Label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center justify-between">
      <span className="flex items-center gap-2">
          {icon}
          {label}
        </span>
        {isEditable && !isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="h-7 w-7 p-1 text-blue-600 dark:text-[#78b9dd] hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-[#78b9dd]/20 dark:hover:text-[#a0d0ec] transition-colors"
            disabled={loading}
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
              disabled={loading}
            />
          ) : (
            <Input
              type={type}
              value={editedValue}
              onChange={(e) => onChange(e.target.value)}
              className={`w-full ${error ? 'border-red-500' : ''}`}
              disabled={loading}
              placeholder={type === 'url' ? 'https://...' : ''}
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
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? (
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
        <div className="mt-1 min-h-[1.5rem]">
          {loading ? (
            <Skeleton className="h-5 w-full" />
          ) : displayValue ? (
            type === 'url' ? (
              <a
                href={displayValue}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 break-all"
              >
                <span className="truncate mr-1">{getTruncatedUrl(displayValue)}</span>
                <ExternalLink className="h-3 w-3 opacity-70 group-hover:opacity-100 flex-shrink-0" />
              </a>
            ) : (
              <span className="text-gray-900 dark:text-gray-100">{getFormattedDisplayValue()}</span>
            )
          ) : (
            <span className="text-gray-500 dark:text-gray-400">Non renseigné</span>
          )}
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for memo
  // N'inclure que les propriétés essentielles pour éviter des re-rendus inutiles
  return (
    prevProps.value === nextProps.value &&
    prevProps.isEditing === nextProps.isEditing &&
    prevProps.editedValue === nextProps.editedValue &&
    prevProps.loading === nextProps.loading
  );
});

EditableField.displayName = 'EditableField';

export default EditableField;