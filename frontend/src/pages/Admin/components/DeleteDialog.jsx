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
    deleteUser,
    isDark
}) {
    // Generate avatar initials
    const getInitials = (firstName, lastName) => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
    };
    
    return (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent className={`sm:max-w-[500px] ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}>
                <DialogHeader>
                    <DialogTitle className={`text-xl flex items-center gap-2 ${isDark ? 'text-gray-100' : ''}`}>
                        <UserX className={`h-5 w-5 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                        Supprimer l'utilisateur
                    </DialogTitle>
                    <DialogDescription className={isDark ? 'text-gray-400' : ''}>
                        Cette action est irréversible. Toutes les données de l'utilisateur seront supprimées.
                    </DialogDescription>
                </DialogHeader>
                
                {selectedUser && (
                    <div className={`p-4 ${isDark ? 'bg-gray-900/50' : 'bg-gray-50'} rounded-lg mb-4 border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="flex items-center gap-3">
                            <Avatar className={`h-10 w-10 border-2 ${isDark ? 'border-gray-700' : 'border-white'} shadow-sm`}>
                                <AvatarFallback className={`${isDark ? 'bg-gray-700 text-gray-200' : 'bg-red-100 text-red-700'} font-medium`}>
                                    {getInitials(selectedUser.firstName, selectedUser.lastName)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className={`font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                                    {selectedUser.firstName} {selectedUser.lastName}
                                </h3>
                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {selectedUser.email}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
                
                {userHasSuperAdminRole(selectedUser) && !isSuperAdmin && (
                    <Alert variant="destructive" className={`mb-4 ${isDark ? 'bg-red-900/20 border-red-900 text-red-400' : ''}`}>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Action non autorisée</AlertTitle>
                        <AlertDescription>
                            Vous n'avez pas les permissions nécessaires pour supprimer un SuperAdmin.
                        </AlertDescription>
                    </Alert>
                )}
                
                <Alert variant="destructive" className={`${isDark ? 'bg-red-900/20 border-red-900 text-red-400' : ''}`}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Attention</AlertTitle>
                    <AlertDescription>
                        Cette action supprimera définitivement le compte de l'utilisateur et toutes ses données associées.
                        Cette action ne peut pas être annulée.
                    </AlertDescription>
                </Alert>
                
                <DialogFooter className="mt-6">
                    <Button
                        variant="outline"
                        onClick={() => setIsDeleteDialogOpen(false)}
                        className={`${isDark ? 'bg-gray-900 border-gray-700 hover:bg-gray-800 text-gray-200' : ''}`}
                    >
                        Annuler
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => deleteUser(selectedUser.id)}
                        disabled={isProcessing || (userHasSuperAdminRole(selectedUser) && !isSuperAdmin)}
                        className={isDark ? 'bg-red-900 hover:bg-red-800 border-red-900' : ''}
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Suppression...
                            </>
                        ) : (
                            <>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Supprimer définitivement
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 