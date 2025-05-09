import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRightIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getProfilePictureUrl, getUserInitials } from "@/lib/utils/profileUtils";
import apiService from "@/lib/services/apiService";
import RoleBadge from "@/components/ui/RoleBadge";
import { User } from "lucide-react";

const ProfileHeader = ({ userData, isPublicProfile = false, profilePictureUrl }) => {
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
  
  // Récupération sécurisée des propriétés utilisateur
  const getUserProperty = (propName, defaultValue = '') => {
    // Si la propriété existe directement dans userData
    if (userData && userData[propName] !== undefined) {
      return userData[propName];
    }
    // Si la propriété existe dans userData.user
    if (userData && userData.user && userData.user[propName] !== undefined) {
      return userData.user[propName];
    }
    // Valeur par défaut
    return defaultValue;
  };
  
  const getUserFullName = () => {
    const firstName = getUserProperty('firstName');
    const lastName = getUserProperty('lastName');
    return `${firstName} ${lastName}`.trim() || 'Utilisateur';
  };

  const getMainRole = () => {
    const roles = getUserProperty('roles');
    
    if (roles) {
      if (Array.isArray(roles) && roles.length > 0) {
        const firstRole = roles[0];
        // Si c'est déjà un objet complet avec name, displayName et color
        if (typeof firstRole === 'object' && firstRole !== null && 
            firstRole.name && firstRole.displayName && firstRole.color) {
          return firstRole;
        }
        // Si c'est un objet avec juste name
        if (typeof firstRole === 'object' && firstRole !== null && firstRole.name) {
          return firstRole;
        }
        // Si c'est une chaîne
        if (typeof firstRole === 'string') {
          return { name: firstRole };
        }
      }
    }
    
    // Fallback à userData.user.roles si disponible
    if (userData?.user?.roles) {
      const userRoles = userData.user.roles;
      if (Array.isArray(userRoles) && userRoles.length > 0) {
        const firstRole = userRoles[0];
        // Si c'est déjà un objet complet
        if (typeof firstRole === 'object' && firstRole !== null && 
            firstRole.name && firstRole.displayName && firstRole.color) {
          return firstRole;
        }
        // Si c'est un objet avec juste name
        if (typeof firstRole === 'object' && firstRole !== null && firstRole.name) {
          return firstRole;
        }
        // Si c'est une chaîne
        if (typeof firstRole === 'string') {
          return { name: firstRole };
        }
      }
    }
    
    return { name: "USER" };
  };

  const mainRole = getMainRole();
  
  const displayProfilePictureUrl = profilePictureUrl || 
                           userData.user?.profilePictureUrl || 
                           getProfilePictureUrl(userData.user?.profilePicturePath);
  
  const userInitials = getUserInitials(userData.user);
  
  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
  }, [displayProfilePictureUrl]);
  
  const handleImageError = () => {
    setImageError(true);
  };
  
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Vérifications sécurisées pour les propriétés possiblement manquantes
  const hasLinkedIn = userData?.user?.linkedinUrl ? true : false;
  const hasCv = userData?.documents && Array.isArray(userData.documents) && 
                userData.documents.some(doc => 
                  doc?.documentType?.code === 'CV' || 
                  doc?.type === 'CV'
                );
  const hasDiploma = userData?.diplomas && Array.isArray(userData.diplomas) && userData.diplomas.length > 0;

  const completedItems = [hasLinkedIn, hasCv, hasDiploma].filter(Boolean).length;
  const totalItems = 3;

  const completionItems = [
    { name: 'LinkedIn', completed: hasLinkedIn },
    { name: 'CV', completed: hasCv },
    { name: 'Diplôme', completed: hasDiploma }
  ];

  return (
    <motion.div 
      className="w-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="relative p-4 sm:p-6">
        {/* Effet de halo bleu subtil */}
        <div className="absolute left-0 top-0 w-1/3 h-full bg-blue-500/10 blur-[40px] pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start relative">
          {/* Avatar */}
          <motion.div variants={itemVariants} className="relative z-10">
            <div className="rounded-full p-0.5 bg-gradient-to-br from-blue-400/30 to-indigo-600/30">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24 ring-2 ring-white/10">
                {!imageError && displayProfilePictureUrl && (
                  <AvatarImage 
                    src={displayProfilePictureUrl} 
                    alt={getUserFullName()}
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                    className={`transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  />
                )}
                <AvatarFallback className="bg-gradient-to-r from-[#02284f] to-[#03386b] text-white">
                  <User className="w-10 h-10 sm:w-12 sm:h-12" />
                </AvatarFallback>
              </Avatar>
            </div>
          </motion.div>
          
          {/* Informations principales */}
          <div className="flex-1 min-w-0 text-center sm:text-left">
            <motion.div variants={itemVariants}>
              <h1 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-600">
                {getUserFullName()}
              </h1>
              
              {/* Affichage de la spécialisation avec vérification sécurisée */}
              {(getUserProperty('specialization') || 
                (userData && userData.user && userData.user.specialization)) && (
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                  <span className="text-sm text-muted-foreground">
                    {(() => {
                      const specialization = getUserProperty('specialization') || 
                        (userData && userData.user && userData.user.specialization) || {};
                      
                      const domainName = specialization.domain?.name || 
                        domainData?.name || '';
                      
                      const specializationName = specialization.name || '';
                      
                      return (
                        <>
                          {domainName}
                          {domainName && specializationName && (
                            <span className="mx-1.5 opacity-40">•</span>
                          )}
                          {specializationName}
                        </>
                      );
                    })()}
                  </span>
                </div>
              )}
            </motion.div>
            
            {/* Badges de rôle avec le nouveau composant RoleBadge */}
            <motion.div 
              variants={itemVariants} 
              className="flex flex-wrap justify-center sm:justify-start gap-1.5 mt-2"
            >
              <AnimatePresence>
                {(() => {
                  // Get roles securely, prioritizing the structure passed by ProfileView
                  let roles = [];
                  if (userData?.roles && Array.isArray(userData.roles)) {
                    roles = userData.roles;
                  } else if (userData?.user?.roles && Array.isArray(userData.user.roles)) {
                    roles = userData.user.roles;
                  } else if (userData?.data?.roles && Array.isArray(userData.data.roles)) {
                    roles = userData.data.roles;
                  } else if (Array.isArray(userData)) {
                    roles = userData;
                  }

                  // Si aucun rôle n'est trouvé mais que nous avons un rôle dans user
                  if (roles.length === 0 && userData?.user?.role) {
                    roles = [userData.user.role];
                  }

                  // Ensure roles is always an array
                  if (!Array.isArray(roles)) {
                    roles = [];
                  }
                  
                  if (roles.length > 0) {
                    return roles.map((role, index) => {
                      // S'assurer que le nom du rôle est une chaîne de caractères
                      const roleName = typeof role === 'object' && role !== null 
                        ? (role.name || role || "USER")
                        : String(role);
                      
                      return (
                        <RoleBadge
                          key={`${roleName}-${index}`}
                          role={roleName}
                          animated={true}
                          index={index}
                          hovered={hoveredBadge === roleName}
                          onHoverStart={() => setHoveredBadge(roleName)}
                          onHoverEnd={() => setHoveredBadge(null)}
                        />
                      );
                    });
                  }
                  
                  return (
                    <RoleBadge 
                      key="default-user" 
                      role="USER"
                      animated={true} 
                    />
                  );
                })()}

                {userData.studentProfile?.isSeekingInternship && (
                  <motion.div key="seeking-internship"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Badge className="bg-gradient-to-r from-amber-500/90 to-amber-700/90 text-white px-2.5 py-0.5 text-xs rounded-full">
                      Recherche Stage
                    </Badge>
                  </motion.div>
                )}
                
                {userData.studentProfile?.isSeekingApprenticeship && (
                  <motion.div key="seeking-apprenticeship"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Badge className="bg-gradient-to-r from-green-500/90 to-green-700/90 text-white px-2.5 py-0.5 text-xs rounded-full">
                      Recherche Alternance
                    </Badge>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
          
          {/* Boutons d'action */}
          <div className="flex gap-2 mt-2 sm:mt-0">
            {userData.studentProfile?.portfolioUrl && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <div
                  onClick={() => window.open(userData.studentProfile.portfolioUrl, '_blank')}
                  className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500/90 via-violet-500/90 to-purple-500/90 hover:from-indigo-600/90 hover:via-violet-600/90 hover:to-purple-600/90 text-white cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/20"
                >
                  <span className="text-xs font-medium">Voir mon portfolio</span>
                  <ChevronRightIcon className="h-3.5 w-3.5 transform transition-transform duration-300 group-hover:translate-x-0.5" />
                </div>
              </motion.div>
            )}
            
            {!isPublicProfile && (
              <motion.div variants={itemVariants}>
                <Button 
                  asChild 
                  variant="outline" 
                  size="sm"
                  className="border-primary/20 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 text-xs h-auto py-1.5"
                >
                  <Link to="/settings/profile" className="flex items-center gap-1.5">
                    Modifier
                    <ChevronRightIcon className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileHeader; 