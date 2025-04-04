import React from 'react';
import { useProfilePicture } from '../pages/Global/Profile/hooks/useProfilePicture';
import { UserRound } from 'lucide-react';

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
    <div className={`relative rounded-full ${className} sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20`}>
      <img
        src={profilePictureUrl || '/default-avatar.png'}
        alt="Photo de profil"
        className="rounded-full w-full h-full object-cover transition-opacity duration-300"
        onError={handleImageError}
      />
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full">
          <UserRound className="w-10 h-10 text-white" />
        </div>
      )}
    </div>
  );
};

export default ProfilePictureDisplay;
