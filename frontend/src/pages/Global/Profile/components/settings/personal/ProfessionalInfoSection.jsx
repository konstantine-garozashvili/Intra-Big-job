import React from 'react';
import { Briefcase, GraduationCap, Linkedin, Link } from 'lucide-react';
import EditableField from '../personal/EditableField';
import { StaticField } from './StaticField';

export const ProfessionalInfoSection = ({ 
  userData, 
  studentProfile,
  editedData, 
  editMode, 
  isStudent,
  isAdmin,
  toggleFieldEdit, 
  handleCancelField, 
  handleInputChange, 
  onSave 
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
      <StaticField 
        label="Domaine"
        icon={<Briefcase className="h-4 w-4 mr-2 text-blue-500" />}
        value={userData.specialization?.domain?.name || 'Non renseigné'}
      />

      <StaticField 
        label="Spécialisation"
        icon={<GraduationCap className="h-4 w-4 mr-2 text-blue-500" />}
        value={userData.specialization?.name || 'Non renseignée'}
      />

      <EditableField
        field="linkedinUrl"
        label="LinkedIn"
        icon={<Linkedin className="h-4 w-4 mr-2 text-gray-500" />}
        value={userData.linkedinUrl}
        editedValue={editedData.personal.linkedinUrl}
        type="url"
        isEditing={editMode.linkedinUrl}
        isEditable={true}
        onEdit={() => toggleFieldEdit('linkedinUrl')}
        onSave={onSave}
        onCancel={() => handleCancelField('linkedinUrl')}
        onChange={(value) => handleInputChange('linkedinUrl', value)}
      />

      {isStudent && (
        <EditableField
          field="portfolioUrl"
          label="Portfolio"
          icon={<Link className="h-4 w-4 mr-2 text-gray-500" />}
          value={studentProfile?.portfolioUrl}
          editedValue={editedData.personal.portfolioUrl}
          type="url"
          isEditing={editMode.portfolioUrl}
          isEditable={true}
          onEdit={() => toggleFieldEdit('portfolioUrl')}
          onSave={onSave}
          onCancel={() => handleCancelField('portfolioUrl')}
          onChange={(value) => handleInputChange('portfolioUrl', value)}
        />
      )}

      {isStudent && (
        <StaticField 
          label="Situation actuelle"
          icon={<Briefcase className="h-4 w-4 mr-2 text-blue-500" />}
          value={studentProfile.situationType?.name || 'Non renseignée'}
        />
      )}
    </div>
  );
}; 