import React from 'react';
import { User, Calendar, Globe } from 'lucide-react';
import EditableField from './EditableField';
import StaticField from './StaticField';
import { formatDate } from './utils';
import { Button } from '@/components/ui/button';

export const PersonalInfoSection = ({ 
  userData, 
  editedData, 
  editMode, 
  isFieldEditable, 
  toggleFieldEdit, 
  handleCancelField, 
  handleInputChange, 
  onSave
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
      {/* First Name */}
      <div className="address-edit-card w-full">
        {isFieldEditable('firstName') ? (
          <EditableField
            field="firstName"
            label="Prénom"
            icon={<User className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-gray-500" />}
            value={userData.firstName}
            editedValue={editedData.personal.firstName}
            isEditing={editMode.firstName}
            isEditable={true}
            onEdit={() => toggleFieldEdit('firstName')}
            onSave={onSave}
            onCancel={() => handleCancelField('firstName')}
            onChange={(value) => handleInputChange('firstName', value)}
          />
        ) : (
          <StaticField 
            label="Prénom"
            icon={<User className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-gray-500" />}
            value={userData.firstName || 'Non renseigné'}
          />
        )}
      </div>

      {/* Last Name */}
      <div className="address-edit-card w-full">
        {isFieldEditable('lastName') ? (
          <EditableField
            field="lastName"
            label="Nom"
            icon={<User className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-gray-500" />}
            value={userData.lastName}
            editedValue={editedData.personal.lastName}
            isEditing={editMode.lastName}
            isEditable={true}
            onEdit={() => toggleFieldEdit('lastName')}
            onSave={onSave}
            onCancel={() => handleCancelField('lastName')}
            onChange={(value) => handleInputChange('lastName', value)}
          />
        ) : (
          <StaticField 
            label="Nom"
            icon={<User className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-gray-500" />}
            value={userData.lastName || 'Non renseigné'}
          />
        )}
      </div>
      
      {/* Birth Date - Toujours afficher en mode statique pour éviter les problèmes */}
      <div className="address-edit-card w-full">
        <StaticField 
          label="Date de naissance"
          icon={<Calendar className="h-4 w-4 mr-2 text-blue-500" />}
          value={`${formatDate(userData.birthDate)}${userData.age ? ` (${userData.age} ans)` : ''}`}
        />
      </div>

      {/* Nationality */}
      <div className="address-edit-card w-full">
        <StaticField 
          label="Nationalité"
          icon={<Globe className="h-4 w-4 mr-2 text-blue-500" />}
          value={userData.nationality?.name || 'Non renseignée'}
        />
      </div>
    </div>
  );
}; 