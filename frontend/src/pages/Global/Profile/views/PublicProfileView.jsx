import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiService from '@/lib/services/apiService';
import ProfileHeader from '../components/profile-view/ProfileHeader';
import ProfileTabs from '../components/profile-view/ProfileTabs';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { useRoleUI } from '@/features/roles';
import { ROLES } from '@/features/roles/roleContext';

const PublicProfileView = () => {
  const { userId } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const roleUI = useRoleUI();
  
  console.log('PublicProfileView - userId from params:', userId);
  console.log('PublicProfileView - Current URL:', window.location.pathname);
  
  useEffect(() => {
    const checkCurrentUser = async () => {
      try {
        const currentUser = await apiService.getUserProfile();
        if (currentUser?.id?.toString() === userId?.toString()) {
          setIsOwnProfile(true);
          window.location.href = '/profile';
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error checking current user:', error);
        return false;
      }
    };
    
    const fetchPublicProfile = async () => {
      try {
        const isOwn = await checkCurrentUser();
        if (isOwn) return;
        
        apiService.clearPublicProfileCache(userId);
        
        console.log('Fetching public profile for userId:', userId);
        const response = await apiService.getPublicProfile(userId);
        console.log('Raw API Response:', response);
        
        if (response?.data?.user) {
          console.log('Using response.data.user:', response.data.user);
          setProfileData(response.data.user);
          
          // Extraire l'URL de la photo de profil
          if (response.data.user.profilePictureUrl) {
            setProfilePictureUrl(response.data.user.profilePictureUrl);
            console.log('Profile picture URL found:', response.data.user.profilePictureUrl);
          } else if (response.data.user.profilePicturePath) {
            // Fallback: utiliser getProfilePictureUrl du frontend si l'URL n'est pas fournie
            const { getProfilePictureUrl } = require('@/lib/utils/profileUtils');
            const fallbackUrl = getProfilePictureUrl(response.data.user.profilePicturePath);
            setProfilePictureUrl(fallbackUrl);
            console.log('Profile picture URL generated from path:', fallbackUrl);
          } else {
            setProfilePictureUrl(null);
            console.log('No profile picture available');
          }
        } else {
          setError('Données du profil non disponibles');
        }
      } catch (error) {
        console.error('Error in fetchPublicProfile:', error);
        setError(error.message || 'Erreur lors de la récupération du profil');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (userId) {
      fetchPublicProfile();
    }
    
    return () => {
      apiService.clearPublicProfileCache(userId);
    };
  }, [userId]);

  const pageVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.2,
        duration: 0.3
      }
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-8" data-testid="public-profile-loading">
        <div className="w-full bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-lg shadow-md overflow-hidden">
          <Skeleton className="h-64 w-full" />
          <div className="p-6 space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-6" data-testid="public-profile-error">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Erreur :</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-6" data-testid="public-profile-no-data">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Attention :</strong>
          <span className="block sm:inline"> Profil non trouvé.</span>
        </div>
      </div>
    );
  }

  console.log('ProfileData before transformation:', profileData);
  
  const userData = {
    user: {
      ...profileData,
      profilePictureUrl: profilePictureUrl,
      roles: Array.isArray(profileData.roles) 
        ? profileData.roles.map(role => {
            console.log('[PublicProfileView] Role avant transformation:', role);
            const normalizedRole = role.replace('ROLE_', '');
            const transformedRole = {
              name: role,
              displayName: roleUI.translateRoleName(role),
              color: roleUI.getRoleBadgeColor(role)
            };
            console.log('[PublicProfileView] Role après transformation:', transformedRole);
            return transformedRole;
          })
        : [{ 
            name: ROLES.GUEST,
            displayName: roleUI.translateRoleName(ROLES.GUEST),
            color: roleUI.getRoleBadgeColor(ROLES.GUEST)
          }],
      specialization: profileData.specialization || {},
      linkedinUrl: profileData.linkedinUrl || "",
      birthDate: profileData.birthDate,
      createdAt: profileData.createdAt,
      updatedAt: profileData.updatedAt,
      addresses: profileData.addresses || []
    },
    studentProfile: profileData.studentProfile || {
      isSeekingInternship: false,
      isSeekingApprenticeship: false,
      portfolioUrl: null,
      currentInternshipCompany: null,
      internshipStartDate: null,
      internshipEndDate: null,
      situationType: null
    },
    addresses: profileData.addresses || [],
    stats: { profile: { completionPercentage: 0 } }
  };

  console.log('[PublicProfileView] userData final:', {
    roles: userData.user.roles,
    isPublicProfile: true,
    profilePictureUrl: userData.user.profilePictureUrl
  });

  return (
    <motion.div
      className="w-full max-w-7xl mx-auto px-4 py-6 space-y-8"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      data-testid="public-profile-view"
    >
      <ProfileHeader 
        userData={userData} 
        isPublicProfile={true}
        profilePictureUrl={profilePictureUrl}
        onProfileUpdate={() => {}}
      />

      <ProfileTabs 
        userData={userData}
        isPublicProfile={true}
        documents={[]}
        onProfileUpdate={() => {}}
      />
    </motion.div>
  );
};

export default PublicProfileView;
