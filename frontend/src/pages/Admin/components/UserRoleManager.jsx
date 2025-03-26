import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import {
    Card,
    CardContent,
    CardDescription,
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
import { Badge } from "@/components/ui/badge";
import { 
    ArrowUp, 
    ArrowDown, 
    ChevronLeft, 
    ChevronRight, 
    Loader2,
    Filter,
    MoreVertical
} from "lucide-react";
import { 
    Select, 
    SelectContent, 
    SelectGroup, 
    SelectItem, 
    SelectLabel, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DashboardLayout from "@/components/DashboardLayout";
import { Pagination } from "@/components/ui/pagination";
import apiService from "@/lib/services/apiService";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { getFrenchRoleDisplayName, getRoleColor } from "@/lib/utils/roleDisplay.jsx";
import ConvertCsv from "@/components/ConvertCsv"; // Importation sans accolades


export default function UserRoleManager() {
    // États pour les données
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedRoleId, setSelectedRoleId] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [filterRole, setFilterRole] = useState("ALL");
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
            if (roleName === "ALL") {
                // Si "ALL", récupérer tous les utilisateurs
                const response = await apiService.get("/users");
                if (response.success && response.data) {
                    setUsers(response.data);
                } else {
                    toast.error("Impossible de récupérer les utilisateurs");
                }
            } else {
                // Sinon, récupérer les utilisateurs par rôle spécifique
                const response = await apiService.getUsersByRole(roleName);
                if (response.success && response.data) {
                    setUsers(response.data);
                } else {
                    toast.error(`Impossible de récupérer les utilisateurs avec le rôle ${roleName}`);
                }
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des utilisateurs:", error);
            toast.error("Erreur lors du chargement des utilisateurs");
        } finally {
            setIsLoading(false);
        }
    };
    // Changer le rôle d'un utilisateur
    const changeUserRole = async (userId, oldRoleName, newRoleName) => {
        setIsProcessing(true);
        try {
            const response = await apiService.changeUserRole(userId, oldRoleName, newRoleName);
            if (response.success) {
                toast.success("Rôle modifié avec succès");
                fetchUsers(filterRole); // Rafraîchir la liste
            } else {
                toast.error("Impossible de modifier le rôle: " + (response.message || "Erreur inconnue"));
            }
        } catch (error) {
            console.error("Erreur lors de la modification du rôle:", error);
            toast.error("Erreur lors de la modification du rôle");
        } finally {
            setIsProcessing(false);
            setIsDialogOpen(false);
        }
    };
    
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
    
    // Obtenir une icône de tri en fonction de la configuration
    const getSortIcon = (key) => {
        if (sortConfig.key === key) {
            if (sortConfig.direction === 'ascending') {
                return <ArrowUp className="w-4 h-4 ml-1" />;
            }
            return <ArrowDown className="w-4 h-4 ml-1" />;
        }
        return null;
    };
    
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
        setIsDialogOpen(true);
    };
    
    // Rendre le composant de pagination
    const renderPagination = () => {
        const totalPages = Math.ceil(filteredUsers.length / pagination.itemsPerPage);
        if (totalPages <= 1) return null;
        
        const currentPage = pagination.currentPage;
        
        // Limiter le nombre de boutons de page affichés
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);
        
        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }
        
        const pageButtons = [];
        for (let i = startPage; i <= endPage; i++) {
            pageButtons.push(
                <Button
                    key={i}
                    variant={i === currentPage ? "default" : "outline"}
                    size="icon"
                    onClick={() => handlePageChange(i)}
                    className="w-9 h-9"
                >
                    {i}
                </Button>
            );
        }
        
        return (
            <Pagination className="mt-4 flex justify-center">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="mr-1"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                
                {startPage > 1 && (
                    <>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handlePageChange(1)}
                            className="w-9 h-9"
                        >
                            1
                        </Button>
                        {startPage > 2 && <span className="mx-1 self-center">...</span>}
                    </>
                )}
                
                {pageButtons}
                
                {endPage < totalPages && (
                    <>
                        {endPage < totalPages - 1 && <span className="mx-1 self-center">...</span>}
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handlePageChange(totalPages)}
                            className="w-9 h-9"
                        >
                            {totalPages}
                        </Button>
                    </>
                )}
                
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="ml-1"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </Pagination>
        );
    };
    
    return (
        <DashboardLayout 
            headerTitle="Gestion des rôles utilisateurs"
            headerIcon={Filter}
        >
            <div className="container mx-auto py-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Gestion des rôles utilisateurs</CardTitle>
                        <CardDescription>
                            Visualisez et modifiez les rôles des utilisateurs dans la plateforme.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row justify-between mb-4 gap-3">
                            <div className="flex items-center gap-3">
                                <Select
                                    value={filterRole}
                                    onValueChange={setFilterRole}
                                >
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="Filtrer par rôle" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">Tous les rôles</SelectItem>
                                        {roles.map(role => (
                                            <SelectItem key={role.id} value={role.name}>
                                                {getFrenchRoleDisplayName(role.name)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                
                                <Button 
                                    variant="outline" 
                                    onClick={() => fetchUsers(filterRole)}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        "Actualiser"
                                    )}
                                </Button>                               
                                <ConvertCsv />
                                

                            </div>
                            
                            <div className="w-full sm:w-auto">
                                <Input
                                    placeholder="Rechercher un utilisateur..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full"
                                />
                            </div>
                        </div>
                        
                        {isLoading ? (
                            <div className="flex justify-center items-center h-64">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <span className="ml-2 text-sm text-muted-foreground">
                                    Chargement des utilisateurs...
                                </span>
                            </div>
                        ) : (
                            <>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead 
                                                    className="cursor-pointer"
                                                    onClick={() => handleSort('lastName')}
                                                >
                                                    <div className="flex items-center">
                                                        Nom
                                                        {getSortIcon('lastName')}
                                                    </div>
                                                </TableHead>
                                                <TableHead 
                                                    className="cursor-pointer"
                                                    onClick={() => handleSort('email')}
                                                >
                                                    <div className="flex items-center">
                                                        Email
                                                        {getSortIcon('email')}
                                                    </div>
                                                </TableHead>
                                                <TableHead>Rôles</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {paginatedUsers.length > 0 ? (
                                                paginatedUsers.map((user) => (
                                                    <TableRow key={user.id}>
                                                        <TableCell className="font-medium">
                                                            {user.firstName} {user.lastName}
                                                        </TableCell>
                                                        <TableCell>{user.email}</TableCell>
                                                        <TableCell>
                                                            {user.roles && user.roles.length > 0 ? (
                                                                <div className="flex flex-wrap gap-1">
                                                                    {user.roles.map((role) => (
                                                                        <Badge 
                                                                            key={role.id} 
                                                                            className={getRoleColor(role.name)}
                                                                        >
                                                                            {getFrenchRoleDisplayName(role.name)}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <span className="text-sm text-gray-500">
                                                                    Aucun rôle
                                                                </span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon">
                                                                        <MoreVertical className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem 
                                                                        onClick={() => openChangeRoleDialog(user)}
                                                                    >
                                                                        Gérer les rôles
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                                                        Aucun utilisateur trouvé
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                                
                                {renderPagination()}
                            </>
                        )}
                    </CardContent>
                </Card>
                
                {/* Dialog for changing roles */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Modifier le rôle</DialogTitle>
                            <DialogDescription>
                                Choisissez un nouveau rôle pour {selectedUser?.firstName} {selectedUser?.lastName}
                            </DialogDescription>
                        </DialogHeader>
                        
                        <div className="py-4">
                            <Label htmlFor="role-select" className="mb-2 block">
                                Choisir un nouveau rôle
                            </Label>
                            <Select
                                onValueChange={(value) => setSelectedRoleId(Number(value))}
                                value={selectedRoleId?.toString() || ""}
                            >
                                <SelectTrigger className="w-full" id="role-select">
                                    <SelectValue placeholder="Sélectionner un rôle" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Rôles disponibles</SelectLabel>
                                        {roles.map(role => (
                                            <SelectItem 
                                                key={role.id} 
                                                value={role.id.toString()}
                                            >
                                                {getFrenchRoleDisplayName(role.name)}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                                disabled={isProcessing}
                            >
                                Annuler
                            </Button>
                            <Button
                                variant="default"
                                onClick={() => {
                                    if (selectedUser && selectedRoleId) {
                                        const role = roles.find(r => r.id === selectedRoleId);
                                        if (role) {
                                            // Trouver le premier rôle actuel de l'utilisateur
                                            const currentRole = selectedUser.roles && selectedUser.roles.length > 0
                                                ? selectedUser.roles[0].name
                                                : 'ROLE_GUEST';
                                                
                                            changeUserRole(selectedUser.id, currentRole, role.name);
                                        }
                                    }
                                }}
                                disabled={isProcessing || !selectedRoleId}
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Chargement...
                                    </>
                                ) : (
                                    "Modifier le rôle"
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
} 