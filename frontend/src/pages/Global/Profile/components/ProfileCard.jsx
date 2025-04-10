import React, { memo, useState } from 'react';
import { Mail, Building } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import ProfilePictureDisplay from '@/components/ProfilePictureDisplay';

const OptimizedImage = memo(({ src, alt, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  return (
    <>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 0.3s ease-in-out' }}
        {...props}
      />
      {!isLoaded && <Skeleton className="w-full h-full absolute inset-0" />}
    </>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

const ProfileCard = memo(({ userData }) => {
  if (!userData) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center space-x-4 mb-6">
        <div className="bg-white/20 rounded-full p-2.5">
          <ProfilePictureDisplay className="w-12 h-12" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {userData.firstName} {userData.lastName}
          </h2>
          <p className="text-gray-500">{userData.role}</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-3 text-gray-600">
          <Mail className="h-5 w-5" />
          <span>{userData.email}</span>
        </div>
        {userData.organization && (
          <div className="flex items-center space-x-3 text-gray-600">
            <Building className="h-5 w-5" />
            <span>{userData.organization}</span>
          </div>
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.userData?.firstName === nextProps.userData?.firstName &&
    prevProps.userData?.lastName === nextProps.userData?.lastName &&
    prevProps.userData?.email === nextProps.userData?.email &&
    prevProps.userData?.role === nextProps.userData?.role &&
    prevProps.userData?.organization === nextProps.userData?.organization
  );
});

ProfileCard.displayName = 'ProfileCard';

export default ProfileCard;
