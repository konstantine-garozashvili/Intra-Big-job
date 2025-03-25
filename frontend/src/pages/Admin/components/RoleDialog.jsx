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
import { Badge } from "@/components/ui/badge";
import { Loader2, ShieldAlert, UserCog, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { getFrenchRoleDisplayName } from "@/lib/utils/roleDisplay";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
        return getFrenchRoleDisplayName(selectedUser.roles[0].name);
    };

    // Handle role change
    const handleRoleChange = () => {
        if (selectedUser && selectedRoleId) {
            const role = roles.find(r => r.id === selectedRoleId);
            if (role) {
                // Find the first current role of the user
                const currentRole = selectedUser.roles && selectedUser.roles.length > 0
                    ? selectedUser.roles[0].name
                    : 'ROLE_GUEST';
                    
                changeUserRole(selectedUser.id, currentRole, role.name);
                
                // Call success callback if provided
                if (onSuccess) {
                    onSuccess(selectedUser, getFrenchRoleDisplayName(role.name));
                }
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
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg mb-4 border border-gray-200">
                            <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                <AvatarFallback className="bg-blue-100 text-blue-700 font-medium">
                                    {getInitials(selectedUser.firstName, selectedUser.lastName)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="font-medium text-gray-900">{selectedUser.firstName} {selectedUser.lastName}</h3>
                                <p className="text-sm text-gray-500">{selectedUser.email}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-gray-600">Rôle actuel:</span>
                                    <Badge variant="outline" className="text-xs">
                                        {getCurrentRoleName()}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                        
                        {selectedUser && userHasSuperAdminRole(selectedUser) && !isSuperAdmin && (
                            <Alert variant="destructive" className="mb-4 bg-red-50 text-red-800 border-red-200">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle className="font-medium">Accès limité</AlertTitle>
                                <AlertDescription className="text-sm">
                                    Seul un SuperAdmin peut modifier un utilisateur SuperAdmin.
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
                                                {getFrenchRoleDisplayName(role.name)}
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