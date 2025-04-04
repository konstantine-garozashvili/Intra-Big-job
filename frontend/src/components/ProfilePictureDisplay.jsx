import React from 'react';
import { useProfilePicture } from '../pages/Global/Profile/hooks/useProfilePicture';

const ProfilePictureDisplay = ({ className = '' }) => {
  const {
    profilePictureUrl,
    isLoading,
    isError
  } = useProfilePicture();

  const handleImageError = (e) => {
    e.target.src = '/default-avatar.png';
  };

  return (
    <div className={`relative rounded-full ${className}`}>
      {profilePictureUrl ? (
        <img
          src={profilePictureUrl}
          alt="Photo de profil"
          className="rounded-full w-full h-full object-cover transition-opacity duration-300"
          onError={handleImageError}
        />
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-user w-6 h-6 text-white">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      )}
    </div>
  );
};

export default ProfilePictureDisplay;
