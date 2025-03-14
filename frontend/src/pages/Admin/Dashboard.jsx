import React, { useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import Calendar from './Calendar';
import apiService from '@/lib/services/apiService';
import { useAdminDashboardData } from '@/hooks/useDashboardQueries';
import { useApiMutation } from '@/hooks/useReactQuery';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';

const ROLE_COLORS = {
  'ADMIN': 'bg-blue-100 text-blue-800',
  'SUPERADMIN': 'bg-purple-100 text-purple-800',
  'HR': 'bg-green-100 text-green-800',
  'TEACHER': 'bg-yellow-100 text-yellow-800',
  'STUDENT': 'bg-indigo-100 text-indigo-800',
  'GUEST': 'bg-gray-100 text-gray-800'
};

const AdminDashboard = () => {
  // Utiliser le hook personnalisé pour les données utilisateur et la liste des utilisateurs
  const { user, users, isLoading, isError, error, refetch } = useAdminDashboardData();
  
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

  // Utiliser useApiMutation pour les opérations de modification d'utilisateur
  const editUserMutation = useApiMutation(
    (data) => `/users/${data.id}`,
    'put',
    'admin-users',
    {
      onSuccess: () => {
        setIsEditModalOpen(false);
        refetch();
      },
      onError: (error) => {
        alert(error.message || 'Une erreur est survenue lors de la modification de l\'utilisateur');
      }
    }
  );

  // Utiliser useApiMutation pour les opérations de suppression d'utilisateur
  const deleteUserMutation = useApiMutation(
    (id) => `/users/${id}`,
    'delete',
    'admin-users',
    {
      onSuccess: () => {
        setIsDeleteModalOpen(false);
        refetch();
      },
      onError: (error) => {
        alert(error.message || 'Une erreur est survenue lors de la suppression de l\'utilisateur');
      }
    }
  );

  const handleEditUser = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    // Préparer les données pour la mutation
    const userData = {
      ...editFormData,
      id: selectedUser.id
    };

    // Exécuter la mutation
    editUserMutation.mutate(userData);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    deleteUserMutation.mutate(selectedUser.id);
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

  const filteredUsers = users?.filter(user => {
    if (roleFilter === 'ALL' || !roleFilter) return true;

    return user.roles && user.roles.some(role => role.name === roleFilter);
  }) || [];

  // Utiliser le DashboardLayout pour gérer les états de chargement et d'erreur
  return (
    <DashboardLayout 
      loading={isLoading} 
      error={isError ? error?.message || 'Une erreur est survenue lors du chargement des données' : null}
      className="p-0"
    >
      <div className="min-h-screen bg-gray-50">
        <main className="px-6 py-8">
          <div className="mt-8">
            <Calendar />
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
                  onClick={refetch}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Actualiser la liste
                </button>
              </div>
            </div>

            {editUserMutation.isError && (
              <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
                <p>Erreur: {editUserMutation.error?.message || 'Une erreur est survenue'}</p>
                <p className="mt-2 font-mono text-xs">Vérifiez la console pour plus de détails.</p>
              </div>
            )}

            {editUserMutation.isLoading || deleteUserMutation.isLoading ? (
              <div className="flex justify-center py-8">
                <div className="flex flex-col items-center">
                  <motion.div
                    className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, ease: "linear", duration: 1 }}
                  />
                  <p className="mt-4 text-sm font-medium text-gray-600">Traitement en cours...</p>
                </div>
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
                  <Button type="submit" disabled={editUserMutation.isLoading}>
                    {editUserMutation.isLoading ? 'Enregistrement...' : 'Enregistrer'}
                  </Button>
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
                {/* <Button 
                  variant="destructive" 
                  onClick={handleDeleteUser}
                  disabled={deleteUserMutation.isLoading}
                >
                  {deleteUserMutation.isLoading ? 'Suppression...' : 'Supprimer'}
                </Button> */}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;