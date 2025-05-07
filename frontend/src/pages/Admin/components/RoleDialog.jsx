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
import { toast } from "sonner";
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
    onSuccess,
    isDark
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
                    // Utiliser le toast pour notifier l'utilisateur
                    toast.warning("L'utilisateur possède déjà ce rôle");
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
            <DialogContent className={`sm:max-w-[550px] ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}>
                <DialogHeader>
                    <DialogTitle className={`text-xl flex items-center gap-2 ${isDark ? 'text-gray-100' : ''}`}>
                        <UserCog className={`h-5 w-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                        Modifier les rôles
                    </DialogTitle>
                    <DialogDescription className={isDark ? 'text-gray-400' : ''}>
                        Choisissez un nouveau rôle pour l'utilisateur.
                    </DialogDescription>
                </DialogHeader>

                {selectedUser && (
                    <div className={`p-4 ${isDark ? 'bg-gray-900/50' : 'bg-gray-50'} rounded-lg mb-4 border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="flex items-center gap-3">
                            <Avatar className={`h-10 w-10 border-2 ${isDark ? 'border-gray-700' : 'border-white'} shadow-sm`}>
                                <AvatarFallback className={`${isDark ? 'bg-gray-700 text-gray-200' : 'bg-blue-100 text-blue-700'} font-medium`}>
                                    {getInitials(selectedUser.firstName, selectedUser.lastName)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className={`font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                                    {selectedUser.firstName} {selectedUser.lastName}
                                </h3>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {selectedUser.roles?.map(role => (
                                        <RoleBadge 
                                            key={role.id} 
                                            role={role.name}
                                            isDark={isDark}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {userHasSuperAdminRole(selectedUser) && !isSuperAdmin && (
                    <Alert variant="destructive" className={`mb-4 ${isDark ? 'bg-red-900/20 border-red-900 text-red-400' : ''}`}>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Action non autorisée</AlertTitle>
                        <AlertDescription>
                            Vous n'avez pas les permissions nécessaires pour modifier les rôles d'un SuperAdmin.
                        </AlertDescription>
                    </Alert>
                )}

                <div className="space-y-4">
                    <div>
                        <Label htmlFor="role-select" className={`block mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                            Sélectionner un nouveau rôle
                        </Label>
                        <Select
                            onValueChange={(value) => setSelectedRoleId(Number(value))}
                            value={selectedRoleId?.toString() || ""}
                            disabled={selectedUser && userHasSuperAdminRole(selectedUser) && !isSuperAdmin}
                        >
                            <SelectTrigger 
                                className={`w-full ${isDark ? 'bg-gray-900 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300'} transition-colors`}
                                id="role-select"
                            >
                                <SelectValue placeholder="Sélectionner un rôle" />
                            </SelectTrigger>
                            <SelectContent className={`max-h-[400px] ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}>
                                <SelectGroup>
                                    <SelectLabel className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                                        Rôles disponibles
                                    </SelectLabel>
                                    {roles.map(role => {
                                        const isSuperAdminRole = role.name === 'SUPERADMIN' || role.name === 'ROLE_SUPERADMIN';
                                        if (isSuperAdminRole && !isSuperAdmin) return null;
                                        
                                        return (
                                            <SelectItem 
                                                key={role.id} 
                                                value={role.id.toString()}
                                                className={`flex items-center gap-2 ${isDark ? 'text-gray-200 hover:bg-gray-700' : ''}`}
                                            >
                                                <RoleBadge role={role.name} isDark={isDark} />
                                            </SelectItem>
                                        );
                                    })}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter className="mt-6">
                    <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        className={`${isDark ? 'bg-gray-900 border-gray-700 hover:bg-gray-800 text-gray-200' : ''}`}
                    >
                        Annuler
                    </Button>
                    <Button
                        onClick={handleRoleChange}
                        disabled={isProcessing || !selectedRoleId || (userHasSuperAdminRole(selectedUser) && !isSuperAdmin)}
                        className={isDark ? 'bg-blue-600 hover:bg-blue-700' : ''}
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Modification en cours...
                            </>
                        ) : (
                            'Confirmer le changement'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 