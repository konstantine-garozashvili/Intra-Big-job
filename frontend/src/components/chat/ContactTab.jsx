import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Globe, MessageCircle, SlidersHorizontal } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import RoleBadge from '@/components/ui/RoleBadge';
import { getRoleDisplayName } from '@/lib/constants/roles';

export default function ContactTab({ onUserSelect, selectedUserId }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [availableRoles, setAvailableRoles] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // Appel unique à la route optimisée
        const params = { includeRoles: true };
        if (roleFilter) params.role = roleFilter;
        const response = await axios.get('/api/users/list', { params });
        const userData = response.data.data || [];
        setUsers(userData);
        
        // Si pas de filtre actif, mettre à jour la liste des rôles disponibles
        if (!roleFilter) {
          const allRoles = Array.from(new Set(userData.flatMap(u => (u.userRoles || []).map(ur => ur.role.name))));
          setAvailableRoles(allRoles);
        }
      } catch (err) {
        setError('Erreur lors de la récupération des utilisateurs');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [roleFilter]);

  // Filtrage côté frontend sur le nom, prénom, email
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.firstName?.toLowerCase().includes(searchLower) ||
      user.lastName?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      (user.userRoles && user.userRoles.some(ur => ur.role.name.toLowerCase().includes(searchLower)))
    );
  });

  const handleRoleSelect = (role) => {
    setRoleFilter(role);
    setIsPopoverOpen(false);
  };

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
    <div className="flex flex-col h-full">
      {/* Barre de recherche et filtre rôle */}
      <div className="p-4 border-b border-gray-800 flex gap-2 items-center">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un contact..."
            className="w-full bg-gray-700 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        </div>
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <button
              className="bg-gray-700 text-gray-400 hover:text-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <SlidersHorizontal className="h-5 w-5" />
            </button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-64 p-3 bg-gray-800 border border-gray-700 rounded-lg shadow-xl"
            align="end"
            side="top"
            sideOffset={5}
            style={{
              zIndex: 9999,
            }}
          >
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-300 mb-2">Filtrer par rôle</div>
              <button
                onClick={() => handleRoleSelect('')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${!roleFilter ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
              >
                Tous les rôles
              </button>
              {availableRoles.map(role => (
                <button
                  key={role}
                  onClick={() => handleRoleSelect(role)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${roleFilter === role ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                >
                  {getRoleDisplayName(role)}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Liste des utilisateurs */}
      <div className="overflow-y-auto flex-1">
        <div className="space-y-2 p-4">
          {/* Chat Global en premier */}
          <button
            key="global-chat"
            onClick={() => onUserSelect?.({ id: 'global', firstName: 'Chat Global' })}
            className={`w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-700 transition-colors ${selectedUserId === 'global' ? 'bg-blue-800 border-2 border-blue-500' : 'bg-blue-800/80 border border-blue-600'}`}
          >
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg">
              <Globe className="w-6 h-6" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium text-white">Chat Global</div>
              <div className="text-sm text-blue-200">Tous les utilisateurs</div>
            </div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </button>
          {/* Utilisateurs */}
          {filteredUsers.map((user) => (
            <button
              key={user.id}
              onClick={() => onUserSelect?.(user)}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${selectedUserId === user.id ? 'bg-gray-700 border-2 border-blue-500' : 'hover:bg-gray-700'}`}
            >
              {user.profilePictureUrl ? (
                <img
                  src={user.profilePictureUrl}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={e => { e.target.onerror = null; e.target.src = '/default-avatar.png'; }}
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm">
                  {user.firstName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
              <div className="flex-1 text-left">
                <div className="font-medium text-white">
                  {user.firstName && user.lastName 
                    ? `${user.firstName} ${user.lastName}`
                    : user.email}
                </div>
                <div className="flex gap-1 mt-1">
                  {(user.userRoles && user.userRoles.length > 0) ? (
                    user.userRoles.map((userRole, index) => (
                      <RoleBadge 
                        key={`${user.id}-${userRole.role.name}`}
                        role={userRole.role.name}
                        useVariant={true}
                        animated={false}
                        interactive={false}
                      />
                    ))
                  ) : (
                    <RoleBadge 
                      role="USER"
                      useVariant={true}
                      animated={false}
                      interactive={false}
                    />
                  )}
                </div>
              </div>
              <MessageCircle className="w-5 h-5 text-gray-400" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 