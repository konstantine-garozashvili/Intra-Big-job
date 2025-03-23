import React, { useEffect, useState } from "react";
import ProfileHeader from "../components/profile-view/ProfileHeader";
import ProfileTabs from "../components/profile-view/ProfileTabs";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
// Using the centralized useUserData hook for better state management and data consistency
import { useUserData } from "@/hooks/useUserData";
import { useProfilePicture } from "../hooks/useProfilePicture";
import { isGuest } from "../utils/roleUtils";
import documentService from "../services/documentService";
import apiService from "@/lib/services/apiService";

const ProfileView = () => {
  const { userId } = useParams();
  const [documents, setDocuments] = useState([]);
  const isPublicProfile = !!userId;
  
  // Use the useUserData hook for current profile data - now with normalized structure
  const { 
    user: currentProfileData, 
    isLoading: isLoadingCurrentProfile,
    error: currentProfileError,
    forceRefresh: refetchCurrentProfile
  } = useUserData({
    preferComprehensiveData: true,
    enabled: !isPublicProfile
  });
  
  // For public profile, we'll still use the existing hook/API call
  const [publicProfileData, setPublicProfileData] = useState(null);
  const [isLoadingPublicProfile, setIsLoadingPublicProfile] = useState(false);
  const [publicProfileError, setPublicProfileError] = useState(null);
  
  // Fetch public profile data if userId is provided
  useEffect(() => {
    if (isPublicProfile && userId) {
      setIsLoadingPublicProfile(true);
      
      const fetchPublicProfile = async () => {
        try {
          const data = await apiService.get(`/profile/public/${userId}`);
          
          if (data && (data.success === true || data.data)) {
            setPublicProfileData(data.data || data);
          } else {
            setPublicProfileError(data.error || 'Failed to fetch profile data');
          }
        } catch (error) {
          setPublicProfileError(error.message || 'Error fetching profile data');
        } finally {
          setIsLoadingPublicProfile(false);
        }
      };
      
      fetchPublicProfile();
    }
  }, [userId, isPublicProfile]);
  
  // Fetch profile picture using the custom hook
  const {
    profilePictureUrl,
    isLoading: isLoadingProfilePicture,
    refetch: refetchProfilePicture
  } = useProfilePicture();
  
  // Determine which data to use
  const data = isPublicProfile ? publicProfileData : currentProfileData;
  const isLoading = (isPublicProfile ? isLoadingPublicProfile : isLoadingCurrentProfile) || isLoadingProfilePicture;
  const error = isPublicProfile ? publicProfileError : currentProfileError;
  
  // Refetch profile picture when component mounts or userId changes
  useEffect(() => {
    // Only refetch if there's no cached URL available
    if (!profilePictureUrl && !isLoadingProfilePicture) {
      refetchProfilePicture();
    }
  }, [userId]); // Only run when userId changes, not on every render
  
  // Always use the latest profile picture URL when rendering
  useEffect(() => {
    if (data && profilePictureUrl) {
      if (isPublicProfile) {
        // For public profile
        if (data.profilePictureUrl !== profilePictureUrl) {
          data.profilePictureUrl = profilePictureUrl;
        }
      } else {
        // For current user profile
        if (data.profilePictureUrl !== profilePictureUrl) {
          data.profilePictureUrl = profilePictureUrl;
        }
      }
    }
  }, [data, profilePictureUrl, isPublicProfile]);
  
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

  // Prepare userData for components with proper structure
  let userData;
  
  if (isPublicProfile) {
    // Normalize public profile data
    userData = {
      user: {
        id: data.id || data.user?.id,
        firstName: data.firstName || data.user?.firstName || "",
        lastName: data.lastName || data.user?.lastName || "",
        email: data.email || data.user?.email || "",
        phoneNumber: data.phoneNumber || data.user?.phoneNumber || "",
        profilePictureUrl: profilePictureUrl || data.profilePictureUrl || data.user?.profilePictureUrl || "",
        roles: Array.isArray(data.roles) 
          ? data.roles.map(role => typeof role === 'string' ? { name: role } : role)
          : (data.user?.roles || [{ name: 'USER' }]),
        specialization: data.specialization || data.user?.specialization || {},
        linkedinUrl: data.linkedinUrl || data.user?.linkedinUrl || "",
        city: data.city || ""
      },
      studentProfile: data.studentProfile || {
        isSeekingInternship: false,
        isSeekingApprenticeship: false
      },
      diplomas: data.diplomas || [],
      addresses: data.addresses || [],
      documents: data.documents || [],
      stats: data.stats || { profile: { completionPercentage: 0 } }
    };
  } else {
    // For current profile, the useUserData hook now returns normalized data
    userData = {
      user: data,  // Use the normalized user data directly
      studentProfile: data.studentProfile || {
        isSeekingInternship: false,
        isSeekingApprenticeship: false
      },
      diplomas: data.diplomas || [],
      addresses: data.addresses || [],
      documents: documents.length > 0 ? documents : (data.documents || []),
      stats: data.stats || { profile: { completionPercentage: 0 } }
    };
  }


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