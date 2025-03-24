import React, { memo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Common header skeleton - memoized for performance
const HeaderSkeleton = memo(() => (
  <div className="mb-6">
    <Skeleton className="h-8 w-48 mb-2" />
    <Skeleton className="h-5 w-64 mb-4" />
  </div>
));

HeaderSkeleton.displayName = 'HeaderSkeleton';

// Memoized skeleton components for each section
const ProfileSkeleton = memo(() => {
  return (
    <>
      <HeaderSkeleton />
      
      {/* Profile Picture Section */}
      <div className="mb-8 flex justify-center">
        <div className="relative">
          <Skeleton className="w-32 h-32 rounded-full" />
          <Skeleton className="absolute bottom-0 right-0 w-8 h-8 rounded-full" />
        </div>
      </div>
      
      {/* Personal Information Section */}
      <div className="space-y-6 bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Skeleton className="h-5 w-5 mr-2 rounded-full" />
            <Skeleton className="h-6 w-48" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      </div>
      
      {/* Address Section */}
      <div className="space-y-6 bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Skeleton className="h-5 w-5 mr-2 rounded-full" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
        
        <div className="grid grid-cols-1 gap-6 mt-4">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        </div>
      </div>
      
      {/* Social Profiles Section */}
      <div className="space-y-6 bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Skeleton className="h-5 w-5 mr-2 rounded-full" />
            <Skeleton className="h-6 w-36" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
        
        <div className="mt-4">
          <Skeleton className="h-14 w-full" />
        </div>
      </div>
    </>
  );
});

ProfileSkeleton.displayName = 'ProfileSkeleton';

// Remaining skeleton components should also be memoized
const SecuritySkeleton = memo(() => {
  return (
    <>
      <HeaderSkeleton />
      
      {/* Password Change Section */}
      <div className="space-y-6">
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="space-y-4">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-10 w-40 mt-2" />
        </div>
      </div>
      
      {/* Separator */}
      <Skeleton className="h-px w-full my-8" />
      
      {/* 2FA Section */}
      <div className="space-y-6">
        <Skeleton className="h-6 w-56 mb-4" />
        <div className="p-6 border rounded-lg">
          <Skeleton className="h-6 w-64 mb-2" />
          <Skeleton className="h-4 w-full mb-4" />
          <Skeleton className="h-10 w-48" />
        </div>
      </div>
    </>
  );
});

SecuritySkeleton.displayName = 'SecuritySkeleton';

const NotificationsSkeleton = memo(() => {
  return (
    <>
      <HeaderSkeleton />
      
      {/* Email Notifications */}
      <div className="space-y-6">
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="space-y-6">
          {Array(4).fill().map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <div>
                <Skeleton className="h-5 w-48 mb-1" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-6 w-12" />
            </div>
          ))}
        </div>
      </div>
      
      {/* Separator */}
      <Skeleton className="h-px w-full my-8" />
      
      {/* App Notifications */}
      <div className="space-y-6">
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="space-y-6">
          {Array(3).fill().map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <div>
                <Skeleton className="h-5 w-48 mb-1" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-6 w-12" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
});

NotificationsSkeleton.displayName = 'NotificationsSkeleton';

// Ajouter un nouveau squelette pour la page Carrière
const CareerSkeleton = memo(() => {
  return (
    <>
      <HeaderSkeleton />
      
      {/* CV Section */}
      <div className="space-y-6 bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Skeleton className="h-5 w-5 mr-2 rounded-full" />
            <Skeleton className="h-6 w-48" />
          </div>
        </div>
        
        <Skeleton className="h-4 w-full mb-4" />
        <Skeleton className="h-4 w-3/4 mb-6" />
        
        {/* CV Upload Area */}
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-6">
          <div className="flex flex-col items-center">
            <Skeleton className="h-12 w-12 rounded-full mb-4" />
            <Skeleton className="h-5 w-48 mb-2" />
            <Skeleton className="h-4 w-64 mb-4" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
      </div>
      
      {/* Job Seeking Section */}
      <div className="space-y-6 bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Skeleton className="h-5 w-5 mr-2 rounded-full" />
            <Skeleton className="h-6 w-48" />
          </div>
        </div>
        
        <Skeleton className="h-4 w-full mb-4" />
        <Skeleton className="h-4 w-3/4 mb-6" />
        
        {/* Options */}
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div>
                <Skeleton className="h-5 w-36 mb-1" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            <Skeleton className="h-6 w-12 rounded-full" />
          </div>
          
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div>
                <Skeleton className="h-5 w-36 mb-1" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            <Skeleton className="h-6 w-12 rounded-full" />
          </div>
        </div>
      </div>
    </>
  );
});

CareerSkeleton.displayName = 'CareerSkeleton';

/**
 * Main component that renders the appropriate skeleton based on the type
 * @param {Object} props - Component props
 * @param {string} props.type - The type of skeleton to render (profile, security, notifications, documents, career)
 */
const ProfileSettingsSkeleton = ({ type = 'profile' }) => {
  // Use memoized components for better performance
  switch (type) {
    case 'profile':
      return <ProfileSkeleton />;
    case 'security':
      return <SecuritySkeleton />;
    case 'notifications':
      return <NotificationsSkeleton />;
    case 'career':
      return <CareerSkeleton />;
    default:
      return <ProfileSkeleton />;
  }
};

// Add display name for better debugging
ProfileSettingsSkeleton.displayName = 'ProfileSettingsSkeleton';

export default ProfileSettingsSkeleton; 