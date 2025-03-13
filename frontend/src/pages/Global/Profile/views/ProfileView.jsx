import React, { useEffect, useState } from "react";
import ProfileHeader from "../components/profile-view/ProfileHeader";
import ProfileTabs from "../components/profile-view/ProfileTabs";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentProfile, usePublicProfile, useProfilePicture } from "../hooks/useProfileQueries";
import { isGuest } from "../utils/roleUtils";
import documentService from "../services/documentService";

const ProfileView = () => {
  const { userId } = useParams();
  const [documents, setDocuments] = useState([]);
  
  // Use the appropriate query hook based on whether we're viewing our own profile or someone else's
  const { 
    data: currentProfileData, 
    isLoading: isLoadingCurrentProfile,
    error: currentProfileError 
  } = useCurrentProfile();
  
  const { 
    data: publicProfileData, 
    isLoading: isLoadingPublicProfile,
    error: publicProfileError 
  } = usePublicProfile(userId);
  
  // Also fetch profile picture separately
  const {
    data: profilePictureData,
    isLoading: isLoadingProfilePicture
  } = useProfilePicture();
  
  // Determine which data to use
  const isPublicProfile = !!userId;
  const data = isPublicProfile ? publicProfileData : currentProfileData;
  const isLoading = isPublicProfile ? isLoadingPublicProfile : isLoadingCurrentProfile;
  const error = isPublicProfile ? publicProfileError : currentProfileError;
  
  // Add debugging logs
  useEffect(() => {
    if (isPublicProfile) {
      // console.log('Public Profile Mode:', { userId });
      // console.log('Public Profile Data:', publicProfileData);
      // console.log('Public Profile Loading:', isLoadingPublicProfile);
      // console.log('Public Profile Error:', publicProfileError);
    } else {
      // console.log('Current Profile Mode');
      // console.log('Current Profile Data:', currentProfileData);
      // console.log('Current Profile Loading:', isLoadingCurrentProfile);
      // console.log('Current Profile Error:', currentProfileError);
    }
    
    // Log profile picture data
    // console.log('Profile Picture Data:', profilePictureData);
  }, [userId, publicProfileData, currentProfileData, isLoadingPublicProfile, isLoadingCurrentProfile, publicProfileError, currentProfileError, profilePictureData]);
  
  // Fetch documents separately
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const docs = await documentService.getDocuments(true); // Force refresh
        // console.log('Fetched documents:', docs);
        setDocuments(docs);
      } catch (error) {
        // console.error('Error fetching documents:', error);
      }
    };
    
    if (!isPublicProfile && !isLoading && !error && data) {
      fetchDocuments();
    }
  }, [isPublicProfile, isLoading, error, data]);
  
  // Animation variants for the page
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
    // console.log('Rendering loading state');
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-8" data-testid="profile-loading">
        {/* Profile Header Skeleton */}
        <div className="w-full bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              {/* Avatar Skeleton */}
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-indigo-600/30 rounded-full opacity-75 blur"></div>
                <Skeleton className="h-24 w-24 sm:h-32 sm:w-32 rounded-full border-4 border-background relative" />
              </div>
              
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-4">
                  <div>
                    {/* Name Skeleton */}
                    <Skeleton className="h-8 w-64 mb-2" />
                    {/* Specialization Skeleton */}
                    <Skeleton className="h-4 w-48 mb-4" />
                    
                    {/* Badges Skeleton */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Skeleton className="h-6 w-24 rounded-full" />
                      <Skeleton className="h-6 w-32 rounded-full" />
                    </div>
                  </div>
                  
                  {/* Action Button Skeleton */}
                  <Skeleton className="h-10 w-36" />
                </div>
                
                {/* Additional Info Skeleton */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-6 w-56" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs Skeleton */}
        <div>
          {/* Tabs Header Skeleton */}
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-1 rounded-lg mb-6">
            <div className="grid w-full grid-cols-2 h-auto p-1">
              <Skeleton className="h-12 rounded-md" />
              <Skeleton className="h-12 rounded-md" />
            </div>
          </div>
          
          {/* Tab Content Skeleton - About Tab */}
          <div className="space-y-6">
            {/* Personal Info Card Skeleton */}
            <div className="overflow-hidden border-none shadow-md bg-white dark:bg-slate-800 rounded-lg">
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 p-4">
                <Skeleton className="h-6 w-48" />
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Skeleton className="h-20 w-full rounded-lg" />
                    <Skeleton className="h-20 w-full rounded-lg" />
                  </div>
                  <div className="space-y-4">
                    <Skeleton className="h-20 w-full rounded-lg" />
                    <Skeleton className="h-20 w-full rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Student Profile Card Skeleton */}
            <div className="overflow-hidden border-none shadow-md bg-white dark:bg-slate-800 rounded-lg">
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 p-4">
                <Skeleton className="h-6 w-36" />
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Skeleton className="h-20 w-full rounded-lg" />
                    <Skeleton className="h-20 w-full rounded-lg" />
                  </div>
                  <div className="space-y-4">
                    <Skeleton className="h-20 w-full rounded-lg" />
                    <Skeleton className="h-20 w-full rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    // console.log('Rendering error state:', error);
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-6" data-testid="profile-error">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Erreur :</strong>
          <span className="block sm:inline"> {error.message || "Une erreur est survenue lors du chargement du profil."}</span>
        </div>
      </div>
    );
  }

  if (!data) {
    // console.log('No data available:', { data });
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-6" data-testid="profile-no-data">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Attention :</strong>
          <span className="block sm:inline"> Aucune donnée de profil n'est disponible.</span>
        </div>
      </div>
    );
  }

  // Extract user data based on the profile type
  let userData;
  
  if (isPublicProfile) {
    // For public profile, the structure is { success: true, data: { user: {...}, ... } }
    userData = data.success === true && data.data ? data.data : null;
  } else {
    // For current profile, the data is directly available
    userData = data ? {
      user: data.user,
      studentProfile: data.studentProfile,
      diplomas: data.diplomas,
      addresses: data.addresses,
      stats: data.stats,
      documents: documents
    } : null;
  }
  
  // console.log('Extracted user data:', userData);
  
  if (!userData || !userData.user) {
    // console.log('Invalid user data structure:', { userData });
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-6" data-testid="profile-invalid-data">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Attention :</strong>
          <span className="block sm:inline"> La structure des données du profil est invalide.</span>
        </div>
      </div>
    );
  }
  
  // Add profile picture URL from the separate profile picture query if available
  if (profilePictureData && profilePictureData.data && profilePictureData.data.profile_picture_url) {
    userData.user.profilePictureUrl = profilePictureData.data.profile_picture_url;
    // console.log('Added profile picture URL from separate query:', userData.user.profilePictureUrl);
  }
  
  // console.log('=== DÉBUT DES LOGS DE DÉBOGAGE PROFILEVIEW ===');
  // console.log('Data complète:', data);
  // console.log('UserData:', userData);
  
  // Add detailed role debugging
  // console.log('User roles:', userData.user.roles);
  // if (userData.user.roles && userData.user.roles.length > 0) {
  //   console.log('First role:', userData.user.roles[0]);
  //   console.log('First role name:', userData.user.roles[0].name);
  //   console.log('Is guest check result:', isGuest(userData.user.roles[0].name));
  // } else {
  //   console.log('No roles found for user');
  // }
  
  // Log the condition result
  const isGuestUser = () => {
    // Check if user has roles array
    if (userData.user.roles && userData.user.roles.length > 0) {
      // If roles is an array of objects with name property
      if (typeof userData.user.roles[0] === 'object' && userData.user.roles[0].name) {
        return isGuest(userData.user.roles[0].name);
      }
      // If roles is an array of strings
      if (typeof userData.user.roles[0] === 'string') {
        return isGuest(userData.user.roles[0]);
      }
    }
    
    // Check if user has a single role property
    if (userData.user.role) {
      return isGuest(userData.user.role);
    }
    
    return false;
  };
  
  // console.log('isPublicProfile:', isPublicProfile);
  // console.log('isGuestUser result:', isGuestUser());
  
  // console.log('=== FIN DES LOGS DE DÉBOGAGE PROFILEVIEW ===');

  return (
    <motion.div
      className="w-full max-w-7xl mx-auto px-4 py-6 space-y-8"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      data-testid="profile-view"
    >
      <ProfileHeader 
        userData={userData} 
        isPublicProfile={isPublicProfile} 
        profilePictureData={profilePictureData}
      />

      <ProfileTabs 
        userData={userData}
        isPublicProfile={isPublicProfile}
        documents={documents}
      />

    </motion.div>
  );
};

export default ProfileView; 