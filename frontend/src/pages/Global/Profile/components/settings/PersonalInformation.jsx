import React, { useEffect } from 'react';
import { User, Pencil, Phone, Briefcase } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { SimpleDatePicker } from './personal/SimpleDatePicker';
import { PersonalInformationSkeleton } from './personal/PersonalInformationSkeleton';
import { PersonalInfoSection } from './personal/PersonalInfoSection';
import { ContactInfoSection } from './personal/ContactInfoSection';
import { ProfessionalInfoSection } from './personal/ProfessionalInfoSection';
import { usePersonalInformation } from './personal/usePersonalInformation';

const PersonalInformation = ({ 
  userData, 
  editMode, 
  setEditMode, 
  editedData, 
  setEditedData, 
  userRole,
  onSave,
  onSaveAddress,
  isLoading = false
}) => {
  // If loading, show skeleton
  if (isLoading) {
    return <PersonalInformationSkeleton />;
  }

  const {
    isStudent,
    isAdmin,
    studentProfile,
    isFieldEditable,
    handleInputChange,
    toggleFieldEdit,
    handleCancelField,
  } = usePersonalInformation({
    userData,
    userRole,
    editMode,
    setEditMode,
    editedData,
    setEditedData
  });

  // Update editedData when userData or studentProfile changes
  useEffect(() => {
    if (userData) {
      const newPersonalData = {
        firstName: userData.firstName ?? '',
        lastName: userData.lastName ?? '',
        email: userData.email ?? '',
        phoneNumber: userData.phoneNumber ?? '',
        linkedinUrl: userData.linkedinUrl ?? '',
        portfolioUrl: studentProfile?.portfolioUrl ?? '',
      };

      // Get the first address if available
      const address = userData.addresses && userData.addresses.length > 0 
        ? userData.addresses[0] 
        : null;

      // Only update if we're not in edit mode to prevent overwriting user input
      if (!editMode.address) {
        setEditedData(prev => ({
          ...prev,
          personal: newPersonalData,
          address: address ? {
            name: address.name || '',
            complement: address.complement || '',
            postalCode: { code: address.postalCode?.code || '' },
            city: { name: address.city?.name || '' }
          } : {
            name: '',
            complement: '',
            postalCode: { code: '' },
            city: { name: '' }
          }
        }));
      } else {
        // If in edit mode, only update personal data
        setEditedData(prev => ({
          ...prev,
          personal: newPersonalData
        }));
      }
    }
  }, [userData?.id]); // Only depend on userData.id to prevent unnecessary rerenders

  return (
    <div className="space-y-6 sm:space-y-8 w-full px-1 sm:px-2 md:px-4">
      {/* Personal Information Section */}
      <div>
        <h3 className="text-base sm:text-lg font-semibold flex items-center mb-3 sm:mb-5">
          <User className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 text-blue-600" />
          Informations personnelles
        </h3>
        <PersonalInfoSection 
          userData={userData}
          editedData={editedData}
          editMode={editMode}
          isFieldEditable={isFieldEditable}
          toggleFieldEdit={toggleFieldEdit}
          handleCancelField={handleCancelField}
          handleInputChange={handleInputChange}
          onSave={onSave}
        />
      </div>

      <Separator className="my-6 sm:my-8" />

      {/* Contact Information Section */}
      <div>
        <h3 className="text-base sm:text-lg font-semibold flex items-center mb-3 sm:mb-5">
          <Phone className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 text-blue-600" />
          Coordonnées
        </h3>
        <ContactInfoSection 
          userData={userData}
          editedData={editedData}
          editMode={editMode}
          setEditedData={setEditedData}
          isFieldEditable={isFieldEditable}
          toggleFieldEdit={toggleFieldEdit}
          handleCancelField={handleCancelField}
          handleInputChange={handleInputChange}
          onSave={onSave}
          onSaveAddress={onSaveAddress}
          setEditMode={setEditMode}
        />
      </div>

      <Separator className="my-6 sm:my-8" />

      {/* Professional Information Section */}
      <div>
        <h3 className="text-base sm:text-lg font-semibold flex items-center mb-3 sm:mb-5">
          <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 text-blue-600" />
          Ma carrière
        </h3>
        <ProfessionalInfoSection 
          userData={userData}
          studentProfile={studentProfile}
          editedData={editedData}
          editMode={editMode}
          isStudent={isStudent}
          isAdmin={isAdmin}
          toggleFieldEdit={toggleFieldEdit}
          handleCancelField={handleCancelField}
          handleInputChange={handleInputChange}
          onSave={onSave}
        />
      </div>
    </div>
  );
};

export default PersonalInformation; 