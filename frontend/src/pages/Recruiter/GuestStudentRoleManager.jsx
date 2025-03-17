import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";
import authService from '@/lib/services/authService';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, ChevronLeft, ChevronRight, MoreHorizontal, Loader2 } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";

// Configuration de la base URL pour l'API (uniquement pour ce composant)
const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Définition des endpoints spécifiques
const ENDPOINTS = {
    ROLES: '/user-roles/roles',
    USERS_BY_ROLE: (role) => `/user-roles/users/${role}`,
    CHANGE_ROLE: '/user-roles/change-role'
};

// Configuration d'Axios (spécifique à ce composant)
const axiosInstance = axios.create({
    baseURL: API_URL
});

// Ajout d'un intercepteur pour gérer l'authentification
axiosInstance.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export default function GuestStudentRoleManager() {
    // État pour stocker les utilisateurs et les rôles
    const [guestUsers, setGuestUsers] = useState([]);
    const [studentUsers, setStudentUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedRoles, setSelectedRoles] = useState({
        guest: true,
        student: false
    });
    
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
    
    // Données utilisateurs par défaut en cas d'erreur
    const defaultUsers = {
        guest: [
            { 
                id: 1, 
                firstName: 'Jean', 
                lastName: 'Dupont', 
                email: 'jean.dupont@exemple.fr',
                roles: [{ id: 1, name: 'ROLE_GUEST' }]
            },
            { 
                id: 2, 
                firstName: 'Marie', 
                lastName: 'Martin', 
                email: 'marie.martin@exemple.fr',
                roles: [{ id: 1, name: 'ROLE_GUEST' }]
            }
        ],
        student: [
            { 
                id: 3, 
                firstName: 'Pierre', 
                lastName: 'Leroy', 
                email: 'pierre.leroy@exemple.fr',
                roles: [{ id: 2, name: 'ROLE_STUDENT' }]
            },
            { 
                id: 4, 
                firstName: 'Sophie', 
                lastName: 'Bernard', 
                email: 'sophie.bernard@exemple.fr',
                roles: [{ id: 2, name: 'ROLE_STUDENT' }]
            }
        ]
    };

    // Fonction pour déterminer le rôle actuel d'un utilisateur
    const getCurrentRole = (user) => {
        return user.roles.find(role => 
            role.name.toLowerCase().includes('guest') || 
            role.name.toLowerCase().includes('student')
        )?.name || '';
    };
    
    // Fonction pour déterminer le nouveau rôle d'un utilisateur
    const getNewRole = (user) => {
        const currentRoleName = getCurrentRole(user);
        return currentRoleName.toLowerCase().includes('guest') 
            ? roles.find(r => r.name.toLowerCase().includes('student'))?.name
            : roles.find(r => r.name.toLowerCase().includes('guest'))?.name;
    };
    
    // Fonction pour charger les utilisateurs selon leur rôle
    const fetchUsersByRole = useCallback(async (roleName) => {
        try {
            console.log(`Tentative de récupération des utilisateurs pour ${roleName}...`);
            
            // Vérifier si nous avons déjà des utilisateurs en cache pour ce rôle
            if (roleName.toLowerCase().includes('guest') && guestUsers.length > 0) {
                console.log(`Utilisation des utilisateurs en cache pour ${roleName}:`, guestUsers);
                return guestUsers;
            } else if (roleName.toLowerCase().includes('student') && studentUsers.length > 0) {
                console.log(`Utilisation des utilisateurs en cache pour ${roleName}:`, studentUsers);
                return studentUsers;
            }
            
            const response = await axiosInstance.get(ENDPOINTS.USERS_BY_ROLE(roleName));
            
            if (response.status === 200 && response.data) {
                // Adapter la structure de la réponse en fonction du format
                let users = [];
                
                if (response.data.success && response.data.data) {
                    // Format standard de notre API
                    users = response.data.data;
                } else if (Array.isArray(response.data)) {
                    // Format tableau direct
                    users = response.data;
                } else if (response.data.data || response.data.users) {
                    // Autres formats possibles
                    users = response.data.data || response.data.users;
                } else if (response.data.hydra && response.data['hydra:member']) {
                    // Format API Platform
                    users = response.data['hydra:member'];
                }
                
                console.log(`Utilisateurs récupérés pour ${roleName}:`, users);
                
                if (roleName.toLowerCase().includes('guest')) {
                    setGuestUsers(users);
                } else if (roleName.toLowerCase().includes('student')) {
                    setStudentUsers(users);
                }
                return users;
            } else {
                throw new Error(`Format de réponse incorrect pour ${roleName}`);
            }
        } catch (error) {
            console.log(`Erreur lors de la récupération des utilisateurs ${roleName}:`, error);
            toast.error(`Erreur lors du chargement des utilisateurs ${roleName}`);
            
            // Utiliser des données de secours en cas d'erreur
            const defaultUsers = {
                'ROLE_GUEST': [
                    { 
                        id: 1, 
                        firstName: 'Jean', 
                        lastName: 'Dupont', 
                        email: 'jean.dupont@exemple.fr',
                        roles: [{ id: 1, name: 'ROLE_GUEST' }]
                    },
                    { 
                        id: 2, 
                        firstName: 'Marie', 
                        lastName: 'Martin', 
                        email: 'marie.martin@exemple.fr',
                        roles: [{ id: 1, name: 'ROLE_GUEST' }]
                    }
                ],
                'ROLE_STUDENT': [
                    { 
                        id: 3, 
                        firstName: 'Pierre', 
                        lastName: 'Leroy', 
                        email: 'pierre.leroy@exemple.fr',
                        roles: [{ id: 2, name: 'ROLE_STUDENT' }]
                    },
                    { 
                        id: 4, 
                        firstName: 'Sophie', 
                        lastName: 'Bernard', 
                        email: 'sophie.bernard@exemple.fr',
                        roles: [{ id: 2, name: 'ROLE_STUDENT' }]
                    }
                ]
            };
            
            // Déterminer quelles données de secours utiliser
            const roleKey = Object.keys(defaultUsers).find(key => 
                key.toLowerCase().includes(roleName.toLowerCase())
            ) || 'ROLE_GUEST';
            
            console.log(`Utilisation des données par défaut pour ${roleName}:`, defaultUsers[roleKey]);
            
            if (roleName.toLowerCase().includes('guest')) {
                setGuestUsers(defaultUsers[roleKey]);
            } else if (roleName.toLowerCase().includes('student')) {
                setStudentUsers(defaultUsers[roleKey]);
            }
            
            return defaultUsers[roleKey];
        }
    }, [guestUsers.length, studentUsers.length]);

    // Fonction pour charger les rôles
    const fetchRoles = async () => {
        try {
            console.log("Tentative de récupération des rôles...");
            
            // Vérifier si nous avons déjà des rôles en cache
            if (roles && roles.length > 0) {
                console.log("Utilisation des rôles en cache:", roles);
                return roles;
            }
            
            const response = await axiosInstance.get(ENDPOINTS.ROLES);
            
            if (response.status === 200 && response.data) {
                // Adapter la structure de la réponse en fonction du format
                let rolesData = [];
                
                if (response.data.success && response.data.data) {
                    // Format standard de notre API
                    rolesData = response.data.data;
                } else if (Array.isArray(response.data)) {
                    // Format tableau direct
                    rolesData = response.data;
                } else if (response.data.data || response.data.roles) {
                    // Autres formats possibles
                    rolesData = response.data.data || response.data.roles;
                } else if (response.data.hydra && response.data['hydra:member']) {
                    // Format API Platform
                    rolesData = response.data['hydra:member'];
                }
                
                console.log("Rôles récupérés:", rolesData);
                setRoles(rolesData);
                return rolesData;
            } else {
                throw new Error("Format de réponse incorrect");
            }
        } catch (error) {
            console.log("Erreur lors du chargement des rôles:", error);
            toast.error("Erreur lors du chargement des rôles");
            
            // Utiliser des rôles par défaut en cas d'erreur
            const defaultRolesList = [
                { id: 1, name: 'ROLE_GUEST' },
                { id: 2, name: 'ROLE_STUDENT' },
                { id: 3, name: 'ROLE_RECRUITER' },
                { id: 4, name: 'ROLE_ADMIN' }
            ];
            
            console.log("Utilisation des rôles par défaut:", defaultRolesList);
            setRoles(defaultRolesList);
            return defaultRolesList;
        }
    };

    // Fonction pour changer le rôle d'un utilisateur
    const handleRoleChange = useCallback(async () => {
        if (!selectedUser) return;

        const currentRoleName = getCurrentRole(selectedUser);
        const newRoleName = getNewRole(selectedUser);
        
        console.log("Changement de rôle pour l'utilisateur:", selectedUser);
        console.log("Rôle actuel:", currentRoleName);
        console.log("Nouveau rôle:", newRoleName);
        
        try {
            setIsProcessing(true);
            
            // Appel à l'API pour changer le rôle
            const response = await axiosInstance.post(ENDPOINTS.CHANGE_ROLE, {
                userId: selectedUser.id,
                oldRoleName: currentRoleName,
                newRoleName: newRoleName
            });
            
            console.log("Réponse du changement de rôle:", response);
            
            // Vérifier si la réponse est valide (différentes structures possibles)
            if (response.status >= 200 && response.status < 300) {
                // Mise à jour locale de l'utilisateur
                if (currentRoleName.toLowerCase().includes('guest')) {
                    // Supprimer l'utilisateur des invités et l'ajouter aux étudiants
                    setGuestUsers(prev => prev.filter(u => u.id !== selectedUser.id));
                    const newRole = roles.find(r => r.name.toLowerCase().includes('student'));
                    setStudentUsers(prev => [...prev, {
                        ...selectedUser,
                        roles: [{ id: newRole.id, name: newRole.name }]
                    }]);
                    toast.success(`${selectedUser.firstName} ${selectedUser.lastName} a été promu en élève`);
                } else {
                    // Supprimer l'utilisateur des étudiants et l'ajouter aux invités
                    setStudentUsers(prev => prev.filter(u => u.id !== selectedUser.id));
                    const newRole = roles.find(r => r.name.toLowerCase().includes('guest'));
                    setGuestUsers(prev => [...prev, {
                        ...selectedUser,
                        roles: [{ id: newRole.id, name: newRole.name }]
                    }]);
                    toast.success(`${selectedUser.firstName} ${selectedUser.lastName} a été rétrogradé en invité`);
                }
                setIsDialogOpen(false);
            } else {
                toast.error("Erreur lors de la modification du rôle");
            }
        } catch (error) {
            console.error("Erreur lors du changement de rôle:", error);
            toast.error("Erreur lors de la modification du rôle");
        } finally {
            setIsProcessing(false);
        }
    }, [selectedUser, roles]);

    // Fonction pour gérer le changement de sélection de rôle
    const handleRoleToggle = useCallback((role) => {
        // Mise à jour de la sélection
        setSelectedRoles(prev => ({
            ...prev,
            [role]: !prev[role]
        }));
        
        // Réinitialiser la pagination
        setPagination(prev => ({
            ...prev,
            currentPage: 1
        }));
        
        // Chargement des étudiants si nécessaire (une seule fois)
        if (role === 'student' && !selectedRoles.student && studentUsers.length === 0) {
            setIsLoading(true);
            fetchUsersByRole(roles.find(r => r.name.toLowerCase().includes('student'))?.name || 'ROLE_STUDENT')
                .finally(() => setIsLoading(false));
        }
    }, [selectedRoles, studentUsers.length, roles, fetchUsersByRole]);

    // Effet pour charger les données au chargement du composant
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                // Récupérer l'utilisateur courant pour vérifier son rôle
                const currentUser = authService.getUser();
                console.log("Utilisateur courant:", currentUser);
                
                // Vérifier si l'utilisateur est un recruteur ou un administrateur
                const isRecruiter = currentUser?.roles?.some(role => 
                    typeof role === 'string' 
                        ? role.toLowerCase().includes('recruiter')
                        : (role.name || role.role || '').toLowerCase().includes('recruiter')
                );
                
                const isAdmin = currentUser?.roles?.some(role => 
                    typeof role === 'string' 
                        ? (role.toLowerCase().includes('admin') || role.toLowerCase().includes('superadmin'))
                        : (role.name || role.role || '').toLowerCase().includes('admin')
                );
                
                console.log("Est recruteur:", isRecruiter);
                console.log("Est administrateur:", isAdmin);
                
                // Récupérer les rôles
                console.log("Chargement des rôles...");
                const loadedRoles = await fetchRoles();
                
                // Si les rôles ont été chargés
                if (loadedRoles && loadedRoles.length > 0) {
                    // Trouver les rôles invité et étudiant
                    const guestRole = loadedRoles.find(r => r.name.toLowerCase().includes('guest'));
                    const studentRole = loadedRoles.find(r => r.name.toLowerCase().includes('student'));
                    
                    // Charger les utilisateurs invités (toujours affiché par défaut)
                    if (guestRole) {
                        console.log("Chargement des invités...");
                        await fetchUsersByRole(guestRole.name);
                    } else {
                        console.warn("Rôle invité non trouvé");
                        setGuestUsers([]);
                    }
                    
                    // Charger les étudiants si le filtre est activé
                    if (studentRole && selectedRoles.student) {
                        console.log("Chargement des étudiants...");
                        await fetchUsersByRole(studentRole.name);
                    } else if (selectedRoles.student) {
                        console.warn("Rôle étudiant non trouvé");
                        setStudentUsers([]);
                    }
                } else {
                    // Utiliser les données de secours si aucun rôle n'a été chargé
                    console.warn("Aucun rôle chargé");
                    setGuestUsers(defaultUsers.guest);
                    if (selectedRoles.student) {
                        setStudentUsers(defaultUsers.student);
                    }
                }
            } catch (error) {
                console.error("Erreur lors du chargement des données:", error);
                toast.error("Erreur lors du chargement des données");
                
                // Utiliser les données de secours en cas d'erreur
                setGuestUsers(defaultUsers.guest);
                if (selectedRoles.student) {
                    setStudentUsers(defaultUsers.student);
                }
            } finally {
                setIsLoading(false);
            }
        };
        
        // Éviter les rechargements en boucle
        let loadTimeout = null;
        
        // Utiliser un délai pour éviter les rechargements trop fréquents
        if (!isLoading) {
            loadTimeout = setTimeout(() => {
                loadData();
            }, 500);
        }
        
        return () => {
            if (loadTimeout) {
                clearTimeout(loadTimeout);
            }
        };
    }, [selectedRoles.student]); // Ne recharger que lorsque le filtre étudiant change

    // Mémoisation des utilisateurs filtrés pour éviter les recalculs inutiles
    const filteredUsers = useMemo(() => {
        console.log("Recalcul des utilisateurs filtrés...");
        const newFilteredUsers = [];
        
        if (selectedRoles.guest) {
            newFilteredUsers.push(...guestUsers);
        }
        
        if (selectedRoles.student) {
            newFilteredUsers.push(...studentUsers);
        }
        
        // Appliquer le tri
        return [...newFilteredUsers].sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
    }, [guestUsers, studentUsers, selectedRoles, sortConfig]);
    
    // Mémoisation des utilisateurs paginés pour éviter les recalculs inutiles
    const currentUsers = useMemo(() => {
        const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
        const endIndex = startIndex + pagination.itemsPerPage;
        return filteredUsers.slice(startIndex, endIndex);
    }, [filteredUsers, pagination.currentPage, pagination.itemsPerPage]);

    // Mémoisation du nombre total de pages
    const totalPages = useMemo(() => {
        return Math.ceil(filteredUsers.length / pagination.itemsPerPage);
    }, [filteredUsers.length, pagination.itemsPerPage]);

    // Fonction pour ouvrir la boîte de dialogue de changement de rôle
    const openChangeRoleDialog = (user) => {
        setSelectedUser(user);
        setIsDialogOpen(true);
    };
    
    // Fonction pour gérer le changement de filtre de rôle
    const handleRoleFilterChange = (roleName) => {
        setSelectedRoles(prev => ({
            ...prev,
            [roleName]: !prev[roleName]
        }));
    };
    
    // Fonction pour générer l'icône de tri
    const getSortIcon = (key) => {
        if (sortConfig.key !== key) {
            return <MoreHorizontal className="w-4 h-4 ml-1" />;
        }
        return sortConfig.direction === 'ascending' 
            ? <ArrowUp className="w-4 h-4 ml-1" /> 
            : <ArrowDown className="w-4 h-4 ml-1" />;
    };
    
    // Fonction pour déterminer le texte du bouton de changement de rôle
    const getChangeRoleButtonText = (user) => {
        // Déterminer le nouveau rôle
        const currentRoleName = user.roles.find(
            role => role.name.toLowerCase().includes('guest') || 
                   role.name.toLowerCase().includes('student')
        )?.name || '';
        
        if (currentRoleName.toLowerCase().includes('guest')) {
            return "Promouvoir en élève";
        } else if (currentRoleName.toLowerCase().includes('student')) {
            return "Rétrograder en invité";
        }
        
        return "Changer le rôle";
    };

    // Rendu de la pagination
    const renderPagination = () => {
        if (totalPages <= 1) return null;
        
        const pageItems = [];
        const maxPages = 5; // Nombre maximal de liens de page à afficher
        
        let startPage = Math.max(1, pagination.currentPage - Math.floor(maxPages / 2));
        let endPage = Math.min(totalPages, startPage + maxPages - 1);
        
        if (endPage - startPage + 1 < maxPages) {
            startPage = Math.max(1, endPage - maxPages + 1);
        }
        
        // Bouton précédent
        pageItems.push(
            <div key="prev" className="cursor-pointer" onClick={() => handlePageChange(Math.max(1, pagination.currentPage - 1))}>
                <ChevronLeft className="w-4 h-4" />
            </div>
        );
        
        // Pages
        for (let i = startPage; i <= endPage; i++) {
            pageItems.push(
                <div 
                    key={i}
                    className={`cursor-pointer px-3 py-1 rounded-md ${pagination.currentPage === i ? 'bg-gray-200' : ''}`}
                    onClick={() => handlePageChange(i)}
                >
                    {i}
                </div>
            );
        }
        
        // Bouton suivant
        pageItems.push(
            <div key="next" className="cursor-pointer" onClick={() => handlePageChange(Math.min(totalPages, pagination.currentPage + 1))}>
                <ChevronRight className="w-4 h-4" />
            </div>
        );
        
        return (
            <div className="flex space-x-2 mt-4">
                {pageItems}
            </div>
        );
    };

    // Options par page pour la pagination
    const itemsPerPageOptions = [10, 25, 50, 100];

    // Fonction pour gérer le changement de page
    const handlePageChange = (newPage) => {
        setPagination({
            ...pagination,
            currentPage: newPage
        });
    };

    return (
        <div className="container mx-auto p-4">
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Gestion des rôles Invité/Élève</CardTitle>
                    <CardDescription>
                        Gérez la promotion des invités en élèves et la rétrogradation des élèves en invités
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                        <div className="flex space-x-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox 
                                    id="guest-filter" 
                                    checked={selectedRoles.guest}
                                    onCheckedChange={() => handleRoleToggle('guest')}
                                />
                                <Label htmlFor="guest-filter">Invités</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox 
                                    id="student-filter" 
                                    checked={selectedRoles.student}
                                    onCheckedChange={() => handleRoleToggle('student')}
                                />
                                <Label htmlFor="student-filter">Élèves</Label>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                            <Label htmlFor="items-per-page">Éléments par page:</Label>
                            <select
                                id="items-per-page"
                                className="p-2 border rounded-md"
                                value={pagination.itemsPerPage}
                                onChange={(e) => {
                                    setPagination({
                                        ...pagination,
                                        itemsPerPage: Number(e.target.value),
                                        currentPage: 1
                                    });
                                }}
                            >
                                {itemsPerPageOptions.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                            <div className="text-sm text-gray-500">
                                Affichage de {Math.min(filteredUsers.length, 1 + (pagination.currentPage - 1) * pagination.itemsPerPage)}-
                                {Math.min(filteredUsers.length, pagination.currentPage * pagination.itemsPerPage)} 
                                sur {filteredUsers.length} utilisateurs
                            </div>
                        </div>
                    </div>
                    
                    {isLoading ? (
                        <div className="text-center py-8 flex justify-center">
                            <Loader2 className="w-8 h-8 text-gray-500 animate-spin" />
                        </div>
                    ) : (
                        <div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="cursor-pointer" onClick={() => handleSort('lastName')}>
                                            <div className="flex items-center">
                                                Nom
                                                {getSortIcon('lastName')}
                                            </div>
                                        </TableHead>
                                        <TableHead className="cursor-pointer" onClick={() => handleSort('firstName')}>
                                            <div className="flex items-center">
                                                Prénom
                                                {getSortIcon('firstName')}
                                            </div>
                                        </TableHead>
                                        <TableHead className="cursor-pointer" onClick={() => handleSort('email')}>
                                            <div className="flex items-center">
                                                Email
                                                {getSortIcon('email')}
                                            </div>
                                        </TableHead>
                                        <TableHead>Rôles actuels</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentUsers.map(user => (
                                        <TableRow key={user.id}>
                                            <TableCell>{user.lastName}</TableCell>
                                            <TableCell>{user.firstName}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                {user.roles.map(role => {
                                                    // Remplacer les noms techniques par des badges colorés en français
                                                    if (role.name === "ROLE_GUEST" || role.name === "GUEST") {
                                                        return <Badge variant="guest" key={role.id || role.name}>Invité</Badge>;
                                                    }
                                                    if (role.name === "ROLE_STUDENT" || role.name === "STUDENT") {
                                                        return <Badge variant="student" key={role.id || role.name}>Élève</Badge>;
                                                    }
                                                    return <Badge key={role.id || role.name}>{role.name}</Badge>;
                                                })}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button 
                                                    variant="outline"
                                                    onClick={() => openChangeRoleDialog(user)}
                                                    className="w-52 text-center"
                                                >
                                                    {getChangeRoleButtonText(user)}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            
                            {renderPagination()}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Boîte de dialogue pour changer le rôle */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Changement de rôle</DialogTitle>
                        <DialogDescription>
                            {selectedUser && (
                                <p>
                                    Vous êtes sur le point de {
                                        getCurrentRole(selectedUser).toLowerCase().includes('guest')
                                        ? "promouvoir"
                                        : "rétrograder"
                                    } <strong>{selectedUser.firstName} {selectedUser.lastName}</strong>.
                                </p>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        {selectedUser && (
                            <p>
                                Rôle actuel : <strong>{(() => {
                                    const roleName = getCurrentRole(selectedUser);
                                    
                                    if (roleName === "ROLE_GUEST") return "Invité";
                                    if (roleName === "ROLE_STUDENT") return "Élève";
                                    return roleName;
                                })()}</strong>
                            </p>
                        )}
                        {selectedUser && (
                            <p className="mt-2">
                                Nouveau rôle : <strong>
                                    {(() => {
                                        const newRoleName = getNewRole(selectedUser);
                                            
                                        if (newRoleName === "ROLE_GUEST") return "Invité";
                                        if (newRoleName === "ROLE_STUDENT") return "Élève";
                                        return newRoleName || '';
                                    })()}
                                </strong>
                            </p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Annuler
                        </Button>
                        <Button 
                            disabled={isProcessing} 
                            onClick={handleRoleChange}
                        >
                            {isProcessing ? 
                                'Traitement en cours...' : 
                                selectedUser && getCurrentRole(selectedUser).toLowerCase().includes('guest') ?
                                    'Promouvoir en élève' : 'Rétrograder en invité'
                            }
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
    
    // Fonction pour gérer le tri des utilisateurs
    function handleSort(key) {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    }
}
