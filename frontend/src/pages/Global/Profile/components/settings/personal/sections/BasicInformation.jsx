import React, { memo } from 'react';
import { User, Calendar, Globe } from 'lucide-react';
import EditableField from '../EditableField';
import { Label } from '@/components/ui/label';
import { formatDate } from '../utils/formatters';

// Static field component for better performance
const StaticField = memo(({ label, icon, value }) => (
  <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
    <Label className="text-sm font-medium text-gray-700">{label}</Label>
    <div className="mt-2">
      <div className="flex items-center text-sm text-gray-900">
        {icon}
        <span className="font-medium">{value}</span>
      </div>
    </div>
  </div>
));

StaticField.displayName = 'StaticField';

const BasicInformation = memo(({
  userData,
  editingFields,
  editedData,
  userRole,
  onEdit,
  onSave,
  onCancel,
  onChange,
  isFieldEditable,
  isSaving = {}
}) => {
  // Memoize handlers
  const handleEdit = React.useCallback((field) => () => onEdit(field), [onEdit]);
  const handleSave = React.useCallback((field) => () => onSave(field), [onSave]);
  const handleCancel = React.useCallback((field) => () => onCancel(field), [onCancel]);
  const handleChange = React.useCallback((field) => (value) => onChange(field, value), [onChange]);

  return (
    <section className="animate-in fade-in duration-500">
      <h2 className="text-lg sm:text-xl font-semibold flex items-center mb-4 sm:mb-6">
        <User className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-blue-600" />
        Informations personnelles
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
        <EditableField
          field="firstName"
          label="Prénom"
          icon={<User className="h-4 w-4 mr-2 text-gray-500" />}
          value={userData.firstName}
          isEditing={editingFields.firstName}
          isEditable={isFieldEditable('firstName')}
          editedValue={editedData.personal.firstName}
          onEdit={handleEdit('firstName')}
          onSave={handleSave('firstName')}
          onCancel={handleCancel('firstName')}
          onChange={handleChange('firstName')}
          isSaving={isSaving.firstName}
        />

        <EditableField
          field="lastName"
          label="Nom"
          icon={<User className="h-4 w-4 mr-2 text-gray-500" />}
          value={userData.lastName}
          isEditing={editingFields.lastName}
          isEditable={isFieldEditable('lastName')}
          editedValue={editedData.personal.lastName}
          onEdit={handleEdit('lastName')}
          onSave={handleSave('lastName')}
          onCancel={handleCancel('lastName')}
          onChange={handleChange('lastName')}
          isSaving={isSaving.lastName}
        />
        
        {/* Non-editable fields */}
        <StaticField
          label="Date de naissance"
          icon={<Calendar className="h-4 w-4 mr-2 text-blue-500" />}
          value={
            <>
              {formatDate(userData.birthDate)}
              {userData.age && <span className="ml-2 text-gray-500">({userData.age} ans)</span>}
            </>
          }
        />

        <StaticField
          label="Nationalité"
          icon={<Globe className="h-4 w-4 mr-2 text-blue-500" />}
          value={userData.nationality?.name || 'Non renseignée'}
        />
      </div>
    </section>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for memo
  return (
    prevProps.userData === nextProps.userData &&
    prevProps.editingFields === nextProps.editingFields &&
    prevProps.editedData === nextProps.editedData &&
    prevProps.isSaving === nextProps.isSaving
  );
});

BasicInformation.displayName = 'BasicInformation';

export default BasicInformation; 