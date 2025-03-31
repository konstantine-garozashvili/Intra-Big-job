import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  UserIcon, 
  MailIcon, 
  MapPinIcon,
  LinkedinIcon,
  FileText,
  Download,
  ChevronRightIcon
} from "lucide-react";
import { useUserCV } from "../../../hooks/useProfileQueries";
import documentService from "../../../services/documentService";
import { toast } from "sonner";

const AboutTab = ({ userData, isPublicProfile = false, documents = [] }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Vérifications sécurisées pour éviter les erreurs si les données ne sont pas structurées comme prévu
  const user = userData?.user || {};
  const isStudent = user?.roles?.some(role => 
    typeof role === 'object' ? role.name === "STUDENT" : role === "STUDENT"
  );
  
  const userId = isPublicProfile ? user?.id : null;
  const { data: cvData, isLoading: isLoadingCV } = useUserCV(userId);
  
  // Si nous avons des documents passés en props, on les utilise en priorité
  const cvDocument = documents?.find(doc => 
    doc?.documentType?.code === 'CV' || doc?.type === 'CV'
  );
  
  // Sinon on utilise les données du hook useUserCV
  const apiCvDocument = Array.isArray(cvData?.data) ? cvData?.data[0] : cvData?.data;
  
  // On utilise le CV disponible (prop ou API)
  const hasCV = cvDocument || (cvData?.success && cvData?.data && 
            (Array.isArray(cvData.data) ? cvData.data.length > 0 : !!cvData.data));
  
  // Document final à utiliser
  const finalCvDocument = cvDocument || apiCvDocument;

  const handleDownloadCV = async () => {
    if (!finalCvDocument || !finalCvDocument.id) {
      toast.error('CV non disponible');
      return;
    }
    
    setIsDownloading(true);
    try {
      const blob = await documentService.downloadDocument(finalCvDocument.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = finalCvDocument.name || 'cv.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('CV téléchargé avec succès');
    } catch (error) {
      console.error('Erreur lors du téléchargement du CV:', error);
      toast.error('Échec du téléchargement du CV');
    } finally {
      setIsDownloading(false);
    }
  };

  const InfoCard = ({ icon: Icon, title, value, link }) => (
    <div className={`group ${link ? 'cursor-pointer' : ''}`}>
      <div className={`relative flex items-center gap-4 p-4 rounded-xl bg-background/50 backdrop-blur-sm border border-border/5 shadow-sm overflow-hidden ${
        link ? 'hover:shadow-lg hover:border-primary transition-all duration-300 pr-12' : ''
      }`}>
        <div className="flex-shrink-0">
          <div className={`w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center ${
            link ? 'group-hover:bg-primary/20 transition-colors duration-300' : ''
          }`}>
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground">{title}</p>
          {link ? (
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
        {link && (
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

  // Récupérer l'adresse principale de manière sécurisée
  const mainAddress = userData?.addresses?.[0];
  
  // Récupérer la ville de manière sécurisée (plusieurs formats possibles)
  const cityName = 
    user.city || // Format direct dans user
    (mainAddress?.city?.name) || // Format objet imbriqué
    (mainAddress?.city) || // Format chaîne directe
    "Non renseignée";

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

            {user.linkedinUrl && (
              <InfoCard
              icon={LinkedinIcon}
              title="LinkedIn"
              value="Voir le profil LinkedIn"
              link={user.linkedinUrl}
              />
            )}

            {isStudent && hasCV && (
              <div 
                onClick={handleDownloadCV}
                className="group cursor-pointer"
              >
                <div className="relative flex items-center gap-4 p-4 rounded-xl bg-background/50 backdrop-blur-sm border border-border/5 shadow-sm overflow-hidden hover:shadow-lg hover:border-primary transition-all duration-300">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground">CV</p>
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-foreground group-hover:text-primary transition-colors duration-300">
                        Télécharger mon CV
                      </p>
                      <Download className="h-5 w-5 sm:h-6 sm:w-6 text-primary opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AboutTab; 