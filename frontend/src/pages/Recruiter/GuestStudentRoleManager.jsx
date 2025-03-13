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
import { ArrowUp, ArrowDown, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";

// Configuration de la base URL pour l'API (uniquement pour ce composant)
const API_URL = '/api/user-roles';

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
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [displayedUsers, setDisplayedUsers] = useState([]);
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
        totalPages: 1,
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
            console.log(`Tentative de récupération des utilisateurs avec le rôle: ${roleName}`);
            const response = await axiosInstance.get(`/users/${roleName}`);
            
            if (response.status === 200 && response.data && response.data.success) {
                console.log(`Utilisateurs récupérés pour ${roleName}:`, response.data.data);
                
                if (roleName.toLowerCase().includes('guest')) {
                    setGuestUsers(response.data.data);
                } else if (roleName.toLowerCase().includes('student')) {
                    setStudentUsers(response.data.data);
                }
                return response.data.data;
            } else {
                console.error(`Erreur dans la réponse pour ${roleName}:`, response);
                toast.error(`Erreur lors du chargement des utilisateurs ${roleName}`);
                return [];
            }
        } catch (error) {
            console.error(`Erreur lors du chargement des utilisateurs ${roleName}:`, error);
            console.log({
                message: `Erreur API (GET): /users/${roleName}`,
                error: error,
                url: `${API_URL}/users/${roleName}`
            });
            toast.error(`Erreur lors du chargement des utilisateurs ${roleName}`);
            return [];
        }
    }, []);

    // Rôles par défaut en cas d'erreur
    const defaultRoles = [
        { id: 1, name: 'ROLE_GUEST', description: 'Utilisateur invité' },
        { id: 2, name: 'ROLE_STUDENT', description: 'Élève' }
    ];

    // Fonction pour récupérer les rôles disponibles
    const fetchRoles = useCallback(async () => {
        try {
            console.log("Tentative de récupération des rôles...");
            const response = await axiosInstance.get('/roles');
            
            if (response.status === 200 && response.data && response.data.success) {
                console.log("Rôles récupérés:", response.data.data);
                setRoles(response.data.data);
                return response.data.data;
            } else {
                console.error("Erreur dans la réponse des rôles:", response);
                toast.error("Erreur lors du chargement des rôles");
                return [];
            }
        } catch (error) {
            console.error("Erreur lors du chargement des rôles:", error);
            console.log({
                message: "Erreur API (GET): /roles",
                error: error,
                url: `${API_URL}/roles`
            });
            toast.error("Erreur lors du chargement des rôles");
            return [];
        }
    }, []);

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
            const response = await axiosInstance.post(`/change-role`, {
                userId: selectedUser.id,
                oldRoleName: currentRoleName,
                newRoleName: newRoleName
            });
            
            console.log("Réponse du changement de rôle:", response);
            
            if (response.status === 200 && response.data && response.data.success) {
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

    // Charger les données initiales
    useEffect(() => {
        async function loadInitialData() {
            setIsLoading(true);
            
            try {
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
                    setGuestUsers([]);
                    if (selectedRoles.student) {
                        setStudentUsers([]);
                    }
                }
            } catch (error) {
                console.error("Erreur lors du chargement initial:", error);
                
                // Utiliser les données de secours en cas d'erreur
                console.warn("Utilisation des données de secours suite à une erreur");
                setGuestUsers([]);
                if (selectedRoles.student) {
                    setStudentUsers([]);
                }
            } finally {
                setIsLoading(false);
            }
        }
        
        loadInitialData();
    }, [fetchRoles, fetchUsersByRole, selectedRoles.student]);

    // Effet pour filtrer les utilisateurs en fonction des filtres de rôle sélectionnés
    useEffect(() => {
        // Recalculer la liste des utilisateurs en fonction des filtres sélectionnés
        const newFilteredUsers = [];
        
        if (selectedRoles.guest) {
            newFilteredUsers.push(...guestUsers);
        }
        
        if (selectedRoles.student) {
            newFilteredUsers.push(...studentUsers);
        }
        
        // Appliquer le tri
        const sortedUsers = [...newFilteredUsers].sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
        
        setFilteredUsers(sortedUsers);
        
        // Recalculer la pagination
        const newTotalPages = Math.ceil(sortedUsers.length / pagination.itemsPerPage);
        setPagination(prev => ({
            ...prev,
            currentPage: prev.currentPage > newTotalPages ? 1 : prev.currentPage,
            totalPages: newTotalPages
        }));
    }, [guestUsers, studentUsers, selectedRoles, sortConfig]);

    // Mettre à jour la liste des utilisateurs lorsque la pagination change
    useEffect(() => {
        const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
        const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pagination.itemsPerPage);
        setDisplayedUsers(paginatedUsers);
    }, [filteredUsers, pagination.currentPage, pagination.itemsPerPage]);

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
        if (pagination.totalPages <= 1) return null;
        
        const pageItems = [];
        const maxPages = 5; // Nombre maximal de liens de page à afficher
        
        let startPage = Math.max(1, pagination.currentPage - Math.floor(maxPages / 2));
        let endPage = Math.min(pagination.totalPages, startPage + maxPages - 1);
        
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
            <div key="next" className="cursor-pointer" onClick={() => handlePageChange(Math.min(pagination.totalPages, pagination.currentPage + 1))}>
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
                                    onCheckedChange={() => handleRoleFilterChange('guest')}
                                />
                                <Label htmlFor="guest-filter">Invités</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox 
                                    id="student-filter" 
                                    checked={selectedRoles.student}
                                    onCheckedChange={() => handleRoleFilterChange('student')}
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
                                    setPagination(prev => ({
                                        ...prev,
                                        itemsPerPage: Number(e.target.value),
                                        currentPage: 1
                                    }));
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
                        <div className="text-center py-4">Chargement des utilisateurs...</div>
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
                                    {displayedUsers.map(user => (
                                        <TableRow key={user.id}>
                                            <TableCell>{user.lastName}</TableCell>
                                            <TableCell>{user.firstName}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                {user.roles.map(role => {
                                                    // Remplacer les noms techniques par des badges colorés
                                                    if (role.name === "ROLE_GUEST") {
                                                        return <Badge variant="guest" key={role.name}>Invité</Badge>;
                                                    }
                                                    if (role.name === "ROLE_STUDENT") {
                                                        return <Badge variant="student" key={role.name}>Élève</Badge>;
                                                    }
                                                    return <Badge key={role.name}>{role.name}</Badge>;
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
                                        selectedUser.roles.some(role => role.name.toLowerCase().includes('guest'))
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
                                    const roleName = selectedUser.roles.find(
                                        role => role.name.toLowerCase().includes('guest') || 
                                              role.name.toLowerCase().includes('student')
                                    )?.name || '';
                                    
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
                                        const newRoleName = selectedUser.roles.some(role => role.name.toLowerCase().includes('guest'))
                                            ? roles.find(r => r.name.toLowerCase().includes('student'))?.name
                                            : roles.find(r => r.name.toLowerCase().includes('guest'))?.name;
                                            
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
                            onClick={handleRoleChange}
                            disabled={isProcessing}
                        >
                            {isProcessing ? "Modification en cours..." : (
                                selectedUser?.roles.some(role => role.name.toLowerCase().includes('guest'))
                                ? "Promouvoir en élève"
                                : "Rétrograder en invité"
                            )}
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
    
    // Fonction pour gérer le changement de page
    function handlePageChange(pageNumber) {
        setPagination(prev => ({
            ...prev,
            currentPage: pageNumber
        }));
    }
}
