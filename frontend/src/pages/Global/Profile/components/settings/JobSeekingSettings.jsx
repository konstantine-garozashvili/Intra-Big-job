import { useState, useEffect, useCallback, memo } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Briefcase, BookOpen, Calendar, Building, Pin } from 'lucide-react';
import { toast } from 'sonner';
import { studentProfileService } from '@/lib/services';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PropTypes from 'prop-types';

// Optimisation : mémoiser le composant pour éviter les re-rendus inutiles
const JobSeekingSettings = memo(({ profile, onProfileUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [isSeekingInternship, setIsSeekingInternship] = useState(false);
  const [isSeekingApprenticeship, setIsSeekingApprenticeship] = useState(false);
  const [localSettings, setLocalSettings] = useState(profile?.studentProfile || {
    isJobSeeking: false,
    jobType: 'INTERNSHIP',
    availabilityDate: '',
    remotePreference: 'HYBRID',
    locationPreference: '',
  });
  
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
    } catch {
      // Gestion silencieuse des erreurs
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
          toast.success('Recherche d&apos;emploi et d&apos;alternance activées');
        } else if (internship) {
          toast.success('Recherche d&apos;emploi ' + (internship ? 'activée' : 'désactivée'));
        } else if (apprenticeship) {
          toast.success('Recherche d&apos;alternance ' + (apprenticeship ? 'activée' : 'désactivée'));
        } else {
          toast.success('Recherche d&apos;emploi désactivée');
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch {
      toast.error('Une erreur est survenue lors de la mise à jour de votre statut de recherche');
    } finally {
      setLoading(false);
    }
  }, [loading, onProfileUpdate]);

  // Gérer le changement de statut de recherche d'emploi
  const handleToggleInternship = useCallback(async () => {
    // Inverser l'état actuel sans affecter l'autre option
    await updateBothStatuses(!isSeekingInternship, isSeekingApprenticeship);
  }, [isSeekingInternship, isSeekingApprenticeship, updateBothStatuses]);

  // Gérer le changement de statut de recherche d'alternance
  const handleToggleApprenticeship = useCallback(async () => {
    // Inverser l'état actuel sans affecter l'autre option
    await updateBothStatuses(isSeekingInternship, !isSeekingApprenticeship);
  }, [isSeekingInternship, isSeekingApprenticeship, updateBothStatuses]);

  const handleChange = (key, value) => {
    const updated = { ...localSettings, [key]: value };
    setLocalSettings(updated);
    onProfileUpdate(updated);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold">
          Recherche d&apos;emploi
        </CardTitle>
        <CardDescription>
          Paramétrez vos préférences de recherche d&apos;emploi pour améliorer la visibilité de votre profil auprès des recruteurs.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm sm:text-base text-gray-600">
          Activez ces options pour indiquer que vous êtes à la recherche d&apos;un emploi et/ou d&apos;une alternance.
          <strong className="block mt-2 sm:mt-3">Vous pouvez activer les deux options simultanément si vous êtes ouvert aux deux types d&apos;opportunités.</strong>
        </p>
        
        <div className="space-y-3 sm:space-y-4">
          {/* Option de recherche d'emploi */}
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg ${isSeekingInternship ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}>
            <div className="flex items-start sm:items-center space-x-3 mb-3 sm:mb-0">
              <div className={`p-2 rounded-full ${isSeekingInternship ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <BookOpen className={`h-4 w-4 sm:h-5 sm:w-5 ${isSeekingInternship ? 'text-blue-600' : 'text-gray-500'}`} />
              </div>
              <div>
                <Label htmlFor="seeking-internship" className="text-sm sm:text-base font-medium">
                  Recherche d&apos;emploi
                </Label>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
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
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg ${isSeekingApprenticeship ? 'bg-purple-50 border border-purple-200' : 'bg-gray-50'}`}>
            <div className="flex items-start sm:items-center space-x-3 mb-3 sm:mb-0">
              <div className={`p-2 rounded-full ${isSeekingApprenticeship ? 'bg-purple-100' : 'bg-gray-100'}`}>
                <Briefcase className={`h-4 w-4 sm:h-5 sm:w-5 ${isSeekingApprenticeship ? 'text-purple-600' : 'text-gray-500'}`} />
              </div>
              <div>
                <Label htmlFor="seeking-apprenticeship" className="text-sm sm:text-base font-medium">
                  Recherche d&apos;alternance
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

        <div className="grid gap-6 md:grid-cols-2">
          {/* Type d'emploi */}
          <div className="space-y-2">
            <Label htmlFor="jobType" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              Type d&apos;emploi
            </Label>
            <Select
              value={localSettings.jobType}
              onValueChange={(value) => handleChange('jobType', value)}
              disabled={!localSettings.isJobSeeking}
            >
              <SelectTrigger id="jobType">
                <SelectValue placeholder="Sélectionnez un type d&apos;emploi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INTERNSHIP">Stage</SelectItem>
                <SelectItem value="APPRENTICESHIP">Alternance</SelectItem>
                <SelectItem value="FULLTIME">CDI</SelectItem>
                <SelectItem value="PARTTIME">CDD</SelectItem>
                <SelectItem value="FREELANCE">Freelance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date de disponibilité */}
          <div className="space-y-2">
            <Label htmlFor="availabilityDate" className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Disponible à partir de
            </Label>
            <input
              type="date"
              id="availabilityDate"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
              value={localSettings.availabilityDate}
              onChange={(e) => handleChange('availabilityDate', e.target.value)}
              disabled={!localSettings.isJobSeeking}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Préférence de travail à distance */}
          <div className="space-y-2">
            <Label htmlFor="remotePreference" className="flex items-center gap-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              Préférence de travail
            </Label>
            <Select
              value={localSettings.remotePreference}
              onValueChange={(value) => handleChange('remotePreference', value)}
              disabled={!localSettings.isJobSeeking}
            >
              <SelectTrigger id="remotePreference">
                <SelectValue placeholder="Sélectionnez une préférence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ONSITE">Sur site</SelectItem>
                <SelectItem value="HYBRID">Hybride</SelectItem>
                <SelectItem value="REMOTE">À distance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Préférence de localisation */}
          <div className="space-y-2">
            <Label htmlFor="locationPreference" className="flex items-center gap-2">
              <Pin className="h-4 w-4 text-muted-foreground" />
              Localisation souhaitée
            </Label>
            <input
              type="text"
              id="locationPreference"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
              value={localSettings.locationPreference}
              onChange={(e) => handleChange('locationPreference', e.target.value)}
              placeholder="Paris, Lyon, Bordeaux..."
              disabled={!localSettings.isJobSeeking}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

// Définition des PropTypes
JobSeekingSettings.propTypes = {
  profile: PropTypes.shape({
    studentProfile: PropTypes.shape({
      isSeekingInternship: PropTypes.bool,
      isSeekingApprenticeship: PropTypes.bool
    }),
    isSeekingInternship: PropTypes.bool,
    isSeekingApprenticeship: PropTypes.bool
  }),
  onProfileUpdate: PropTypes.func.isRequired
};

// Ajouter un displayName pour faciliter le débogage
JobSeekingSettings.displayName = 'JobSeekingSettings';

export default JobSeekingSettings; 