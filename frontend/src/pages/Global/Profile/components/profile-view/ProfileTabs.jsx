import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import AboutTab from "./tabs/AboutTab";
import ExperienceTab from "./tabs/ExperienceTab";

const ProfileTabs = ({ userData, isPublicProfile = false, documents = [] }) => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 100, 
        delay: 0.3 
      }
    }
  };

  const tabVariants = {
    inactive: { 
      opacity: 0.7,
      scale: 0.95
    },
    active: { 
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  // Get the first role name
  const getMainRole = () => {
    if (userData?.user?.roles) {
      if (Array.isArray(userData.user.roles) && userData.user.roles.length > 0) {
        const firstRole = userData.user.roles[0];
        // Si c'est un objet avec une propriété name
        if (typeof firstRole === 'object' && firstRole !== null && firstRole.name) {
          return firstRole.name;
        }
        // Si c'est une chaîne
        if (typeof firstRole === 'string') {
          return firstRole;
        }
      }
      // Si roles est une chaîne
      if (typeof userData.user.roles === 'string') {
        return userData.user.roles;
      }
    }
    return "USER";
  };

  const mainRole = getMainRole();
  
  // Vérifier si l'utilisateur a des diplômes (avec vérification sécurisée)
  const hasDiplomas = userData?.user?.diplomas && Array.isArray(userData.user.diplomas) && userData.user.diplomas.length > 0;
  
  // Si l'utilisateur est un formateur, toujours afficher l'onglet "Expérience et Cours"
  const shouldShowExperienceTab = mainRole === "TEACHER" || hasDiplomas;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      <Tabs defaultValue="about" className="w-full">
        <div className="bg-white/5 backdrop-blur-sm border-b border-white/10 rounded-t-xl p-1.5 mb-0">
          <TabsList className={`grid w-full ${shouldShowExperienceTab ? 'grid-cols-2' : 'grid-cols-1'} bg-transparent h-auto p-1 gap-4`}>
            <TabsTrigger 
              value="about" 
              className="relative overflow-hidden 
                data-[state=active]:bg-transparent !bg-transparent
                data-[state=active]:text-primary
                py-2.5 transition-all duration-200 
                text-slate-400
                font-medium
                rounded-md
                before:absolute before:inset-x-0 before:h-[2px] before:bg-primary
                before:bottom-0 before:scale-x-0 hover:before:scale-x-100
                before:transition-transform before:duration-300
                before:origin-left"
            >
              <motion.div
                variants={tabVariants}
                initial="inactive"
                animate="active"
                className="flex items-center justify-center gap-2"
              >
                <span className="relative z-10 font-medium">À propos</span>
              </motion.div>
            </TabsTrigger>
            
            {shouldShowExperienceTab && (
              <TabsTrigger 
                value="experience" 
                className="relative overflow-hidden 
                  data-[state=active]:bg-transparent !bg-transparent
                  data-[state=active]:text-primary
                  py-2.5 transition-all duration-200 
                  text-slate-400
                  font-medium
                  rounded-md
                  before:absolute before:inset-x-0 before:h-[2px] before:bg-primary
                  before:bottom-0 before:scale-x-0 hover:before:scale-x-100
                  before:transition-transform before:duration-300
                  before:origin-left"
              >
                <motion.div
                  variants={tabVariants}
                  initial="inactive"
                  animate="active"
                  className="flex items-center justify-center gap-2"
                >
                  <span className="relative z-10 font-medium">
                    {mainRole === "TEACHER" ? "Expérience et Cours" : "Diplômes"}
                  </span>
                </motion.div>
              </TabsTrigger>
            )}
          </TabsList>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative bg-white/5 rounded-b-xl p-6"
        >
          <TabsContent 
            value="about" 
            className="mt-0 space-y-6 focus-visible:outline-none focus-visible:ring-0"
          >
            <AboutTab 
              userData={userData} 
              isPublicProfile={isPublicProfile} 
              documents={documents} 
            />
          </TabsContent>
          
          {shouldShowExperienceTab && (
            <TabsContent 
              value="experience" 
              className="mt-0 space-y-6 focus-visible:outline-none focus-visible:ring-0"
            >
              <ExperienceTab 
                userData={userData} 
                isPublicProfile={isPublicProfile} 
                documents={documents} 
              />
            </TabsContent>
          )}
        </motion.div>
      </Tabs>
    </motion.div>
  );
};

export default ProfileTabs;