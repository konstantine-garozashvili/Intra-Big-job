import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import ProfileProgress from '../pages/Global/Profile/components/profile-view/ProfileProgress';
import { RoleGuard, ROLES, useRoles } from '../features/roles';
import { authService } from '../lib/services/authService';
import { profileService } from '../pages/Global/Profile/services/profileService';
import Footer from './Footer';


const MainLayout = () => {
  const [userData, setUserData] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showProgress, setShowProgress] = useState(false);
  const { hasRole } = useRoles();
  const location = useLocation();

  // Pages qui doivent être affichées en plein écran sans marges internes
  const fullScreenPages = ['/register', '/login'];
  const isFullScreenPage = fullScreenPages.includes(location.pathname);

  // Fetch user data when the component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      if (authService.isLoggedIn()) {
        try {
          const data = await authService.getCurrentUser();
          setUserData(data);
          
          // After getting basic user data, fetch complete profile data
          const profileData = await profileService.getAllProfileData();
          setProfileData(profileData);
          setIsLoading(false);
          // Attendre un court instant avant d'afficher le composant de progression
          setTimeout(() => setShowProgress(true), 100);
        } catch (error) {
          console.error('Error fetching data:', error);
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar user={userData} />
      
      <main className={`flex-grow ${isFullScreenPage ? '' : 'container mx-auto px-4 py-8'}`}>
        <Outlet />
      </main>

      {showProgress && !isLoading && profileData && hasRole(ROLES.GUEST) && (
        <ProfileProgress userData={profileData} />
      )}
      
      <Footer />
    </div>
  );
};

export default MainLayout;
