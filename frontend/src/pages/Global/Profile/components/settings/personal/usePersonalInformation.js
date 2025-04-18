import { useCallback } from 'react';
import { toast } from 'sonner';
import * as roleUtils from '../../../utils/roleUtils';

export const usePersonalInformation = ({
  userData,
  userRole,
  editMode,
  setEditMode,
  editedData,
  setEditedData,
  currentUser
}) => {
  const isStudent = userRole === 'ROLE_STUDENT';
  const isSuperAdmin = userRole === 'ROLE_SUPER_ADMIN' || userRole === 'SUPER_ADMIN' || userRole === 'SUPERADMIN';
  const isAdmin = useCallback(() => {
    const adminRoles = ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'SUPERADMIN'];
    return adminRoles.includes(userRole);
  }, [userRole])();
  
  const isGuest = userRole === 'ROLE_GUEST' || userRole === 'GUEST';
  
  const studentProfile = userData?.studentProfile || {};
  
  const isFieldEditable = useCallback((field) => {
    // SuperAdmin can edit everything
    if (isSuperAdmin) return true;
    
    // Admins can edit everything
    if (isAdmin) return true;
    
    // For address field, check if user is a guest viewing their own profile
    if (field === 'address') {
      // Guests can edit their own address
      if (isGuest && userData?.id === currentUser?.id) {
        return true;
      }
      return false;
    }
    
    // For all non-admin users, only allow editing specific fields
    const editableFields = ['phoneNumber', 'linkedinUrl'];
    
    // Students can also edit portfolioUrl
    if (isStudent) {
      editableFields.push('portfolioUrl');
    }
    
    // Only allow editing the fields in the editableFields array
    return editableFields.includes(field);
  }, [isAdmin, isStudent, isGuest, isSuperAdmin, userData?.id, currentUser?.id]);

  // Function to handle input changes
  const handleInputChange = (field, value) => {
    // For birthDate field, validate minimum age
    if (field === 'birthDate') {
      const isValidAge = validateMinimumAge(value);
      if (!isValidAge) {
        toast.error("Vous devez avoir au moins 16 ans pour vous inscrire.");
        return;
      }
    }
    
    setEditedData(prev => ({
      ...prev,
      personal: {
        ...prev.personal,
        [field]: value
      },
    }));
  };

  // Function to validate minimum age (16 years)
  const validateMinimumAge = (dateString) => {
    if (!dateString) return true;
    
    try {
      const birthDate = new Date(dateString);
      if (isNaN(birthDate.getTime())) return false;
      
      const today = new Date();
      const minAgeDate = new Date(today);
      minAgeDate.setFullYear(today.getFullYear() - 16);
      
      return birthDate <= minAgeDate;
    } catch (e) {
      // console.error('Error validating age:', e);
      return false;
    }
  };

  // Function to toggle edit mode for a specific field
  const toggleFieldEdit = (field) => {
    setEditMode(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Function to cancel editing a field
  const handleCancelField = (field) => {
    setEditedData(prev => ({
      ...prev,
      personal: {
        ...prev.personal,
        [field]: field === 'portfolioUrl' ? (studentProfile?.portfolioUrl ?? '') : (userData[field] ?? '')
      }
    }));
    setEditMode(prev => ({
      ...prev,
      [field]: false
    }));
  };

  // Function to handle cancel for address field
  const handleCancelAddress = () => {
    const address = userData.addresses && userData.addresses.length > 0 
      ? userData.addresses[0] 
      : null;

    setEditedData(prev => ({
      ...prev,
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
    setEditMode(prev => ({
      ...prev,
      address: false
    }));
  };

  return {
    isStudent,
    isAdmin,
    isSuperAdmin,
    isGuest,
    studentProfile,
    isFieldEditable,
    handleInputChange,
    toggleFieldEdit,
    handleCancelField,
    handleCancelAddress,
    validateMinimumAge
  };
}; 