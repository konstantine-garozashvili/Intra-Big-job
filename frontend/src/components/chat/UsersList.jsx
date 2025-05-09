import React, { useState, useEffect } from 'react';
import apiService from '../../lib/services/apiService';
import { useAuth } from '@/contexts/AuthContext';

export default function UsersList({ onUserSelect }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // Récupérer les utilisateurs de tous les rôles pertinents
        const roles = ['ROLE_ADMIN', 'ROLE_SUPERADMIN', 'ROLE_HR', 'ROLE_TEACHER', 'ROLE_STUDENT', 'ROLE_GUEST', 'ROLE_RECRUITER'];
        const usersPromises = roles.map(role => apiService.getUsersByRole(role));
        const usersArrays = await Promise.all(usersPromises);
        
        // Fusionner et dédupliquer les utilisateurs
        const allUsers = [...new Map(
          usersArrays
            .flat()
            .filter(u => u.id !== user?.id) // Exclure l'utilisateur actuel
            .map(u => [u.id, u])
        ).values()];

        setUsers(allUsers);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Erreur lors de la récupération des utilisateurs');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full">
      <div className="space-y-2 p-4">
        {users.map((user) => (
          <button
            key={user.id}
            onClick={() => onUserSelect(user)}
            className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm">
              {user.firstName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium text-white">
                {user.firstName && user.lastName 
                  ? `${user.firstName} ${user.lastName}`
                  : user.email}
              </div>
              <div className="text-sm text-gray-400">
                {user.roles?.[0]?.replace('ROLE_', '') || 'Utilisateur'}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
