import { Skeleton } from "./ui/skeleton";

/**
 * Composant squelette pour le tableau de bord pendant le chargement
 * Affiche une animation de chargement avec une structure similaire au tableau de bord
 */
const DashboardSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* En-tête du tableau de bord */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-[250px]" />
            <Skeleton className="h-4 w-[180px]" />
          </div>
        </div>
        <Skeleton className="h-10 w-[120px] rounded-md" />
      </div>

      {/* Cartes principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Skeleton className="h-[200px] rounded-lg" />
        <Skeleton className="h-[200px] rounded-lg" />
        <Skeleton className="h-[200px] rounded-lg" />
      </div>

      {/* Section de contenu */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-[180px]" />
        <Skeleton className="h-[300px] rounded-lg" />
      </div>

      {/* Tableau */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-[220px]" />
        <div className="space-y-2">
          <Skeleton className="h-10 w-full rounded" />
          <Skeleton className="h-10 w-full rounded" />
          <Skeleton className="h-10 w-full rounded" />
          <Skeleton className="h-10 w-full rounded" />
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton; 