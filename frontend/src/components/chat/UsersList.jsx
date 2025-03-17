import React, { useState, useEffect, useRef } from 'react';

const UsersList = ({ users, loading, onStartPrivateChat }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const searchInputRef = useRef(null);

  // Filter users whenever search term or users list changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }

    const lowerCaseSearch = searchTerm.toLowerCase();
    const filtered = users.filter(user => 
      user.firstName?.toLowerCase().includes(lowerCaseSearch) || 
      user.lastName?.toLowerCase().includes(lowerCaseSearch) ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(lowerCaseSearch) ||
      (user.email && user.email.toLowerCase().includes(lowerCaseSearch)) ||
      (user.userRoles && user.userRoles.some(role => 
        role.role.name.toLowerCase().includes(lowerCaseSearch)
      ))
    );
    
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="relative" ref={searchInputRef}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
            </svg>
          </div>
          <input
            type="text"
            className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Rechercher un utilisateur..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Users list */}
      <div className="mt-3">
        {filteredUsers.map(user => (
          <div key={user.id} className="flex items-center p-2 hover:bg-gray-100 rounded-lg">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold mr-3">
              {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
            </div>
            <div className="flex-grow">
              <div className="font-medium">{user.firstName} {user.lastName}</div>
              {user.userRoles && user.userRoles.length > 0 && (
                <div className="text-xs text-gray-500">
                  {user.userRoles.map(userRole => userRole.role.name).join(', ')}
                </div>
              )}
            </div>
            <button 
              onClick={() => onStartPrivateChat(user)}
              className="text-blue-600 hover:text-blue-800 p-2"
              title="Démarrer une conversation privée"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ))}
        
        {filteredUsers.length === 0 && searchTerm && (
          <div className="text-center p-4 text-gray-500">
            Aucun utilisateur ne correspond à votre recherche
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersList;
