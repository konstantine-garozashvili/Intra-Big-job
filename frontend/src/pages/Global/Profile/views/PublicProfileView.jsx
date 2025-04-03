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
    const fetchPublicProfile = async () => {
      try {
        setIsLoading(true);
        const data = await apiService.getPublicProfile(userId);
        
        if (data && (data.success === true || data.data)) {
          setProfileData(data.data || data);
        } else {
          setError(data.error || 'Failed to fetch profile data');
        }
      } catch (error) {
        setError(error.message || 'Error fetching profile data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPublicProfile();
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
      id: profileData.id || profileData.user?.id,
      firstName: profileData.firstName || profileData.user?.firstName || "",
      lastName: profileData.lastName || profileData.user?.lastName || "",
      email: profileData.email || profileData.user?.email || "",
      phoneNumber: profileData.phoneNumber || profileData.user?.phoneNumber || "",
      profilePictureUrl: profileData.profilePictureUrl || profileData.user?.profilePictureUrl || "",
      roles: Array.isArray(profileData.roles) 
        ? profileData.roles.map(role => typeof role === 'string' ? { name: role } : role)
        : (profileData.user?.roles || [{ name: 'USER' }]),
      specialization: profileData.specialization || profileData.user?.specialization || {},
      linkedinUrl: profileData.linkedinUrl || profileData.user?.linkedinUrl || "",
      city: profileData.city || ""
    },
    studentProfile: profileData.studentProfile || {
      isSeekingInternship: false,
      isSeekingApprenticeship: false
    },
    diplomas: profileData.diplomas || [],
    addresses: profileData.addresses || [],
    documents: profileData.documents || [],
    stats: profileData.stats || { profile: { completionPercentage: 0 } }
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
        onProfileUpdate={() => {}} // Fonction vide car pas de mise à jour en mode public
      />

      <ProfileTabs 
        userData={userData}
        isPublicProfile={true}
        documents={userData.documents}
        onProfileUpdate={() => {}} // Fonction vide car pas de mise à jour en mode public
      />
    </motion.div>
  );
};

export default PublicProfileView;
