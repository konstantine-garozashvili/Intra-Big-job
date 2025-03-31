import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const PersonalInformationSkeleton = () => {
  return (
    <div className="container mx-auto p-6">
      {/* Title */}
      <Skeleton className="h-10 w-48 mb-8" />
      
      {/* Main Card */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        {/* Form Fields */}
        <div className="space-y-6">
          {/* Profile Header with Avatar */}
          <div className="flex items-center space-x-6 mb-6">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          
          {/* Form Fields in Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Row */}
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            
            {/* Second Row */}
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
          
          {/* Full Width Fields */}
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          
          {/* Address Section */}
          <div className="mt-8">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
          
          {/* Button Row */}
          <div className="flex justify-end mt-6">
            <Skeleton className="h-10 w-48" />
          </div>
        </div>
      </div>
      
      {/* Additional Settings Card */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <Skeleton className="h-6 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    </div>
  );
}; 