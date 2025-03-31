import React, { useEffect, useState, useCallback } from "react";
import ProfileHeader from "../components/profile-view/ProfileHeader";
import ProfileTabs from "../components/profile-view/ProfileTabs";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserData } from "@/hooks/useUserData";
import { useProfilePicture } from "../hooks/useProfilePicture";
import { isGuest } from "../utils/roleUtils";
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
  
  const { 
    user: currentProfileData, 
    isLoading: isLoadingCurrentProfile,
    error: currentProfileError,
    forceRefresh: refetchCurrentProfile,
    setUser: setCurrentProfileData
  } = useUserData({
    preferComprehensiveData: true,
    enabled: !isPublicProfile
  });
  
  const [publicProfileData, setPublicProfileData] = useState(null);
  const [isLoadingPublicProfile, setIsLoadingPublicProfile] = useState(false);
  const [publicProfileError, setPublicProfileError] = useState(null);
  
  // Fonction réutilisable pour charger le profil étudiant
  const fetchStudentProfile = useCallback(async (forceFresh = true) => {
    if (isLoadingStudentProfile) return; // Éviter les appels multiples
    
    try {
      setIsLoadingStudentProfile(true);
      console.log("Fetching student profile in ProfileView...", forceFresh ? "(force refresh)" : "");
      
      const response = await studentProfileService.getMyProfile(forceFresh);
      console.log("Fetched student profile:", response);
      
      if (response && response.success && response.data) {
        setStudentProfile(response.data);
        
        // Mettre également à jour les données dans le profil utilisateur
        if (currentProfileData && !isPublicProfile) {
          currentProfileData.studentProfile = response.data;
          
          // Notifier les autres composants de la mise à jour
          handleProfileUpdate({
            studentProfile: response.data
          });
        }
      }
      setHasLoadedStudentProfile(true);
    } catch (error) {
      console.error("Failed to fetch student profile:", error);
      setHasLoadedStudentProfile(true); // Même en cas d'erreur, pour éviter les appels en boucle
    } finally {
      setIsLoadingStudentProfile(false);
    }
  }, [isLoadingStudentProfile, currentProfileData, isPublicProfile]);
  
  // Préchargement du profil étudiant pour résoudre le problème d'affichage
  useEffect(() => {
    if (!isPublicProfile && currentProfileData && !hasLoadedStudentProfile && !isLoadingStudentProfile) {
      // Vérifie si l'utilisateur est un étudiant
      const isStudent = currentProfileData.roles?.some(role => {
        if (typeof role === 'string') {
          return role.includes('STUDENT');
        } else if (typeof role === 'object' && role !== null && role.name) {
          return role.name.includes('STUDENT');
        }
        return false;
      });
      
      if (isStudent) {
        // Toujours forcer le chargement frais des données lors de l'initialisation
        fetchStudentProfile(true);
      } else {
        setHasLoadedStudentProfile(true); // Marquer comme chargé si l'utilisateur n'est pas un étudiant
      }
    }
  }, [isPublicProfile, currentProfileData, hasLoadedStudentProfile, isLoadingStudentProfile, fetchStudentProfile]);
  
  // Gestionnaire de mise à jour du profil utilisateur depuis les composants enfants
  const handleProfileUpdate = useCallback((updatedData) => {
    console.log("Profile update triggered with:", updatedData);
    
    if (isPublicProfile) {
      // Pour les profils publics, mettre à jour l'état local
      setPublicProfileData(prev => ({
        ...prev,
        ...updatedData
      }));
    } else {
      // Pour le profil de l'utilisateur connecté, utiliser la fonction de mise à jour du hook
      if (setCurrentProfileData) {
        setCurrentProfileData(prev => ({
          ...prev,
          ...updatedData
        }));
      } else {
        // Fallback: forcer un rafraichissement complet des données
        refetchCurrentProfile();
      }
      
      // Mettre à jour aussi l'état local des documents si nécessaire
      if (updatedData.documents) {
        setDocuments(updatedData.documents);
      }
      
      // Mettre à jour l'état du profil étudiant si présent
      if (updatedData.studentProfile) {
        setStudentProfile(updatedData.studentProfile);
      }
    }
    
    // Toast pour indiquer que le profil a été mis à jour
    if (updatedData.toastMessage !== false) {
      toast.success(updatedData.toastMessage || "Profil mis à jour");
    }
  }, [isPublicProfile, setCurrentProfileData, refetchCurrentProfile]);
  
  // Écouter les événements de mise à jour des statuts de recherche
  useEffect(() => {
    if (!isPublicProfile) {
      // Gestionnaire pour les mises à jour de statut de recherche
      const handleJobStatusUpdate = async (event) => {
        console.log("Job status update event received:", event.detail);
        await fetchStudentProfile(true);
      };
      
      // Gestionnaire pour les mises à jour de portfolio
      const handlePortfolioUpdate = async (event) => {
        console.log("Portfolio update event received:", event.detail);
        
        // Forcer le rafraîchissement du profil étudiant si c'est une mise à jour de portfolio
        if (event.detail?.portfolioUrl !== undefined || (event.detail?.type === 'portfolio')) {
          const portfolioUrl = event.detail.portfolioUrl || (event.detail.type === 'portfolio' ? event.detail.portfolioUrl : undefined);
          
          // Mise à jour optimiste immédiate
          if (studentProfile && portfolioUrl !== undefined) {
            setStudentProfile(prevProfile => ({
              ...prevProfile,
              portfolioUrl: portfolioUrl
            }));
            
            // Mettre également à jour le profil utilisateur principal
            if (currentProfileData && currentProfileData.studentProfile) {
              currentProfileData.studentProfile.portfolioUrl = portfolioUrl;
              handleProfileUpdate({
                studentProfile: {
                  ...currentProfileData.studentProfile,
                  portfolioUrl: portfolioUrl
                },
                toastMessage: false // Éviter d'afficher un toast pour cette mise à jour
              });
            }
          }
          
          // Puis forcer le chargement complet des données fraîches
          await fetchStudentProfile(true);
        }
      };
      
      // Écouter les événements personnalisés
      window.addEventListener('job-status-updated', handleJobStatusUpdate);
      window.addEventListener('profile-updated', handlePortfolioUpdate);
      window.addEventListener('portfolio-updated', handlePortfolioUpdate);
      
      // Nettoyer les écouteurs quand le composant est démonté
      return () => {
        window.removeEventListener('job-status-updated', handleJobStatusUpdate);
        window.removeEventListener('profile-updated', handlePortfolioUpdate);
        window.removeEventListener('portfolio-updated', handlePortfolioUpdate);
      };
    }
  }, [isPublicProfile, fetchStudentProfile, studentProfile, currentProfileData, handleProfileUpdate]);
  
  // Add this useEffect to clear cache when component mounts or when reloading the page
  useEffect(() => {
    // Clear cache on page reload
    const handleBeforeUnload = () => {
      studentProfileService.clearCache();
    };
    
    // Listen for page reload/navigation
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Initial cache clear when component mounts
    studentProfileService.clearCache();
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
  
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
  
  // Add this useEffect to force fresh profile data when navigating to the profile page
  useEffect(() => {
    // Only run for personal profiles (not public profiles)
    if (!isPublicProfile) {
      console.log("ProfileView mounted - forcing immediate profile data refresh");
      
      // Force an immediate profile data refresh to get city and other information
      const loadCompleteProfileData = async () => {
        try {
          // First try to get data from the local storage or cache
          let profileData = currentProfileData;
          
          // If we don't have the city information, force a fresh data load
          if (!profileData?.city || profileData.city === 'Non renseignée' || profileData.city === 'Chargement...') {
            console.log("City information missing, loading fresh profile data");
            
            // Try to load from consolidated endpoint which includes city
            try {
              const response = await apiService.get('/profile/consolidated', { 
                noCache: true, 
                timeout: 5000
              });
              
              if (response) {
                // Update local state with the fresh data
                const freshData = response.data || response;
                
                // Extract city information
                let city = 'Non renseignée';
                if (freshData.city) {
                  city = freshData.city;
                } else if (freshData.addresses && freshData.addresses.length > 0) {
                  const firstAddress = freshData.addresses[0];
                  city = firstAddress.city?.name || firstAddress.city || 'Non renseignée';
                }
                
                // Create a merged profile with the fresh city data
                const enhancedProfile = {
                  ...profileData,
                  ...freshData,
                  city: city,
                  _loadedAt: Date.now()
                };
                
                // Update component state
                if (setCurrentProfileData) {
                  setCurrentProfileData(enhancedProfile);
                }
                
                // Dispatch event to notify other components
                window.dispatchEvent(new CustomEvent('profile-data-refreshed', {
                  detail: { 
                    data: enhancedProfile,
                    source: 'profile-view'
                  }
                }));
                
                console.log("Profile data refreshed with city:", city);
              }
            } catch (error) {
              console.error("Error loading fresh profile data:", error);
            }
          }
        } catch (error) {
          console.error("Error in profile initial data loading:", error);
        }
      };
      
      // Execute the data loading function
      loadCompleteProfileData();
      
      // Also refetch current profile through the hook
      if (refetchCurrentProfile) {
        refetchCurrentProfile();
      }
    }
  }, [isPublicProfile, refetchCurrentProfile, setCurrentProfileData, currentProfileData]);

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

  // Add this useEffect to clear cache when userId changes
  useEffect(() => {
    // Clear profile cache when userId changes
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    
    // Force refresh profile data
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

  let userData;
  
  if (isPublicProfile) {
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
    userData = {
      user: data,
      // Priorité au profil étudiant préchargé, sinon utiliser celui des données actuelles
      studentProfile: studentProfile || data.studentProfile || {
        isSeekingInternship: false,
        isSeekingApprenticeship: false
      },
      diplomas: data.diplomas || [],
      addresses: data.addresses || [],
      documents: documents.length > 0 ? documents : (data.documents || []),
      stats: data.stats || { profile: { completionPercentage: 0 } }
    };
  }

  console.log("Final userData structure being passed to ProfileHeader:", userData);
  
  if (studentProfile) {
    console.log("Student profile state is being used:", studentProfile);
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