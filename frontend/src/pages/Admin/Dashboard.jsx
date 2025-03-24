import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Calendar as CalendarIcon, Users, Shield, Book, ChevronRight } from 'lucide-react';
import Calendar from './Calendar';
import { useAdminDashboardData } from '@/hooks/useDashboardQueries';
import { useApiMutation } from '@/hooks/useReactQuery';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from 'sonner';
import authService from '@/lib/services/authService';
import { Checkbox } from '@/components/ui/checkbox';
import apiService from '@/lib/services/apiService';

const ROLE_COLORS = {
  'ADMIN': 'bg-blue-100 text-blue-800',
  'SUPERADMIN': 'bg-purple-100 text-purple-800',
  'HR': 'bg-green-100 text-green-800',
  'TEACHER': 'bg-yellow-100 text-yellow-800',
  'STUDENT': 'bg-indigo-100 text-indigo-800',
  'GUEST': 'bg-gray-100 text-gray-800'
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 15, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 400, damping: 25 }
  }
};

const AdminDashboard = () => {
  const { user, users, isLoading, isError, error, refetch } = useAdminDashboardData();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState("calendar");
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
  });
  const hasAttemptedRefresh = useRef(false);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);

  // Définir les cartes pour les accès rapides
  const quickAccessCards = [
    {
      title: 'Gestion des rôles',
      description: 'Gérer les rôles des utilisateurs',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-50',
      link: '/admin/user-roles',
    },
    {
      title: 'Gestion des invités',
      description: 'Gérer les rôles des étudiants invités',
      icon: Users,
      color: 'from-indigo-500 to-indigo-600',
      textColor: 'text-indigo-50',
      link: '/recruiter/guest-student-roles',
    },
    {
      title: 'Formations',
      description: 'Gérer et consulter les formations',
      icon: Book,
      color: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-50',
      link: '/formations',
    }
  ];

  const editUserMutation = useApiMutation(
    (data) => data && data.id ? `/users/${data.id}` : '/users',
    'put',
    'admin-users',
    {
      onSuccess: () => {
        setIsEditModalOpen(false);
        refetch();
        toast.success('Les informations de l\'utilisateur ont été mises à jour.');
      },
      onError: (error) => {
        console.error('Erreur lors de la modification de l\'utilisateur:', error);
        toast.error('Impossible de modifier l\'utilisateur.');
      }
    }
  );

  const deleteUserMutation = useApiMutation(
    (id) => id ? `/users/${id}` : '/users',
    'delete',
    'admin-users',
    {
      onSuccess: () => {
        setIsDeleteModalOpen(false);
        refetch();
        toast.success('L\'utilisateur a été supprimé avec succès.');
      },
      onError: (error) => {
        console.error('Erreur lors de la suppression de l\'utilisateur:', error);
        toast.error('Impossible de supprimer l\'utilisateur.');
      }
    }
  );

  const fetchAvailableRoles = async () => {
    setIsLoadingRoles(true);
    try {
      const response = await apiService.get('/user-roles/roles');
      if (response.success && response.data) {
        setAvailableRoles(response.data);
      } else {
        toast.error('Impossible de récupérer les rôles disponibles');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des rôles:', error);
      toast.error('Échec de la récupération des rôles');
    } finally {
      setIsLoadingRoles(false);
    }
  };

  useEffect(() => {
    fetchAvailableRoles();
  }, []);

  const handleEditUser = async (e) => {
    e.preventDefault();
    if (!selectedUser || !selectedUser.id) {
      toast.error('Utilisateur invalide. Veuillez réessayer.');
      return;
    }

    const userData = {
      ...editFormData,
      id: selectedUser.id,
      roles: selectedRoles
    };

    try {
      editUserMutation.mutate(userData);
    } catch (error) {
      console.error('Error in handleEditUser:', error);
      toast.error('Une erreur s\'est produite. Veuillez réessayer.');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser || !selectedUser.id) {
      toast.error('Utilisateur invalide. Impossible de supprimer.');
      return;
    }
    
    try {
      deleteUserMutation.mutate(selectedUser.id);
    } catch (error) {
      console.error('Error in handleDeleteUser:', error);
      toast.error('Une erreur s\'est produite lors de la suppression.');
    }
  };

  const openEditModal = (user) => {
    if (!user || !user.id) {
      console.error('Invalid user object received in openEditModal:', user);
      toast.error('Impossible d\'éditer cet utilisateur. Données invalides.');
      return;
    }
    
    setSelectedUser(user);
    setEditFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
    });
    
    if (user.roles && Array.isArray(user.roles)) {
      const roleIds = user.roles.map(role => role.id);
      setSelectedRoles(roleIds);
    } else {
      setSelectedRoles([]);
    }
    
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (user) => {
    if (!user || !user.id) {
      console.error('Invalid user object received in openDeleteModal:', user);
      toast.error('Impossible de supprimer cet utilisateur. Données invalides.');
      return;
    }
    
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

  const handleRoleChange = (roleId) => {
    setSelectedRoles(prev => {
      if (prev.includes(roleId)) {
        return prev.filter(id => id !== roleId);
      } else {
        return [...prev, roleId];
      }
    });
  };

  const filteredUsers = users?.filter(user => {
    if (roleFilter === 'ALL' || !roleFilter) return true;

    return user.roles && user.roles.some(role => role.name === roleFilter);
  }) || [];

  // Avoid infinite loop of refreshes but try once if we don't have user data
  useEffect(() => {
    if (!user && !hasAttemptedRefresh.current && !isLoading) {
      hasAttemptedRefresh.current = true;
      // Wait a short delay before attempting to refresh
      const timer = setTimeout(() => {
        authService.getCurrentUser();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [user, isLoading]);

  return (
    <DashboardLayout 
      loading={isLoading} 
      error={isError ? error?.message || 'Une erreur est survenue lors du chargement des données' : null}
      className="p-0"
      user={user}
      headerIcon={Shield}
      headerTitle="Tableau de bord administrateur"
    >
      <div className="container p-4 mx-auto sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
        {/* Statistiques essentielles */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8"
        >
          {/* ... existing stats code ... */}
        </motion.div>

        <Card className="border-0 shadow-md mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Accès rapide</h2>
            
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              {quickAccessCards.map((card, index) => (
                <motion.div key={index} variants={itemVariants} className="h-full">
                  <Link to={card.link} className="block h-full">
                    <div className="relative h-full overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group">
                      <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-90 group-hover:opacity-100 transition-opacity`}></div>
                      <div className="relative p-5 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-2.5 rounded-lg bg-white/20 backdrop-blur-sm">
                            <card.icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="p-1.5 rounded-full bg-white/20 backdrop-blur-sm">
                            <ChevronRight className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        
                        <h2 className="text-xl font-semibold text-white mb-1">
                          {card.title}
                        </h2>
                        <p className="text-white/80 text-sm mb-4">
                          {card.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <Tabs defaultValue="calendar" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <h1 className="text-xl font-semibold text-gray-800">Tableau de bord administrateur</h1>
              <TabsList className="grid w-auto grid-cols-2 bg-gray-100 no-focus-outline">
                <TabsTrigger 
                  value="calendar" 
                  className="flex items-center gap-1.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white no-focus-outline"
                >
                  <CalendarIcon className="w-4 h-4" />
                  <span>Emploi du temps</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="users" 
                  className="flex items-center gap-1.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white no-focus-outline"
                >
                  <Users className="w-4 h-4" />
                  <span>Utilisateurs</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <CardContent className="p-0">
              <TabsContent value="calendar" className="mt-0 no-focus-outline">
                <Calendar />
              </TabsContent>

              <TabsContent value="users" className="mt-0 no-focus-outline">
                <div className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
                    <h2 className="text-lg font-medium text-gray-800">Utilisateurs de la formation</h2>
                    <div className="flex items-center space-x-3">
                      <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="w-[180px] no-focus-outline">
                          <SelectValue placeholder="Filtrer par rôle" />
                        </SelectTrigger>
                        <SelectContent className="no-focus-outline">
                          <SelectItem value="ALL" className="no-focus-outline">Tous les rôles</SelectItem>
                          <SelectItem value="ADMIN" className="no-focus-outline">Administrateurs</SelectItem>
                          <SelectItem value="TEACHER" className="no-focus-outline">Formateurs</SelectItem>
                          <SelectItem value="STUDENT" className="no-focus-outline">Étudiants</SelectItem>
                          <SelectItem value="HR" className="no-focus-outline">RH</SelectItem>
                          <SelectItem value="SUPERADMIN" className="no-focus-outline">Super Administrateurs</SelectItem>
                          <SelectItem value="GUEST" className="no-focus-outline">Invités</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={refetch}
                        variant="outline"
                        className="no-focus-outline"
                      >
                        Actualiser la liste
                      </Button>
                    </div>
                  </div>

                  {editUserMutation.isError && (
                    <div className="p-3 mb-3 text-sm text-red-700 bg-red-100 rounded-lg">
                      <p>Erreur: {editUserMutation.error?.message || 'Une erreur est survenue'}</p>
                      <p className="mt-1 font-mono text-xs">Vérifiez la console pour plus de détails.</p>
                    </div>
                  )}

                  {editUserMutation.isLoading || deleteUserMutation.isLoading ? (
                    <div className="flex justify-center py-6">
                      <div className="flex flex-col items-center">
                        <motion.div
                          className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, ease: "linear", duration: 1 }}
                        />
                        <p className="mt-3 text-sm font-medium text-gray-600">Traitement en cours...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto bg-white rounded-lg shadow">
                      <table className="w-full">
                        <thead>
                          <tr className="text-xs font-medium tracking-wider text-left text-gray-500 uppercase border-b bg-gray-50">
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
                                      className="p-1 text-blue-600 bg-blue-100 rounded hover:bg-blue-200 no-focus-outline"
                                      title="Modifier"
                                      onClick={() => openEditModal(user)}
                                    >
                                      <Edit size={16} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="5" className="px-4 py-6 text-center text-gray-500">
                                {error ? 'Impossible de charger les utilisateurs' : 'Aucun utilisateur trouvé'}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="no-focus-outline">
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
                <Label className="mb-2 block">Rôles</Label>
                {isLoadingRoles ? (
                  <div className="py-2 text-sm text-gray-500">Chargement des rôles...</div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {availableRoles.map(role => (
                      <div key={role.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`role-${role.id}`}
                          checked={selectedRoles.includes(role.id)}
                          onCheckedChange={() => handleRoleChange(role.id)}
                          className="no-focus-outline"
                        />
                        <Label 
                          htmlFor={`role-${role.id}`}
                          className="text-sm font-normal"
                        >
                          {role.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
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

        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent className="no-focus-outline">
            <DialogHeader>
              <DialogTitle>Supprimer l'utilisateur</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir supprimer cet utilisateur ?
                Cette action est irréversible.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} className="no-focus-outline">
                Annuler
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;