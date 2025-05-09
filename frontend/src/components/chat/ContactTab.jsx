import React, { useState } from 'react';
import { Search, Globe, MessageCircle, SlidersHorizontal } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import RoleBadge from '@/components/ui/RoleBadge';
import { getRoleDisplayName, getRoleBadgeColor } from '@/lib/constants/roles';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { useUnreadCountByContact } from '@/lib/hooks/useUnreadPrivateMessagesCount';

// Nouveau composant UsersList
function UsersList({ searchTerm, roleFilter, selectedUserId, onUserSelect }) {
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const unreadByContact = useUnreadCountByContact();

  React.useEffect(() => {
    let isMounted = true;
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const params = { includeRoles: true };
        if (roleFilter) params.role = roleFilter;
        const response = await (await import('axios')).default.get('/api/users/list', { params });
        const userData = response.data.data || [];
        if (isMounted) setUsers(userData);
      } catch (err) {
        if (isMounted) setError('Erreur lors de la récupération des utilisateurs');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchUsers();
    return () => { isMounted = false; };
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-red-500 text-center p-4">{error}</div>
    );
  }
  return (
    <div className="overflow-y-auto flex-1">
      <TooltipProvider>
        <div className="space-y-2 p-4">
          {/* Utilisateurs */}
          {filteredUsers.map((user) => (
            <button
              key={user.id}
              onClick={() => onUserSelect?.(user)}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors text-sm ${selectedUserId === user.id ? 'bg-gray-700 border-2 border-blue-500' : 'hover:bg-gray-700'}`}
              style={{ minHeight: 48 }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white text-base cursor-pointer">
                    {user.firstName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  align="center"
                  className={`max-w-md px-4 py-2 text-sm z-50 ${user.userRoles && user.userRoles.length > 0 ? getRoleBadgeColor(user.userRoles[0].role.name) : ''}`}
                >
                  {user.userRoles && user.userRoles.length > 0
                    ? user.userRoles.map((userRole, idx) => (
                        <div key={userRole.role.name} className="text-sm text-white whitespace-nowrap">
                          {getRoleDisplayName(userRole.role.name)}
                        </div>
                      ))
                    : <div className="text-sm text-white whitespace-nowrap">Utilisateur</div>}
                </TooltipContent>
              </Tooltip>
              <div className="flex-1 flex items-center gap-2 truncate">
                <span className="font-medium text-white truncate" style={{maxWidth: 140}}>
                  {user.firstName && user.lastName 
                    ? `${user.firstName} ${user.lastName}`
                    : user.email}
                </span>
                {/* Badge de messages non lus */}
                {unreadByContact[user.id] > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-600 text-white min-w-[20px] h-5">
                    {unreadByContact[user.id]}
                  </span>
                )}
              </div>
              <MessageCircle className="w-5 h-5 text-gray-400" />
            </button>
          ))}
        </div>
      </TooltipProvider>
    </div>
  );
}

export default function ContactTab({ onUserSelect, selectedUserId }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [availableRoles, setAvailableRoles] = useState([]);

  // On ne veut charger les rôles qu'une seule fois (au premier rendu)
  React.useEffect(() => {
    let isMounted = true;
    const fetchRoles = async () => {
      try {
        const response = await (await import('axios')).default.get('/api/users/list', { params: { includeRoles: true } });
        const userData = response.data.data || [];
        const allRoles = Array.from(new Set(userData.flatMap(u => (u.userRoles || []).map(ur => ur.role.name))));
        if (isMounted) setAvailableRoles(allRoles);
      } catch {}
    };
    fetchRoles();
    return () => { isMounted = false; };
  }, []);

  const handleRoleSelect = (role) => {
    setRoleFilter(role);
    setIsPopoverOpen(false);
  };

  return (
    <TooltipProvider>
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
              style={{ zIndex: 9999 }}
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
        {/* Bouton Chat Global */}
        <div className="p-4 border-b border-gray-800">
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
        </div>
        {/* Liste des utilisateurs (isolée) */}
        <UsersList
          searchTerm={searchTerm}
          roleFilter={roleFilter}
          selectedUserId={selectedUserId}
          onUserSelect={onUserSelect}
        />
      </div>
    </TooltipProvider>
  );
} 