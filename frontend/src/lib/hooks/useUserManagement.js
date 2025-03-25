import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { toast } from "sonner";
import apiService from "@/lib/services/apiService";

// Données fictives pour les utilisateurs en cas d'échec de l'API
const mockUsers = [
    {
        id: 1,
        firstName: "Pierre",
        lastName: "Dupont",
        email: "pierre.dupont@example.com",
        roles: [{ id: 1, name: "ROLE_ADMIN" }],
        createdAt: "2023-01-01 10:00:00"
    },
    {
        id: 2,
        firstName: "Marie",
        lastName: "Martin",
        email: "marie.martin@example.com",
        roles: [{ id: 2, name: "ROLE_TEACHER" }],
        createdAt: "2023-01-02 11:00:00"
    },
    {
        id: 3,
        firstName: "Jean",
        lastName: "Dubois",
        email: "jean.dubois@example.com",
        roles: [{ id: 3, name: "ROLE_STUDENT" }],
        createdAt: "2023-01-03 12:00:00"
    },
    {
        id: 4,
        firstName: "Sophie",
        lastName: "Bernard",
        email: "sophie.bernard@example.com",
        roles: [{ id: 4, name: "ROLE_HR" }],
        createdAt: "2023-01-04 13:00:00"
    },
    {
        id: 5,
        firstName: "Michel",
        lastName: "Petit",
        email: "michel.petit@example.com",
        roles: [{ id: 5, name: "ROLE_RECRUITER" }],
        createdAt: "2023-01-05 14:00:00"
    },
    {
        id: 6,
        firstName: "Claire",
        lastName: "Robert",
        email: "claire.robert@example.com",
        roles: [{ id: 6, name: "ROLE_GUEST" }],
        createdAt: "2023-01-06 15:00:00"
    },
    {
        id: 7,
        firstName: "Thomas",
        lastName: "Richard",
        email: "thomas.richard@example.com",
        roles: [{ id: 7, name: "ROLE_SUPERADMIN" }],
        createdAt: "2023-01-07 16:00:00"
    }
];

export function useUserManagement(initialFilter = "ALL") {
    // États pour les données
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedRoleId, setSelectedRoleId] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [filterRole, setFilterRole] = useState(initialFilter);
    const [searchTerm, setSearchTerm] = useState("");
    
    // État pour le tri
    const [sortConfig, setSortConfig] = useState({
        key: 'lastName',
        direction: 'ascending'
    });
    
    // État pour la pagination
    const [pagination, setPagination] = useState({
        currentPage: 1,
        itemsPerPage: 10
    });
    
    // Version simplifiée sans debounce pour éviter les problèmes de synchronisation
    const updateFilterRole = useCallback((newRole) => {
        // Mise à jour synchrone du filtre
        setFilterRole(newRole);
    }, []);
    
    // Charger les données au montage du composant
    useEffect(() => {
        const loadData = async () => {
            await fetchRoles();
            await fetchUsers(filterRole);
        };
        
        loadData();
    }, []);
    
    // Rafraîchir les utilisateurs lorsque le filtre change
    useEffect(() => {
        fetchUsers(filterRole);
    }, [filterRole]);
    
    // Gérer le tri des utilisateurs
    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };
    
    // Récupérer tous les rôles disponibles
    const fetchRoles = async () => {
        try {
            const response = await apiService.getAllRoles();
            if (response.success && response.data) {
                setRoles(response.data);
            } else {
                toast.error("Impossible de récupérer les rôles");
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des rôles:", error);
            toast.error("Erreur lors du chargement des rôles");
        }
    };
    
    // Récupérer les utilisateurs en fonction du rôle sélectionné
    const fetchUsers = async (roleName = "ALL") => {
        setIsLoading(true);
        try {
            let response;
            
            if (roleName === "ALL") {
                // Si "ALL", récupérer tous les utilisateurs
                response = await apiService.get("/users");
            } else {
                // Nettoyer le nom du rôle pour s'assurer qu'il est au bon format
                // S'assurer que le rôle commence par ROLE_
                const formattedRoleName = roleName.startsWith('ROLE_') 
                    ? roleName 
                    : `ROLE_${roleName.replace('ROLE_', '')}`;
                
                // Appel à l'API avec le rôle formaté
                response = await apiService.getUsersByRole(formattedRoleName);
            }
            
            if (response.success && response.data) {
                setUsers(response.data);
            } else {
                console.warn("Réponse de l'API sans succès, utilisation des données fictives");
                // Utiliser les données fictives en cas d'échec
                if (roleName === "ALL") {
                    setUsers(mockUsers);
                } else {
                    const formattedRoleName = roleName.startsWith('ROLE_') 
                        ? roleName 
                        : `ROLE_${roleName.replace('ROLE_', '')}`;
                        
                    // Filtrer les données fictives par rôle
                    const filteredMockUsers = mockUsers.filter(user => 
                        user.roles && user.roles.some(role => 
                            role.name === formattedRoleName || 
                            role.name === formattedRoleName.replace('ROLE_', '') ||
                            'ROLE_' + role.name === formattedRoleName
                        )
                    );
                    
                    setUsers(filteredMockUsers);
                }
                
                toast.error(`Impossible de récupérer les utilisateurs depuis l'API. Affichage des données de démonstration.`);
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des utilisateurs:", error);
            
            // Utiliser les données fictives en cas d'erreur
            if (roleName === "ALL") {
                setUsers(mockUsers);
            } else {
                const formattedRoleName = roleName.startsWith('ROLE_') 
                    ? roleName 
                    : `ROLE_${roleName.replace('ROLE_', '')}`;
                    
                // Filtrer les données fictives par rôle
                const filteredMockUsers = mockUsers.filter(user => 
                    user.roles && user.roles.some(role => 
                        role.name === formattedRoleName || 
                        role.name === formattedRoleName.replace('ROLE_', '') ||
                        'ROLE_' + role.name === formattedRoleName
                    )
                );
                
                setUsers(filteredMockUsers);
            }
            
            toast.error("Erreur lors du chargement des utilisateurs. Affichage des données de démonstration.");
        } finally {
            setIsLoading(false);
        }
    };
    
    // Changer le rôle d'un utilisateur
    const changeUserRole = async (userId, oldRoleName, newRoleName) => {
        setIsProcessing(true);
        
        // Mise à jour optimiste de l'interface utilisateur
        setUsers(prevUsers => prevUsers.map(user => {
            if (user.id === userId) {
                // Créer une copie de l'utilisateur avec le nouveau rôle
                return {
                    ...user,
                    roles: [{ name: newRoleName }]
                };
            }
            return user;
        }));
        
        try {
            const response = await apiService.changeUserRole(userId, oldRoleName, newRoleName);
            if (response.success) {
                toast.success("Rôle modifié avec succès");
                // Pas besoin de rafraîchir toute la liste puisque nous avons déjà mis à jour localement
            } else {
                toast.error("Impossible de modifier le rôle: " + (response.message || "Erreur inconnue"));
                // Recharger les données en cas d'erreur pour revenir à l'état précédent
                fetchUsers(filterRole);
            }
        } catch (error) {
            console.error("Erreur lors de la modification du rôle:", error);
            toast.error("Erreur lors de la modification du rôle");
            // Recharger les données en cas d'erreur pour revenir à l'état précédent
            fetchUsers(filterRole);
        } finally {
            setIsProcessing(false);
            setIsDialogOpen(false);
        }
    };
    
    // Supprimer un utilisateur
    const deleteUser = async (userId) => {
        setIsProcessing(true);
        
        // Sauvegarder l'état actuel au cas où nous aurions besoin de revenir en arrière
        const previousUsers = [...users];
        
        // Mise à jour optimiste de l'interface utilisateur - suppression locale immédiate
        setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
        
        try {
            const response = await apiService.delete(`/users/${userId}`);
            if (response.success) {
                toast.success("Utilisateur supprimé avec succès");
                // Pas besoin de rafraîchir toute la liste puisque nous avons déjà mis à jour localement
            } else {
                // Restaurer l'état précédent en cas d'échec
                setUsers(previousUsers);
                toast.error("Impossible de supprimer l'utilisateur: " + (response.message || "Erreur inconnue"));
            }
        } catch (error) {
            // Restaurer l'état précédent en cas d'erreur
            setUsers(previousUsers);
            console.error("Erreur lors de la suppression de l'utilisateur:", error);
            toast.error("Erreur lors de la suppression de l'utilisateur");
        } finally {
            setIsProcessing(false);
            setIsDeleteDialogOpen(false);
        }
    };
    
    // Mettre à jour un utilisateur
    const updateUser = async (userId, userData, onSuccess) => {
        setIsProcessing(true);
        
        // Mise à jour optimiste de l'interface utilisateur
        setUsers(prevUsers => prevUsers.map(user => {
            if (user.id === userId) {
                return { ...user, ...userData };
            }
            return user;
        }));
        
        try {
            const response = await apiService.updateUser(userId, userData);
            if (response.success) {
                toast.success("Utilisateur mis à jour avec succès");
                // Appeler le callback de succès si fourni
                if (onSuccess) {
                    onSuccess();
                }
                // Pas besoin de rafraîchir toute la liste puisque nous avons déjà mis à jour localement
            } else {
                toast.error("Impossible de mettre à jour l'utilisateur: " + (response.message || "Erreur inconnue"));
                // Recharger les données en cas d'erreur pour revenir à l'état précédent
                fetchUsers(filterRole);
            }
        } catch (error) {
            console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
            toast.error("Erreur lors de la mise à jour de l'utilisateur");
            // Recharger les données en cas d'erreur pour revenir à l'état précédent
            fetchUsers(filterRole);
        } finally {
            setIsProcessing(false);
        }
    };
    
    // Vérifier si un utilisateur a le rôle SuperAdmin
    const userHasSuperAdminRole = (user) => {
        // Vérifier si l'utilisateur et ses rôles existent
        if (!user || !user.roles) {
            return false;
        }
        return user.roles.some(role => 
            role.name === 'SUPERADMIN' || role.name === 'ROLE_SUPERADMIN'
        );
    };
    
    // Trier les utilisateurs
    const sortedUsers = useMemo(() => {
        const sortableUsers = [...users];
        if (sortConfig.key) {
            sortableUsers.sort((a, b) => {
                // Gestion des valeurs null ou undefined
                if (a[sortConfig.key] === null) return 1;
                if (b[sortConfig.key] === null) return -1;
                if (a[sortConfig.key] === undefined) return 1;
                if (b[sortConfig.key] === undefined) return -1;
                
                // Tri des chaînes de caractères (insensible à la casse)
                if (typeof a[sortConfig.key] === 'string') {
                    if (sortConfig.direction === 'ascending') {
                        return a[sortConfig.key].localeCompare(b[sortConfig.key], 'fr', { sensitivity: 'base' });
                    }
                    return b[sortConfig.key].localeCompare(a[sortConfig.key], 'fr', { sensitivity: 'base' });
                }
                
                // Tri des dates
                if (a[sortConfig.key] instanceof Date && b[sortConfig.key] instanceof Date) {
                    if (sortConfig.direction === 'ascending') {
                        return a[sortConfig.key] - b[sortConfig.key];
                    }
                    return b[sortConfig.key] - a[sortConfig.key];
                }
                
                // Tri par défaut
                if (sortConfig.direction === 'ascending') {
                    return a[sortConfig.key] > b[sortConfig.key] ? 1 : -1;
                }
                return a[sortConfig.key] < b[sortConfig.key] ? 1 : -1;
            });
        }
        return sortableUsers;
    }, [users, sortConfig]);
    
    // Filtrer les utilisateurs par terme de recherche
    const filteredUsers = useMemo(() => {
        if (!searchTerm.trim()) return sortedUsers;
        
        return sortedUsers.filter(user => {
            const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
            const email = user.email.toLowerCase();
            const term = searchTerm.toLowerCase();
            
            return fullName.includes(term) || email.includes(term);
        });
    }, [sortedUsers, searchTerm]);
    
    // Calculer les utilisateurs à afficher (pagination)
    const paginatedUsers = useMemo(() => {
        const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
        return filteredUsers.slice(startIndex, startIndex + pagination.itemsPerPage);
    }, [filteredUsers, pagination]);
    
    // Gérer le changement de page
    const handlePageChange = (newPage) => {
        setPagination(prev => ({
            ...prev,
            currentPage: newPage
        }));
    };
    
    // Afficher la boîte de dialogue de changement de rôle
    const openChangeRoleDialog = (user) => {
        setSelectedUser(user);
        setSelectedRoleId(null); // Réinitialiser la sélection
        setIsDialogOpen(true);
    };
    
    // Afficher la boîte de dialogue de suppression
    const openDeleteDialog = (user) => {
        setSelectedUser(user);
        setIsDeleteDialogOpen(true);
    };

    return {
        users,
        roles,
        isLoading,
        selectedUser,
        selectedRoleId,
        isDialogOpen,
        isDeleteDialogOpen,
        isProcessing,
        filterRole,
        searchTerm,
        sortConfig,
        pagination,
        paginatedUsers,
        filteredUsers,
        fetchUsers,
        changeUserRole,
        deleteUser,
        updateUser,
        userHasSuperAdminRole,
        handleSort,
        setSearchTerm,
        setFilterRole: updateFilterRole,
        handlePageChange,
        openChangeRoleDialog,
        openDeleteDialog,
        setSelectedUser,
        setSelectedRoleId,
        setIsDialogOpen,
        setIsDeleteDialogOpen
    };
} 