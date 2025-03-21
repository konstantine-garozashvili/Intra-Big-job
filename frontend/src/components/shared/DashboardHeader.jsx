import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, User, Sparkles } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const DashboardHeader = ({ user, icon: Icon, roleTitle }) => {
  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: -15 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
      }}
      initial="hidden"
      animate="visible"
      className="relative p-6 mb-8 overflow-hidden bg-white shadow-lg dark:bg-gray-800 rounded-xl"
    >
      <div className="flex flex-col items-start justify-between md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-16 w-16 border-4 border-white dark:border-gray-800 shadow-md">
              <AvatarImage src={user?.avatar} alt={`${user?.firstName} ${user?.lastName}`} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-white text-xl">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">
              Bienvenue{" "}
              <span className="relative inline-block px-3 py-1 text-white transition-all duration-300 transform rounded-lg shadow-md bg-gradient-to-r from-blue-500 to-indigo-600 hover:scale-105">
                <span className="relative inline-block">
                  {user?.firstName || 'Utilisateur'}
                </span>
                <motion.div
                  className="absolute inset-0 bg-white rounded-lg opacity-0"
                  animate={{
                    opacity: [0, 0.1, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1.5 mt-1">
              {Icon && <Icon className="h-3.5 w-3.5 text-primary" />}
              <span>{roleTitle}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center mt-4 md:mt-0 gap-3">
          <div className="flex items-center mr-4">
            <Clock className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400" />
            <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span>
          </div>
          <Link to="/profile">
            <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Mon profil</span>
            </Button>
          </Link>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
    </motion.div>
  );
};

export default DashboardHeader; 