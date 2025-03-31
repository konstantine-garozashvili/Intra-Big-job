import React, { useEffect, useMemo } from 'react';
import { Briefcase, GraduationCap, Linkedin, Link, Globe } from 'lucide-react';
import EditableField from './EditableField';
import { StaticField } from './StaticField';
import { studentProfileService } from '@/lib/services';
import { synchronizePortfolioUpdate } from '@/lib/utils/profileUtils';
import { toast } from 'sonner';

export const ProfessionalInfoSection = ({ 
  userData, 
  studentProfile,
  editedData, 
  editMode, 
  isStudent,
  isAdmin,
  toggleFieldEdit, 
  handleCancelField, 
  handleInputChange, 
  onSave 
}) => {
  const [loading, setLoading] = React.useState(false);
  const [localPortfolioUrl, setLocalPortfolioUrl] = React.useState('');

  // Utiliser useMemo pour calculer la valeur actuelle du portfolio
  const currentPortfolioUrl = useMemo(() => {
    return studentProfile?.portfolioUrl || '';
  }, [studentProfile?.portfolioUrl]);

  // Synchroniser l'état local avec la valeur la plus récente
  useEffect(() => {
    setLocalPortfolioUrl(currentPortfolioUrl);
  }, [currentPortfolioUrl]);

  // Écouter les événements de mise à jour du portfolio
  useEffect(() => {
    const handlePortfolioUpdate = (event) => {
      if (event.detail?.portfolioUrl !== undefined) {
        console.log('Mise à jour du portfolio détectée:', event.detail.portfolioUrl);
        setLocalPortfolioUrl(event.detail.portfolioUrl);
      }
    };
    
    window.addEventListener('portfolio-updated', handlePortfolioUpdate);
    
    return () => {
      window.removeEventListener('portfolio-updated', handlePortfolioUpdate);
    };
  }, []);

  const handleSavePortfolio = async (value) => {
    try {
      setLoading(true);
      
      // Valider l'URL
      if (value && !value.startsWith('https://')) {
        toast.error("L'URL du portfolio doit commencer par https://");
        setLoading(false);
        return;
      }
      
      // Mettre à jour l'état local immédiatement pour une UI réactive
      setLocalPortfolioUrl(value);
      
      // Mettre à jour la propriété dans editedData
      handleInputChange('portfolioUrl', value);
      
      const response = await studentProfileService.updatePortfolioUrl(value);
      
      if (response && response.success) {
        // Appeler onSave pour mettre à jour l'état parent
        onSave('portfolioUrl', value);
        
        // S'assurer que tous les composants sont notifiés
        synchronizePortfolioUpdate(value);
        
        toast.success('Portfolio mis à jour avec succès');
        
        // Forcer la mise à jour du studentProfile aussi
        if (studentProfile) {
          studentProfile.portfolioUrl = value;
        }
      } else {
        // Restaurer l'ancienne valeur en cas d'erreur
        setLocalPortfolioUrl(currentPortfolioUrl);
        toast.error("Une erreur est survenue lors de la mise à jour du portfolio");
      }
    } catch (error) {
      // Restaurer l'ancienne valeur en cas d'erreur
      setLocalPortfolioUrl(currentPortfolioUrl);
      console.error('Erreur lors de la mise à jour du portfolio:', error);
      toast.error(error.message || "Une erreur est survenue lors de la mise à jour du portfolio");
    } finally {
      setLoading(false);
    }
  };

  // Pour débogage - loguer les valeurs importantes
  useEffect(() => {
    console.log('ProfessionalInfoSection - studentProfile?.portfolioUrl:', studentProfile?.portfolioUrl);
    console.log('ProfessionalInfoSection - localPortfolioUrl:', localPortfolioUrl);
    console.log('ProfessionalInfoSection - editedData.personal.portfolioUrl:', editedData.personal.portfolioUrl);
  }, [studentProfile?.portfolioUrl, localPortfolioUrl, editedData.personal.portfolioUrl]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
      <StaticField 
        label="Domaine"
        icon={<Briefcase className="h-4 w-4 mr-2 text-blue-500" />}
        value={userData.specialization?.domain?.name || 'Non renseigné'}
      />

      <StaticField 
        label="Spécialisation"
        icon={<GraduationCap className="h-4 w-4 mr-2 text-blue-500" />}
        value={userData.specialization?.name || 'Non renseignée'}
      />

      <EditableField
        field="linkedinUrl"
        label="LinkedIn"
        icon={<Linkedin className="h-4 w-4" />}
        value={userData.linkedinUrl}
        editedValue={editedData.personal.linkedinUrl}
        type="url"
        isEditing={editMode.linkedinUrl}
        isEditable={true}
        onEdit={() => toggleFieldEdit('linkedinUrl')}
        onSave={() => onSave('linkedinUrl', editedData.personal.linkedinUrl)}
        onCancel={() => handleCancelField('linkedinUrl')}
        onChange={(value) => handleInputChange('linkedinUrl', value)}
      />

      {isStudent ? (
        <EditableField
          field="portfolioUrl"
          label="Portfolio"
          icon={<Globe className="h-4 w-4" />}
          value={localPortfolioUrl}
          editedValue={editedData.personal.portfolioUrl}
          type="url"
          isEditing={editMode.portfolioUrl}
          isEditable={true}
          onEdit={() => {
            // S'assurer que la valeur éditée est initialisée avec la valeur actuelle
            handleInputChange('portfolioUrl', localPortfolioUrl);
            toggleFieldEdit('portfolioUrl');
          }}
          onSave={() => handleSavePortfolio(editedData.personal.portfolioUrl)}
          onCancel={() => {
            handleCancelField('portfolioUrl');
            // Rétablir l'état local après annulation
            setLocalPortfolioUrl(currentPortfolioUrl);
          }}
          onChange={(value) => handleInputChange('portfolioUrl', value)}
          loading={loading}
        />
      ) : (
        <StaticField 
          label="Portfolio"
          icon={<Globe className="h-4 w-4 mr-2 text-blue-500" />}
          value={localPortfolioUrl || 'Non renseigné'}
        />
      )}

      {isStudent && (
        <StaticField 
          label="Situation actuelle"
          icon={<Briefcase className="h-4 w-4 mr-2 text-blue-500" />}
          value={studentProfile?.situationType?.name || 'Non renseignée'}
        />
      )}
    </div>
  );
}; 