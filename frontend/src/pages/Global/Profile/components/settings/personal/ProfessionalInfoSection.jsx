import React, { useEffect, useMemo, useState } from 'react';
import { Briefcase, GraduationCap, Linkedin, Link, Globe } from 'lucide-react';
import EditableField from './EditableField';
import StaticField from './StaticField';
import { studentProfileService } from '@/lib/services';
import { synchronizePortfolioUpdate } from '@/lib/utils/profileUtils';
import { toast } from 'sonner';

// Helper function to format LinkedIn URL
const formatLinkedinUrl = (input) => {
  if (!input) return '';
  let trimmedInput = input.trim();

  // If user enters only the username (no slashes, no spaces, reasonable length)
  if (/^[a-zA-Z0-9._-]{3,100}$/.test(trimmedInput)) {
    return `https://www.linkedin.com/in/${trimmedInput}`;
  }

  // If user pastes a full LinkedIn URL, extract the username after /in/
  const match = trimmedInput.match(/linkedin\.com\/in\/([a-zA-Z0-9._-]{3,100})/);
  if (match && match[1]) {
    return `https://www.linkedin.com/in/${match[1]}`;
  }

  // If user pastes a partial URL (e.g., /in/username)
  const partialMatch = trimmedInput.match(/\/in\/([a-zA-Z0-9._-]{3,100})/);
  if (partialMatch && partialMatch[1]) {
    return `https://www.linkedin.com/in/${partialMatch[1]}`;
  }

  // If it already looks like a valid LinkedIn profile URL
  if (/^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9._-]{3,100}\/?$/.test(trimmedInput)) {
    // Remove trailing slash if present
    return trimmedInput.replace(/\/$/, '');
  }

  // If it doesn't match expected formats, show an error
  toast.error("Format LinkedIn invalide. Entrez uniquement l'identifiant ou le lien complet.");
  return null; // Indicate invalid format
};

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
  const [loading, setLoading] = useState(false);
  const [localPortfolioUrl, setLocalPortfolioUrl] = useState('');

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

  // Modified onEdit handler for LinkedIn
  const handleEditLinkedin = () => {
    const currentValue = userData.linkedinUrl || '';
    // Pre-fill with base URL only if the current value is empty
    const initialEditValue = currentValue ? currentValue : 'https://www.linkedin.com/in/';
    handleInputChange('linkedinUrl', initialEditValue);
    toggleFieldEdit('linkedinUrl');
  };

  // Modified onSave handler for LinkedIn
  const handleSaveLinkedin = () => {
    const rawValue = editedData.personal.linkedinUrl;
    const formattedValue = formatLinkedinUrl(rawValue);

    // If formatting returned null (invalid), don't save and keep editing
    if (formattedValue === null) {
      // Optionally keep the input field in edit mode or clear it
      // toast.error is already shown by formatLinkedinUrl
      return;
    }

    // Update the state with the formatted value before saving
    // This ensures the input field shows the final formatted URL after saving
    handleInputChange('linkedinUrl', formattedValue);

    // Call the parent save function ONLY if the value changed 
    if (formattedValue !== userData.linkedinUrl) {
        onSave('linkedinUrl', formattedValue);
    } else {
        // If value hasn't changed, just exit edit mode
        toggleFieldEdit('linkedinUrl'); // Ensure edit mode is toggled off
    }
  };

  // Handler for LinkedIn input changes to manage the placeholder
  const handleLinkedinInputChange = (value) => {
    // When editing an empty field, don't allow deleting the pre-filled base URL.
    if (editMode.linkedinUrl && !userData.linkedinUrl && value.length < 'https://www.linkedin.com/in/'.length) {
       // If trying to delete part of the placeholder, reset it.
       handleInputChange('linkedinUrl', 'https://www.linkedin.com/in/');
    } else {
       handleInputChange('linkedinUrl', value);
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
      <div className="address-edit-card w-full">
        <StaticField 
          label="Domaine"
          icon={<Briefcase className="h-4 w-4 mr-2 text-blue-500" />}
          value={userData.specialization?.domain?.name || 'Non renseigné'}
        />
      </div>
      <div className="address-edit-card w-full">
        <StaticField 
          label="Spécialisation"
          icon={<GraduationCap className="h-4 w-4 mr-2 text-blue-500" />}
          value={userData.specialization?.name || 'Non renseignée'}
        />
      </div>
      <div className="address-edit-card w-full">
        <EditableField
          field="linkedinUrl"
          label="LinkedIn"
          icon={<Linkedin className="h-4 w-4" />}
          value={editMode.linkedinUrl ? editedData.personal.linkedinUrl : (userData.linkedinUrl || '')}
          editedValue={editedData.personal.linkedinUrl}
          type="text"
          placeholder="Lien complet ou identifiant"
          isEditing={editMode.linkedinUrl}
          isEditable={true}
          displayAsLink={true}
          onEdit={handleEditLinkedin}
          onSave={handleSaveLinkedin}
          onCancel={() => handleCancelField('linkedinUrl')}
          onChange={handleLinkedinInputChange}
        />
      </div>
      {isStudent && (
        <div className="address-edit-card w-full">
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
              handleInputChange('portfolioUrl', localPortfolioUrl);
              toggleFieldEdit('portfolioUrl');
            }}
            onSave={() => handleSavePortfolio(editedData.personal.portfolioUrl)}
            onCancel={() => {
              handleCancelField('portfolioUrl');
              setLocalPortfolioUrl(currentPortfolioUrl);
            }}
            onChange={(value) => handleInputChange('portfolioUrl', value)}
            loading={loading}
          />
        </div>
      )}
      {isStudent && (
        <div className="address-edit-card w-full">
          <StaticField 
            label="Situation actuelle"
            icon={<Briefcase className="h-4 w-4 mr-2 text-blue-500" />}
            value={studentProfile?.situationType?.name || 'Non renseignée'}
          />
        </div>
      )}
    </div>
  );
}; 