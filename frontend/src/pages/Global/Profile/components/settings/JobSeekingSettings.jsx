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
      console.error('Error parsing profile data:', error);
    }
  }, [profile]);

  // Fonction pour mettre à jour les deux statuts en même temps
  const updateBothStatuses = useCallback(async (internship, apprenticeship) => {
    if (loading) return;
    
    try {
      setLoading(true);
      const response = await studentProfileService.updateJobSeekingStatus({
        isSeekingInternship: internship,
        isSeekingApprenticeship: apprenticeship
      });
      
      // Vérifier que la réponse est valide
      if (response && typeof response === 'object') {
        // Mettre à jour l'état local
        setIsSeekingInternship(Boolean(internship));
        setIsSeekingApprenticeship(Boolean(apprenticeship));
        
        // Extraire les données à mettre à jour
        const profileData = response.profile || response;
        
        // Mettre à jour le profil parent si la fonction est fournie
        if (onProfileUpdate && typeof onProfileUpdate === 'function') {
          onProfileUpdate(profileData);
        }
        
        // Message de succès approprié
        if (internship && apprenticeship) {
          toast.success('Recherche de stage et d\'alternance activées');
        } else if (internship) {
          toast.success('Recherche de stage ' + (internship ? 'activée' : 'désactivée'));
        } else if (apprenticeship) {
          toast.success('Recherche d\'alternance ' + (apprenticeship ? 'activée' : 'désactivée'));
        } else {
          toast.success('Recherche d\'emploi désactivée');
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut de recherche:', error);
      toast.error('Une erreur est survenue lors de la mise à jour de votre statut de recherche');
    } finally {
      setLoading(false);
    }
  }, [loading, onProfileUpdate]);

  // Gérer le changement de statut de recherche de stage
  const handleToggleInternship = useCallback(async () => {
    // Inverser l'état actuel sans affecter l'autre option
    await updateBothStatuses(!isSeekingInternship, isSeekingApprenticeship);
  }, [isSeekingInternship, isSeekingApprenticeship, updateBothStatuses]);

  // Gérer le changement de statut de recherche d'alternance
  const handleToggleApprenticeship = useCallback(async () => {
    // Inverser l'état actuel sans affecter l'autre option
    await updateBothStatuses(isSeekingInternship, !isSeekingApprenticeship);
  }, [isSeekingInternship, isSeekingApprenticeship, updateBothStatuses]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <p className="text-sm sm:text-base text-gray-600">
        Activez ces options pour indiquer que vous êtes à la recherche d'un stage et/ou d'une alternance.
        <strong className="block mt-2 sm:mt-3">Vous pouvez activer les deux options simultanément si vous êtes ouvert aux deux types d'opportunités.</strong>
      </p>
      
      <div className="space-y-3 sm:space-y-4">
        {/* Option de recherche de stage */}
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg ${isSeekingInternship ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}>
          <div className="flex items-start sm:items-center space-x-3 mb-3 sm:mb-0">
            <div className={`p-2 rounded-full ${isSeekingInternship ? 'bg-blue-100' : 'bg-gray-100'}`}>
              <BookOpen className={`h-4 w-4 sm:h-5 sm:w-5 ${isSeekingInternship ? 'text-blue-600' : 'text-gray-500'}`} />
            </div>
            <div>
              <Label htmlFor="seeking-internship" className="text-sm sm:text-base font-medium">
                Recherche de stage
              </Label>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Activez cette option si vous recherchez un stage
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
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg ${isSeekingApprenticeship ? 'bg-purple-50 border border-purple-200' : 'bg-gray-50'}`}>
          <div className="flex items-start sm:items-center space-x-3 mb-3 sm:mb-0">
            <div className={`p-2 rounded-full ${isSeekingApprenticeship ? 'bg-purple-100' : 'bg-gray-100'}`}>
              <Briefcase className={`h-4 w-4 sm:h-5 sm:w-5 ${isSeekingApprenticeship ? 'text-purple-600' : 'text-gray-500'}`} />
            </div>
            <div>
              <Label htmlFor="seeking-apprenticeship" className="text-sm sm:text-base font-medium">
                Recherche d'alternance
              </Label>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
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
          <div className="mt-4 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-xs sm:text-sm text-green-800">
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