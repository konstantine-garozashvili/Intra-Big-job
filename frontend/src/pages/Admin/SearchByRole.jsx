import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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
  // Data fetching hook
  const { users, isLoading, isError, error, refetch } = useAdminDashboardData();
  const [searchParams] = useSearchParams();
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Modal and selected user state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Extended form state for editing user (all editable fields)
  const [editFormData, setEditFormData] = useState({
    profilePicturePath: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    birthDate: '',
    roles: '',
    linkedinUrl: '',
    specialization: '',
    nationality: '',
    diplomas: ''
  });

  // Placeholder mutation functions – replace with your actual API calls
  const editUserMutation = {
    isLoading: false,
    mutate: (data, { onSuccess, onError }) => {
      console.log("Editing user:", data);
      setTimeout(() => {
        onSuccess && onSuccess(data);
      }, 1000);
    }
  };

  const deleteUserMutation = {
    isLoading: false,
    mutate: (userId, { onSuccess, onError }) => {
      console.log("Deleting user with id:", userId);
      setTimeout(() => {
        onSuccess && onSuccess(userId);
      }, 1000);
    }
  };

  useEffect(() => {
    const role = searchParams.get('role');
    if (role) {
      setRoleFilter(role.toUpperCase());
    }
  }, [searchParams]);

  // Filtering and sorting using the original user data
  const filteredAndSortedUsers = useMemo(() => {
    let sortableUsers = users ? [...users] : [];

    if (roleFilter !== 'ALL') {
      sortableUsers = sortableUsers.filter(user =>
        Array.isArray(user.roles) &&
        user.roles.some(role => role.name.toUpperCase() === roleFilter)
      );
    }

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

    // Map for display: converting diplomas and roles arrays to strings
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

  // Edit modal functions
  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditFormData({
      profilePicturePath: user.profilePicturePath || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      birthDate: user.birthDate ? user.birthDate.substring(0, 10) : '', // assuming ISO format
      roles: Array.isArray(user.roles) ? user.roles.map(item => item.name).join(', ') : user.roles || '',
      linkedinUrl: user.linkedinUrl || '',
      specialization: user.specialization || '',
      nationality: user.nationality || '',
      diplomas: Array.isArray(user.diplomas) ? user.diplomas.map(item => `${item.name} (${item.obtainedAt})`).join(', ') : user.diplomas || ''
    });
    setIsEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditUser = (e) => {
    e.preventDefault();
    // Optionally transform roles/diplomas here before sending
    editUserMutation.mutate(
      { id: selectedUser.id, ...editFormData },
      {
        onSuccess: () => {
          refetch();
          setIsEditModalOpen(false);
        },
        onError: (err) => {
          console.error("Edit failed:", err);
        }
      }
    );
  };

  // Delete modal functions
  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteUser = () => {
    deleteUserMutation.mutate(selectedUser.id, {
      onSuccess: () => {
        refetch();
        setIsDeleteModalOpen(false);
      },
      onError: (err) => {
        console.error("Delete failed:", err);
      }
    });
  };

  if (isLoading) return <div className="p-4 text-center">Loading...</div>;
  if (isError) return <div className="p-4 text-center">Error: {error?.message}</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Liste des utilisateurs</h2>
          <div className="flex items-center space-x-3">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="p-2 border border-gray-300 rounded bg-white"
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

        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
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
                          onClick={() => handleEditClick(user)}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="p-1 text-red-600 bg-red-100 rounded hover:bg-red-200"
                          title="Supprimer"
                          onClick={() => handleDeleteClick(user)}
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

      {/* Edit User Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="no-focus-outline max-h-[80vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Modifier l'utilisateur</DialogTitle>
            <DialogDescription className="text-gray-600">
              Modifier les informations de l'utilisateur
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditUser} className="space-y-4">
            <div>
              <Label htmlFor="profilePicturePath">Profile Picture Path</Label>
              <Input
                id="profilePicturePath"
                name="profilePicturePath"
                value={editFormData.profilePicturePath}
                onChange={handleEditChange}
                className="no-focus-outline"
              />
            </div>
            <div>
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                name="firstName"
                value={editFormData.firstName}
                onChange={handleEditChange}
                required
                className="no-focus-outline"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                name="lastName"
                value={editFormData.lastName}
                onChange={handleEditChange}
                required
                className="no-focus-outline"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={editFormData.email}
                onChange={handleEditChange}
                required
                className="no-focus-outline"
              />
            </div>
            <div>
              <Label htmlFor="phoneNumber">Numéro de téléphone</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={editFormData.phoneNumber}
                onChange={handleEditChange}
                className="no-focus-outline"
              />
            </div>
            <div>
              <Label htmlFor="birthDate">Date de naissance</Label>
              <Input
                id="birthDate"
                name="birthDate"
                type="date"
                value={editFormData.birthDate}
                onChange={handleEditChange}
                className="no-focus-outline"
              />
            </div>
            <div>
              <Label htmlFor="roles">Roles (séparé par des virgules, example : STUDENT, ADMIN)</Label>
              <Input
                id="roles"
                name="roles"
                value={editFormData.roles}
                onChange={handleEditChange}
                className="no-focus-outline"
              />
            </div>
            <div>
              <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
              <Input
                id="linkedinUrl"
                name="linkedinUrl"
                value={editFormData.linkedinUrl}
                onChange={handleEditChange}
                className="no-focus-outline"
              />
            </div>
            <div>
              <Label htmlFor="specialization">Spécialisation</Label>
              <Input
                id="specialization"
                name="specialization"
                value={editFormData.specialization}
                onChange={handleEditChange}
                className="no-focus-outline"
              />
            </div>
            <div>
              <Label htmlFor="nationality">Nationalité</Label>
              <Input
                id="nationality"
                name="nationality"
                value={editFormData.nationality}
                onChange={handleEditChange}
                className="no-focus-outline"
              />
            </div>
            <div>
              <Label htmlFor="diplomas">Diplomas (séparé par des virgules, exemple : Bachelor in Computer Science (2022), Master in Software Engineering (2025))</Label>
              <Input
                id="diplomas"
                name="diplomas"
                value={editFormData.diplomas}
                onChange={handleEditChange}
                className="no-focus-outline"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} className="no-focus-outline">
                Annuler
              </Button>
              <Button type="submit" disabled={editUserMutation.isLoading} className="no-focus-outline">
                {editUserMutation.isLoading ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="no-focus-outline max-h-[80vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Supprimer l'utilisateur</DialogTitle>
            <DialogDescription className="text-gray-600">
              Êtes-vous sûr de vouloir supprimer cet utilisateur ?<br />
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} className="no-focus-outline">
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser} className="no-focus-outline" disabled={deleteUserMutation.isLoading}>
              {deleteUserMutation.isLoading ? 'Suppression...' : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserTable;
