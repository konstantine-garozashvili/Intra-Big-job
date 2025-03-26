import React, { useState, useEffect } from 'react';
import { Edit, Eye, ArrowLeft, ChevronLeft, ChevronRight, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import apiService from '@/lib/services/apiService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import PageTransition from '@/components/PageTransition';
import CreateUserDialog from './CreateUserDialog';

const ROLE_COLORS = {
    'ADMIN': 'bg-blue-100 text-blue-800',
    'SUPERADMIN': 'bg-purple-100 text-purple-800',
    'HR': 'bg-green-100 text-green-800',
    'TEACHER': 'bg-yellow-100 text-yellow-800',
    'STUDENT': 'bg-indigo-100 text-indigo-800',
    'GUEST': 'bg-gray-100 text-gray-800'
};

const ITEMS_PER_PAGE = 10;

const AdminUserManagement = () => {
    const [allUsers, setAllUsers] = useState([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [error, setError] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [editFormData, setEditFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        birthDate: '',
    });
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

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
            const response = await apiService.put(`/users/${selectedUser.id}`, editFormData, apiService.withAuth());

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

    const openEditModal = (user) => {
        setSelectedUser(user);
        setEditFormData({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            phoneNumber: user.phoneNumber || '',
            birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : '',
        });
        setIsEditModalOpen(true);
    };

    const openViewModal = (user) => {
        setSelectedUser(user);
        setIsViewModalOpen(true);
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleUserCreated = () => {
        fetchUsers();
        alert('Utilisateur créé avec succès');
    };

    const switchToEditMode = () => {
        setIsViewModalOpen(false);
        openEditModal(selectedUser);
    };

    const filteredUsers = allUsers.filter(user => {
        // Exclure les SUPERADMIN et ADMIN de la liste
        const isAdminOrSuperAdmin = user.roles && user.roles.some(role =>
            role.name === 'SUPERADMIN' || role.name === 'ADMIN'
        );

        if (isAdminOrSuperAdmin) {
            return false; // Filtrer ces utilisateurs
        }

        // Filtrage par rôle sélectionné
        const roleMatch = roleFilter === 'ALL' || !roleFilter
            ? true
            : (user.roles && user.roles.some(role => role.name === roleFilter));

        // Filtrage par recherche
        const searchMatch = searchTerm === ''
            ? true
            : (
                `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (user.phoneNumber && user.phoneNumber.includes(searchTerm))
            );

        return roleMatch && searchMatch;
    });

    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Non spécifié';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [roleFilter, searchTerm]);

    return (
        <PageTransition>
            <div className="min-h-screen py-8 bg-gray-50 dark:bg-gray-900">
                <div className="container p-6 mx-auto">
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="flex items-center justify-between mb-8"
                    >
                        <div>
                            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                                Gestion des utilisateurs
                            </h1>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                Administrez les comptes utilisateurs de la plateforme
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button
                                className="text-white transition-all duration-200 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                                onClick={() => setCreateDialogOpen(true)}
                            >
                                <UserPlus className="w-4 h-4 mr-2" />
                                Créer un utilisateur
                            </Button>
                            <Link to="/admin/dashboard">
                                <Button variant="outline" className="flex items-center gap-2">
                                    <ArrowLeft className="w-4 h-4" />
                                    Retour
                                </Button>
                            </Link>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800"
                    >
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                            <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">Liste des utilisateurs</h2>
                            <div className="flex flex-wrap gap-4">
                                <div className="relative">
                                    <Input
                                        type="text"
                                        placeholder="Rechercher un utilisateur..."
                                        className="w-64 pl-9"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                </div>

                                <Select value={roleFilter} onValueChange={setRoleFilter}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Filtrer par rôle" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">Tous les rôles</SelectItem>
                                        <SelectItem value="HR">RH</SelectItem>
                                        <SelectItem value="TEACHER">Enseignants</SelectItem>
                                        <SelectItem value="STUDENT">Étudiants</SelectItem>
                                        <SelectItem value="GUEST">Invités</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Button
                                    onClick={fetchUsers}
                                    variant="outline"
                                    className="transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    Actualiser
                                </Button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900/30 dark:text-red-300">
                                <p>Erreur: {error}</p>
                                <p className="mt-2 font-mono text-xs">Vérifiez la console pour plus de détails.</p>
                            </div>
                        )}

                        {isLoadingUsers ? (
                            <div className="flex justify-center py-8">
                                <div className="w-8 h-8 border-4 rounded-full border-t-blue-600 border-b-blue-300 border-l-blue-300 border-r-blue-300 animate-spin"></div>
                                <p className="ml-4 text-gray-600 dark:text-gray-400">Chargement des utilisateurs...</p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto border border-gray-200 rounded-lg shadow dark:border-gray-700">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="text-xs font-medium tracking-wider text-left text-gray-500 uppercase border-b border-gray-200 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                                                <th className="px-4 py-3">Nom</th>
                                                <th className="px-4 py-3">Email</th>
                                                <th className="px-4 py-3">Téléphone</th>
                                                <th className="px-4 py-3">Rôle(s)</th>
                                                <th className="px-4 py-3">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200 dark:divide-gray-700 dark:bg-gray-900">
                                            {currentItems.length > 0 ? (
                                                currentItems.map((user) => (
                                                    <tr key={user.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
                                                        <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-200">
                                                            {user.firstName} {user.lastName}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{user.email}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{user.phoneNumber}</td>
                                                        <td className="px-4 py-3 text-sm">
                                                            {user.roles && user.roles.map((role) => (
                                                                <span
                                                                    key={role.id}
                                                                    className={`inline-block px-2 py-1 mr-1 mb-1 text-xs font-medium rounded-full ${ROLE_COLORS[role.name] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}
                                                                >
                                                                    {role.name}
                                                                </span>
                                                            ))}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">
                                                            <div className="flex items-center space-x-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="text-indigo-600 hover:bg-indigo-100 dark:text-indigo-400 dark:hover:bg-indigo-900/30"
                                                                    title="Voir les détails"
                                                                    onClick={() => openViewModal(user)}
                                                                >
                                                                    <Eye size={16} />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/30"
                                                                    title="Modifier"
                                                                    onClick={() => openEditModal(user)}
                                                                >
                                                                    <Edit size={16} />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                                        {filteredUsers.length === 0
                                                            ? 'Aucun utilisateur ne correspond aux critères de recherche'
                                                            : 'Aucun utilisateur trouvé'
                                                        }
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {filteredUsers.length > ITEMS_PER_PAGE && (
                                    <div className="flex justify-center mt-6">
                                        <div className="flex items-center space-x-1">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={goToPreviousPage}
                                                disabled={currentPage === 1}
                                                className="px-2 py-1"
                                            >
                                                <ChevronLeft className="w-5 h-5" />
                                            </Button>

                                            {[...Array(totalPages)].map((_, index) => {
                                                const pageNumber = index + 1;

                                                const nearCurrentPage = Math.abs(pageNumber - currentPage) <= 1;
                                                const isFirstPage = pageNumber === 1;
                                                const isLastPage = pageNumber === totalPages;

                                                if (nearCurrentPage || isFirstPage || isLastPage) {
                                                    return (
                                                        <Button
                                                            key={pageNumber}
                                                            variant={currentPage === pageNumber ? "default" : "outline"}
                                                            size="sm"
                                                            onClick={() => paginate(pageNumber)}
                                                            className={`min-w-[2rem] ${currentPage === pageNumber ? 'bg-blue-600' : ''}`}
                                                        >
                                                            {pageNumber}
                                                        </Button>
                                                    );
                                                } else if (
                                                    (pageNumber === currentPage - 2 && currentPage > 3) ||
                                                    (pageNumber === currentPage + 2 && currentPage < totalPages - 2)
                                                ) {
                                                    return (
                                                        <span key={`ellipsis-${pageNumber}`} className="mx-1 text-gray-500 dark:text-gray-400">
                                                            ...
                                                        </span>
                                                    );
                                                }

                                                return null;
                                            })}

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={goToNextPage}
                                                disabled={currentPage === totalPages}
                                                className="px-2 py-1"
                                            >
                                                <ChevronRight className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </motion.div>
                </div>

                {/* Modal de visualisation */}
                <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Détails de l'utilisateur</DialogTitle>
                            <DialogDescription>
                                Informations complètes sur l'utilisateur
                            </DialogDescription>
                        </DialogHeader>

                        {selectedUser && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Prénom</p>
                                        <p className="mt-1 font-medium text-gray-900 dark:text-white">{selectedUser.firstName || 'Non spécifié'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Nom</p>
                                        <p className="mt-1 font-medium text-gray-900 dark:text-white">{selectedUser.lastName || 'Non spécifié'}</p>
                                    </div>
                                </div>

                                <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                                    <p className="mt-1 font-medium text-gray-900 dark:text-white">{selectedUser.email}</p>
                                </div>

                                <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Téléphone</p>
                                    <p className="mt-1 font-medium text-gray-900 dark:text-white">{selectedUser.phoneNumber || 'Non spécifié'}</p>
                                </div>

                                <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Date de naissance</p>
                                    <p className="mt-1 font-medium text-gray-900 dark:text-white">
                                        {selectedUser.birthDate ? formatDate(selectedUser.birthDate) : 'Non spécifiée'}
                                    </p>
                                </div>

                                <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Nationalité</p>
                                    <p className="mt-1 font-medium text-gray-900 dark:text-white">
                                        {selectedUser.nationality ? selectedUser.nationality.name : 'Non spécifiée'}
                                    </p>
                                </div>

                                <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Rôle(s)</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {selectedUser.roles && selectedUser.roles.map(role => (
                                            <span
                                                key={role.id}
                                                className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${ROLE_COLORS[role.name] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}
                                            >
                                                {role.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Date de création</p>
                                    <p className="mt-1 font-medium text-gray-900 dark:text-white">
                                        {selectedUser.createdAt ? formatDate(selectedUser.createdAt) : 'Non spécifiée'}
                                    </p>
                                </div>
                            </div>
                        )}

                        <DialogFooter className="flex justify-between sm:justify-between">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsViewModalOpen(false)}
                            >
                                Fermer
                            </Button>
                            <Button
                                type="button"
                                onClick={switchToEditMode}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <Edit className="w-4 h-4 mr-2" />
                                Modifier
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Modal d'édition */}
                <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Modifier l'utilisateur</DialogTitle>
                            <DialogDescription>Modifier les informations de l'utilisateur</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleEditUser} className="space-y-4">
                            {/* Champs existants */}
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
                            {/* Nouveaux champs */}
                            <div>
                                <Label htmlFor="birthDate">Date de naissance</Label>
                                <Input
                                    id="birthDate"
                                    name="birthDate"
                                    type="date"
                                    value={editFormData.birthDate}
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

                {/* Dialogue de création d'utilisateur */}
                <CreateUserDialog
                    open={createDialogOpen}
                    onOpenChange={setCreateDialogOpen}
                    onUserCreated={handleUserCreated}
                />
            </div>
        </PageTransition>
    );
};

export default AdminUserManagement;