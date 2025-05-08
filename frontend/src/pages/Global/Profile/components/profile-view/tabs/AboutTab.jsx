import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  UserIcon, 
  MailIcon, 
  MapPinIcon,
  LinkedinIcon,
  FileText,
  ExternalLink as ExternalLinkIcon,
  Download,
  ChevronRightIcon,
  Briefcase
} from "lucide-react";
import { useUserCV } from "../../../hooks/useProfileQueries";
import documentService from "../../../services/documentService";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const AboutTab = ({ userData, isPublicProfile = false, documents = [] }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Normalisation des données utilisateur
  const user = userData?.user || userData || {};
  
  // Vérifier si l'utilisateur est un étudiant
  const isStudent = user?.roles?.some(role => 
    typeof role === 'object' ? role.name === "STUDENT" || role.name === "ROLE_STUDENT" : 
    role === "STUDENT" || role === "ROLE_STUDENT"
  );
  
  // Vérifier si l'utilisateur est un invité
  const isGuest = user?.roles?.some(role => 
    typeof role === 'object' ? role.name === "GUEST" || role.name === "ROLE_GUEST" : 
    role === "GUEST" || role === "ROLE_GUEST"
  );
  
  // Déterminer si l'utilisateur peut avoir un CV/portfolio (étudiant ou invité)
  const canHaveResume = isStudent || isGuest;
  
  const userId = isPublicProfile ? user?.id : null;
  const { data: cvData, isLoading: isLoadingCV } = useUserCV(userId);
  
  // Récupération du CV via différentes sources possibles
  // 1. Documents passés en props (prioritaire)
  const cvDocument = documents?.find(doc => 
    doc?.documentType?.code === 'CV' || doc?.type === 'CV'
  );
  
  // 2. Données du hook useUserCV
  const apiCvDocument = Array.isArray(cvData?.data) ? cvData?.data[0] : cvData?.data;
  
  // 3. Chemin du fichier CV dans les données utilisateur
  const cvFilePath = user?.cvFilePath;
  
  // Déterminer si l'utilisateur a un CV disponible
  const hasCV = cvDocument || 
                (cvData?.success && cvData?.data && (Array.isArray(cvData.data) ? cvData.data.length > 0 : !!cvData.data)) ||
                !!cvFilePath;
  
  // Document final à utiliser
  const finalCvDocument = cvDocument || apiCvDocument;

  // Récupérer l'adresse principale de manière sécurisée
  const mainAddress = user?.addresses && user.addresses.length > 0 ? user.addresses[0] : null;
  
  // Récupérer la ville de manière standardisée
  const cityName = mainAddress?.city?.name || 
                  (typeof mainAddress?.city === 'string' ? mainAddress.city : null) || 
                  user?.city?.name || 
                  (typeof user?.city === 'string' ? user.city : "Non renseignée");
  
  // Récupérer les URLs importantes
  const linkedinUrl = user?.linkedinUrl;
  const portfolioUrl = user?.studentProfile?.portfolioUrl;
  
  // Récupérer les statuts de recherche de stage/alternance
  const isSeekingInternship = user?.studentProfile?.isSeekingInternship || false;
  const isSeekingApprenticeship = user?.studentProfile?.isSeekingApprenticeship || false;
  const isActivelySearching = isSeekingInternship || isSeekingApprenticeship;

  // Si profil public, on utilise le champ cvDocument du backend
  const publicCvDocument = isPublicProfile ? user?.cvDocument : null;

  const handleDownloadCV = async () => {
    // Cas profil public : téléchargement direct via l'URL
    if (isPublicProfile && publicCvDocument && publicCvDocument.downloadUrl) {
      setIsDownloading(true);
      try {
        // Patch robuste : supporte VITE_API_URL avec ou sans /api à la fin
        let apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        // On retire tous les / finaux pour éviter les doublons
        apiBaseUrl = apiBaseUrl.replace(/\/+$/, '');
        let downloadUrl = publicCvDocument.downloadUrl;
        try {
          const urlObj = new URL(downloadUrl, apiBaseUrl);
          let path = urlObj.pathname;
          // Si la base API se termine par /api et le path commence par /api, on retire un /api
          if (apiBaseUrl.endsWith('/api') && path.startsWith('/api/')) {
            path = path.replace(/^\/api\//, '/');
          }
          downloadUrl = apiBaseUrl + path + urlObj.search;
        } catch (e) {
          // fallback: si ce n'est pas une URL valide, on garde la valeur d'origine
        }
        const response = await fetch(downloadUrl, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!response.ok) throw new Error('Erreur lors du téléchargement du CV');
        const blob = await response.blob();
        const fileName = publicCvDocument.name || 'cv.pdf';
        const safeFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = safeFileName;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          document.body.removeChild(link);
        }, 100);
        toast.success('CV téléchargé avec succès');
      } catch (error) {
        toast.error(error.message || 'Erreur lors du téléchargement du CV');
      } finally {
        setIsDownloading(false);
      }
      return;
    }
    // Si nous avons un finalCvDocument avec ID, utiliser le service de document
    if (finalCvDocument && finalCvDocument.id) {
      setIsDownloading(true);
      try {
        const blob = await documentService.downloadDocument(finalCvDocument.id);
        
        // Ensure we have a valid blob
        if (!(blob instanceof Blob)) {
          throw new Error('Invalid document format received');
        }

        // Create a safe filename
        const fileName = finalCvDocument.name || 'cv.pdf';
        const safeFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');

        // Create and click a download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = safeFileName;
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          document.body.removeChild(link);
        }, 100);

        toast.success('CV téléchargé avec succès');
      } catch (error) {
        console.error('Erreur lors du téléchargement du CV:', error);
        toast.error(error.message || 'Erreur lors du téléchargement du CV');
      } finally {
        setIsDownloading(false);
      }
    }
    // Si nous avons juste un lien direct vers le CV
    else if (cvFilePath) {
      window.open(cvFilePath, '_blank');
    } else {
      toast.error('CV non disponible');
    }
  };

  const InfoCard = ({ icon: Icon, title, value, link, isDownload = false }) => (
    <div className={`group ${(link || isDownload) ? 'cursor-pointer' : ''}`} onClick={isDownload ? handleDownloadCV : undefined}>
      <div className={`relative flex items-center gap-4 p-4 rounded-xl bg-background/50 backdrop-blur-sm border border-border/5 shadow-sm overflow-hidden ${
        (link || isDownload) ? 'hover:shadow-lg hover:border-primary transition-all duration-300 pr-12' : ''
      }`}>
        <div className="flex-shrink-0">
          <div className={`w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center ${
            (link || isDownload) ? 'group-hover:bg-primary/20 transition-colors duration-300' : ''
          }`}>
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground">{title}</p>
          {link && !isDownload ? (
            <a 
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground group-hover:text-primary flex items-center gap-1 transition-colors duration-300"
            >
              {value}
            </a>
          ) : (
            <p className="font-medium truncate">{value || "Non renseigné"}</p>
          )}
        </div>
        {(link || isDownload) && (
          <>
            <div className="absolute right-0 inset-y-0 w-12 bg-gradient-to-l from-primary/5 to-transparent group-hover:from-primary/10 transition-colors duration-300" />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 transform transition-transform duration-300 group-hover:translate-x-1">
              <ChevronRightIcon className="h-5 w-5 text-primary opacity-50 group-hover:opacity-100" />
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden border-none shadow-md bg-background/50 backdrop-blur-sm">
        <CardHeader className="border-b border-border/5 bg-background/50">
          <CardTitle className="text-xl font-semibold text-foreground/90 flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-primary" />
            Informations personnelles
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard
              icon={UserIcon}
              title="Nom complet"
              value={`${user.firstName || ''} ${user.lastName || ''}`}
            />
            
            <InfoCard
              icon={MailIcon}
              title="Email"
              value={user.email}
            />

            <InfoCard
              icon={MapPinIcon}
              title="Ville"
              value={cityName}
            />

            {linkedinUrl && (
              <InfoCard
                icon={LinkedinIcon}
                title="LinkedIn"
                value="Voir le profil LinkedIn"
                link={linkedinUrl}
              />
            )}

            {canHaveResume && portfolioUrl && (
              <InfoCard
                icon={ExternalLinkIcon}
                title="Portfolio"
                value="Voir le portfolio"
                link={portfolioUrl}
              />
            )}

            {/* Affichage du CV pour profil public */}
            {isPublicProfile && publicCvDocument && (
              <InfoCard
                icon={FileText}
                title="CV"
                value={publicCvDocument.name || 'Télécharger le CV'}
                isDownload={true}
              />
            )}
            {/* Ancien affichage pour profil privé */}
            {!isPublicProfile && canHaveResume && hasCV && (
              <InfoCard
                icon={FileText}
                title="CV"
                value="Télécharger mon CV"
                link={cvFilePath}
                isDownload={true}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AboutTab; 