import { useState } from 'react';
import { Button } from '../../../../../components/ui/button';
import { Calendar, Gift, Upload, User, Users } from 'lucide-react';
import { EditableField } from './EditableField';
import { formatDate } from './utils';
import PropTypes from 'prop-types';

/**
 * Section d'informations personnelles dans les paramètres de profil
 * 
 * @param {Object} props - Les propriétés du composant
 * @returns {JSX.Element} - Section d'informations personnelles
 */
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
  const [uploadingIdentity, setUploadingIdentity] = useState(false);
  
  // Gérer le téléversement de document d'identité
  const handleUploadIdentity = async (e) => {
    e.preventDefault();
    
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      setUploadingIdentity(true);
      await onUploadIdentity(file);
    } finally {
      setUploadingIdentity(false);
      e.target.value = null; // Réinitialiser l'input pour permettre un nouveau téléversement du même fichier
    }
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Informations personnelles</h3>
      
      {/* Prénom */}
      <EditableField
        field="firstName"
        label="Prénom"
        icon={<User className="h-4 w-4" />}
        value={userData.firstName}
        isEditing={editMode.firstName}
        isEditable={isFieldEditable('firstName')}
        editedValue={editedData.personal?.firstName}
        onEdit={() => toggleFieldEdit('firstName')}
        onSave={() => onSave('firstName')}
        onCancel={() => handleCancelField('firstName')}
        onChange={(e) => handleInputChange('firstName', e.target.value)}
      />
      
      {/* Nom */}
      <EditableField
        field="lastName"
        label="Nom"
        icon={<Users className="h-4 w-4" />}
        value={userData.lastName}
        isEditing={editMode.lastName}
        isEditable={isFieldEditable('lastName')}
        editedValue={editedData.personal?.lastName}
        onEdit={() => toggleFieldEdit('lastName')}
        onSave={() => onSave('lastName')}
        onCancel={() => handleCancelField('lastName')}
        onChange={(e) => handleInputChange('lastName', e.target.value)}
      />
      
      {/* Date de naissance */}
      <div className="flex items-start justify-between py-2">
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <div>
            <span className="text-sm font-medium">Date de naissance</span>
            <p className="text-sm text-gray-500">
              {userData.birthDate ? `${formatDate(userData.birthDate)} (${userData.age} ans)` : 'Non renseignée'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Nationalité */}
      <div className="flex items-start justify-between py-2">
        <div className="flex items-center space-x-2">
          <Gift className="h-4 w-4 text-gray-500" />
          <div>
            <span className="text-sm font-medium">Nationalité</span>
            <p className="text-sm text-gray-500">
              {userData.nationality?.name || "Non renseignée"}
            </p>
          </div>
        </div>
      </div>
      
      {/* Documents d'identité */}
      <div className="flex flex-col space-y-2 py-2">
        <h4 className="text-sm font-medium">Documents d&apos;identité</h4>
        
        {/* Liste des documents d'identité */}
        {userData.identityDocuments && userData.identityDocuments.length > 0 ? (
          <div className="space-y-2">
            {userData.identityDocuments.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                <span className="text-sm">{doc.name}</span>
                <Button variant="ghost" size="sm">Télécharger</Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Aucun document d&apos;identité n&apos;a été téléversé</p>
        )}
        
        {/* Bouton pour ajouter un document d'identité */}
        <div className="mt-2">
          <label htmlFor="upload-identity" className="relative">
            <input
              id="upload-identity"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="absolute inset-0 opacity-0"
              onChange={handleUploadIdentity}
              disabled={uploadingIdentity}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              disabled={uploadingIdentity}
            >
              <Upload className="mr-2 h-4 w-4" />
              {uploadingIdentity ? "Téléversement en cours..." : "Ajouter un document d&apos;identité"}
            </Button>
          </label>
        </div>
      </div>
    </div>
  );
};

// Définition des PropTypes
PersonalInfoSection.propTypes = {
  userData: PropTypes.shape({
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    birthDate: PropTypes.string,
    age: PropTypes.number,
    nationality: PropTypes.shape({
      name: PropTypes.string
    }),
    identityDocuments: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        name: PropTypes.string
      })
    )
  }).isRequired,
  editedData: PropTypes.shape({
    personal: PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string
    })
  }).isRequired,
  editMode: PropTypes.shape({
    firstName: PropTypes.bool,
    lastName: PropTypes.bool
  }).isRequired,
  isFieldEditable: PropTypes.func.isRequired,
  toggleFieldEdit: PropTypes.func.isRequired,
  handleCancelField: PropTypes.func.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onUploadIdentity: PropTypes.func.isRequired
}; 