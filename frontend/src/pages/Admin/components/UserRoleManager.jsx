import { useMemo, useState, useEffect, useRef } from "react";
import { Filter, Loader2, Users, Sparkles, Search, GraduationCap, BookOpen, Briefcase, Shield } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useUserManagement } from "@/lib/hooks/useUserManagement";
import { UserFilters } from "./UserFilters";
import { UserTable } from "./UserTable";
import { UserPagination } from "./UserPagination";
import { RoleDialog } from "./RoleDialog";
import { DeleteDialog } from "./DeleteDialog";
import EditUserDialog from "./EditUserDialog";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useSearchParams } from "react-router-dom";

// Mapping des rôles vers des icônes et des titres
const roleConfig = {
    "ALL": { 
        icon: Users, 
        title: "Gestion des utilisateurs",
        description: "Visualisez et modifiez les rôles des utilisateurs dans la plateforme."
    },
    "ROLE_STUDENT": { 
        icon: GraduationCap, 
        title: "Gestion des étudiants",
        description: "Visualisez et modifiez les informations des étudiants."
    },
    "STUDENT": { 
        icon: GraduationCap, 
        title: "Gestion des étudiants",
        description: "Visualisez et modifiez les informations des étudiants."
    },
    "ROLE_TEACHER": { 
        icon: BookOpen, 
        title: "Gestion des formateurs",
        description: "Visualisez et modifiez les informations des formateurs."
    },
    "TEACHER": { 
        icon: BookOpen, 
        title: "Gestion des formateurs",
        description: "Visualisez et modifiez les informations des formateurs."
    },
    "ROLE_HR": { 
        icon: Briefcase, 
        title: "Gestion des ressources humaines",
        description: "Visualisez et modifiez les informations du personnel RH."
    },
    "HR": { 
        icon: Briefcase, 
        title: "Gestion des ressources humaines",
        description: "Visualisez et modifiez les informations du personnel RH."
    },
    "ROLE_ADMIN": { 
        icon: Shield, 
        title: "Gestion des administrateurs",
        description: "Visualisez et modifiez les informations des administrateurs."
    },
    "ADMIN": { 
        icon: Shield, 
        title: "Gestion des administrateurs",
        description: "Visualisez et modifiez les informations des administrateurs."
    }
};

export default function UserRoleManager() {
    // Récupérer le paramètre de filtre de l'URL si présent
    const [searchParams] = useSearchParams();
    const urlFilter = searchParams.get('filter');
    
    // S'assurer que le filtre initial est au bon format (avec ou sans le préfixe ROLE_)
    const initialFilter = useMemo(() => {
        if (!urlFilter) return "ALL";
        return urlFilter;
    }, [urlFilter]);
    
    // Utiliser useRef pour mémoriser la dernière valeur de filterRole traitée
    const lastFilterRoleRef = useRef(initialFilter);
    
    // État pour le dialogue d'édition
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [animateCard, setAnimateCard] = useState(false);
    const [showWelcomeMessage, setShowWelcomeMessage] = useState(initialFilter === "ALL");
    
    // Authentication state
    const { user: currentUser } = useAuth();
    const isSuperAdmin = useMemo(() => currentUser?.roles?.some(role => 
        role.name === 'SUPERADMIN' || role.name === 'ROLE_SUPERADMIN'
    ), [currentUser]);
    
    // Hook personnalisé pour la gestion des utilisateurs avec filtre initial
    const {
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
        setFilterRole,
        handlePageChange,
        openChangeRoleDialog,
        openDeleteDialog,
        setSelectedUser,
        setSelectedRoleId,
        setIsDialogOpen,
        setIsDeleteDialogOpen
    } = useUserManagement(initialFilter);
    
    // Effet pour mettre à jour le filtre lorsque l'URL change - Approche simplifiée
    useEffect(() => {
        console.log("[UserRoleManager] URL changée:", initialFilter);
        
        // Mise à jour directe du lastFilterRoleRef et du filtre
        if (initialFilter !== lastFilterRoleRef.current) {
            lastFilterRoleRef.current = initialFilter;
            
            // Mise à jour synchrone du filtre sans setTimeout
            setFilterRole(initialFilter);
        }
    }, [initialFilter, setFilterRole]);
    
    // Récupérer la configuration pour le rôle filtré actuel
    const currentRoleConfig = roleConfig[filterRole] || roleConfig["ALL"];
    const HeaderIcon = currentRoleConfig.icon;
    
    // Ouvrir le dialogue d'édition
    const openEditDialog = (user) => {
        setSelectedUser(user);
        setIsEditDialogOpen(true);
    };
    
    // Fermer le dialogue d'édition
    const closeEditDialog = () => {
        setIsEditDialogOpen(false);
    };

    // Animation effect on mount
    useEffect(() => {
        setAnimateCard(true);
        const timer = setTimeout(() => {
            setShowWelcomeMessage(false);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    // Success message when role is changed
    const handleSuccessfulRoleChange = (user, roleName) => {
        toast.success(
            <div className="flex flex-col">
                <span className="font-medium">Rôle modifié avec succès</span>
                <span className="text-sm opacity-90">{user.firstName} {user.lastName} est maintenant {roleName}</span>
            </div>
        );
        fetchUsers(filterRole);
    };
    
    return (
        <DashboardLayout 
            headerTitle={currentRoleConfig.title}
            headerIcon={HeaderIcon}
        >
            <div className="container mx-auto py-6 px-4 sm:px-6">
                {showWelcomeMessage && initialFilter === "ALL" && (
                    <motion.div 
                        className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100 shadow-sm"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <p className="text-blue-600 text-sm mt-1 ml-7">Vous pouvez gérer tous les utilisateurs et leurs rôles ici</p>
                    </motion.div>
                )}

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: animateCard ? 1 : 0, y: animateCard ? 0 : 20 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <Card className="border-0 bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b rounded-t-lg">
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                                        {currentRoleConfig.title}
                                    </CardTitle>
                                    <CardDescription className="max-w-2xl mt-2">
                                        {currentRoleConfig.description}
                                        {!isSuperAdmin && (
                                            <div className="text-amber-600 mt-2 text-sm flex items-center">
                                                <Badge variant="outline" className="mr-2 bg-amber-50 text-amber-700 border-amber-200">Note</Badge>
                                                Seuls les SuperAdmin peuvent modifier ou supprimer d'autres utilisateurs SuperAdmin.
                                            </div>
                                        )}
                                    </CardDescription>
                                </div>
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
                                    {filteredUsers.length} utilisateur{filteredUsers.length !== 1 ? 's' : ''}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            {/* Composant des filtres */}
                            <UserFilters 
                                roles={roles}
                                filterRole={filterRole}
                                setFilterRole={setFilterRole}
                                searchTerm={searchTerm}
                                setSearchTerm={setSearchTerm}
                                fetchUsers={fetchUsers}
                                isLoading={isLoading}
                            />
                            
                            {isLoading ? (
                                <motion.div 
                                    className="flex flex-col justify-center items-center h-64 my-8"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                                    <span className="text-sm text-muted-foreground">
                                        Chargement des utilisateurs...
                                    </span>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {/* Tableau des utilisateurs */}
                                    <div className="mt-6 mb-6">
                                        <UserTable 
                                            paginatedUsers={paginatedUsers}
                                            handleSort={handleSort}
                                            sortConfig={sortConfig}
                                            openChangeRoleDialog={openChangeRoleDialog}
                                            openDeleteDialog={openDeleteDialog}
                                            openEditDialog={openEditDialog}
                                            userHasSuperAdminRole={userHasSuperAdminRole}
                                            isSuperAdmin={isSuperAdmin}
                                        />
                                    </div>
                                    
                                    {/* Pagination */}
                                    <div className="mt-6">
                                        <UserPagination 
                                            filteredUsers={filteredUsers}
                                            pagination={pagination}
                                            handlePageChange={handlePageChange}
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {!isLoading && filteredUsers.length === 0 && searchTerm && (
                                <motion.div 
                                    className="flex flex-col items-center justify-center py-12 text-center"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Search className="h-12 w-12 text-gray-300 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-700">Aucun résultat trouvé</h3>
                                    <p className="text-sm text-gray-500 mt-1 max-w-sm">
                                        Aucun utilisateur ne correspond à votre recherche "{searchTerm}".
                                    </p>
                                    <button 
                                        onClick={() => setSearchTerm('')}
                                        className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        Effacer la recherche
                                    </button>
                                </motion.div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
                
                {/* Boîte de dialogue pour modifier les rôles */}
                <RoleDialog 
                    isDialogOpen={isDialogOpen}
                    setIsDialogOpen={setIsDialogOpen}
                    selectedUser={selectedUser}
                    selectedRoleId={selectedRoleId}
                    setSelectedRoleId={setSelectedRoleId}
                    roles={roles}
                    userHasSuperAdminRole={userHasSuperAdminRole}
                    isSuperAdmin={isSuperAdmin}
                    isProcessing={isProcessing}
                    changeUserRole={changeUserRole}
                    onSuccess={handleSuccessfulRoleChange}
                />
                
                {/* Boîte de dialogue pour supprimer un utilisateur */}
                <DeleteDialog 
                    isDeleteDialogOpen={isDeleteDialogOpen}
                    setIsDeleteDialogOpen={setIsDeleteDialogOpen}
                    selectedUser={selectedUser}
                    userHasSuperAdminRole={userHasSuperAdminRole}
                    isSuperAdmin={isSuperAdmin}
                    isProcessing={isProcessing}
                    deleteUser={deleteUser}
                />
                
                {/* Boîte de dialogue pour éditer un utilisateur */}
                <EditUserDialog
                    isOpen={isEditDialogOpen}
                    onClose={closeEditDialog}
                    user={selectedUser}
                    onUpdateUser={updateUser}
                    isProcessing={isProcessing}
                    currentUserIsSuperAdmin={isSuperAdmin}
                />
            </div>
        </DashboardLayout>
    );
} 