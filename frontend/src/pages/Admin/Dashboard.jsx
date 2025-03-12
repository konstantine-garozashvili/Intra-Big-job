import React, { useState, useEffect } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import FormationCalendar from './FormationCalendar';
import apiService from '@/lib/services/apiService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ROLE_COLORS = {
  'ADMIN': 'bg-blue-100 text-blue-800',
  'SUPERADMIN': 'bg-purple-100 text-purple-800',
  'HR': 'bg-green-100 text-green-800',
  'TEACHER': 'bg-yellow-100 text-yellow-800',
  'STUDENT': 'bg-indigo-100 text-indigo-800',
  'GUEST': 'bg-gray-100 text-gray-800'
};

const AdminDashboard = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
  });

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    setError(null);

    try {
      const userData = await apiService.get('/users');

      if (userData && userData.success) {
        setAllUsers(userData.data);
      } else {
        setError('Format de réponse incorrect');
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Erreur inconnue');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      const headers = {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      };

      const response = await apiService.put(`/users/${selectedUser.id}`, editFormData, { headers });

      if (response.success) {
        setAllUsers(prev =>
          prev.map(user =>
            user.id === selectedUser.id ? response.user : user
          )
        );
        setIsEditModalOpen(false);
      } else {
        const errorMessage = response.message || 'Une erreur est survenue lors de la modification de l\'utilisateur';
        setError(errorMessage);
        alert(errorMessage);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Une erreur inconnue est survenue';
      setError(errorMessage);
      alert(errorMessage);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const headers = {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      };

      const response = await apiService.delete(`/users/${selectedUser.id}`, { headers });

      if (response.success) {
        setAllUsers(prev => prev.filter(user => user.id !== selectedUser.id));
        setIsDeleteModalOpen(false);
      } else {
        const errorMessage = response.message || 'Erreur lors de la suppression de l\'utilisateur';
        setError(errorMessage);
        alert(errorMessage);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Une erreur inconnue est survenue';
      setError(errorMessage);
      alert(errorMessage);
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredUsers = allUsers.filter(user => {
    if (roleFilter === 'ALL' || !roleFilter) return true;

    return user.roles && user.roles.some(role => role.name === roleFilter);
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="px-6 py-8">
        <div className="mt-8">
          <FormationCalendar />
        </div>

        <div className="p-6 mt-8 bg-white rounded-lg shadow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-800">Utilisateurs de la formation</h2>
            <div className="flex items-center space-x-4">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrer par rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tous les rôles</SelectItem>
                  <SelectItem value="ADMIN">Administrateurs</SelectItem>
                  <SelectItem value="TEACHER">Enseignants</SelectItem>
                  <SelectItem value="STUDENT">Étudiants</SelectItem>
                  <SelectItem value="HR">RH</SelectItem>
                  <SelectItem value="SUPERADMIN">Super Administrateurs</SelectItem>
                  <SelectItem value="GUEST">Invités</SelectItem>
                </SelectContent>
              </Select>
              <button
                onClick={fetchUsers}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Actualiser la liste
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
              <p>Erreur: {error}</p>
              <p className="mt-2 font-mono text-xs">Vérifiez la console pour plus de détails.</p>
            </div>
          )}

          {isLoadingUsers ? (
            <div className="flex justify-center py-8">
              <p>Chargement des utilisateurs...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs font-medium tracking-wider text-left text-gray-500 uppercase border-b">
                    <th className="px-4 py-3">Nom</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Téléphone</th>
                    <th className="px-4 py-3">Rôle(s)</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">
                          {user.firstName} {user.lastName}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{user.email}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{user.phoneNumber}</td>
                        <td className="px-4 py-3 text-sm">
                          {user.roles && user.roles.map((role) => (
                            <span
                              key={role.id}
                              className={`inline-block px-2 py-1 mr-1 mb-1 text-xs font-medium rounded-full ${ROLE_COLORS[role.name] || 'bg-gray-100 text-gray-800'}`}
                            >
                              {role.name}
                            </span>
                          ))}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center space-x-2">
                            <button
                              className="p-1 text-blue-600 bg-blue-100 rounded hover:bg-blue-200"
                              title="Modifier"
                              onClick={() => openEditModal(user)}
                            >
                              <Edit size={16} />
                            </button>
                            {/* <button
                              className="p-1 text-red-600 bg-red-100 rounded hover:bg-red-200"
                              title="Supprimer"
                              onClick={() => openDeleteModal(user)}
                            >
                              <Trash2 size={16} />
                            </button> */}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                        {error ? 'Impossible de charger les utilisateurs' : 'Aucun utilisateur trouvé'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier l'utilisateur</DialogTitle>
              <DialogDescription>Modifier les informations de l'utilisateur</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditUser} className="space-y-4">
              <div>
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={editFormData.firstName}
                  onChange={handleEditChange}
                  required
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
                />
              </div>
              <div>
                <Label htmlFor="phoneNumber">Numéro de téléphone</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={editFormData.phoneNumber}
                  onChange={handleEditChange}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">Enregistrer</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Supprimer l'utilisateur</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir supprimer cet utilisateur ?
                Cette action est irréversible.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                Annuler
              </Button>
              {/* <Button variant="destructive" onClick={handleDeleteUser}>
                Supprimer
              </Button> */}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default AdminDashboard;