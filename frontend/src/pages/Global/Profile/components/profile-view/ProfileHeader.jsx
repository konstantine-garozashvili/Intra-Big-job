import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, ChevronRightIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getProfilePictureUrl, getUserInitials } from "@/lib/utils/profileUtils";
import apiService from "@/lib/services/apiService";

const ProfileHeader = ({ userData, isPublicProfile = false, profilePictureData }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [domainData, setDomainData] = useState(null);
  const [hoveredBadge, setHoveredBadge] = useState(null);
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  useEffect(() => {
    const fetchDomainData = async () => {
      if (userData?.user?.specialization && !userData.user.specialization.domain && userData.user.specialization.id) {
        try {
          const specializationId = userData.user.specialization.id;
          const response = await apiService.get(`/api/specialization/${specializationId}`);
          if (response.data && response.data.success && response.data.data) {
            setDomainData(response.data.data.domain);
          }
        } catch (error) {
          console.error('Error fetching domain data:', error);
        }
      }
    };

    fetchDomainData();
  }, [userData]);

  const getRoleBadgeColor = (roleName) => {
    switch(roleName) {
      case "STUDENT": return "from-blue-500/90 to-blue-700/90";
      case "TEACHER": return "from-emerald-500/90 to-emerald-700/90";
      case "HR": return "from-purple-500/90 to-purple-700/90";
      case "ADMIN": return "from-amber-500/90 to-amber-700/90";
      case "SUPER_ADMIN": return "from-red-500/90 to-red-700/90";
      case "RECRUITER": return "from-pink-500/90 to-pink-700/90";
      case "GUEST": return "from-teal-500/90 to-teal-700/90";
      case "USER": return "from-gray-500/90 to-gray-700/90";
      default: return "from-gray-500/90 to-gray-700/90";
    }
  };

  const translateRoleName = (roleName) => {
    switch(roleName) {
      case "STUDENT": return "Étudiant";
      case "TEACHER": return "Professeur";
      case "HR": return "Ressources Humaines";
      case "ADMIN": return "Administrateur";
      case "SUPER_ADMIN": return "Super Administrateur";
      case "RECRUITER": return "Recruteur";
      case "GUEST": return "Invité";
      case "USER": return "Utilisateur";
      default: return roleName;
    }
  };

  const getMainRole = () => {
    if (userData.user && userData.user.roles && userData.user.roles.length > 0) {
      return userData.user.roles[0].name;
    }
    return "USER";
  };

  const mainRole = getMainRole();
  
  const profilePictureUrl = userData.user?.profilePictureUrl || 
                           (profilePictureData?.data?.profile_picture_url) || 
                           getProfilePictureUrl(userData.user?.profilePicturePath);
  
  const userInitials = getUserInitials(userData.user);
  
  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
  }, [profilePictureUrl]);
  
  const handleImageError = () => {
    setImageError(true);
  };
  
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const hasLinkedIn = userData?.user?.linkedinUrl;
  const hasCv = userData?.documents?.some(doc => doc?.documentType?.code === 'CV' || doc?.type === 'CV');
  const hasDiploma = userData?.diplomas?.length > 0;

  const completedItems = [hasLinkedIn, hasCv, hasDiploma].filter(Boolean).length;
  const totalItems = 3;

  const completionItems = [
    { name: 'LinkedIn', completed: hasLinkedIn },
    { name: 'CV', completed: hasCv },
    { name: 'Diplôme', completed: hasDiploma }
  ];

  return (
    <motion.div 
      className="w-full bg-background/50 backdrop-blur-sm rounded-xl shadow-md overflow-hidden border border-border/5"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
        <div className="p-6 sm:p-8 relative">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <motion.div 
              variants={itemVariants}
              className="relative group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/80 to-indigo-600/80 rounded-full opacity-75 group-hover:opacity-100 blur transition duration-300" />
              <Avatar className="relative h-24 w-24 sm:h-32 sm:w-32 ring-2 ring-background">
                {!imageError && profilePictureUrl && (
                  <AvatarImage 
                    src={profilePictureUrl} 
                    alt={`${userData.user.firstName} ${userData.user.lastName}`}
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                    className={`transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  />
                )}
                <AvatarFallback className="text-3xl bg-gradient-to-br from-primary/90 to-indigo-600/90 text-white font-medium">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </motion.div>
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-col gap-4">
                <motion.div variants={itemVariants} className="w-full space-y-4">
                  <div className="flex flex-col gap-4">
                    <div className="space-y-1.5">
                      <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-600">
                        {userData.user.firstName} {userData.user.lastName}
                      </h1>
                      {userData.user.specialization && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">
                            {userData.user.specialization.domain?.name || domainData?.name}
                            {userData.user.specialization.name && (
                              <span className="mx-1.5 opacity-40">•</span>
                            )}
                            {userData.user.specialization.name}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <AnimatePresence>
                        {userData.user?.roles?.map((role, index) => (
                          <motion.div
                            key={role.name}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2, delay: index * 0.1 }}
                            onHoverStart={() => setHoveredBadge(role.name)}
                            onHoverEnd={() => setHoveredBadge(null)}
                          >
                            <Badge 
                              className={`bg-gradient-to-r ${getRoleBadgeColor(role.name)} text-white px-3 py-1 rounded-full transition-all duration-300 ${
                                hoveredBadge === role.name ? 'shadow-lg scale-105' : ''
                              }`}
                            >
                              {translateRoleName(role.name)}
                            </Badge>
                          </motion.div>
                        )) || (
                          <Badge className={`bg-gradient-to-r ${getRoleBadgeColor("USER")} text-white px-3 py-1 rounded-full`}>
                            {translateRoleName("USER")}
                          </Badge>
                        )}

                        {userData.studentProfile?.isSeekingInternship && (
                          <Badge className="bg-gradient-to-r from-amber-500/90 to-amber-700/90 text-white px-3 py-1 rounded-full">
                            Recherche Stage
                          </Badge>
                        )}
                        
                        {userData.studentProfile?.isSeekingApprenticeship && (
                          <Badge className="bg-gradient-to-r from-green-500/90 to-green-700/90 text-white px-3 py-1 rounded-full">
                            Recherche Alternance
                          </Badge>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="flex items-center gap-2">
                      {userData.studentProfile?.portfolioUrl && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 20 }}
                          transition={{ duration: 0.3, delay: 0.2 }}
                        >
                          <div
                            onClick={() => window.open(userData.studentProfile.portfolioUrl, '_blank')}
                            className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500/90 via-violet-500/90 to-purple-500/90 hover:from-indigo-600/90 hover:via-violet-600/90 hover:to-purple-600/90 text-white cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/20"
                          >
                            <span className="text-sm font-medium">Voir mon portfolio</span>
                            <ChevronRightIcon className="h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-1" />
                          </div>
                        </motion.div>
                      )}
                      
                      {!isPublicProfile && (
                        <motion.div variants={itemVariants}>
                          <Button 
                            asChild 
                            variant="outline" 
                            className="border-primary/20 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
                          >
                            <Link to="/settings/profile" className="flex items-center gap-2">
                              Modifier
                              <ChevronRightIcon className="h-4 w-4" />
                            </Link>
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileHeader; 