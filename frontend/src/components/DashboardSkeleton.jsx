import React from 'react';
import { Skeleton } from './ui/skeleton';
import UserSkeleton from './ui/UserSkeleton';

/**
 * Affiche un squelette pour le dashboard pendant le chargement
 * Réduit le CLS (Cumulative Layout Shift) en maintenant la structure du dashboard
 */
const DashboardSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* En-tête du dashboard */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" /> {/* Titre */}
          <Skeleton className="h-4 w-64" /> {/* Sous-titre */}
        </div>
        <Skeleton className="h-10 w-32 rounded-md" /> {/* Bouton d'action */}
      </div>

      {/* Grille de stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <Skeleton 
            key={index} 
            className="h-28 rounded-lg"
          />
        ))}
      </div>

      {/* Section principale */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-72 rounded-lg" /> {/* Graphique */}
          <Skeleton className="h-64 rounded-lg" /> {/* Tableau ou liste */}
        </div>
        
        {/* Colonne latérale */}
        <div className="space-y-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" /> {/* Titre section */}
            <UserSkeleton /> {/* Info utilisateur */}
          </div>
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" /> {/* Titre section */}
            <Skeleton className="h-48 rounded-lg" /> {/* Contenu latéral */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton; 