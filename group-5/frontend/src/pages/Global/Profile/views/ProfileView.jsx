import React, { useEffect, useState } from "react";
import ProfileHeader from "../components/profile-view/ProfileHeader";
import ProfileTabs from "../components/profile-view/ProfileTabs";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentProfile, usePublicProfile } from "../hooks/useProfileQueries";
import { useProfilePicture } from "../hooks/useProfilePicture";
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
  
  // Fetch profile picture using the custom hook
  const {
    profilePictureUrl,
    isLoading: isLoadingProfilePicture,
    refetch: refetchProfilePicture
  } = useProfilePicture();
  
  // Determine which data to use
  const isPublicProfile = !!userId;
  const data = isPublicProfile ? publicProfileData : currentProfileData;
  const isLoading = (isPublicProfile ? isLoadingPublicProfile : isLoadingCurrentProfile) || isLoadingProfilePicture;
  const error = isPublicProfile ? publicProfileError : currentProfileError;
  
  // Refetch profile picture when component mounts or userId changes
  useEffect(() => {
    refetchProfilePicture();
  }, [userId, refetchProfilePicture]);
  
  // Fetch documents separately
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const docs = await documentService.getDocuments(true); // Force refresh
        setDocuments(docs);
      } catch (error) {
        // Error handling without console.log
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
    // Ajout d'un log pour déboguer
    console.log("DEBUGGING - Profile data received:", data);
    
    // Handle public profile data specifically
    if (data) {
      // Accepter directement les données telles qu'elles sont
      userData = data;
      
      console.log("DEBUGGING - Using data directly:", userData);
    } else {
      // Fallback if no data
      console.warn("No data received for public profile");
      userData = null;
    }
    
    // Normalize userData structure if it exists
    if (userData) {
      // Ensure all required collections exist with default values
      userData.diplomas = userData.diplomas || [];
      userData.addresses = userData.addresses || [];
      userData.documents = userData.documents || [];
      userData.stats = userData.stats || { profile: { completionPercentage: 0 } };

      // Ensure user object exists
      if (!userData.user) {
        console.warn("User data missing in profile data");
        userData.user = {};
      }
      
      // Ensure studentProfile exists with default values if missing
      if (!userData.studentProfile) {
        userData.studentProfile = {
          isSeekingInternship: false,
          isSeekingApprenticeship: false,
          currentInternshipCompany: null,
          internshipStartDate: null,
          internshipEndDate: null,
          portfolioUrl: null,
          situationType: null
        };
      }
      
      // Standardize roles format - ensure it's always an array of objects with name property
      if (!userData.user.roles) {
        userData.user.roles = [{ id: 0, name: 'USER' }];
      } else if (!Array.isArray(userData.user.roles)) {
        // Convert string to object
        userData.user.roles = [{ id: 0, name: String(userData.user.roles) }];
      } else {
        // Normalize array elements to ensure each has a name property
        userData.user.roles = userData.user.roles.map(role => {
          if (typeof role === 'string') {
            return { id: 0, name: role };
          } else if (typeof role === 'object' && role !== null) {
            return { id: role.id || 0, name: role.name || 'USER' };
          } else {
            return { id: 0, name: 'USER' };
          }
        });
      }
      
      console.log("DEBUGGING - Normalized userData:", userData);
    }
  } else {
    // For current profile, the data is directly available
    userData = data ? {
      user: data.user || {},
      studentProfile: data.studentProfile || {
        isSeekingInternship: false,
        isSeekingApprenticeship: false
      },
      diplomas: data.diplomas || [],
      addresses: data.addresses || [],
      stats: data.stats || { profile: { completionPercentage: 0 } },
      documents: documents || []
    } : null;
  }
  
  if (!userData || (!userData.user && !Object.keys(userData).includes('firstName'))) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-6" data-testid="profile-invalid-data">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Attention :</strong>
          <span className="block sm:inline"> La structure des données du profil est invalide.</span>
          <div className="mt-2">
            <p className="text-sm">Données reçues :</p>
            <pre className="mt-2 text-xs overflow-auto max-h-80 whitespace-pre-wrap bg-gray-100 p-2 rounded">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  }
  
  // S'assurer que userData.user existe, même si les données sont directement au niveau racine
  if (!userData.user && userData.firstName) {
    userData = {
      user: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        profilePictureUrl: userData.profilePictureUrl,
        profilePicturePath: userData.profilePicturePath,
        roles: userData.roles || [{ id: 0, name: 'USER' }],
        specialization: userData.specialization,
        linkedinUrl: userData.linkedinUrl
      },
      studentProfile: userData.studentProfile || {
        isSeekingInternship: false,
        isSeekingApprenticeship: false
      },
      diplomas: userData.diplomas || [],
      addresses: userData.addresses || [],
      documents: userData.documents || [],
      stats: userData.stats || { profile: { completionPercentage: 0 } }
    };
    console.log("DEBUGGING - Restructured userData:", userData);
  }
  
  // Toujours utiliser la photo de profil la plus récente du hook useProfilePicture
  if (profilePictureUrl) {
    userData.user.profilePictureUrl = profilePictureUrl;
  }
  
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
        profilePictureUrl={profilePictureUrl}
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