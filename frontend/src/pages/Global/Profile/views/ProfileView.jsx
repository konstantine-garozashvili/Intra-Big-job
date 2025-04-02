import React, { useEffect, useState, useCallback } from "react";
import ProfileHeader from "../components/profile-view/ProfileHeader";
import ProfileTabs from "../components/profile-view/ProfileTabs";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfilePicture } from "../hooks/useProfilePicture";
import { isGuest } from "../utils/roleUtils";
import documentService from "../services/documentService";
import apiService from "@/lib/services/apiService";
import { toast } from "sonner";
import { studentProfileService } from "@/lib/services/studentProfileService";
import { useProfileData } from "@/hooks/useProfileData";

const ProfileView = () => {
  const { userId } = useParams();
  const isPublicProfile = !!userId;

  // États principaux
  const [documents, setDocuments] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [hasLoadedStudentProfile, setHasLoadedStudentProfile] = useState(false);
  const [isLoadingStudentProfile, setIsLoadingStudentProfile] = useState(false);
  const [publicProfileData, setPublicProfileData] = useState(null);
  const [isLoadingPublicProfile, setIsLoadingPublicProfile] = useState(false);
  const [publicProfileError, setPublicProfileError] = useState(null);

  // Hook de données de profil
  const {
    profileData: currentProfileData,
    isLoading: isLoadingCurrentProfile,
    error: currentProfileError,
    loadProfileData: refetchCurrentProfile,
    getRoles,
    getCity,
    getFullName
  } = useProfileData({
    loadOnMount: !isPublicProfile
  });

  // Hook de photo de profil
  const {
    profilePictureUrl,
    isLoading: isLoadingProfilePicture,
    refetch: refetchProfilePicture
  } = useProfilePicture();

  // Fonction pour charger le profil étudiant
  const fetchStudentProfile = useCallback(async (forceFresh = true) => {
    if (isLoadingStudentProfile) return;
    
    try {
      setIsLoadingStudentProfile(true);
      console.log("Fetching student profile in ProfileView...", forceFresh ? "(force refresh)" : "");
      
      const response = await studentProfileService.getMyProfile(forceFresh);
      console.log("Fetched student profile:", response);
      
      if (response && response.success && response.data) {
        setStudentProfile(response.data);
        
        if (currentProfileData && !isPublicProfile) {
          handleProfileUpdate({
            studentProfile: response.data
          });
        }
      }
      setHasLoadedStudentProfile(true);
    } catch (error) {
      console.error("Failed to fetch student profile:", error);
      setHasLoadedStudentProfile(true);
    } finally {
      setIsLoadingStudentProfile(false);
    }
  }, [currentProfileData, isPublicProfile, isLoadingStudentProfile]);

  // Gestionnaire de mise à jour du profil
  const handleProfileUpdate = useCallback((updatedData) => {
    console.log("Profile update triggered with:", updatedData);
    
    if (isPublicProfile) {
      setPublicProfileData(prev => ({
        ...prev,
        ...updatedData
      }));
    } else {
      refetchCurrentProfile(true);
      
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
  }, [isPublicProfile, refetchCurrentProfile]);

  // Effet pour charger le profil public
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

  // Effet pour charger le profil étudiant
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
  }, [isPublicProfile, currentProfileData, hasLoadedStudentProfile, isLoadingStudentProfile, fetchStudentProfile]);

  // Effet pour charger la photo de profil
  useEffect(() => {
    if (!profilePictureUrl && !isLoadingProfilePicture) {
      refetchProfilePicture();
    }
  }, [profilePictureUrl, isLoadingProfilePicture, refetchProfilePicture]);

  // Effet pour les mises à jour d'événements
  useEffect(() => {
    if (!isPublicProfile) {
      const handleJobStatusUpdate = async () => {
        await fetchStudentProfile(true);
      };
      
      const handlePortfolioUpdate = async (event) => {
        console.log("Portfolio update event received:", event.detail);
        
        if (event.detail?.portfolioUrl !== undefined || (event.detail?.type === 'portfolio')) {
          const portfolioUrl = event.detail.portfolioUrl || (event.detail.type === 'portfolio' ? event.detail.portfolioUrl : undefined);
          
          if (studentProfile && portfolioUrl !== undefined) {
            setStudentProfile(prevProfile => ({
              ...prevProfile,
              portfolioUrl: portfolioUrl
            }));
          }
          
          await fetchStudentProfile(true);
        }
      };
      
      window.addEventListener('job-status-updated', handleJobStatusUpdate);
      window.addEventListener('profile-updated', handlePortfolioUpdate);
      window.addEventListener('portfolio-updated', handlePortfolioUpdate);
      
      return () => {
        window.removeEventListener('job-status-updated', handleJobStatusUpdate);
        window.removeEventListener('profile-updated', handlePortfolioUpdate);
        window.removeEventListener('portfolio-updated', handlePortfolioUpdate);
      };
    }
  }, [isPublicProfile, fetchStudentProfile, studentProfile]);

  // Effet pour charger les documents
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const docs = await documentService.getDocuments(true);
        setDocuments(docs);
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
    };
    
    if (!isPublicProfile && !isLoadingCurrentProfile && !currentProfileError && currentProfileData) {
      fetchDocuments();
    }
  }, [isPublicProfile, isLoadingCurrentProfile, currentProfileError, currentProfileData]);

  // Animations
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

  // États de chargement et données
  const data = isPublicProfile ? publicProfileData : currentProfileData;
  const isLoading = (isPublicProfile ? isLoadingPublicProfile : isLoadingCurrentProfile) || isLoadingProfilePicture;
  const error = isPublicProfile ? publicProfileError : currentProfileError;

  if (isLoading && !data) {
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

  // Construction des données pour les composants enfants
  const userData = isPublicProfile ? {
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
  } : {
    user: data,
    studentProfile: studentProfile || data.studentProfile || {
      isSeekingInternship: false,
      isSeekingApprenticeship: false
    },
    diplomas: data.diplomas || [],
    addresses: data.addresses || [],
    documents: documents.length > 0 ? documents : (data.documents || []),
    stats: data.stats || { profile: { completionPercentage: 0 } }
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