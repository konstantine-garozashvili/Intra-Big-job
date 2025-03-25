import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import {
    ArrowUp, 
    ArrowDown, 
    MoreVertical, 
    Edit, 
    Trash2,
    UserCog,
    Mail,
    User
} from "lucide-react";
import { getFrenchRoleDisplayName, getRoleColor } from "@/lib/utils/roleDisplay";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function UserTable({ 
    paginatedUsers, 
    handleSort, 
    sortConfig, 
    openChangeRoleDialog, 
    openDeleteDialog,
    userHasSuperAdminRole,
    isSuperAdmin,
    openEditDialog
}) {
    const getSortIcon = (key) => {
        if (sortConfig.key === key) {
            if (sortConfig.direction === 'ascending') {
                return <ArrowUp className="w-4 h-4 ml-1" />;
            }
            return <ArrowDown className="w-4 h-4 ml-1" />;
        }
        return null;
    };

    // Generate avatar initials from user's name
    const getInitials = (firstName, lastName) => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
    };

    // Function to get user role background color for avatar
    const getAvatarColorClass = (user) => {
        if (!user || !user.roles || user.roles.length === 0) return "bg-gray-200";
        
        const roleName = user.roles[0].name;
        switch(roleName) {
            case 'SUPERADMIN':
            case 'ROLE_SUPERADMIN':
                return "bg-red-100 text-red-700";
            case 'ADMIN':
            case 'ROLE_ADMIN':
                return "bg-orange-100 text-orange-700";
            case 'TEACHER':
            case 'ROLE_TEACHER':
                return "bg-green-100 text-green-700";
            case 'STUDENT':
            case 'ROLE_STUDENT':
                return "bg-blue-100 text-blue-700";
            case 'HR':
            case 'ROLE_HR':
                return "bg-purple-100 text-purple-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <motion.div 
            className="rounded-md border border-gray-200 overflow-hidden shadow-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
        >
            <Table>
                <TableHeader className="bg-gray-50">
                    <TableRow className="hover:bg-gray-50/80">
                        <TableHead className="w-12"></TableHead>
                        <TableHead 
                            className="cursor-pointer font-medium text-gray-700"
                            onClick={() => handleSort('lastName')}
                        >
                            <div className="flex items-center">
                                <User className="h-4 w-4 mr-2 text-gray-500" />
                                Nom
                                {getSortIcon('lastName')}
                            </div>
                        </TableHead>
                        <TableHead 
                            className="cursor-pointer font-medium text-gray-700"
                            onClick={() => handleSort('email')}
                        >
                            <div className="flex items-center">
                                <Mail className="h-4 w-4 mr-2 text-gray-500" />
                                Email
                                {getSortIcon('email')}
                            </div>
                        </TableHead>
                        <TableHead className="font-medium text-gray-700">
                            <div className="flex items-center">
                                <UserCog className="h-4 w-4 mr-2 text-gray-500" />
                                Rôles
                            </div>
                        </TableHead>
                        <TableHead className="text-right font-medium text-gray-700">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedUsers.length > 0 ? (
                        paginatedUsers.map((user, index) => (
                            <motion.tr
                                key={user.id}
                                className={`border-b border-gray-100 group transition-colors hover:bg-blue-50/30 ${userHasSuperAdminRole(user) ? 'bg-red-50/30' : ''}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                whileHover={{ backgroundColor: 'rgba(243, 244, 246, 0.8)' }}
                            >
                                <TableCell className="py-3">
                                    <Avatar className={`h-9 w-9 ${getAvatarColorClass(user)}`}>
                                        <AvatarFallback>
                                            {getInitials(user.firstName, user.lastName)}
                                        </AvatarFallback>
                                    </Avatar>
                                </TableCell>
                                <TableCell className="font-medium py-3">
                                    <div className="flex flex-col">
                                        <span>{user.firstName} {user.lastName}</span>
                                        {userHasSuperAdminRole(user) && (
                                            <span className="text-xs text-red-600 mt-1">SuperAdmin</span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="py-3">
                                    <a href={`mailto:${user.email}`} className="text-blue-600 hover:text-blue-800 hover:underline transition-colors">
                                        {user.email}
                                    </a>
                                </TableCell>
                                <TableCell className="py-3">
                                    {user.roles && user.roles.length > 0 ? (
                                        <div className="flex flex-wrap gap-1.5">
                                            {user.roles.map((role) => (
                                                <Badge 
                                                    key={role.id} 
                                                    className={`${getRoleColor(role.name)} transition-all duration-200 hover:scale-105`}
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
                                <TableCell className="text-right py-3">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuItem 
                                                            onClick={() => openChangeRoleDialog(user)}
                                                            disabled={userHasSuperAdminRole(user) && !isSuperAdmin}
                                                            className="cursor-pointer"
                                                        >
                                                            <UserCog className="h-4 w-4 mr-2 text-blue-600" />
                                                            <span>Gérer les rôles</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem 
                                                            onClick={() => openEditDialog && openEditDialog(user)}
                                                            disabled={userHasSuperAdminRole(user) && !isSuperAdmin}
                                                            className="cursor-pointer"
                                                        >
                                                            <Edit className="h-4 w-4 mr-2 text-green-600" />
                                                            <span>Modifier l'utilisateur</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem 
                                                            onClick={() => openDeleteDialog(user)}
                                                            disabled={userHasSuperAdminRole(user) && !isSuperAdmin}
                                                            className="text-red-600 cursor-pointer"
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            <span>Supprimer l'utilisateur</span>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TooltipTrigger>
                                            <TooltipContent side="left">
                                                <p>Actions pour {user.firstName} {user.lastName}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </TableCell>
                            </motion.tr>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                                <div className="flex flex-col items-center justify-center">
                                    <User className="h-10 w-10 text-gray-300 mb-2" />
                                    <p className="text-base font-medium text-gray-600 mb-1">Aucun utilisateur trouvé</p>
                                    <p className="text-sm text-gray-500">Modifiez vos filtres ou ajoutez de nouveaux utilisateurs</p>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </motion.div>
    );
} 