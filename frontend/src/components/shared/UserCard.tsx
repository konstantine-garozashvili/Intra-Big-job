import React from 'react';
import { useUser } from '@/context/UserContext';

interface UserCardProps {
  userId: string;
  firstName: string;
  lastName: string;
  photoUrl: string;
  role: string;
  className?: string;
}

export const UserCard: React.FC<UserCardProps> = ({
  userId,
  firstName,
  lastName,
  photoUrl,
  role,
  className = '',
}) => {
  const { user } = useUser();
  
  // Si c'est la carte de l'utilisateur connecté, utiliser la photo du contexte
  const displayPhotoUrl = user?.id === userId ? user.photoUrl : photoUrl;

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
          <img
            src={displayPhotoUrl}
            alt={`${firstName} ${lastName}`}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h3 className="font-semibold text-lg">{firstName} {lastName}</h3>
          <p className="text-gray-600">{role}</p>
        </div>
      </div>
    </div>
  );
}; 