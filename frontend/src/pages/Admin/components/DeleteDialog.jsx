import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertTriangle, Trash2, UserX, Ban } from "lucide-react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function DeleteDialog({
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    selectedUser,
    userHasSuperAdminRole,
    isSuperAdmin,
    isProcessing,
    deleteUser
}) {
    // Generate avatar initials
    const getInitials = (firstName, lastName) => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
    };
    
    return (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
                <DialogHeader className="px-6 pt-6 pb-2">
                    <DialogTitle className="text-xl font-semibold flex items-center gap-2 text-red-600">
                        <UserX className="h-5 w-5" />
                        Confirmation de suppression
                    </DialogTitle>
                    <DialogDescription className="text-gray-500 mt-1.5">
                        Cette action est définitive et ne peut pas être annulée.
                    </DialogDescription>
                </DialogHeader>
                
                {selectedUser && (
                    <div className="px-6 pb-4">
                        <Alert variant="destructive" className="mb-4 bg-red-50 border-red-200">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <AlertTitle className="font-medium text-red-800">Attention</AlertTitle>
                            <AlertDescription className="text-sm text-red-700">
                                Vous êtes sur le point de supprimer définitivement cet utilisateur.
                                Toutes ses données seront perdues.
                            </AlertDescription>
                        </Alert>
                        
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg mb-4 border border-gray-200">
                            <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                <AvatarFallback className="bg-red-100 text-red-700 font-medium">
                                    {getInitials(selectedUser.firstName, selectedUser.lastName)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-medium text-gray-900">{selectedUser.firstName} {selectedUser.lastName}</h3>
                                    {userHasSuperAdminRole(selectedUser) && (
                                        <Badge variant="destructive" className="text-xs bg-red-100 text-red-700 border-red-200">
                                            SuperAdmin
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500">{selectedUser.email}</p>
                            </div>
                        </div>
                        
                        {selectedUser && userHasSuperAdminRole(selectedUser) && !isSuperAdmin && (
                            <Alert variant="destructive" className="mb-4 bg-red-50 text-red-800 border-red-200">
                                <Ban className="h-4 w-4" />
                                <AlertTitle className="font-medium">Action non autorisée</AlertTitle>
                                <AlertDescription className="text-sm">
                                    Seul un SuperAdmin peut supprimer un utilisateur SuperAdmin.
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                )}
                
                <DialogFooter className="px-6 py-4 bg-gray-50 border-t flex space-x-2 justify-end">
                    <Button 
                        variant="outline" 
                        onClick={() => setIsDeleteDialogOpen(false)}
                        disabled={isProcessing}
                        className="bg-white hover:bg-gray-50"
                    >
                        Annuler
                    </Button>
                    <motion.div
                        whileHover={{ scale: isProcessing || (selectedUser && userHasSuperAdminRole(selectedUser) && !isSuperAdmin) ? 1 : 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Button
                            onClick={() => selectedUser && deleteUser(selectedUser.id)}
                            disabled={isProcessing || (selectedUser && userHasSuperAdminRole(selectedUser) && !isSuperAdmin)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {isProcessing ? (
                                <div className="flex items-center">
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Suppression en cours...
                                </div>
                            ) : (
                                <div className="flex items-center">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Supprimer définitivement
                                </div>
                            )}
                        </Button>
                    </motion.div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 