import React, { memo, useState } from 'react';
import { UserRound, Mail, Building } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

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
        <div className="bg-[#02284f] rounded-full p-4 relative">
          {userData.avatar ? (
            <div className="relative w-12 h-12">
              <OptimizedImage
                src={userData.avatar}
                alt={`${userData.firstName} ${userData.lastName}`}
                className="rounded-full w-full h-full object-cover"
              />
            </div>
          ) : (
            <UserRound className="h-12 w-12 text-white" />
          )}
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
  // Custom comparison function for memoization
  return (
    prevProps.userData?.firstName === nextProps.userData?.firstName &&
    prevProps.userData?.lastName === nextProps.userData?.lastName &&
    prevProps.userData?.email === nextProps.userData?.email &&
    prevProps.userData?.role === nextProps.userData?.role &&
    prevProps.userData?.organization === nextProps.userData?.organization &&
    prevProps.userData?.avatar === nextProps.userData?.avatar
  );
});

ProfileCard.displayName = 'ProfileCard';

export default ProfileCard; 