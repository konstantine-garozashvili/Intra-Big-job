import React, { useState } from 'react';
import { authService } from "@/lib/services/authService";
import { toast } from 'sonner';
import ProfileSettingsSkeleton from '../components/ProfileSettingsSkeleton';
import documentService from '../services/documentService';
import { studentProfileService } from '@/lib/services';
import { diplomaService } from '../services/diplomaService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Import des composants liés à la carrière
import { CVUpload, JobSeekingSettings, DiplomaManager } from '../components/settings';

const CareerSettings = () => {
  const queryClient = useQueryClient();
  const [error, setError] = useState(null);

  // 1. REQUÊTE UTILISATEUR - Plus robuste avec gestion d'erreur améliorée
  const {
    data: currentUser,
    isLoading: isLoadingUser,
    isFetching: isFetchingUser,
    status: userStatus
  } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        const user = await authService.getCurrentUser();
        if (!user || !user.roles || !Array.isArray(user.roles) || user.roles.length === 0) {
          throw new Error("Données utilisateur invalides");
        }
        return user;
    } catch (error) {
        console.error("Erreur de chargement utilisateur:", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    onError: (error) => {
      console.error("Erreur dans la requête utilisateur:", error);
      setError('Impossible de charger vos informations. Veuillez rafraîchir la page.');
    }
  });

  // Extraire et valider le rôle de l'utilisateur avec protection supplémentaire
  const userRole = currentUser?.roles?.[0] || null;
  
  // Déterminer les rôles de façon sécurisée
  const isStudent = userRole === 'ROLE_STUDENT';
  const isGuest = userRole === 'ROLE_GUEST';
  const hasValidRole = userStatus === 'success' && (isStudent || isGuest);

  // 2. REQUÊTE PROFIL ÉTUDIANT - Uniquement si l'utilisateur est un étudiant confirmé
  const {
    data: studentProfile,
    isLoading: isLoadingProfile,
    isFetching: isFetchingProfile
  } = useQuery({
    queryKey: ['studentProfile'],
    queryFn: studentProfileService.getMyProfile,
    enabled: isStudent && userStatus === 'success',
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: () => {
      console.error("Erreur de chargement du profil étudiant");
      // Ne pas définir d'erreur fatale ici pour permettre l'affichage de la page
    }
  });

  // 3. REQUÊTE CV - Seulement si l'utilisateur a un rôle valide
  const {
    data: cvDocuments,
    isLoading: isLoadingCv,
    isFetching: isFetchingCv
  } = useQuery({
    queryKey: ['documents', 'CV'],
    queryFn: () => documentService.getDocumentByType('CV', false),
    enabled: hasValidRole,
    staleTime: 2 * 60 * 1000,
    retry: 1,
    onError: () => {
      console.error("Erreur de chargement du CV");
      // Ne pas définir d'erreur fatale ici
    }
  });

  // Extraire le CV avec validation
  const cvDocument = cvDocuments && Array.isArray(cvDocuments) && cvDocuments.length > 0 
    ? cvDocuments[0] 
    : null;

  // 4. REQUÊTE DIPLÔMES - Seulement si l'utilisateur a un rôle valide
  const {
    data: diplomas,
    isLoading: isLoadingDiplomas,
    isFetching: isFetchingDiplomas
  } = useQuery({
    queryKey: ['userDiplomas'],
    queryFn: diplomaService.getUserDiplomas,
    enabled: hasValidRole,
    staleTime: 2 * 60 * 1000,
    retry: 1,
    select: (data) => {
      if (data && Array.isArray(data)) {
        return [...data].sort((a, b) => {
          const dateA = new Date(a.obtainedDate || '1900-01-01');
          const dateB = new Date(b.obtainedDate || '1900-01-01');
          return dateB - dateA;
        });
      }
      return [];
    },
    onError: () => {
      console.error("Erreur de chargement des diplômes");
      // Ne pas définir d'erreur fatale ici
    }
  });

  // 5. MUTATIONS pour les actions utilisateur
  // Upload CV
  const uploadCvMutation = useMutation({
    mutationFn: (file) => {
      const formData = new FormData();
      formData.append('file', file);
      return documentService.uploadCV(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', 'CV'] });
      toast.success('CV téléversé avec succès');
    },
    onError: (error) => {
      console.error("Erreur d'upload:", error);
      toast.error('Erreur lors du téléversement du CV');
    }
  });

  // Suppression CV
  const deleteCvMutation = useMutation({
    mutationFn: (documentId) => documentService.deleteDocument(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', 'CV'] });
      documentService.clearCache();
      toast.success('CV supprimé avec succès');
    },
    onError: (error) => {
      console.error("Erreur de suppression:", error);
      toast.error('Erreur lors de la suppression du CV');
    }
  });

  // Mise à jour profil
  const updateProfileMutation = useMutation({
    mutationFn: (profileData) => studentProfileService.updateProfile(profileData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['studentProfile'] });
      // Mettre également à jour le cache directement
      queryClient.setQueryData(['studentProfile'], (oldData) => {
        return { ...oldData, ...data };
      });
      toast.success('Profil mis à jour avec succès');
    },
    onError: (error) => {
      console.error("Erreur de mise à jour:", error);
      toast.error('Erreur lors de la mise à jour du profil');
    }
  });

  // Téléchargement CV
  const handleDownloadCV = async (documentId) => {
    if (!documentId) {
      toast.error('Impossible de télécharger le document: ID manquant');
      return;
    }
    
    try {
      const blob = await documentService.downloadDocument(documentId);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = cvDocument?.name || 'cv.pdf';
      
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Document téléchargé avec succès');
    } catch (error) {
      console.error("Erreur de téléchargement:", error);
      toast.error('Erreur lors du téléchargement du document');
    }
  };

  // GESTION DISTINCTE pour CHARGEMENT INITIAL vs. ACTUALISATION
  // Chargement initial = aucune donnée disponible
  const isInitialLoading = 
    (isLoadingUser && !currentUser) ||
    (isStudent && isLoadingProfile && !studentProfile) ||
    (hasValidRole && isLoadingCv && !cvDocuments) ||
    (hasValidRole && isLoadingDiplomas && !diplomas);

  // Actualisation = les données existent mais sont rafraîchies
  const isRefreshing = 
    isFetchingUser || 
    (isStudent && isFetchingProfile) ||
    (hasValidRole && (isFetchingCv || isFetchingDiplomas));

  // LOGS pour le débogage
  console.log('CareerSettings - État:', {
    userRole,
    isStudent,
    isGuest,
    hasValidRole,
    userStatus,
    isInitialLoading,
    isRefreshing
  });

  // Chargement initial - Afficher un squelette
  if (isInitialLoading) {
    return (
      <div className="space-y-6 bg-white p-6 rounded-lg shadow">
        <ProfileSettingsSkeleton type="career" />
      </div>
    );
  }

  // Erreur fatale - Afficher un message d'erreur
  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Réessayer
        </button>
      </div>
    );
  }

  // Rôle non autorisé - Afficher un message informatif
  if (userStatus === 'success' && !isStudent && !isGuest) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Cette section est réservée aux étudiants et aux invités.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6">Gestion de carrière</h1>
      
      <div className="space-y-6 sm:space-y-8">
        {/* Section CV */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">Curriculum Vitae</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
            Votre CV est essentiel pour vos candidatures. Assurez-vous qu'il est à jour et reflète vos compétences actuelles.
          </p>
          
          <CVUpload 
            cvDocument={cvDocument}
            onUpload={(file) => uploadCvMutation.mutate(file)}
            onDelete={(documentId) => deleteCvMutation.mutate(documentId)}
            onDownload={handleDownloadCV}
          />
        </div>
        
        {/* Section Diplômes */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">Diplômes</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
            Ajoutez vos diplômes pour mettre en valeur votre parcours académique auprès des recruteurs.
          </p>
          
          <DiplomaManager 
            userData={{ role: userRole }}
            diplomas={diplomas || []}
            setDiplomas={(updatedDiplomas) => {
              // Conserver la compatibilité avec l'API existante
              queryClient.setQueryData(['userDiplomas'], updatedDiplomas);
            }}
          />
        </div>
        
        {/* Section Recherche d'emploi - Visible uniquement pour les étudiants */}
        {isStudent && (
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">Recherche d'emploi</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              Indiquez si vous êtes à la recherche d'un stage ou d'une alternance pour être visible auprès des recruteurs.
            </p>
            
            <JobSeekingSettings 
              profile={studentProfile}
              onProfileUpdate={(updatedProfileData) => {
                updateProfileMutation.mutate(updatedProfileData);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CareerSettings; 