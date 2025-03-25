import React from 'react';
import { User, Calendar, Globe, FileBox } from 'lucide-react';
import EditableField from '../personal/EditableField';
import { StaticField } from './StaticField';
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
  onSave,
  onUploadIdentity
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
      {/* First Name */}
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

      {/* Last Name */}
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
      
      {/* Birth Date - Toujours afficher en mode statique pour éviter les problèmes */}
      <StaticField 
        label="Date de naissance"
        icon={<Calendar className="h-4 w-4 mr-2 text-blue-500 dark:text-[#78b9dd]" />}
        value={`${formatDate(userData.birthDate)}${userData.age ? ` (${userData.age} ans)` : ''}`}
      />

      {/* Nationality */}
      <StaticField 
        label="Nationalité"
        icon={<Globe className="h-4 w-4 mr-2 text-blue-500 dark:text-[#78b9dd]" />}
        value={userData.nationality?.name || 'Non renseignée'}
      />

      {/* Identity Documents Section - Span full width */}
      <div className="col-span-1 sm:col-span-2 mt-2">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center">
            <FileBox className="h-4 w-4 mr-2 text-blue-500 dark:text-[#78b9dd]" />
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Pièces d'identité</span>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mt-1 bg-gray-50 dark:bg-gray-800/60 dark:border dark:border-gray-700 p-3 rounded-md">
            <div className="flex-1">
              {userData.identityDocuments && userData.identityDocuments.length > 0 ? (
                <div className="flex flex-col space-y-2">
                  {userData.identityDocuments.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-700/80 p-2 rounded border dark:border-gray-600">
                      <span className="text-sm truncate text-gray-900 dark:text-gray-100">{doc.name || `Document ${index + 1}`}</span>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="h-7 px-2 text-xs dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white">Voir</Button>
                        <Button variant="destructive" size="sm" className="h-7 px-2 text-xs dark:bg-red-600/80 dark:hover:bg-red-600">Supprimer</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">Aucune pièce d'identité n'a été téléchargée.</p>
              )}
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              className="whitespace-nowrap dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700/90 dark:hover:border-[#78b9dd]/60 dark:hover:text-[#78b9dd]"
              onClick={() => onUploadIdentity && onUploadIdentity()}
            >
              Ajouter un document
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}; 