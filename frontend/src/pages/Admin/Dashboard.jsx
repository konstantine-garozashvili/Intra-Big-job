import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Users, Shield, Book, ChevronRight } from 'lucide-react';
import { useAdminDashboardData } from '@/hooks/useDashboardQueries';
import { useApiMutation } from '@/hooks/useReactQuery';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from "@/components/ui/card";
import { toast } from 'sonner';
import authService from '@/lib/services/authService';
import { Checkbox } from '@/components/ui/checkbox';
import apiService from '@/lib/services/apiService';
import { useTranslation } from '@/contexts/TranslationContext';
import AsyncTranslation from '@/components/Translation/AsyncTranslation';
import DashboardHeader from '@/components/shared/DashboardHeader';

const ROLE_COLORS = {
  'ADMIN': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  'SUPERADMIN': 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
  'HR': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  'TEACHER': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  'STUDENT': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300',
  'GUEST': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
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
  const { translate, currentLanguage } = useTranslation();
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
  const [translations, setTranslations] = useState({
    title: '',
    cards: []
  });

  const quickAccessCards = [
    {
      id: 1,
      title: 'Gestion des utilisateurs',
      description: 'Gérer les utilisateurs, les rôles et les permissions',
      link: '/admin/users',
      color: 'bg-blue-500'
    },
    {
      id: 2,
      title: 'Gestion des entreprises',
      description: 'Gérer les entreprises partenaires',
      link: '/admin/companies',
      color: 'bg-green-500'
    },
    {
      id: 3,
      title: 'Gestion des offres',
      description: 'Gérer les offres d\'emploi et de stage',
      link: '/admin/offers',
      color: 'bg-purple-500'
    },
    {
      id: 4,
      title: 'Gestion des événements',
      description: 'Gérer les événements et les actualités',
      link: '/admin/events',
      color: 'bg-yellow-500'
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

  // Log initial mount
  useEffect(() => {
    console.log('[AdminDashboard] Component mounted');
    console.log('[AdminDashboard] Current language:', currentLanguage);
  }, []);

  // Log language changes
  useEffect(() => {
    console.log('[Translation] Language changed to:', currentLanguage);
  }, [currentLanguage]);

  // Log translations
  const loggedTranslate = async (text) => {
    console.log('[Translation] Attempting to translate:', text);
    try {
      const result = await translate(text);
      console.log('[Translation] Result:', {
        original: text,
        translated: result,
        language: currentLanguage
      });
      return result;
    } catch (error) {
      console.error('[Translation] Error:', error);
      return text;
    }
  };

  const translateContent = useCallback(async () => {
    try {
      const [dashboardTitle, ...cardTranslations] = await Promise.all([
        translate('Tableau de bord administrateur'),
        ...quickAccessCards.map(async (card) => ({
          ...card,
          translatedTitle: await translate(card.title),
          translatedDescription: await translate(card.description)
        }))
      ]);

      setTranslations({
        title: dashboardTitle,
        cards: cardTranslations
      });
    } catch (error) {
      console.error('Translation error:', error);
    }
  }, [translate]);

  useEffect(() => {
    translateContent();
  }, [currentLanguage, translateContent]);

  return (
    <DashboardLayout 
      loading={isLoading} 
      error={isError ? error?.message || <AsyncTranslation text="Une erreur est survenue lors du chargement des données" /> : null}
      className="p-0"
      user={user}
      headerIcon={Shield}
      headerTitle={<AsyncTranslation text="Tableau de bord administrateur" />}
    >
      <div className="container p-4 mx-auto sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">

        <Card className="border-0 shadow-md mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              <AsyncTranslation text="Accès rapide" />
            </h2>
            
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              {translations.cards.map((card, index) => (
                <motion.div key={index} variants={itemVariants} className="h-full">
                  <Link to={card.link} className="block h-full">
                    <div className="relative h-full overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group">
                      <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-90 group-hover:opacity-100 transition-opacity`}></div>
                      <div className="relative p-5 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-2.5 rounded-lg bg-white/20 backdrop-blur-sm">
                            <Users className="w-5 h-5 text-white" />
                          </div>
                          <div className="p-1.5 rounded-full bg-white/20 backdrop-blur-sm">
                            <ChevronRight className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        
                        <h2 className="text-xl font-semibold text-white mb-1">
                          {card.translatedTitle}
                        </h2>
                        <p className="text-white/80 text-sm mb-4">
                          {card.translatedDescription}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </CardContent>
        </Card>
        
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="no-focus-outline">
            <DialogHeader>
              <DialogTitle><AsyncTranslation text="Modifier l'utilisateur" /></DialogTitle>
              <DialogDescription><AsyncTranslation text="Modifier les informations de l'utilisateur" /></DialogDescription>
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
              <DialogTitle><AsyncTranslation text="Supprimer l'utilisateur" /></DialogTitle>
              <DialogDescription>
                <AsyncTranslation text="Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible." />
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