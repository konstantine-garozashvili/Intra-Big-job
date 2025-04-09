import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Search, Loader2, AlertCircle, X, FileText, Download, User, Mail, MapPin, GraduationCap, Shield, LayoutGrid, List, SortAsc, SortDesc, Calendar, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchUsers, useUsersList } from './UsersList/services/usersListService';
import { getProfilePictureUrl } from '@/lib/utils/profileUtils';
import { useRoles, ROLES } from '../../features/roles/roleContext';
import { useSearchRoles } from '../../lib/hooks/useSearchRoles';

const getRoleIconColor = (role) => {
  const colors = {
    'STUDENT': 'text-blue-500',
    'TEACHER': 'text-emerald-500',
    'HR': 'text-purple-500',
    'ADMIN': 'text-amber-500',
    'SUPER_ADMIN': 'text-red-500',
    'RECRUITER': 'text-pink-500',
    'GUEST': 'text-blue-300'
  };
  return colors[role] || 'text-gray-500';
};

const getRoleLabel = (role) => {
  const labels = {
    'STUDENT': 'Étudiant',
    'TEACHER': 'Professeur',
    'HR': 'RH',
    'ADMIN': 'Administrateur',
    'SUPER_ADMIN': 'Super Admin',
    'RECRUITER': 'Recruteur',
    'GUEST': 'Invité'
  };
  return labels[role] || role;
};

const getRoleColor = (role) => {
  const colors = {
    'STUDENT': 'bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-800 dark:text-blue-200 dark:hover:bg-blue-700',
    'TEACHER': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
    'HR': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    'ADMIN': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
    'SUPER_ADMIN': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    'RECRUITER': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
    'GUEST': 'bg-blue-50 text-blue-300 hover:bg-blue-100 dark:bg-blue-800 dark:text-blue-200 dark:hover:bg-blue-700'
  };
  return colors[role] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
};

const isAdminRole = (role) => {
  return ['ADMIN', 'SUPER_ADMIN'].includes(role);
};

const RoleDropdown = ({ selectedRole, setSelectedRole, uniqueRoles }) => {
  const [isOpen, setIsOpen] = useState(false);

  const roleLabels = {
    'STUDENT': 'Étudiant',
    'TEACHER': 'Professeur',
    'HR': 'RH',
    'ADMIN': 'Administrateur',
    'SUPER_ADMIN': 'Super Admin',
    'RECRUITER': 'Recruteur',
    'GUEST': 'Invité'
  };

  const roleColors = {
    'STUDENT': 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800',
    'TEACHER': 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900 dark:text-emerald-200 dark:hover:bg-emerald-800',
    'HR': 'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:hover:bg-purple-800',
    'ADMIN': 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900 dark:text-amber-200 dark:hover:bg-amber-800',
    'SUPER_ADMIN': 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800',
    'RECRUITER': 'bg-pink-100 text-pink-700 hover:bg-pink-200 dark:bg-pink-900 dark:text-pink-200 dark:hover:bg-pink-800',
    'GUEST': 'bg-blue-50 text-blue-300 hover:bg-blue-100 dark:bg-blue-800 dark:text-blue-200 dark:hover:bg-blue-700'
  };

  const roleIconColors = {
    'STUDENT': 'text-blue-600',
    'TEACHER': 'text-emerald-600',
    'HR': 'text-purple-600',
    'ADMIN': 'text-amber-600',
    'SUPER_ADMIN': 'text-red-600',
    'RECRUITER': 'text-pink-600',
    'GUEST': 'text-blue-300'
  };

  const getRoleColor = (role) => {
    return roleColors[role] || 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800';
  };

  const getRoleIconColor = (role) => {
    return roleIconColors[role] || 'text-blue-600';
  };

  const toggleDropdown = () => setIsOpen(!isOpen);

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className={`px-4 py-2.5 rounded-lg flex items-center justify-between w-full transition-all ${
          selectedRole ? getRoleColor(selectedRole) : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800'
        }`}
      >
        <div className="flex items-center space-x-2">
          <Shield className={`w-5 h-5 ${selectedRole ? getRoleIconColor(selectedRole) : 'text-blue-600'}`} />
          <span>{selectedRole ? getRoleLabel(selectedRole) : 'Filtrer par rôle'}</span>
        </div>
        <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-2">
            {uniqueRoles.map((role) => (
              <button
                key={role}
                onClick={() => {
                  setSelectedRole(role);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                  selectedRole === role
                    ? 'bg-blue-500 text-white' 
                    : getRoleColor(role)
                }`}
              >
                <Shield className={`w-5 h-5 ${
                  selectedRole === role ? 'text-white' : getRoleIconColor(role)
                }`} />
                <span>{getRoleLabel(role)}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const SortDropdown = ({ sortOption, setSortOption }) => {
  const [isOpen, setIsOpen] = useState(false);

  const sortLabels = {
    'nameAsc': 'Nom A-Z',
    'nameDesc': 'Nom Z-A'
  };

  const sortColors = {
    'nameAsc': 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800',
    'nameDesc': 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800'
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-4 py-2.5 rounded-lg flex items-center justify-between w-full transition-all ${
          sortOption ? sortColors[sortOption] : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
        }`}
      >
        <div className="flex items-center space-x-2">
          {sortOption === 'nameAsc' ? (
            <SortAsc className="w-5 h-5 text-blue-500" />
          ) : sortOption === 'nameDesc' ? (
            <SortDesc className="w-5 h-5 text-blue-500" />
          ) : (
            <SortAsc className="w-5 h-5 text-gray-500" />
          )}
          <span>{sortOption ? sortLabels[sortOption] : 'Trier par'}</span>
        </div>
        <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-2">
            <button
              onClick={() => {
                setSortOption('nameAsc');
                setIsOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                sortOption === 'nameAsc'
                  ? 'bg-blue-500 text-white' 
                  : sortColors['nameAsc']
              }`}
            >
              <SortAsc className="w-5 h-5 text-blue-500" />
              <span>Nom A-Z</span>
            </button>
            <button
              onClick={() => {
                setSortOption('nameDesc');
                setIsOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                sortOption === 'nameDesc'
                  ? 'bg-blue-500 text-white' 
                  : sortColors['nameDesc']
              }`}
            >
              <SortDesc className="w-5 h-5 text-blue-500" />
              <span>Nom Z-A</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const LayoutDropdown = ({ layout, setLayout }) => {
  const [isOpen, setIsOpen] = useState(false);

  const layoutLabels = {
    'card': 'Grille',
    'list': 'Liste',
    'compact': 'Compact'
  };

  const layoutColors = {
    'card': 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800',
    'list': 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800',
    'compact': 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800'
  };

  const layoutIcons = {
    'card': <LayoutGrid className="w-5 h-5" />,
    'list': <List className="w-5 h-5" />,
    'compact': <LayoutGrid className="w-5 h-5" />
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-4 py-2.5 rounded-lg flex items-center justify-between w-full transition-all ${
          layout ? layoutColors[layout] : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
        }`}
      >
        <div className="flex items-center space-x-2">
          {layout ? layoutIcons[layout] : <LayoutGrid className="w-5 h-5 text-gray-500" />}
          <span>{layout ? layoutLabels[layout] : 'Vue'}</span>
        </div>
        <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-2">
            <button
              onClick={() => {
                setLayout('card');
                setIsOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                layout === 'card'
                  ? 'bg-blue-500 text-white' 
                  : layoutColors['card']
              }`}
            >
              <LayoutGrid className="w-5 h-5 text-blue-500" />
              <span>Grille</span>
            </button>
            <button
              onClick={() => {
                setLayout('list');
                setIsOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                layout === 'list'
                  ? 'bg-blue-500 text-white' 
                  : layoutColors['list']
              }`}
            >
              <List className="w-5 h-5 text-blue-500" />
              <span>Liste</span>
            </button>
            <button
              onClick={() => {
                setLayout('compact');
                setIsOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                layout === 'compact'
                  ? 'bg-blue-500 text-white' 
                  : layoutColors['compact']
              }`}
            >
              <LayoutGrid className="w-5 h-5 text-blue-500" />
              <span>Compact</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const UserModal = ({ user, onClose }) => {
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

              <div className="flex flex-wrap gap-2 mb-8">
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
                      role === 'GUEST' ? 'bg-blue-50 text-blue-300 dark:bg-blue-800 dark:text-blue-200' :
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
                      role === 'GUEST' ? 'text-blue-300' :
                      'text-gray-500'
                    }`} />
                    {getRoleLabel(role)}
                  </span>
                ))}
              </div>

              <Link
                to={`/profile/${user.id}`}
                className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <User className="w-4 h-4 mr-2" />
                Voir le profil complet
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserCard = ({ user, onClick }) => {
  const [hasError, setHasError] = useState(false);

  const handleImageError = (e) => {
    e.target.onerror = null;
    setHasError(true);
  };

  const profilePictureUrl = user.profilePictureUrl 
    ? user.profilePictureUrl 
    : (user.profilePicturePath ? getProfilePictureUrl(user.profilePicturePath) : '/default-avatar.png');

  return (
    <div 
      key={user.id} 
      className="bg-white dark:bg-gray-800 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClick(user)}
    >
      <div className="flex items-center space-x-4 mb-2">
        <img
          src={profilePictureUrl}
          alt={`${user.firstName} ${user.lastName}`}
          className="w-10 h-10 rounded-full"
          onError={handleImageError}
          style={{ 
            display: hasError ? 'none' : 'block',
            objectFit: 'cover'
          }}
        />
        {hasError && (
          <img
            src="/default-avatar.png"
            alt={`${user.firstName} ${user.lastName}`}
            className="w-10 h-10 rounded-full object-cover"
          />
        )}
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white">{user.firstName} {user.lastName}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {user.userRoles?.map((ur, index) => (
          <span
            key={index}
            className={`px-2 py-1 text-xs font-medium rounded-full flex items-center ${getRoleColor(ur.role.name)}`}
          >
            <Shield className={`w-3 h-3 mr-1 ${getRoleIconColor(ur.role.name)}`} />
            {getRoleLabel(ur.role.name)}
          </span>
        ))}
      </div>
    </div>
  );
};

const UsersList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [layout, setLayout] = useState('card');
  const [sortOption, setSortOption] = useState('nameAsc');

  // Get current user's roles and permissions
  const { roles: userRoles, hasRole, hasAnyRole } = useRoles();
  const { allowedSearchRoles } = useSearchRoles();

  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users', 'all'],
    queryFn: fetchUsers
  });

  const uniqueRoles = useMemo(() => {
    if (!users) return [];
    
    // Filter roles based on allowedSearchRoles
    const roles = users.flatMap(user => 
      user.userRoles?.map(ur => ur.role.name).filter(role => {
        // Always show GUEST role
        if (role === 'GUEST') return true;
        
        // Check if role is in allowedSearchRoles
        return allowedSearchRoles.includes(role);
      })
    );
    
    return [...new Set(roles) || []];
  }, [users, allowedSearchRoles]);

  const filteredUsers = useMemo(() => {
    if (!users) return [];

    const matchesSearch = (user) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    };

    const matchesRole = (user) => {
      if (!selectedRole) return true;
      return user.userRoles?.some(ur => ur.role.name === selectedRole);
    };

    // Filter users based on search and role
    const filtered = users.filter(user => matchesSearch(user) && matchesRole(user));

    // Apply role-based filtering based on user's permissions
    if (!hasRole(ROLES.ADMIN) && !hasRole(ROLES.SUPERADMIN)) {
      return filtered.filter(user => {
        // Get user's roles
        const userRoles = user.userRoles?.map(ur => ur.role.name) || [];
        
        // Students can only see TEACHER, STUDENT, RECRUITER, and HR
        if (hasRole(ROLES.STUDENT)) {
          return userRoles.some(role => 
            ['TEACHER', 'STUDENT', 'RECRUITER', 'HR'].includes(role)
          );
        }
        
        // HR can only see TEACHER, STUDENT, and RECRUITER
        if (hasRole(ROLES.HR)) {
          return userRoles.some(role => 
            ['TEACHER', 'STUDENT', 'RECRUITER'].includes(role)
          );
        }
        
        // Recruiters can only see TEACHER and STUDENT
        if (hasRole(ROLES.RECRUITER)) {
          return userRoles.some(role => 
            ['TEACHER', 'STUDENT'].includes(role)
          );
        }
        
        // Teachers can only see STUDENT and HR
        if (hasRole(ROLES.TEACHER)) {
          return userRoles.some(role => 
            ['STUDENT', 'HR'].includes(role)
          );
        }
        
        // Guests can only see RECRUITER
        if (hasRole(ROLES.GUEST)) {
          return userRoles.some(role => 
            ['RECRUITER'].includes(role)
          );
        }
        
        // Default case - show all non-admin users
        return !userRoles.some(role => 
          ['ADMIN', 'SUPERADMIN', 'SUPER_ADMIN'].includes(role)
        );
      });
    }

    return filtered;
  }, [users, searchTerm, selectedRole, hasRole, hasAnyRole]);

  const sortedUsers = useMemo(() => {
    if (!filteredUsers) return [];

    switch (sortOption) {
      case 'nameAsc':
        return [...filteredUsers].sort((a, b) => 
          `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
        );
      case 'nameDesc':
        return [...filteredUsers].sort((a, b) => 
          `${b.firstName} ${b.lastName}`.localeCompare(`${a.firstName} ${a.lastName}`)
        );
      default:
        return filteredUsers;
    }
  }, [filteredUsers, sortOption]);

  const handleClearRole = () => {
    setSelectedRole(null);
  };

  const renderUserList = () => {
    switch (layout) {
      case 'list':
        return (
          <div className="space-y-4">
            {sortedUsers?.map((user) => (
              <div 
                key={user.id} 
                className="bg-white dark:bg-gray-800 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedUser(user)}
              >
                <div className="flex items-center space-x-4 mb-2">
                  <img
                    src={getProfilePictureUrl(user.profilePicturePath)}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="w-10 h-10 rounded-full"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/default-avatar.png';
                    }}
                  />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{user.firstName} {user.lastName}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {user.userRoles?.map((ur, index) => (
                    <span
                      key={index}
                      className={`px-2 py-1 text-xs font-medium rounded-full flex items-center ${getRoleColor(ur.role.name)}`}
                    >
                      <Shield className={`w-3 h-3 mr-1 ${getRoleIconColor(ur.role.name)}`} />
                      {getRoleLabel(ur.role.name)}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      case 'compact':
        return (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {sortedUsers?.map((user) => (
              <div 
                key={user.id} 
                className="bg-white dark:bg-gray-800 rounded-lg p-2 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedUser(user)}
              >
                <div className="flex flex-col items-center">
                  <img
                    src={getProfilePictureUrl(user.profilePicturePath)}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="w-16 h-16 rounded-full"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/default-avatar.png';
                    }}
                  />
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mt-1">{user.firstName} {user.lastName}</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {user.userRoles?.map((ur, index) => (
                      <span
                        key={index}
                        className={`px-1.5 py-0.5 text-xs font-medium rounded ${getRoleColor(ur.role.name)}`}
                      >
                        <Shield className={`w-2.5 h-2.5 mr-1 ${getRoleIconColor(ur.role.name)}`} />
                        {getRoleLabel(ur.role.name)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      default:
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {sortedUsers?.map((user) => (
              <UserCard 
                key={user.id} 
                user={user} 
                onClick={setSelectedUser}
              />
            ))}
          </div>
        );
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      'STUDENT': 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800',
      'TEACHER': 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900 dark:text-emerald-200 dark:hover:bg-emerald-800',
      'HR': 'bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:hover:bg-purple-800',
      'ADMIN': 'bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900 dark:text-amber-200 dark:hover:bg-amber-800',
      'SUPER_ADMIN': 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800',
      'RECRUITER': 'bg-pink-100 text-pink-800 hover:bg-pink-200 dark:bg-pink-900 dark:text-pink-200 dark:hover:bg-pink-800',
      'GUEST': 'bg-blue-50 text-blue-300 hover:bg-blue-100 dark:bg-blue-800 dark:text-blue-200 dark:hover:bg-blue-700'
    };
    return colors[role] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

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
      <div className="flex flex-col space-y-4 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-6 h-6 text-blue-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Trombinoscope
            </h1>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="flex-1 hidden md:block" />

          <div className="flex flex-col md:flex-row gap-4 md:gap-2">
            {/* Layout Buttons */}
            <div className="flex flex-wrap gap-2">
              <LayoutDropdown
                layout={layout}
                setLayout={setLayout}
              />
            </div>

            {/* Sorting Buttons */}
            <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
              <SortDropdown
                sortOption={sortOption}
                setSortOption={setSortOption}
              />
            </div>

            {/* Role Filter */}
            <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
              <RoleDropdown
                selectedRole={selectedRole}
                setSelectedRole={setSelectedRole}
                uniqueRoles={uniqueRoles}
              />
              {selectedRole && (
                <button
                  onClick={handleClearRole}
                  className="px-3 py-1.5 rounded-lg flex items-center space-x-2 transition-colors bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  <X className="w-4 h-4" />
                  <span>Effacer le filtre</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {sortedUsers?.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Aucun utilisateur trouvé
          </div>
        ) : (
          <div className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 p-8 rounded-xl">
            {renderUserList()}
          </div>
        )}

        {selectedUser && (
          <UserModal 
            user={selectedUser} 
            onClose={() => setSelectedUser(null)} 
          />
        )}
      </div>
    </div>
  );
};

export default UsersList;
