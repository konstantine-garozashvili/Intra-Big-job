import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiService from '@/lib/services/apiService';
import ProfileHeader from '../components/profile-view/ProfileHeader';
import ProfileTabs from '../components/profile-view/ProfileTabs';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import axios from 'axios';

const PublicProfileView = () => {
  const { userId } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  
  console.log('PublicProfileView - userId from params:', userId);
  console.log('PublicProfileView - Current URL:', window.location.pathname);
  
  useEffect(() => {
    const checkCurrentUser = async () => {
      try {
        const currentUser = await apiService.getCurrentUser();
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
        // Vérifier d'abord si c'est notre propre profil
        const isOwn = await checkCurrentUser();
        if (isOwn) return;
        
        // Nettoyer le cache avant de charger le nouveau profil
        apiService.clearPublicProfileCache(userId);
        
        console.log('PublicProfileView - Fetching data for userId:', userId);
        const response = await apiService.getPublicProfile(userId);
        console.log('PublicProfileView - API Response:', response);
        
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
        console.error('PublicProfileView - Error fetching data:', error);
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
