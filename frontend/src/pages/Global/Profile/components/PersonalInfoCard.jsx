import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Globe,
  Linkedin,
  Github,
} from 'lucide-react';

const PersonalInfoCard = ({ userData = {} }) => {
  // Si aucune donnée utilisateur n'est disponible
  if (!userData || Object.keys(userData).length === 0) {
    return (
      <Card className="overflow-hidden border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
          <div className="flex items-center">
            <User className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
            <CardTitle className="text-lg">Informations personnelles</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-6">
            <User className="h-12 w-12 mx-auto text-gray-300" />
            <p className="mt-2 text-gray-500 dark:text-gray-400">Aucune information disponible</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Les informations personnelles apparaîtront ici
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Valeurs par défaut pour éviter les erreurs
  const {
    firstName = "Prénom",
    lastName = "Nom",
    email = "email@exemple.com",
    phoneNumber,
    birthDate,
    nationality,
    addresses = [],
    linkedinUrl,
    githubUrl,
    createdAt = new Date().toISOString(),
    lastLogin
  } = userData;

  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <div className="flex items-center">
          <User className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
          <CardTitle className="text-lg">Informations personnelles</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Nom complet</p>
            <p className="font-medium">{firstName} {lastName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Date de naissance</p>
            <p className="font-medium">
              {birthDate ? new Date(birthDate).toLocaleDateString() : 'Non renseigné'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Nationalité</p>
            <p className="font-medium">{nationality?.name || 'Non renseigné'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Téléphone</p>
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-2 text-gray-400" />
              <p className="font-medium">{phoneNumber || 'Non renseigné'}</p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Email professionnel</p>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-gray-400" />
                <p className="font-medium">{email}</p>
              </div>
            </div>
            
            {addresses && addresses.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Adresse</p>
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 mr-2 mt-1 text-gray-400" />
                  <div>
                    {addresses.map((address, index) => (
                      <p key={index} className="font-medium">
                        {address.street || 'Adresse non spécifiée'}
                        {address.complement && <span className="block text-sm text-gray-500">{address.complement}</span>}
                        {(address.postalCode || address.city) && (
                          <span className="block">{address.postalCode || ''} {address.city || ''}</span>
                        )}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {(linkedinUrl || githubUrl) && (
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            <h4 className="font-medium mb-2 flex items-center">
              <Globe className="h-4 w-4 mr-2" />
              Réseaux sociaux
            </h4>
            <div className="flex gap-4">
              {linkedinUrl && (
                <a 
                  href={linkedinUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              )}
              {githubUrl && (
                <a 
                  href={githubUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-800 hover:text-black dark:text-gray-300 dark:hover:text-white"
                >
                  <Github className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Membre depuis</p>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                <p className="font-medium">
                  {createdAt ? new Date(createdAt).toLocaleDateString() : 'Date inconnue'}
                </p>
              </div>
            </div>
            {lastLogin && (
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Dernière connexion</p>
                <p className="font-medium">
                  {new Date(lastLogin).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalInfoCard; 