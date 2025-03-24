import React from 'react';
import { Skeleton } from './skeleton';

/**
 * Skeleton pour le chargement des informations utilisateur
 * Affiche un placeholder pulsant pendant le chargement des données
 * 
 * @returns {JSX.Element} Composant skeleton
 */
const UserSkeleton = ({ variant = 'default' }) => {
  // Style pour le variant compact (moins d'espace et éléments)
  if (variant === 'compact') {
    return (
      <div className="flex items-center space-x-3 p-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    );
  }
  
  // Style avatar seulement
  if (variant === 'avatar') {
    return <Skeleton className="h-10 w-10 rounded-full" />;
  }

  // Style détaillé par défaut
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 w-full max-w-md">
      <div className="flex items-start space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-32" />
          <div className="flex space-x-2 pt-2">
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSkeleton; 