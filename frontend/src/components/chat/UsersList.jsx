import React from 'react';

const UsersList = ({ users, loading }) => {
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
            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
          </div>
          <div>
            <div className="font-medium">{user.firstName} {user.lastName}</div>
            {user.userRoles && user.userRoles.length > 0 && (
              <div className="text-xs text-gray-500">
                {user.userRoles.map(userRole => userRole.role.name).join(', ')}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default UsersList;
