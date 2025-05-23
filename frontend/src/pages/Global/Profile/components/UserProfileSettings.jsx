import React, { useState, useEffect, useCallback } from 'react';
import { useApiQuery, useApiMutation } from '@/hooks/useReactQuery';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useQueryClient } from '@tanstack/react-query';
import { profileService } from '../services/profileService';
import { notificationService } from '@/lib/services/notificationService';
import ProfilePicture from './settings/ProfilePicture';
import { isValidEmail, isValidPhone, isValidLinkedInUrl, isValidName, isValidUrl } from '@/lib/utils/validation';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import { Upload, FileText, Trash2, Send } from 'lucide-react';
// Importer notre hook centralisé
import { useUserDataCentralized } from '@/hooks';

// Import our components using the barrel export
import {
  PersonalInformation,
  AdministrativeInformation
} from './settings';

/**
 * UserProfileSettings component that uses React Query to fetch and manage user profile data
 */
const UserProfileSettings = () => {
  // Get the query client instance
  const queryClient = useQueryClient();
  
  // Add state for edit mode and edited data
  const [editMode, setEditMode] = useState({
    personal: false,
    address: false,
    academic: false,
  });
  
  const [editedData, setEditedData] = useState({
    personal: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      linkedinUrl: '',
      portfolioUrl: '',
      nationality: '',
      birthDate: '',
    },
    address: {},
    academic: {},
  });

  // Utiliser notre hook centralisé pour récupérer les données utilisateur
  const { 
    user: userData, 
    isLoading: isProfileLoading, 
    isError: isProfileError,
    error: profileError,
    forceRefresh: refetchProfile
  } = useUserDataCentralized({
    refetchOnWindowFocus: true,    // Enable refetching when window focus changes
    refetchOnMount: true,          // Enable refetching when component mounts
    staleTime: 0,                  // Consider data stale immediately
    cacheTime: 5 * 60 * 1000,      // Keep in cache for 5 minutes
    onError: (error) => {
      toast.error('Failed to load profile data: ' + (error.message || 'Unknown error'));
    }
  });

  // Transformer les données utilisateur pour maintenir la compatibilité
  const profileData = React.useMemo(() => {
    if (!userData) return null;
    return {
      data: {
        user: userData,
        addresses: userData.addresses || [],
        studentProfile: userData.studentProfile || null,
      }
    };
  }, [userData]);
  
  // Determine if user is a student and get role - memoized to prevent unnecessary recalculations
  const { userRole, isStudent } = React.useMemo(() => {
    const userRoles = userData?.roles || [];
    const rolesArray = Array.isArray(userRoles) 
      ? userRoles 
      : (typeof userRoles === 'object' ? Object.values(userRoles) : []);
    
    const isStudent = rolesArray.some(role => 
      typeof role === 'string' && role.includes('STUDENT')
    ) || (userData?.studentProfile && Object.keys(userData?.studentProfile || {}).length > 0);
    
    let userRole = '';
    if (isStudent) {
      userRole = 'ROLE_STUDENT';
    } else if (rolesArray.length > 0) {
      const firstRole = rolesArray[0];
      userRole = typeof firstRole === 'object' && firstRole !== null && firstRole.name
        ? firstRole.name
        : String(firstRole);
    }
    
    return { userRole, isStudent };
  }, [userData?.roles, userData?.studentProfile]);

  // Initialize editedData when userData changes
  useEffect(() => {
    // Only reset if no field is being edited
    const isAnyFieldEditing = Object.values(editMode).some(Boolean);
    if (!isAnyFieldEditing && userData && Object.keys(userData).length > 0) {
      // Use a deep comparison to avoid unnecessary updates
      const newPersonalData = {
        firstName: userData.firstName ?? '',
        lastName: userData.lastName ?? '',
        email: userData.email ?? '',
        phoneNumber: userData.phoneNumber ?? '',
        linkedinUrl: userData.linkedinUrl ?? '',
        portfolioUrl: userData.studentProfile?.portfolioUrl ?? '',
        nationality: userData.nationality ?? '',
        birthDate: userData.birthDate ?? '',
      };
      
      // Only update if the data has actually changed
      if (JSON.stringify(newPersonalData) !== JSON.stringify(editedData.personal)) {
        setEditedData(prev => ({
          ...prev,
          personal: newPersonalData,
          address: {},
          academic: {},
        }));
      }
    }
  }, [profileData, editMode]);

  // Add event listener for portfolio URL updates from other components
  useEffect(() => {
    const handlePortfolioUrlUpdate = (event) => {
      if (event.detail?.portfolioUrl !== undefined) {
        const newPortfolioUrl = event.detail.portfolioUrl;
        
        // Update local state if different
        if (editedData.personal.portfolioUrl !== newPortfolioUrl) {
          setEditedData(prev => ({
            ...prev,
            personal: {
              ...prev.personal,
              portfolioUrl: newPortfolioUrl
            }
          }));
        }
      }
    };
    
    // Listen for portfolio URL update events
    window.addEventListener('portfolio-url-updated', handlePortfolioUrlUpdate);
    
    return () => {
      window.removeEventListener('portfolio-url-updated', handlePortfolioUrlUpdate);
    };
  }, [editedData.personal.portfolioUrl]);

  // Helper function to calculate age from birthdate
  const calculateAge = (birthDateString) => {
    if (!birthDateString) return null;
    
    try {
      const birthDate = new Date(birthDateString);
      if (isNaN(birthDate.getTime())) return null;
      
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      // Adjust age if birthday hasn't occurred yet this year
      const hasBirthdayOccurredThisYear = 
        today.getMonth() > birthDate.getMonth() || 
        (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
      
      return hasBirthdayOccurredThisYear ? age : age - 1;
    } catch (e) {
      return null;
    }
  };

  // Function to update local state optimistically
  const updateLocalState = useCallback((field, value) => {
    if (field === 'portfolioUrl') {
      setEditedData(prev => ({
        ...prev,
        personal: {
          ...prev.personal,
          portfolioUrl: value
        }
      }));
      // Update userData immediately for optimistic UI
      if (userData && userData.studentProfile) {
        // Create a new reference for studentProfile to trigger proper React updates
        userData.studentProfile = {
          ...userData.studentProfile,
          portfolioUrl: value
        };
        
        // Dispatch a custom event for other components listening to portfolio changes
        window.dispatchEvent(new CustomEvent('portfolio-update-local', {
          detail: { portfolioUrl: value }
        }));
      }
    } else {
      setEditedData(prev => ({
        ...prev,
        personal: {
          ...prev.personal,
          [field]: value
        }
      }));
      // Update userData immediately for optimistic UI
      if (userData) {
        userData[field] = value;
        
        // If updating birthDate, also update the age
        if (field === 'birthDate' && value) {
          userData.age = calculateAge(value);
        }
      }
    }
  }, [userData]);

  // Handler for saving personal information
  const handleSavePersonal = async (field) => {
    try {
      const value = editedData.personal[field];
      
      // Validation spécifique selon le type de champ
      if (field === 'birthDate' && value) {
        const birthDate = new Date(value);
        const today = new Date();
        const minAgeDate = new Date(today);
        minAgeDate.setFullYear(today.getFullYear() - 16);
        
        if (birthDate > minAgeDate) {
          toast.error("Vous devez avoir au moins 16 ans pour vous inscrire.");
          return;
        }
      }
      
      // Validation de l'email
      if (field === 'email' && value) {
        if (!isValidEmail(value)) {
          toast.error("Format d'email invalide");
          return;
        }
      }
      
      // Validation du numéro de téléphone
      if (field === 'phoneNumber' && value) {
        if (!isValidPhone(value)) {
          toast.error("Format de numéro de téléphone invalide");
          return;
        }
      }
      
      // Validation du nom et prénom
      if ((field === 'firstName' || field === 'lastName') && value) {
        if (!isValidName(value)) {
          toast.error(`Format de ${field === 'firstName' ? 'prénom' : 'nom'} invalide. Utilisez uniquement des lettres, espaces, tirets et apostrophes.`);
          return;
        }
      }

      // Validate LinkedIn URL
      if (field === 'linkedinUrl' && value) {
        if (!isValidLinkedInUrl(value)) {
          toast.error("L'URL LinkedIn doit commencer par 'https://www.linkedin.com/in/'");
          return;
        }
      }
      // Special case: allow null/empty for linkedinUrl deletion
      if (field === 'linkedinUrl' && (value === null || value === '')) {
        // Continue with deletion
      }

      // Validate portfolio URL
      if (field === 'portfolioUrl' && value) {
        if (!isValidUrl(value)) {
          toast.error("L'URL du portfolio doit commencer par 'https://'");
          return;
        }
      }
      
      // Use the service to update the profile
      await profileService.updateProfile({ [field]: value });
      
      // Optimistically update the local state
      updateLocalState(field, value);
      
      // Exit edit mode for this field
      setEditMode(prev => ({
        ...prev,
        [field]: false,
      }));
      
      // Dispatch event to notify other components like ProfileProgress
      document.dispatchEvent(new CustomEvent('user:data-updated'));

      toast.success(`${field} mis à jour avec succès`);
    } catch (error) {
      // Revert optimistic update on error
      if (field === 'portfolioUrl' && isStudent) {
        updateLocalState('portfolioUrl', profileData?.data?.studentProfile?.portfolioUrl || null);
        toast.error("Erreur lors de la mise à jour de l'URL du portfolio");
      } else {
        updateLocalState(field, profileData?.data?.user?.[field] || null);
        toast.error(`Erreur lors de la mise à jour de ${field}`);
      }
    }
  };

  // Add a new function to handle address updates
  const handleSaveAddress = async () => {
    try {
      const addressData = editedData.address;
      const formattedAddress = {
        name: addressData.name?.trim() || '',
        complement: addressData.complement?.trim() || null,
        postalCode: {
          code: addressData.postalCode?.code?.trim() || ''
        },
        city: {
          name: addressData.city?.name?.trim() || ''
        }
      };
      
      if (!formattedAddress.name || !formattedAddress.postalCode.code || !formattedAddress.city.name) {
        toast.error('Veuillez remplir tous les champs obligatoires');
        return;
      }
      
      // Créer un objet d'adresse complet avec ID si disponible
      const addressWithId = {
        ...formattedAddress,
        id: userData.addresses?.[0]?.id
      };
      
      // Make the API call first
      await profileService.updateAddress(addressWithId);
      
      toast.success('Adresse mise à jour avec succès');
      
      // Force refetch to get the latest data from the server
      await queryClient.invalidateQueries({ queryKey: ['userProfileData'] });
      await refetchProfile();
      
    } catch (error) {
      toast.error('Erreur lors de la mise à jour de l\'adresse');
    }
  };

  // Mutation for updating personal information
  const { mutate: updatePersonalInfo } = useApiMutation(
    '/api/profile',
    'put',
    'userProfileData',
    {
      onMutate: async (variables) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({ queryKey: ['userProfileData'] });
        
        // Snapshot the previous value
        const previousData = queryClient.getQueryData(['userProfileData']);
        
        return { previousData };
      },
      onSuccess: (data, variables) => {
        toast.success('Informations mises à jour avec succès');
      },
      onError: (err, variables, context) => {
        // Rollback on error
        queryClient.setQueryData(['userProfileData'], context.previousData);
        toast.error('Une erreur est survenue lors de la mise à jour du profil');
      },
      onSettled: () => {
        // Refetch in the background to ensure sync
        queryClient.invalidateQueries({ queryKey: ['userProfileData'] });
      }
    }
  );

  // Mutation for updating portfolio URL
  const { mutate: updatePortfolioUrl } = useApiMutation(
    '/api/student/profile/portfolio-url',
    'put',
    'userProfileData',
    {
      onMutate: async (variables) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({ queryKey: ['userProfileData'] });
        
        // Snapshot the previous value
        const previousData = queryClient.getQueryData(['userProfileData']);
        
        return { previousData };
      },
      onSuccess: async (data, variables) => {
        toast.success('URL du portfolio mise à jour avec succès');
        
        // Explicitly trigger a complete refresh of the profile data
        await queryClient.invalidateQueries({ queryKey: ['unified-user-data'] });
        setTimeout(() => refetchProfile(), 300);
        
        // Dispatch a custom event to notify other components about the portfolio URL update
        window.dispatchEvent(new CustomEvent('portfolio-url-updated', {
          detail: { portfolioUrl: variables.portfolioUrl }
        }));
      },
      onError: (err, variables, context) => {
        // Rollback on error
        queryClient.setQueryData(['userProfileData'], context.previousData);
        toast.error(err.response?.data?.message || "L'URL du portfolio doit commencer par 'https://'");
      },
      onSettled: () => {
        // Invalidate all relevant queries to ensure data consistency
        queryClient.invalidateQueries({ queryKey: ['userProfileData'] });
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        queryClient.invalidateQueries({ queryKey: ['unified-user-data'] });
      }
    }
  );

  // Track the last URL we received to avoid duplicate refetches
  const [lastProfilePictureUrl, setLastProfilePictureUrl] = useState(null);
  const [lastRefetchTime, setLastRefetchTime] = useState(0);
  
  // Handler for profile picture changes - DISABLED TO BREAK CIRCULAR DEPENDENCY
  const handleProfilePictureChange = useCallback((newUrl) => {
    // TEMPORARILY DISABLED TO BREAK CIRCULAR DEPENDENCY
  }, []);

  // Render loading state
  if (isProfileLoading) {
    return <ProfileSettingsSkeleton />;
  }

  // Render error state
  if (isProfileError) {
    return (
      <div className="space-y-6 bg-white p-6 rounded-lg shadow">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Profile</h2>
          <p className="text-gray-600 mb-4">{profileError?.response?.data?.message || profileError?.message || 'An unexpected error occurred'}</p>
          <Button onClick={() => refetchProfile()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      <Card className="overflow-hidden w-full">
        <div className="flex flex-col xs:flex-row items-center p-2 xs:p-3">
          <ProfilePicture 
            userData={userData} 
            onProfilePictureChange={handleProfilePictureChange}
            isLoading={isProfileLoading}
          />

        </div>
      </Card>

      <Card className="overflow-hidden w-full">
        <CardHeader className="px-4 sm:px-6 md:px-8 py-3 sm:py-4">
          <CardTitle className="text-lg sm:text-xl">Informations personnelles</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Mettre à jour vos informations personnelles</CardDescription>
        </CardHeader>
        <CardContent className="px-3 sm:px-4 md:px-6 pb-6">
          <PersonalInformation 
            userData={userData}
            editMode={editMode}
            setEditMode={setEditMode}
            editedData={editedData}
            setEditedData={setEditedData}
            userRole={userRole}
            onSave={handleSavePersonal}
            onSaveAddress={handleSaveAddress}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="nationality">Nationalité</Label>
                <Input
                  id="nationality"
                  value={editedData.personal.nationality || ''}
                  onChange={(e) => handleSavePersonal('nationality')}
                  disabled={!editMode.personal}
                  placeholder="Votre nationalité"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate">Date de naissance</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={editedData.personal.birthDate || ''}
                  onChange={(e) => handleSavePersonal('birthDate')}
                  disabled={!editMode.personal}
                />
              </div>
            </div>
          </PersonalInformation>
        </CardContent>
      </Card>
    </div>
  );
};

// Skeleton component for loading state
const ProfileSettingsSkeleton = () => {
  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* Profile Picture Card Skeleton */}
      <div className="bg-white rounded-lg shadow overflow-hidden w-full">
        {/* Card Header */}
        <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 border-b">
          <Skeleton className="h-5 sm:h-6 w-36 sm:w-48 mb-2" />
          <Skeleton className="h-3 sm:h-4 w-48 sm:w-64" />
        </div>
        {/* Card Content */}
        <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6">
          <div className="flex flex-col xs:flex-row items-center justify-center">
            <div className="relative">
              <Skeleton className="h-20 w-20 sm:h-24 sm:w-24 md:h-32 md:w-32 rounded-full" />
              <Skeleton className="absolute bottom-0 right-0 w-6 sm:w-8 h-6 sm:h-8 rounded-full" />
            </div>
            <div className="mt-3 xs:mt-0 xs:ml-3">
              <Skeleton className="h-4 sm:h-5 w-32 mb-2" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
          <div className="mt-4 flex justify-center">
            <Skeleton className="h-8 sm:h-9 w-24 sm:w-28" />
          </div>
        </div>
      </div>
      
      {/* Personal Information Card Skeleton */}
      <div className="bg-white rounded-lg shadow overflow-hidden w-full">
        {/* Card Header */}
        <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 border-b">
          <Skeleton className="h-5 sm:h-6 w-48 sm:w-64 mb-2" />
          <Skeleton className="h-3 sm:h-4 w-56 sm:w-80" />
        </div>
        {/* Card Content */}
        <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6">
          {/* Form Fields */}
          <div className="space-y-4 sm:space-y-6">
            {/* First Row - Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Skeleton className="h-4 sm:h-5 w-24 sm:w-32" />
                <Skeleton className="h-9 sm:h-10 w-full" />
              </div>
              
              <div className="space-y-2">
                <Skeleton className="h-4 sm:h-5 w-24 sm:w-32" />
                <Skeleton className="h-9 sm:h-10 w-full" />
              </div>
            </div>
            
            {/* Second Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Skeleton className="h-4 sm:h-5 w-24 sm:w-32" />
                <Skeleton className="h-9 sm:h-10 w-full" />
              </div>
              
              <div className="space-y-2">
                <Skeleton className="h-4 sm:h-5 w-24 sm:w-32" />
                <Skeleton className="h-9 sm:h-10 w-full" />
              </div>
            </div>
            
            {/* Full Width Fields */}
            <div className="space-y-2">
              <Skeleton className="h-4 sm:h-5 w-24 sm:w-32" />
              <Skeleton className="h-9 sm:h-10 w-full" />
            </div>
            
            {/* Address Section */}
            <div className="pt-3 sm:pt-4">
              <Skeleton className="h-5 sm:h-6 w-24 sm:w-32 mb-3 sm:mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <Skeleton className="h-9 sm:h-10 w-full" />
                <Skeleton className="h-9 sm:h-10 w-full" />
              </div>
            </div>
            
            {/* Button */}
            <div className="flex justify-end mt-4 sm:mt-6">
              <Skeleton className="h-9 sm:h-10 w-32 sm:w-48" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Additional Settings Card */}
      <div className="bg-white rounded-lg shadow overflow-hidden w-full">
        {/* Card Header */}
        <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 border-b">
          <Skeleton className="h-5 sm:h-6 w-36 sm:w-48 mb-2" />
          <Skeleton className="h-3 sm:h-4 w-48 sm:w-64" />
        </div>
        {/* Card Content */}
        <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <Skeleton className="h-9 sm:h-10 w-full" />
            <Skeleton className="h-9 sm:h-10 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileSettings; 