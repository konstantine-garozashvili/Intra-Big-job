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

const ExperienceTab = ({ userData, isPublicProfile = false }) => {
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

  // Get the first role name
  const getMainRole = () => {
    if (userData.user && userData.user.roles && userData.user.roles.length > 0) {
      return userData.user.roles[0].name;
    }
    return "USER";
  };

  const mainRole = getMainRole();
  
  // Vérifier si l'utilisateur a des diplômes
  const hasDiplomas = userData.diplomas && userData.diplomas.length > 0;

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
                {userData.diplomas.map((diploma, index) => (
                  <div 
                    key={index} 
                    className="relative pl-6 pb-8 border-l-2 border-primary/20 last:border-0 last:pb-0"
                  >
                    <div className="absolute left-[-8px] top-0 h-4 w-4 rounded-full bg-primary shadow-md"></div>
                    <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-lg transition-all duration-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:shadow-md">
                      <h3 className="font-bold text-primary">{diploma.name}</h3>
                      <div className="flex items-center text-sm text-muted-foreground mb-3 bg-primary/5 px-2 py-1 rounded-full w-fit mt-2">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        <span>
                          {diploma.obtainedAt ? formatDate(diploma.obtainedAt) : "En cours"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
      
      {/* Cours - Pour les enseignants */}
      {mainRole === "TEACHER" && (
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
        >
          <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-slate-800">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 pb-4">
              <CardTitle className="text-xl flex items-center gap-2">
                <FileTextIcon className="h-5 w-5 text-primary" />
                Cours enseignés
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="text-center py-6 text-muted-foreground">
                Aucun cours renseigné
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </>
  );
};

export default ExperienceTab;