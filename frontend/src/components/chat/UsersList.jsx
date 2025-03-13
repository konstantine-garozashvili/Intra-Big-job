import React from 'react';

const UsersList = ({ users, loading, onStartPrivateChat }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {users.map(user => (
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
    </div>
  );
};

export default UsersList;
