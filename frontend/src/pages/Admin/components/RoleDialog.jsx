import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
    Select, 
    SelectContent, 
    SelectGroup, 
    SelectItem, 
    SelectLabel, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import {
    Alert,
    AlertDescription,
    AlertTitle
} from "@/components/ui/alert";
import { Loader2, ShieldAlert, UserCog, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { getRoleDisplayName } from "@/lib/constants/roles";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Toaster } from "@/components/ui/sonner";
import RoleBadge from "@/components/ui/RoleBadge";

export function RoleDialog({
    isDialogOpen,
    setIsDialogOpen,
    selectedUser,
    selectedRoleId,
    setSelectedRoleId,
    roles,
    userHasSuperAdminRole,
    isSuperAdmin,
    isProcessing,
    changeUserRole,
    onSuccess
}) {
    // Generate avatar initials
    const getInitials = (firstName, lastName) => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
    };

    // Get role display properties
    const getRoleDisplayProps = (roleName) => {
        switch(roleName) {
            case 'SUPERADMIN':
            case 'ROLE_SUPERADMIN':
                return { 
                    icon: <ShieldAlert className="h-4 w-4 text-red-600 mr-2" />,
                    bgColor: 'bg-red-50',
                    textColor: 'text-red-700'
                };
            case 'ADMIN':
            case 'ROLE_ADMIN':
                return { 
                    icon: <UserCog className="h-4 w-4 text-orange-600 mr-2" />,
                    bgColor: 'bg-orange-50',
                    textColor: 'text-orange-700'
                };
            default:
                return { 
                    icon: <UserCog className="h-4 w-4 text-blue-600 mr-2" />,
                    bgColor: 'bg-blue-50',
                    textColor: 'text-blue-700'
                };
        }
    };

    // Get current role name of the user
    const getCurrentRoleName = () => {
        if (!selectedUser || !selectedUser.roles || selectedUser.roles.length === 0) {
            return 'Aucun rôle';
        }
        return getRoleDisplayName(selectedUser.roles[0].name);
    };

    // Handle role change
    const handleRoleChange = () => {
        if (selectedUser && selectedRoleId) {
            const role = roles.find(r => r.id === selectedRoleId);
            if (role) {
                // Vérifier si l'utilisateur a déjà ce rôle
                const hasRole = selectedUser.roles && selectedUser.roles.some(userRole => {
                    const userRoleName = userRole.name.toLowerCase();
                    const newRoleName = role.name.toLowerCase();
                    return userRoleName === newRoleName ||
                           userRoleName === `role_${newRoleName.replace('role_', '')}` ||
                           `role_${userRoleName.replace('role_', '')}` === newRoleName;
                });

                if (hasRole) {
                    // Utiliser le Toaster pour notifier l'utilisateur
                    Toaster.warning("L'utilisateur possède déjà ce rôle");
                    return;
                }

                // Find the first current role of the user
                const currentRole = selectedUser.roles && selectedUser.roles.length > 0
                    ? selectedUser.roles[0].name
                    : 'ROLE_GUEST';
                    
                changeUserRole(selectedUser.id, currentRole, role.name);
                
                // Create updated user object to pass to onSuccess
                const updatedUser = {
                    ...selectedUser,
                    roles: [{ id: role.id, name: role.name }]
                };
                
                // Call success callback with updated user if provided
                if (onSuccess) {
                    onSuccess(updatedUser, getRoleDisplayName(role.name));
                }
                
                // Close dialog
                setIsDialogOpen(false);
            }
        }
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
                <DialogHeader className="px-6 pt-6 pb-2">
                    <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                        <UserCog className="h-5 w-5 text-blue-600" />
                        Modifier le rôle utilisateur
                    </DialogTitle>
                    <DialogDescription className="text-gray-500 mt-1.5">
                        Choisissez un nouveau rôle pour l'utilisateur sélectionné
                    </DialogDescription>
                </DialogHeader>
                
                {selectedUser && (
                    <div className="px-6 pb-4">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100 mt-4">
                            <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                <AvatarFallback className="bg-blue-100 text-blue-800 font-medium">
                                    {getInitials(selectedUser.firstName, selectedUser.lastName)}
                                </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1">
                                <h3 className="font-semibold">{selectedUser.firstName} {selectedUser.lastName}</h3>
                                <p className="text-sm text-gray-500">{selectedUser.email}</p>
                                <div className="flex flex-wrap mt-2 gap-1">
                                    {selectedUser.roles && selectedUser.roles.map((role, idx) => (
                                        <RoleBadge 
                                            key={`${role.id || idx}-${role.name}`}
                                            role={role.name}
                                            solid={true}
                                            useVariant={true}
                                            interactive={false}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                        {userHasSuperAdminRole(selectedUser) && !isSuperAdmin && (
                            <Alert variant="destructive" className="mt-4">
                                <AlertTitle className="flex items-center">
                                    <AlertTriangle className="h-4 w-4 mr-2" />
                                    Action restreinte
                                </AlertTitle>
                                <AlertDescription>
                                    Vous n'avez pas l'autorisation de modifier le rôle d'un SuperAdmin. 
                                    Seul un SuperAdmin peut modifier le rôle d'un autre SuperAdmin.
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                )}
                
                <div className="px-6 pb-6">
                    <Label htmlFor="role-select" className="mb-2 block text-gray-700">
                        Choisir un nouveau rôle
                    </Label>
                    <Select
                        onValueChange={(value) => setSelectedRoleId(Number(value))}
                        value={selectedRoleId?.toString() || ""}
                        disabled={selectedUser && userHasSuperAdminRole(selectedUser) && !isSuperAdmin}
                    >
                        <SelectTrigger 
                            className="w-full bg-white border-gray-200 hover:border-gray-300 transition-colors" 
                            id="role-select"
                        >
                            <SelectValue placeholder="Sélectionner un rôle" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[400px]">
                            <SelectGroup>
                                <SelectLabel className="text-gray-500">Rôles disponibles</SelectLabel>
                                {roles.map(role => {
                                    // Filtrer le rôle SuperAdmin pour les non-SuperAdmin
                                    const isSuperAdminRole = role.name === 'SUPERADMIN' || role.name === 'ROLE_SUPERADMIN';
                                    if (isSuperAdminRole && !isSuperAdmin) {
                                        return null;
                                    }
                                    
                                    const roleProps = getRoleDisplayProps(role.name);
                                    
                                    return (
                                        <SelectItem 
                                            key={role.id} 
                                            value={role.id.toString()}
                                            className={`flex items-center gap-2 my-1 rounded ${roleProps.bgColor} ${roleProps.textColor}`}
                                        >
                                            <div className="flex items-center">
                                                {roleProps.icon}
                                                {getRoleDisplayName(role.name)}
                                            </div>
                                        </SelectItem>
                                    );
                                })}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    
                    {!isSuperAdmin && (
                        <p className="text-amber-600 mt-2 text-xs flex items-center">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Seuls les SuperAdmin peuvent attribuer le rôle SuperAdmin.
                        </p>
                    )}
                </div>
                
                <DialogFooter className="px-6 py-4 bg-gray-50 border-t flex justify-between">
                    <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        disabled={isProcessing}
                        className="bg-white hover:bg-gray-50"
                    >
                        Annuler
                    </Button>
                    <motion.div
                        whileHover={{ scale: isProcessing || !selectedRoleId || (selectedUser && userHasSuperAdminRole(selectedUser) && !isSuperAdmin) ? 1 : 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Button
                            variant="default"
                            onClick={handleRoleChange}
                            disabled={isProcessing || !selectedRoleId || (selectedUser && userHasSuperAdminRole(selectedUser) && !isSuperAdmin)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {isProcessing ? (
                                <div className="flex items-center">
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Modification en cours...
                                </div>
                            ) : (
                                "Appliquer le changement"
                            )}
                        </Button>
                    </motion.div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 