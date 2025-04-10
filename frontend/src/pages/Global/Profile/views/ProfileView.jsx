import React, { useEffect, useState, useCallback } from "react";
import ProfileHeader from "../components/profile-view/ProfileHeader";
import ProfileTabs from "../components/profile-view/ProfileTabs";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserData } from "@/hooks/useUserData";
import { useProfilePicture } from "../hooks/useProfilePicture";
import documentService from "../services/documentService";
import apiService from "@/lib/services/apiService";
import { toast } from "sonner";
import { studentProfileService } from "@/lib/services/studentProfileService";

const ProfileView = () => {
  const { userId } = useParams();
  const [documents, setDocuments] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [hasLoadedStudentProfile, setHasLoadedStudentProfile] = useState(false);
  const [isLoadingStudentProfile, setIsLoadingStudentProfile] = useState(false);
  const isPublicProfile = !!userId;
  const [isMounted, setIsMounted] = useState(false);
  
  const { 
    user: currentProfileData, 
    isLoading: isLoadingCurrentProfile,
    error: currentProfileError,
    forceRefresh: refetchCurrentProfile,
    setUser: setCurrentProfileData
  } = useUserData({
    userId: isPublicProfile ? userId : undefined,
    preferComprehensiveData: true,
    enabled: true
  });
  
  const [publicProfileData, setPublicProfileData] = useState(null);
  const [isLoadingPublicProfile, setIsLoadingPublicProfile] = useState(false);
  const [publicProfileError, setPublicProfileError] = useState(null);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);
  
  const fetchStudentProfile = useCallback(async (forceFresh = true) => {
    if (isLoadingStudentProfile || !isMounted) return;
    
    try {
      setIsLoadingStudentProfile(true);
      
      const response = await studentProfileService.getMyProfile(forceFresh);
      
      if (response && response.success && response.data && isMounted) {
        setStudentProfile(response.data);
        
        if (currentProfileData && !isPublicProfile) {
          currentProfileData.studentProfile = response.data;
          
          handleProfileUpdate({
            studentProfile: response.data
          });
        }
      }
      if (isMounted) {
        setHasLoadedStudentProfile(true);
      }
    } catch (error) {
      setHasLoadedStudentProfile(true); 
    } finally {
      if (isMounted) {
        setIsLoadingStudentProfile(false);
      }
    }
  }, [isLoadingStudentProfile, currentProfileData, isPublicProfile, isMounted]);
  
  useEffect(() => {
    if (!isPublicProfile && currentProfileData && !hasLoadedStudentProfile && !isLoadingStudentProfile) {
      const isStudent = currentProfileData.roles?.some(role => {
        if (typeof role === 'string') {
          return role.includes('STUDENT');
        } else if (typeof role === 'object' && role !== null && role.name) {
          return role.name.includes('STUDENT');
        }
        return false;
      });
      
      if (isStudent) {
        fetchStudentProfile(true);
      } else {
        setHasLoadedStudentProfile(true);
      }
    }
  }, [isPublicProfile, currentProfileData, hasLoadedStudentProfile, isLoadingStudentProfile, fetchStudentProfile, isMounted]);
  
  const handleProfileUpdate = useCallback((updatedData) => {
    if (isPublicProfile) {
      setPublicProfileData(prev => ({
        ...prev,
        ...updatedData
      }));
    } else {
      if (setCurrentProfileData) {
        setCurrentProfileData(prev => ({
          ...prev,
          ...updatedData
        }));
      } else {
        refetchCurrentProfile();
      }
      
      if (updatedData.documents) {
        setDocuments(updatedData.documents);
      }
      
      if (updatedData.studentProfile) {
        setStudentProfile(updatedData.studentProfile);
      }
    }
    
    if (updatedData.toastMessage !== false) {
      toast.success(updatedData.toastMessage || "Profil mis à jour");
    }
  }, [isPublicProfile, setCurrentProfileData, refetchCurrentProfile, isMounted]);
  
  useEffect(() => {
    if (isPublicProfile && userId) {
      const currentUserId = currentProfileData?.id;
      
      if (currentUserId && currentUserId.toString() === userId) {
        setPublicProfileData(currentProfileData);
        setIsLoadingPublicProfile(false);
        return;
      }
      
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
  }, [userId, isPublicProfile, currentProfileData]);
  
  const {
    profilePictureUrl,
    isLoading: isLoadingProfilePicture,
    refetch: refetchProfilePicture
  } = useProfilePicture();
  
  const data = isPublicProfile ? publicProfileData : currentProfileData;
  const isLoading = (isPublicProfile ? isLoadingPublicProfile : isLoadingCurrentProfile) || isLoadingProfilePicture;
  const error = isPublicProfile ? publicProfileError : currentProfileError;
  
  useEffect(() => {
    if (!profilePictureUrl && !isLoadingProfilePicture) {
      refetchProfilePicture();
    }
  }, [userId]);
  
  useEffect(() => {
    if (data && profilePictureUrl) {
      if (isPublicProfile) {
        if (data.profilePictureUrl !== profilePictureUrl) {
          data.profilePictureUrl = profilePictureUrl;
        }
      } else {
        if (data.profilePictureUrl !== profilePictureUrl) {
          data.profilePictureUrl = profilePictureUrl;
        }
      }
    }
  }, [data, profilePictureUrl, isPublicProfile]);
  
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const docs = await documentService.getDocuments(true);
        setDocuments(docs);
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
    };
    
    if (!isPublicProfile && !isLoading && !error && data) {
      fetchDocuments();
    }
  }, [isPublicProfile, isLoading, error, data]);
  
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

  useEffect(() => {
    const handleBeforeUnload = () => {
      studentProfileService.clearCache();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    studentProfileService.clearCache();
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    
    if (refetchCurrentProfile) {
      refetchCurrentProfile();
    }
  }, [userId, refetchCurrentProfile]);

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-8" data-testid="profile-loading">
        <div className="w-full bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-indigo-600/30 rounded-full opacity-75 blur"></div>
                <Skeleton className="h-24 w-24 sm:h-32 sm:w-32 rounded-full border-4 border-background relative" />
              </div>
              
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-4">
                  <div>
                    <Skeleton className="h-8 w-64 mb-2" />
                    <Skeleton className="h-4 w-48 mb-4" />
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Skeleton className="h-6 w-24 rounded-full" />
                      <Skeleton className="h-6 w-32 rounded-full" />
                    </div>
                  </div>
                  
                  <Skeleton className="h-10 w-36" />
                </div>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-6 w-56" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-1 rounded-lg mb-6">
            <div className="grid w-full grid-cols-2 h-auto p-1">
              <Skeleton className="h-12 rounded-md" />
              <Skeleton className="h-12 rounded-md" />
            </div>
          </div>
          
          <div className="space-y-6">
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

  const userData = {
    user: currentProfileData || {},
    studentProfile: studentProfile || {
      isSeekingInternship: false,
      isSeekingApprenticeship: false
    },
    diplomas: currentProfileData?.diplomas || [],
    addresses: currentProfileData?.addresses || [],
    documents: documents.length > 0 ? documents : (currentProfileData?.documents || []),
    stats: currentProfileData?.stats || { profile: { completionPercentage: 0 } }
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
        onProfileUpdate={handleProfileUpdate}
      />

      <ProfileTabs 
        userData={userData}
        isPublicProfile={isPublicProfile}
        documents={documents}
        onProfileUpdate={handleProfileUpdate}
      />

    </motion.div>
  );
};

export default ProfileView; 