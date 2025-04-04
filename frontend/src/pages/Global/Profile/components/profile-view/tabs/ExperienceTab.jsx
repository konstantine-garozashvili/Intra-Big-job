import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  BuildingIcon, 
  MapPinIcon, 
  ClockIcon, 
  GraduationCapIcon, 
  FileTextIcon,
  BriefcaseIcon
} from "lucide-react";

const ExperienceTab = ({ userData, isPublicProfile = false, documents = [] }) => {
  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 100,
        duration: 0.5
      }
    }
  };

  // Fonction pour formater les dates
  const formatDate = (dateString) => {
    if (!dateString) return "Aujourd'hui";
    return new Date(dateString).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
  };

  // Get the first role name in a safe way
  const getMainRole = () => {
    const user = userData?.user || userData || {};
    const roles = user?.roles || [];
    
    if (roles.length === 0) return "USER";
    
    const firstRole = roles[0];
    if (typeof firstRole === 'object' && firstRole !== null && firstRole.name) {
      return firstRole.name;
    }
    if (typeof firstRole === 'string') {
      return firstRole;
    }
    
    return "USER";
  };

  const mainRole = getMainRole();
  
  // Récupérer les diplômes de manière sécurisée depuis différentes sources possibles
  const getDiplomas = () => {
    // 1. Si les diplômes sont directement dans userData
    if (Array.isArray(userData?.diplomas) && userData.diplomas.length > 0) {
      return userData.diplomas;
    }
    
    // 2. Si les diplômes sont dans userData.user
    if (userData?.user?.diplomas && Array.isArray(userData.user.diplomas) && userData.user.diplomas.length > 0) {
      return userData.user.diplomas;
    }
    
    // 3. Si les diplômes sont dans un autre chemin
    if (userData?.data?.diplomas && Array.isArray(userData.data.diplomas) && userData.data.diplomas.length > 0) {
      return userData.data.diplomas;
    }
    
    return [];
  };

  // Formater les données de diplôme pour gérer à la fois l'ancien et le nouveau format
  const formatDiplomaData = (diploma) => {
    // Si le diplôme a une structure imbriquée (nouveau format)
    if (diploma.diploma && typeof diploma.diploma === 'object') {
      return {
        id: diploma.id,
        name: diploma.diploma.name,
        institution: diploma.diploma.institution,
        obtainedAt: diploma.obtainedDate, // Nouveau nom de la propriété
        // Autres propriétés à ajouter au besoin
      };
    }
    
    // Format existant (structure plate)
    return diploma;
  };
  
  const diplomas = getDiplomas().map(formatDiplomaData);
  const hasDiplomas = diplomas.length > 0;

  return (
    <>
      {/* Formation - Diplômes - Afficher seulement si l'utilisateur a des diplômes */}
      {hasDiplomas && (
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-slate-800">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 pb-4">
              <CardTitle className="text-xl flex items-center gap-2">
                <GraduationCapIcon className="h-5 w-5 text-primary" />
                Diplômes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-8">
                {diplomas.map((diploma, index) => (
                  <div 
                    key={index} 
                    className="relative pl-6 pb-8 border-l-2 border-primary/20 last:border-0 last:pb-0"
                  >
                    <div className="absolute left-[-8px] top-0 h-4 w-4 rounded-full bg-primary shadow-md"></div>
                    <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-lg transition-all duration-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:shadow-md">
                      <h3 className="font-bold text-primary">{diploma.name || diploma.title || "Diplôme"}</h3>
                      <div className="flex items-center text-sm text-muted-foreground mb-3 bg-primary/5 px-2 py-1 rounded-full w-fit mt-2">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        <span>
                          {(diploma.obtainedAt || diploma.obtainedDate || diploma.obtained_at) ? formatDate(diploma.obtainedAt || diploma.obtainedDate || diploma.obtained_at) : "En cours"}
                        </span>
                      </div>
                      
                      {/* Afficher l'institution si disponible */}
                      {(diploma.institution || diploma.school) && (
                        <div className="flex items-center text-sm text-muted-foreground mt-2">
                          <BuildingIcon className="h-4 w-4 mr-1 text-muted-foreground/70" />
                          <span>{diploma.institution || diploma.school}</span>
                        </div>
                      )}
                      
                      {/* Afficher la localisation si disponible */}
                      {(diploma.location || diploma.city) && (
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <MapPinIcon className="h-4 w-4 mr-1 text-muted-foreground/70" />
                          <span>{diploma.location || diploma.city}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
      
      {/* Section vide si aucun diplôme */}
      {!hasDiplomas && (
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-slate-800">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 pb-4">
              <CardTitle className="text-xl flex items-center gap-2">
                <GraduationCapIcon className="h-5 w-5 text-primary" />
                Diplômes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center p-6 text-muted-foreground">
                <p>Aucun diplôme n'a été ajouté pour le moment.</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
      
      {/* Cours - Pour les formateurs */}
      {mainRole === "TEACHER" && (
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="mt-8"
        >
          <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-slate-800">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 pb-4">
              <CardTitle className="text-xl flex items-center gap-2">
                <BriefcaseIcon className="h-5 w-5 text-primary" />
                Mes cours et ateliers
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-8">
                {/* Exemple de cours - Ceci pourrait être remplacé par des données réelles */}
                <div className="relative pl-6 pb-8 border-l-2 border-primary/20 last:border-0 last:pb-0">
                  <div className="absolute left-[-8px] top-0 h-4 w-4 rounded-full bg-primary shadow-md"></div>
                  <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-lg transition-all duration-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:shadow-md">
                    <h3 className="font-bold text-primary">Développement Web Full-Stack</h3>
                    <div className="flex items-center text-sm text-muted-foreground mb-3 bg-primary/5 px-2 py-1 rounded-full w-fit mt-2">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      <span>Sept. 2022 - Présent</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Formation complète aux technologies web modernes incluant HTML/CSS, JavaScript, React, Node.js et MongoDB.
                    </p>
                  </div>
                </div>
                
                <div className="relative pl-6 pb-8 border-l-2 border-primary/20 last:border-0 last:pb-0">
                  <div className="absolute left-[-8px] top-0 h-4 w-4 rounded-full bg-primary shadow-md"></div>
                  <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-lg transition-all duration-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:shadow-md">
                    <h3 className="font-bold text-primary">DevOps & CI/CD</h3>
                    <div className="flex items-center text-sm text-muted-foreground mb-3 bg-primary/5 px-2 py-1 rounded-full w-fit mt-2">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      <span>Jan. 2023 - Présent</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Atelier pratique sur l'intégration et le déploiement continus, avec Docker, Jenkins et GitHub Actions.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </>
  );
};

export default ExperienceTab;