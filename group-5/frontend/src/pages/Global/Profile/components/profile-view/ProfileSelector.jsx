import React from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { UserIcon, BookOpenIcon, BriefcaseIcon } from "lucide-react";

const ProfileSelector = ({ activeRole, onChangeRole }) => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 100,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { type: "spring", stiffness: 200 }
    }
  };

  return (
    <motion.div 
      className="flex justify-center gap-4 mb-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <Button 
          variant={activeRole === "STUDENT" ? "default" : "outline"} 
          onClick={() => onChangeRole("STUDENT")}
          className={`
            px-4 py-2 h-auto transition-all duration-300
            ${activeRole === "STUDENT" 
              ? "bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white shadow-md" 
              : "hover:border-blue-500/50 hover:text-blue-600"}
          `}
        >
          <UserIcon className="h-4 w-4 mr-2" />
          Profil Étudiant
        </Button>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Button 
          variant={activeRole === "TEACHER" ? "default" : "outline"} 
          onClick={() => onChangeRole("TEACHER")}
          className={`
            px-4 py-2 h-auto transition-all duration-300
            ${activeRole === "TEACHER" 
              ? "bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 text-white shadow-md" 
              : "hover:border-emerald-500/50 hover:text-emerald-600"}
          `}
        >
          <BookOpenIcon className="h-4 w-4 mr-2" />
          Profil Formateur
        </Button>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Button 
          variant={activeRole === "HR" ? "default" : "outline"} 
          onClick={() => onChangeRole("HR")}
          className={`
            px-4 py-2 h-auto transition-all duration-300
            ${activeRole === "HR" 
              ? "bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white shadow-md" 
              : "hover:border-purple-500/50 hover:text-purple-600"}
          `}
        >
          <BriefcaseIcon className="h-4 w-4 mr-2" />
          Profil RH
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default ProfileSelector; 