import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Search, Loader2, AlertCircle, X, FileText, Download, User, Mail, MapPin, GraduationCap, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import usersListService from './UsersList/services/usersListService';
import { getProfilePictureUrl } from '@/lib/utils/profileUtils';
import documentService from './Profile/services/documentService';
import { toast } from 'sonner';

const UserModal = ({ user, onClose }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Récupérer l'adresse principale de manière sécurisée
  const mainAddress = user.addresses?.[0];
  
  // Récupérer la ville de manière sécurisée (plusieurs formats possibles)
  const cityName = 
    user.city || // Format direct dans user
    (mainAddress?.city?.name) || // Format objet imbriqué
    (mainAddress?.city) || // Format chaîne directe
    "Non renseignée";

  const roles = user.userRoles?.map(ur => ur.role.name) || [];
  const isStudent = roles.some(role => 
    typeof role === 'object' ? role.name === "STUDENT" : role === "STUDENT"
  );

  const handleDownloadCV = async () => {
    if (!user.cvDocument) {
      toast.error('CV non disponible');
      return;
    }
    
    setIsDownloading(true);
    try {
      const blob = await documentService.downloadDocument(user.cvDocument.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = user.cvDocument.name || 'cv.pdf';
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-[500px] h-[400px] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Détails de l'utilisateur
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-start space-x-6">
            <div className="flex-shrink-0">
              <img
                src={getProfilePictureUrl(user.profilePicturePath)}
                alt={`${user.firstName} ${user.lastName}`}
                className="w-36 h-36 rounded-full object-cover shadow-lg shadow-blue-100 dark:shadow-blue-900 transition-transform duration-300 hover:scale-110"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/default-avatar.png';
                }}
              />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white relative inline-block mb-4">
                <span className="relative z-10 px-4">{user.firstName} {user.lastName}</span>
                <span className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg px-4"></span>
              </h3>
              <p className="text-base text-gray-500 dark:text-gray-400 mb-2 flex items-center">
                <Mail className="w-4 h-4 mr-2 text-blue-500" />
                {user.email}
              </p>
              <p className="text-base text-gray-500 dark:text-gray-400 mb-4 flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                {cityName}
              </p>

              {user.specialization && (
                <p className="text-base text-gray-500 dark:text-gray-400 mb-4 flex items-center">
                  <GraduationCap className="w-4 h-4 mr-2 text-blue-500" />
                  {user.specialization.domain?.name && `${user.specialization.domain.name} • `}
                  {user.specialization.name}
                </p>
              )}

              <div className="flex flex-wrap gap-2 mb-4">
                {roles.map((role, index) => (
                  <span
                    key={index}
                    className={`px-2 py-1 text-xs font-medium rounded-full flex items-center ${
                      role === 'STUDENT' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      role === 'TEACHER' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' :
                      role === 'HR' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                      role === 'ADMIN' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' :
                      role === 'SUPER_ADMIN' || role === 'SUPERADMIN' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      role === 'RECRUITER' ? 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}
                  >
                    <Shield className={`w-3 h-3 mr-1 ${
                      role === 'STUDENT' ? 'text-blue-500' :
                      role === 'TEACHER' ? 'text-emerald-500' :
                      role === 'HR' ? 'text-purple-500' :
                      role === 'ADMIN' ? 'text-amber-500' :
                      role === 'SUPER_ADMIN' || role === 'SUPERADMIN' ? 'text-red-500' :
                      role === 'RECRUITER' ? 'text-pink-500' :
                      'text-gray-500'
                    }`} />
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 flex justify-start gap-3 pl-8">
            <Link
              to={`/profile/${user.id}`}
              className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <User className="w-4 h-4 mr-2" />
              Voir le profil complet
            </Link>
            
            <button
              onClick={handleDownloadCV}
              disabled={isDownloading || !user.cvDocument}
              className="flex items-center px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
            >
              <Download className="w-4 h-4 mr-2" />
              {isDownloading ? 'Téléchargement...' : 'Télécharger le CV'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserCard = ({ user, onClick }) => {
  const roles = user.userRoles?.map(ur => ur.role.name) || [];
  
  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg shadow-blue-100 transition-all duration-300 cursor-pointer hover:scale-105 aspect-square flex flex-col items-center justify-between"
      onClick={() => onClick(user)}
    >
      <div className="w-full flex flex-col items-center space-y-6">
        <div className="relative">
          <img
            src={getProfilePictureUrl(user.profilePicturePath)}
            alt={`${user.firstName} ${user.lastName}`}
            className="w-16 h-16 rounded-full object-cover shadow-md shadow-blue-100 dark:shadow-blue-900"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/default-avatar.png';
            }}
          />
        </div>
        <div className="text-center">
          <h3 className="text-base font-semibold text-white relative inline-block mb-2">
            <span className="relative z-10 px-3">{user.firstName} {user.lastName}</span>
            <span className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg px-3"></span>
          </h3>
          <div className="flex flex-wrap justify-center gap-2">
            {roles.map((role, index) => (
              <span
                key={index}
                className={`px-2 py-1 text-xs font-medium rounded-full flex items-center ${
                  role === 'STUDENT' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                  role === 'TEACHER' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' :
                  role === 'HR' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                  role === 'ADMIN' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' :
                  role === 'SUPER_ADMIN' || role === 'SUPERADMIN' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  role === 'RECRUITER' ? 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                }`}
              >
                <Shield className={`w-3 h-3 mr-1 ${
                  role === 'STUDENT' ? 'text-blue-500' :
                  role === 'TEACHER' ? 'text-emerald-500' :
                  role === 'HR' ? 'text-purple-500' :
                  role === 'ADMIN' ? 'text-amber-500' :
                  role === 'SUPER_ADMIN' || role === 'SUPERADMIN' ? 'text-red-500' :
                  role === 'RECRUITER' ? 'text-pink-500' :
                  'text-gray-500'
                }`} />
                {role}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const UsersList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users', 'all'],
    queryFn: usersListService.getAllUsers
  });

  const filteredUsers = users?.filter(user => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const email = user.email?.toLowerCase() || '';
    const roles = user.userRoles?.map(ur => ur.role.name.toLowerCase()) || [];
    
    return (
      fullName.includes(searchLower) ||
      email.includes(searchLower) ||
      roles.some(role => role.includes(searchLower))
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-red-500">
        <AlertCircle className="w-8 h-8 mb-2" />
        <p>Une erreur est survenue lors du chargement des utilisateurs</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-2">
          <Users className="w-6 h-6 text-blue-500" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Trombinoscope
          </h1>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {filteredUsers?.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Aucun utilisateur trouvé
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredUsers?.map((user) => (
            <UserCard 
              key={user.id} 
              user={user} 
              onClick={setSelectedUser}
            />
          ))}
        </div>
      )}

      {selectedUser && (
        <UserModal 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)} 
        />
      )}
    </div>
  );
};

export default UsersList;

