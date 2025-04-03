import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiService from '@/lib/services/apiService';
import ProfileHeader from '../components/profile-view/ProfileHeader';
import ProfileTabs from '../components/profile-view/ProfileTabs';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

const PublicProfileView = () => {
  const { userId } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Réinitialiser les états à chaque changement de userId
    setProfileData(null);
    setIsLoading(true);
    setError(null);
    
    const controller = new AbortController();
    
    const fetchPublicProfile = async () => {
      try {
        // Nettoyer le cache avant de charger le nouveau profil
        apiService.clearPublicProfileCache(userId);
        
        console.log('Fetching profile for userId:', userId);
        const response = await apiService.getPublicProfile(userId, {
          signal: controller.signal
        });
        console.log('API Response:', response);
        
        if (response?.data?.user) {
          console.log('Setting profile data from response.data.user:', response.data.user);
          setProfileData(response.data.user);
        } else if (response?.data) {
          console.log('Setting profile data from response.data:', response.data);
          setProfileData(response.data);
        } else if (response) {
          console.log('Setting profile data from direct response:', response);
          setProfileData(response);
        } else {
          console.error('Invalid response structure:', response);
          setError('Données du profil non disponibles');
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('Request aborted');
          return;
        }
        console.error('Error in fetchPublicProfile:', error);
        setError(error.message || 'Erreur lors de la récupération du profil');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPublicProfile();
    
    return () => {
      controller.abort();
      // Nettoyer le cache lors du démontage du composant
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

  const userData = {
    user: {
      id: profileData.id,
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      email: profileData.email,
      phoneNumber: profileData.phoneNumber,
      profilePictureUrl: profileData.profilePicturePath,
      roles: Array.isArray(profileData.roles) 
        ? profileData.roles.map(role => typeof role === 'string' ? { name: role } : role)
        : [],
      specialization: profileData.specialization || {},
      linkedinUrl: profileData.linkedinUrl || "",
      birthDate: profileData.birthDate,
      createdAt: profileData.createdAt,
      updatedAt: profileData.updatedAt
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
        documents={[]}
        onProfileUpdate={() => {}}
      />
    </motion.div>
  );
};

export default PublicProfileView;
