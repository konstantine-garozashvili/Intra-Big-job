import React, { useState, useEffect, useCallback, memo } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Briefcase, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { studentProfileService } from '@/lib/services';

// Optimisation : mémoiser le composant pour éviter les re-rendus inutiles
const JobSeekingSettings = memo(({ profile, onProfileUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [isSeekingInternship, setIsSeekingInternship] = useState(false);
  const [isSeekingApprenticeship, setIsSeekingApprenticeship] = useState(false);
  
  // Utiliser useEffect pour initialiser les états à partir du profil
  useEffect(() => {
    if (!profile) return;
    
    try {
      // Si les données sont dans profile.studentProfile
      if (profile.studentProfile) {
        setIsSeekingInternship(Boolean(profile.studentProfile.isSeekingInternship));
        setIsSeekingApprenticeship(Boolean(profile.studentProfile.isSeekingApprenticeship));
      } 
      // Si les données sont directement dans profile
      else {
        setIsSeekingInternship(Boolean(profile.isSeekingInternship));
        setIsSeekingApprenticeship(Boolean(profile.isSeekingApprenticeship));
      }
    } catch (error) {
      // console.error('Error parsing profile data:', error);
    }
  }, [profile]);

  // Gérer le changement de statut de recherche d'emploi
  const handleToggleInternship = useCallback(async () => {
    if (loading) return;
    
    try {
      setLoading(true);
      
      // Inverser l'état actuel
      const newStatus = !isSeekingInternship;
      
      // Mettre à jour l'état local immédiatement pour une UI réactive
      setIsSeekingInternship(newStatus);
      
      // Appeler directement l'API
      const response = await studentProfileService.toggleInternshipSeeking(newStatus);
      
      if (!response || !response.success) {
        // En cas d'échec, revenir à l'état précédent
        setIsSeekingInternship(!newStatus);
        throw new Error('Échec de la mise à jour');
      }
      
      // Message de succès
      toast.success(`Recherche d'emploi ${newStatus ? 'activée' : 'désactivée'}`);
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut de recherche de stage:', error);
      toast.error('Une erreur est survenue lors de la mise à jour de votre statut de recherche');
    } finally {
      setLoading(false);
    }
  }, [loading, isSeekingInternship]);

  // Gérer le changement de statut de recherche d'alternance
  const handleToggleApprenticeship = useCallback(async () => {
    if (loading) return;
    
    try {
      setLoading(true);
      
      // Inverser l'état actuel
      const newStatus = !isSeekingApprenticeship;
      
      // Mettre à jour l'état local immédiatement pour une UI réactive
      setIsSeekingApprenticeship(newStatus);
      
      // Appeler directement l'API
      const response = await studentProfileService.toggleApprenticeshipSeeking(newStatus);
      
      if (!response || !response.success) {
        // En cas d'échec, revenir à l'état précédent
        setIsSeekingApprenticeship(!newStatus);
        throw new Error('Échec de la mise à jour');
      }
      
      // Message de succès
      toast.success(`Recherche d'alternance ${newStatus ? 'activée' : 'désactivée'}`);
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut de recherche d\'alternance:', error);
      toast.error('Une erreur est survenue lors de la mise à jour de votre statut de recherche');
    } finally {
      setLoading(false);
    }
  }, [loading, isSeekingApprenticeship]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
        Activez ces options pour indiquer que vous êtes à la recherche d'un emploi et/ou d'une alternance.
        <strong className="block mt-2 sm:mt-3">Vous pouvez activer les deux options simultanément si vous êtes ouvert aux deux types d'opportunités.</strong>
      </p>
      
      <div className="space-y-3 sm:space-y-4">
        {/* Option de recherche d'emploi */}
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg ${isSeekingInternship ? 'bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-700' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
          <div className="flex items-start sm:items-center space-x-3 mb-3 sm:mb-0">
            <div className={`p-2 rounded-full ${isSeekingInternship ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
              <BookOpen className={`h-4 w-4 sm:h-5 sm:w-5 ${isSeekingInternship ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
            </div>
            <div>
              <Label htmlFor="seeking-internship" className="text-sm sm:text-base font-medium text-gray-800 dark:text-gray-200">
                Recherche d'emploi
              </Label>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                Activez cette option si vous recherchez un emploi
              </p>
            </div>
          </div>
          <Switch
            id="seeking-internship"
            checked={isSeekingInternship}
            onCheckedChange={handleToggleInternship}
            disabled={loading}
            className="ml-0 sm:ml-4"
          />
        </div>
        
        {/* Option de recherche d'alternance */}
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg ${isSeekingApprenticeship ? 'bg-purple-50 border border-purple-200 dark:bg-purple-900/20 dark:border-purple-700' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
          <div className="flex items-start sm:items-center space-x-3 mb-3 sm:mb-0">
            <div className={`p-2 rounded-full ${isSeekingApprenticeship ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
              <Briefcase className={`h-4 w-4 sm:h-5 sm:w-5 ${isSeekingApprenticeship ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'}`} />
            </div>
            <div>
              <Label htmlFor="seeking-apprenticeship" className="text-sm sm:text-base font-medium text-gray-800 dark:text-gray-200">
                Recherche d'alternance
              </Label>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                Activez cette option si vous recherchez une alternance
              </p>
            </div>
          </div>
          <Switch
            id="seeking-apprenticeship"
            checked={isSeekingApprenticeship}
            onCheckedChange={handleToggleApprenticeship}
            disabled={loading}
            className="ml-0 sm:ml-4"
          />
        </div>
        
        {/* Informations supplémentaires */}
        {(isSeekingInternship || isSeekingApprenticeship) && (
          <div className="mt-4 p-3 sm:p-4 bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-700 rounded-lg">
            <p className="text-xs sm:text-sm text-green-800 dark:text-green-300">
              <span className="font-semibold">Votre profil est visible</span> par les recruteurs et les entreprises partenaires.
              Assurez-vous que votre CV est à jour pour maximiser vos chances.
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

// Ajouter un displayName pour faciliter le débogage
JobSeekingSettings.displayName = 'JobSeekingSettings';

export default JobSeekingSettings; 