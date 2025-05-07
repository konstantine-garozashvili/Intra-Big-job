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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import RoleBadge from "@/components/ui/RoleBadge";
import { ROLE_SOLID_COLORS } from "@/lib/constants/roles";
import { Link } from 'react-router-dom';

export function UserTable({ 
    paginatedUsers, 
    handleSort, 
    sortConfig, 
    openChangeRoleDialog, 
    openDeleteDialog,
    userHasSuperAdminRole,
    isSuperAdmin,
    openEditDialog,
    isDark
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
        // Utiliser les couleurs solides pour les avatars
        const colorClass = ROLE_SOLID_COLORS[roleName] || ROLE_SOLID_COLORS['ROLE_USER'];
        // Ne retourner que la classe bg- (pas le texte)
        return colorClass.split(' ')[0] || "bg-gray-100";
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="rounded-lg border shadow-sm overflow-hidden"
        >
            <Table>
                <TableHeader className={isDark ? 'bg-gray-800/50' : 'bg-gray-50'}>
                    <TableRow className={isDark ? 'hover:bg-gray-800/80' : 'hover:bg-gray-50/80'}>
                        <TableHead className="w-12"></TableHead>
                        <TableHead 
                            className={`cursor-pointer font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
                            onClick={() => handleSort('lastName')}
                        >
                            <div className="flex items-center">
                                <User className={`h-4 w-4 mr-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                                Nom
                                {getSortIcon('lastName')}
                            </div>
                        </TableHead>
                        <TableHead 
                            className={`cursor-pointer font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
                            onClick={() => handleSort('email')}
                        >
                            <div className="flex items-center">
                                <Mail className={`h-4 w-4 mr-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                                Email
                                {getSortIcon('email')}
                            </div>
                        </TableHead>
                        <TableHead className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                            <div className="flex items-center">
                                <UserCog className={`h-4 w-4 mr-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                                Rôles
                            </div>
                        </TableHead>
                        <TableHead className={`text-right font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedUsers.length > 0 ? (
                        paginatedUsers.map((user, index) => (
                            <motion.tr
                                key={user.id}
                                className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-100'} group transition-colors ${
                                    isDark 
                                        ? userHasSuperAdminRole(user) 
                                            ? 'bg-red-900/20 hover:bg-red-900/30' 
                                            : 'hover:bg-gray-800/50'
                                        : userHasSuperAdminRole(user)
                                            ? 'bg-red-50/30 hover:bg-red-50/50'
                                            : 'hover:bg-blue-50/30'
                                }`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                            >
                                <TableCell className="py-3">
                                    <Link to={`/profile/${user.id}`} tabIndex={-1} onClick={e => e.stopPropagation()}>
                                        <Avatar className={`h-9 w-9 ${getAvatarColorClass(user)}`}>
                                            {user.profilePictureUrl ? (
                                                <AvatarImage src={user.profilePictureUrl} alt={`${user.firstName} ${user.lastName}`} />
                                            ) : null}
                                            <AvatarFallback className={isDark ? 'text-gray-200 bg-gray-700' : ''}>
                                                {getInitials(user.firstName, user.lastName)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Link>
                                </TableCell>
                                <TableCell className={`font-medium py-3 ${isDark ? 'text-gray-200' : ''}`}>
                                    <div className="flex flex-col">
                                        <Link to={`/profile/${user.id}`} className="hover:underline" onClick={e => e.stopPropagation()} tabIndex={-1}>
                                            <span>{user.firstName} {user.lastName}</span>
                                        </Link>
                                        {userHasSuperAdminRole(user) && (
                                            <span className={`text-xs ${isDark ? 'text-red-400' : 'text-red-600'} mt-1`}>SuperAdmin</span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className={isDark ? 'text-gray-300' : ''}>{user.email}</TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {user.roles?.map(role => (
                                            <RoleBadge 
                                                key={role.id} 
                                                role={role.name} 
                                                isDark={isDark}
                                            />
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right py-3">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className={`${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                                                        >
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent 
                                                        align="end" 
                                                        className={`w-48 ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}
                                                    >
                                                        <DropdownMenuItem 
                                                            onClick={() => openChangeRoleDialog(user)}
                                                            disabled={userHasSuperAdminRole(user) && !isSuperAdmin}
                                                            className={`cursor-pointer ${isDark ? 'hover:bg-gray-700' : ''}`}
                                                        >
                                                            <UserCog className={`h-4 w-4 mr-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                                                            <span>Gérer les rôles</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem 
                                                            onClick={() => openEditDialog(user)}
                                                            className={`cursor-pointer ${isDark ? 'hover:bg-gray-700' : ''}`}
                                                        >
                                                            <Edit className={`h-4 w-4 mr-2 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                                                            <span>Modifier</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className={isDark ? 'bg-gray-700' : ''} />
                                                        <DropdownMenuItem 
                                                            onClick={() => openDeleteDialog(user)}
                                                            disabled={userHasSuperAdminRole(user) && !isSuperAdmin}
                                                            className={`cursor-pointer ${isDark ? 'hover:bg-gray-700 text-red-400' : 'text-red-600'}`}
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            <span>Supprimer</span>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Actions disponibles</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </TableCell>
                            </motion.tr>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={5} className={`text-center py-10 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                <div className="flex flex-col items-center justify-center">
                                    <User className={`h-10 w-10 ${isDark ? 'text-gray-600' : 'text-gray-300'} mb-2`} />
                                    <p className={`text-base font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-1`}>
                                        Aucun utilisateur trouvé
                                    </p>
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Modifiez vos filtres ou ajoutez de nouveaux utilisateurs
                                    </p>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </motion.div>
    );
} 