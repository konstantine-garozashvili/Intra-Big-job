import React, { memo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * A skeleton loading component for the sidebar navigation
 * Shows a consistent 4-item skeleton regardless of user role
 * Memoized to prevent unnecessary re-renders
 * @returns {JSX.Element} The skeleton component
 */
const SidebarSkeleton = memo(() => {
  // Define the structure of the navigation items - always show 4 items for consistent layout
  const navItems = [
    { active: true, badge: false }, // Profile
    { active: false, badge: false }, // Career (will be shown or hidden based on role)
    { active: false, badge: false }, // Security 
    { active: false, badge: false }, // Notifications
  ];
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <h2 className="px-3 mb-4 text-lg font-semibold text-foreground">
        <Skeleton className="h-6 w-36" />
      </h2>
      
      {/* Navigation items */}
      <nav className="space-y-1">
        {navItems.map((item, index) => (
          <div 
            key={index}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-md ${
              item.active ? 'bg-primary/10' : 'hover:bg-muted'
            } transition-colors`}
          >
            <div className="flex items-center gap-3">
              <Skeleton className="w-5 h-5 rounded-full" />
              <Skeleton className="h-5 w-24" />
            </div>
            {item.badge && (
              <Skeleton className="w-5 h-5 rounded-full bg-red-200" />
            )}
          </div>
        ))}
      </nav>
    </div>
  );
});

// Add display name for better debugging
SidebarSkeleton.displayName = 'SidebarSkeleton';

export default SidebarSkeleton; 