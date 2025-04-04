import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiService from '@/lib/services/apiService';
import ProfileHeader from '../components/profile-view/ProfileHeader';
import ProfileTabs from '../components/profile-view/ProfileTabs';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { useRoleUI } from '@/features/roles';
import { ROLES } from '@/features/roles/roleContext';
import { usePublicDocuments } from '../hooks/useDocuments';

const PublicProfileView = () => {
  const { userId } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const roleUI = useRoleUI();
  
  // Utiliser le hook pour récupérer les documents publics
  const { 
    documents, 
    isLoading: isLoadingDocuments, 
    downloadDocument 
  } = usePublicDocuments(userId);
  
  console.log('PublicProfileView - userId from params:', userId);
  console.log('PublicProfileView - Current URL:', window.location.pathname);
  console.log('PublicProfileView - Documents:', documents);
  
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

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col items-center sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="flex-1 space-y-2 text-center sm:text-left">
              <Skeleton className="h-7 w-3/4 sm:w-1/2" />
              <Skeleton className="h-5 w-2/3 sm:w-1/3" />
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <Skeleton className="h-7 w-32 mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Erreur</h2>
          <p className="text-gray-700">{error}</p>
          <Button asChild className="mt-4">
            <Link to="/dashboard">Retour au tableau de bord</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isOwnProfile) {
    return null; // Will redirect to /profile
  }

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

  const userData = {
    user: profileData,
    studentProfile: profileData?.studentProfile || {
      isSeekingInternship: false,
      isSeekingApprenticeship: false
    },
    diplomas: profileData?.diplomas || [],
    addresses: profileData?.addresses || [],
    documents: documents || [],
    stats: profileData?.stats || { profile: { completionPercentage: 0 } }
  };

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
        onProfileUpdate={() => {}}
      />

      <ProfileTabs 
        userData={userData}
        isPublicProfile={true}
        documents={documents}
        onProfileUpdate={() => {}}
      />
    </motion.div>
  );
};

export default PublicProfileView;
