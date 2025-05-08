import React, { memo, useState, useEffect, useRef } from 'react';
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
  loading = false,
  displayAsLink = false
}) => {
  // Local state for optimistic updates
  const [localValue, setLocalValue] = useState(value);
  const [error, setError] = useState(null);
  
  // Ajout d'une ref pour l'input URL
  const inputRef = useRef(null);

  // Place le curseur à la fin du champ URL lors du passage en édition
  useEffect(() => {
    if (isEditing && type === 'url' && inputRef.current) {
      const input = inputRef.current;
      // Place le curseur à la fin
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    }
  }, [isEditing, type]);
  
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
    <div className={`address-edit-card w-full ${className} flex flex-col justify-between`}>
      {isEditing ? (
        <>
          <div className="flex items-center gap-4 mb-2">
            {icon && <span className="flex items-center justify-center"><span className="h-5 w-5 text-blue-500 flex items-center justify-center">{icon}</span></span>}
            <Label className="text-sm font-semibold text-gray-700 p-0 m-0 leading-none">{label}</Label>
          </div>
          <div className="mt-1 space-y-2">
            {type === 'phone' ? (
              <PhoneInput
                value={editedValue}
                onChange={onChange}
                className="address-input w-full pl-10"
                disabled={loading}
              />
            ) : (
              <div className="relative mb-4">
                <Input
                  type={type}
                  value={editedValue}
                  onChange={(e) => onChange(e.target.value)}
                  className={`address-input w-full pl-10 ${error ? 'border-red-500' : ''} break-all`}
                  disabled={loading}
                  placeholder={type === 'url' ? 'https://...' : ''}
                  ref={type === 'url' ? inputRef : undefined}
                />
                {icon && <span className="address-input-icon h-5 w-5 text-blue-500 flex items-center justify-center">{icon}</span>}
              </div>
            )}
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            <div className="flex justify-end space-x-2 mt-3">
              <button
                type="button"
                className="address-btn-secondary address-btn-compact"
                onClick={onCancel}
                disabled={loading}
              >Annuler</button>
              <button
                type="button"
                className="address-btn-primary address-btn-compact"
                onClick={handleSave}
                disabled={loading}
              >Enregistrer</button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-1">
            {icon && <span className="flex items-center justify-center"><span className="h-5 w-5 text-blue-500 flex items-center justify-center">{icon}</span></span>}
            <Label className="text-sm font-semibold text-gray-700 p-0 m-0 leading-none">{label}</Label>
            {isEditable && (
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors flex items-center justify-center"
                onClick={onEdit}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="mt-1 min-h-[2.2rem] flex items-center text-base text-gray-900 pl-0">
            {displayAsLink && displayValue ? (
              <a href={displayValue} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">{getFormattedDisplayValue()}</a>
            ) : (
              <span className="break-all">{getFormattedDisplayValue() || <span className='text-gray-400 italic'>Non renseigné</span>}</span>
            )}
          </div>
        </>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for memo
  // Include displayAsLink if its changes should trigger re-render
  return (
    prevProps.value === nextProps.value &&
    prevProps.isEditing === nextProps.isEditing &&
    prevProps.editedValue === nextProps.editedValue &&
    prevProps.loading === nextProps.loading &&
    prevProps.displayAsLink === nextProps.displayAsLink
  );
});

EditableField.displayName = 'EditableField';

export default EditableField;