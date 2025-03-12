import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Mail,
  Calendar,
  Circle as CircleIcon,
} from 'lucide-react';

const ProfileHeader = ({ userData = {} }) => {
  // Si aucune donnée utilisateur n'est disponible
  if (!userData || Object.keys(userData).length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center">
          <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <span className="text-gray-400 text-2xl">?</span>
          </div>
          <div className="mt-4 md:mt-0 md:ml-4">
            <h1 className="text-xl font-bold">Chargement...</h1>
            <p className="text-gray-500 dark:text-gray-400">Informations non disponibles</p>
          </div>
        </div>
      </div>
    );
  }

  // Valeurs par défaut pour éviter les erreurs
  const {
    firstName = "Prénom",
    lastName = "Nom",
    profileImage,
    roles = [],
    status = "Actif"
  } = userData;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Photo de profil */}
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-white border-4 border-gray-100 dark:border-gray-700">
          {profileImage ? (
            <img 
              src={profileImage} 
              alt={`${firstName} ${lastName}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-2xl font-bold">
              {firstName.charAt(0)}{lastName.charAt(0)}
            </div>
          )}
        </div>
        
        {/* Informations principales */}
        <div className="flex-1 text-center md:text-left space-y-3">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold">
              {firstName} {lastName}
            </h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              {roles && roles.map((role, index) => (
                <Badge 
                  key={index}
                  variant="outline" 
                  className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                >
                  {role.name || role}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center justify-center md:justify-start">
              <Mail className="h-4 w-4 mr-2" />
              {userData.email}
            </div>
            <div className="flex items-center justify-center md:justify-start">
              <Calendar className="h-4 w-4 mr-2" />
              Membre depuis {new Date(userData.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center justify-center md:justify-start">
              <CircleIcon className="h-4 w-4 mr-2 text-green-500" />
              {status}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader; 