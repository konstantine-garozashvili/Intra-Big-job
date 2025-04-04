import React from 'react';
import { useProfilePicture } from '../pages/Global/Profile/hooks/useProfilePicture';
import { Avatar, AvatarFallback } from './ui/avatar';
import { User } from "lucide-react";

const ProfilePictureDisplay = ({ className = '' }) => {
  const {
    profilePictureUrl,
    isLoading,
    isError
  } = useProfilePicture();

  const handleImageError = (e) => {
    e.target.src = '';
  };

  return (
    <Avatar className={`rounded-full ${className}`}>
      {profilePictureUrl ? (
        <img
          src={profilePictureUrl}
          alt="Photo de profil"
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
      ) : (
        <AvatarFallback className="bg-gradient-to-r from-[#02284f] to-[#03386b] text-white">
          <User className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8" />
        </AvatarFallback>
      )}
    </Avatar>
  );
};

export default ProfilePictureDisplay;
