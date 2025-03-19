import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminDashboardData } from '@/hooks/useDashboardQueries';

const USER_COLUMNS = [
  { key: 'id', label: 'ID' },
  { key: 'profilePicturePath', label: 'Profile Picture Path' },
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'email', label: 'Email' },
  { key: 'phoneNumber', label: 'Phone Number' },
  { key: 'birthDate', label: 'Birth Date' },
  { key: 'createdAt', label: 'Created At' },
  { key: 'updatedAt', label: 'Updated At' },
  { key: 'roles', label: 'Roles' },
  { key: 'linkedinUrl', label: 'LinkedIn URL' },
  { key: 'specialization', label: 'Specialization' },
  { key: 'nationality', label: 'Nationality' },
  { key: 'diplomas', label: 'Diplomas' }
];

const UserTable = () => {
  const { users, isLoading, isError, error, refetch } = useAdminDashboardData();
  const [searchParams] = useSearchParams();
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  useEffect(() => {
    const role = searchParams.get('role');
    if (role) {
      setRoleFilter(role.toUpperCase());
    }
  }, [searchParams]);

  // Combine filtering and sorting BEFORE mapping to display text
  const filteredAndSortedUsers = useMemo(() => {
    let sortableUsers = users ? [...users] : [];

    // Filter using the original roles array (unchanged)
    if (roleFilter !== 'ALL') {
      sortableUsers = sortableUsers.filter(user =>
        Array.isArray(user.roles) &&
        user.roles.some(role => role.name.toUpperCase() === roleFilter)
      );
    }

    // Sort the users
    sortableUsers.sort((currentUser, nextUser) => {
      let currentUserVal = currentUser[sortConfig.key];
      let nextUserVal = nextUser[sortConfig.key];

      if (['diplomas'].includes(sortConfig.key)) {
        currentUserVal = Array.isArray(currentUserVal)
          ? currentUserVal.map(item => `${item.name} (${item.obtainedAt})`).join(', ')
          : '';
        nextUserVal = Array.isArray(nextUserVal)
          ? nextUserVal.map(item => `${item.name} (${item.obtainedAt})`).join(', ')
          : '';
      }

      if (['roles'].includes(sortConfig.key)) {
        // Use the original roles array for sorting
        currentUserVal = Array.isArray(currentUserVal)
          ? currentUserVal.map(item => item.name).join(', ')
          : '';
        nextUserVal = Array.isArray(nextUserVal)
          ? nextUserVal.map(item => item.name).join(', ')
          : '';
      }

      if (['birthDate', 'createdAt', 'updatedAt'].includes(sortConfig.key)) {
        currentUserVal = new Date(currentUserVal);
        nextUserVal = new Date(nextUserVal);
      }

      if (typeof currentUserVal === 'boolean') {
        currentUserVal = currentUserVal ? 1 : 0;
        nextUserVal = nextUserVal ? 1 : 0;
      }

      if (currentUserVal < nextUserVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (currentUserVal > nextUserVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    // Now map over the data to convert diplomas and roles to displayable strings
    return sortableUsers.map(user => ({
      ...user,
      diplomas: user.diplomas
        ? user.diplomas.map(item => `${item.name} (${item.obtainedAt})`).join(', ')
        : '',
      roles: user.roles
        ? user.roles.map(item => item.name).join(', ')
        : ''
    }));
  }, [users, sortConfig, roleFilter]);

  const handleSort = (columnKey) => {
    let direction = 'asc';
    if (sortConfig.key === columnKey && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key: columnKey, direction });
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error?.message}</div>;

  return (
    <div className="p-4">
      {!searchParams.get('role') && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">Liste des utilisateurs</h2>
          <div className="flex items-center space-x-3">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="ALL">Tous les rôles</option>
              <option value="ADMIN">Administrateurs</option>
              <option value="TEACHER">Formateurs</option>
              <option value="STUDENT">Étudiants</option>
              <option value="HR">RH</option>
              <option value="SUPERADMIN">Super Administrateurs</option>
              <option value="GUEST">Invités</option>
            </select>
            <Button onClick={refetch}>Actualiser la liste</Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full">
          <thead>
            <tr className="text-xs font-medium tracking-wider text-left uppercase border-b bg-gray-50">
              {USER_COLUMNS.map(col => (
                <th
                  key={col.key}
                  className="px-4 py-3 cursor-pointer select-none"
                  onClick={() => handleSort(col.key)}
                >
                  {col.label}
                  {sortConfig.key === col.key && (
                    <span>{sortConfig.direction === 'asc' ? ' ▲' : ' ▼'}</span>
                  )}
                </th>
              ))}
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredAndSortedUsers.length > 0 ? (
              filteredAndSortedUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  {USER_COLUMNS.map(col => (
                    <td key={col.key} className="px-4 py-3 text-sm">
                      {user[col.key] !== null && user[col.key] !== undefined
                        ? user[col.key].toString()
                        : ''}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <button
                        className="p-1 text-blue-600 bg-blue-100 rounded hover:bg-blue-200"
                        title="Modifier"
                        onClick={() => {
                          /* Add edit functionality if needed */
                        }}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="p-1 text-red-600 bg-red-100 rounded hover:bg-red-200"
                        title="Supprimer"
                        onClick={() => {
                          /* Add delete functionality if needed */
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={USER_COLUMNS.length + 1} className="text-center p-4">
                  {users ? 'Aucun utilisateur trouvé' : 'Impossible de charger les utilisateurs'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTable;
