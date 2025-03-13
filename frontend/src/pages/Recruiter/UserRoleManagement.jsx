import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
    Table, 
    TableBody, 
    TableCaption, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from '../../components/ui/dropdown-menu';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '../../components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '../../components/ui/dialog';
import apiService from '../../lib/services/apiService';

export default function UserRoleManagement() {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedRole, setSelectedRole] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Fonction pour charger les utilisateurs ayant le rôle "guest"
    const fetchGuestUsers = async () => {
        setIsLoading(true);
        try {
            const response = await apiService.getUsersByRole('guest');
            if (response.success) {
                setUsers(response.data || []);
            } else {
                toast.error("Erreur lors du chargement des utilisateurs : " + response.message);
            }
        } catch (error) {
            toast.error("Erreur lors du chargement des utilisateurs");
            console.error("Erreur lors du chargement des utilisateurs :", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Fonction pour charger tous les rôles disponibles
    const fetchRoles = async () => {
        try {
            const response = await apiService.getAllRoles();
            if (response.success) {
                console.log("Rôles récupérés:", response.data);
                // Forcer le format des rôles pour s'assurer qu'ils sont dans la bonne structure
                const formattedRoles = response.data.map(role => ({
                    id: role.id,
                    name: role.name,
                    description: role.description || ''
                }));
                console.log("Rôles formatés:", formattedRoles);
                setRoles(formattedRoles || []);
            } else {
                toast.error("Erreur lors du chargement des rôles : " + response.message);
            }
        } catch (error) {
            toast.error("Erreur lors du chargement des rôles");
            console.error("Erreur lors du chargement des rôles :", error);
        }
    };

    // Fonction pour changer le rôle d'un utilisateur
    const handleChangeRole = async () => {
        if (!selectedUser || !selectedRole) return;

        try {
            // Trouver le rôle actuel "guest" qui peut être nommé "guest" ou "ROLE_GUEST"
            const guestRole = selectedUser.roles.find(
                role => role.name.toLowerCase() === 'guest' || 
                       role.name.toLowerCase() === 'role_guest'
            );
            
            console.log("Rôles de l'utilisateur:", selectedUser.roles);
            console.log("Rôle trouvé:", guestRole);
            
            if (!guestRole) {
                toast.error("Impossible de trouver le rôle 'guest' pour cet utilisateur");
                return;
            }

            const response = await apiService.changeUserRole(
                selectedUser.id, 
                guestRole.name, 
                selectedRole.name
            );

            if (response.success) {
                toast.success("Rôle modifié avec succès !");
                setIsDialogOpen(false);
                // Rafraîchir la liste des utilisateurs
                fetchGuestUsers();
            } else {
                toast.error("Erreur lors du changement de rôle : " + response.message);
            }
        } catch (error) {
            toast.error("Erreur lors du changement de rôle");
            console.error("Erreur lors du changement de rôle :", error);
        }
    };

    // Chargement initial des données
    useEffect(() => {
        fetchGuestUsers();
        fetchRoles();
    }, []);

    // Fonction pour ouvrir la boîte de dialogue de changement de rôle
    const openChangeRoleDialog = (user) => {
        setSelectedUser(user);
        setSelectedRole(null);
        setIsDialogOpen(true);
        console.log("Utilisateur sélectionné:", user);
        console.log("Rôles disponibles au moment de l'ouverture:", roles);
    };

    return (
        <div className="container mx-auto p-4">
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Gestion des rôles utilisateurs</CardTitle>
                    <CardDescription>
                        Cette page vous permet de gérer les rôles des utilisateurs. 
                        Vous pouvez changer le rôle d'un invité en étudiant.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <Button 
                            onClick={fetchGuestUsers} 
                            variant="outline" 
                            disabled={isLoading}
                        >
                            {isLoading ? "Chargement..." : "Rafraîchir la liste"}
                        </Button>
                    </div>

                    <Table>
                        <TableCaption>Liste des utilisateurs avec le rôle "invité"</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nom</TableHead>
                                <TableHead>Prénom</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Rôles actuels</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">
                                        Chargement...
                                    </TableCell>
                                </TableRow>
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">
                                        Aucun utilisateur invité trouvé
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>{user.lastName}</TableCell>
                                        <TableCell>{user.firstName}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            {user.roles.map(role => role.name).join(', ')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button 
                                                variant="outline"
                                                onClick={() => openChangeRoleDialog(user)}
                                            >
                                                Changer le rôle
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Boîte de dialogue pour changer le rôle */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Changer le rôle de l'utilisateur</DialogTitle>
                        <DialogDescription>
                            {selectedUser && (
                                <p>
                                    Vous êtes sur le point de changer le rôle de 
                                    <strong> {selectedUser.firstName} {selectedUser.lastName}</strong>. 
                                    Veuillez sélectionner le nouveau rôle.
                                </p>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <h3 className="font-medium mb-2">Sélectionner un nouveau rôle :</h3>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full justify-between">
                                    {selectedRole ? selectedRole.name : "Sélectionner un rôle"}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56">
                                {roles.length === 0 ? (
                                    <div className="p-2 text-center text-sm text-gray-500">
                                        Aucun rôle disponible
                                    </div>
                                ) : (
                                    <>
                                        {console.log("Rendu des rôles:", roles)}
                                        {roles.map((role, index) => (
                                            <DropdownMenuItem 
                                                key={role.id || index}
                                                onClick={() => {
                                                    console.log("Rôle sélectionné:", role);
                                                    setSelectedRole(role);
                                                }}
                                            >
                                                {role.name || "Rôle sans nom"} 
                                                {role.description && ` - ${role.description}`}
                                            </DropdownMenuItem>
                                        ))}
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={() => setIsDialogOpen(false)}
                        >
                            Annuler
                        </Button>
                        <Button 
                            onClick={handleChangeRole} 
                            disabled={!selectedRole}
                        >
                            Confirmer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
