import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Filter, RefreshCw, X, Search } from "lucide-react";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { 
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { getFrenchRoleDisplayName } from "@/lib/utils/roleDisplay";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";

export function UserFilters({ 
    roles, 
    filterRole, 
    setFilterRole, 
    searchTerm, 
    setSearchTerm, 
    fetchUsers, 
    isLoading 
}) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const urlFilter = searchParams.get('filter');
    
    // État local pour la valeur du select, qui sera synchronisée avec filterRole
    const [localFilterValue, setLocalFilterValue] = useState(filterRole);
    
    // Normaliser les noms de rôle pour permettre la comparaison
    const normalizeRoleName = (roleName) => {
        if (!roleName) return '';
        return roleName.replace(/^ROLE_/, '').toUpperCase();
    };
    
    // Identifie l'ID du rôle sélectionné en fonction de l'URL
    const selectedRoleValue = useMemo(() => {
        // Si pas de filtre dans l'URL, retourner ALL
        if (!urlFilter) return "ALL";
        
        // Normaliser le nom du rôle depuis l'URL
        const normalizedUrlFilter = normalizeRoleName(urlFilter);
        
        // Chercher d'abord une correspondance exacte (avec ou sans préfixe)
        const exactMatch = roles.find(role => 
            role.name === urlFilter || 
            normalizeRoleName(role.name) === normalizedUrlFilter
        );
        
        if (exactMatch) {
            return exactMatch.name;
        }
        
        // Sinon chercher une correspondance partielle
        const partialMatch = roles.find(role => 
            normalizeRoleName(role.name) === normalizedUrlFilter
        );
        
        if (partialMatch) {
            return partialMatch.name;
        }
        
        // Si aucune correspondance, garder le filtre tel quel
        return urlFilter;
    }, [urlFilter, roles]);
    
    // Ne garder que l'effet pour initialiser localFilterValue depuis selectedRoleValue au besoin
    useEffect(() => {
        // Ne mettre à jour que si selectedRoleValue change réellement et si c'est la première initialisation
        if (selectedRoleValue && localFilterValue !== selectedRoleValue) {
            setLocalFilterValue(selectedRoleValue);
        }
    }, [selectedRoleValue, localFilterValue]);
    
    // Gérer le changement de valeur du select
    const handleSelectChange = (value) => {
        // Ajouter une vérification pour voir si la valeur est définie
        if (!value) {
            return;
        }
        
        // Mise à jour synchrone de l'état local
        setLocalFilterValue(value);
        
        // Mise à jour du filtre parent
        setFilterRole(value);
        
        // Mise à jour directe de l'URL sans passer par un effet
        if (value === "ALL") {
            navigate(`/admin/users`, { replace: true });
        } else {
            const urlRole = value.startsWith('ROLE_') ? value : `ROLE_${value}`;
            navigate(`/admin/users?filter=${urlRole}`, { replace: true });
        }
    };

    // Version alternative du Select avec un select HTML standard pour tester
    const renderStandardSelect = () => (
        <select 
            value={localFilterValue}
            onChange={(e) => {
                handleSelectChange(e.target.value);
            }}
            className="w-full p-2 border rounded bg-white"
        >
            <option value="ALL">Tous les rôles</option>
            {roles.map(role => (
                <option key={role.id} value={role.name}>
                    {getFrenchRoleDisplayName(role.name)}
                </option>
            ))}
        </select>
    );

    return (
        <motion.div 
            className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200 relative"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex items-center gap-2 mb-3">
                <Filter className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-medium text-gray-700">Filtres et recherche</h3>
                {filterRole !== "ALL" && (
                    <Badge variant="outline" className="ml-auto bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
                        Filtre actif: {getFrenchRoleDisplayName(filterRole)}
                        <button 
                            className="ml-1 hover:bg-blue-100 p-1 rounded-full" 
                            onClick={() => setFilterRole("ALL")}
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </Badge>
                )}
            </div>
            
            <div className="flex flex-col lg:flex-row justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="min-w-[200px]">
                                    {/* Restaurer le composant Select de Radix UI */}
                                    <Select
                                        value={localFilterValue}
                                        onValueChange={handleSelectChange}
                                    >
                                        <SelectTrigger className="w-full bg-white shadow-sm border-gray-200 hover:border-gray-300 transition-colors">
                                            <SelectValue placeholder="Filtrer par rôle" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[400px]">
                                            <SelectItem value="ALL" className="flex items-center gap-2">
                                                <span className="bg-gray-100 w-2 h-2 rounded-full"></span>
                                                Tous les rôles
                                            </SelectItem>
                                            {roles.map(role => (
                                                <SelectItem key={role.id} value={role.name} className="flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${getRoleColor(role.name)}`}></span>
                                                    {getFrenchRoleDisplayName(role.name)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    
                                    {/* Commenter le select HTML standard */}
                                    {/* {renderStandardSelect()} */}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Filtrer les utilisateurs par leur rôle</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button 
                                    variant="outline" 
                                    onClick={() => fetchUsers(filterRole)}
                                    disabled={isLoading}
                                    className="bg-white hover:bg-gray-50 transition-colors shadow-sm"
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            <RefreshCw className="h-4 w-4 mr-1" />
                                            Actualiser
                                        </>
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Rafraîchir la liste des utilisateurs</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                
                <div className="w-full lg:w-auto lg:min-w-[300px]">
                    <div className="relative">
                        <Input
                            placeholder="Rechercher un utilisateur..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white shadow-sm border-gray-200 hover:border-gray-300 transition-colors pl-10"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        {searchTerm && (
                            <button 
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-500"
                                onClick={() => setSearchTerm('')}
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// Helper function for role colors
function getRoleColor(role) {
    switch(role) {
        case 'SUPERADMIN':
        case 'ROLE_SUPERADMIN':
            return 'bg-red-500';
        case 'ADMIN':
        case 'ROLE_ADMIN':
            return 'bg-orange-500';
        case 'TEACHER':
        case 'ROLE_TEACHER':
            return 'bg-green-500';
        case 'STUDENT':
        case 'ROLE_STUDENT':
            return 'bg-blue-500';
        case 'HR':
        case 'ROLE_HR':
            return 'bg-purple-500';
        case 'GUEST':
        case 'ROLE_GUEST':
            return 'bg-yellow-500';
        case 'RECRUITER':
        case 'ROLE_RECRUITER':
            return 'bg-indigo-500';
        default:
            return 'bg-gray-500';
    }
} 