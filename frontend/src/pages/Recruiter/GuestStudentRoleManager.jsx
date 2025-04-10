import React, { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import DashboardLayout from "@/components/DashboardLayout";
import RoleBadge from "@/components/ui/RoleBadge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import authService from "@/lib/services/authService";

// Import extracted components
import { RoleFilterControls } from "./components/RoleFilterControls";
import { UserTable } from "./components/UserTable";
import { PaginationControls } from "./components/PaginationControls";

// Create axios instance with auth token
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5173/api',
});

// Add auth token to requests
axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API endpoints
const ENDPOINTS = {
  USERS_BY_ROLES: '/users',
  CHANGE_ROLE: '/user-roles/change-role'
};

const RoleChangeDialog = ({ open, onOpenChange, user, onConfirm, isProcessing }) => {
  const isGuest = user?.roles?.some(r => r.name === 'GUEST' || r.name === 'ROLE_GUEST');
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmation du changement de rôle</DialogTitle>
          <DialogDescription>
            {isGuest 
              ? `Êtes-vous sûr de vouloir promouvoir ${user?.firstName} ${user?.lastName} en tant qu'élève ?`
              : `Êtes-vous sûr de vouloir rétrograder ${user?.firstName} ${user?.lastName} en tant qu'invité ?`
            }
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={onConfirm} disabled={isProcessing}>
            {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Confirmer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function GuestStudentRoleManager() {
  const queryClient = useQueryClient();
  
  // State
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState({ guest: true, student: false });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [users, setUsers] = useState([]);

  // Fetch users based on selected roles
  const { data: usersData = [], isLoading } = useQuery({
    queryKey: ['guest-student-users', selectedRoles],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get(ENDPOINTS.USERS_BY_ROLES);
        if (response.data.success) {
          const users = response.data.data || [];
          // Filter users based on selected roles
          return users.filter(user => {
            const userRoles = user.roles.map(r => r.name);
            if (selectedRoles.guest && userRoles.includes('GUEST')) return true;
            if (selectedRoles.student && userRoles.includes('STUDENT')) return true;
            return false;
          });
        }
        return [];
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Erreur lors de la récupération des utilisateurs');
        return [];
      }
    }
  });

  // Role change mutation
  const mutation = useMutation({
    mutationFn: async (user) => {
      const isGuest = user.roles.some(r => r.name === 'GUEST' || r.name === 'ROLE_GUEST');
      const newRole = isGuest ? 'ROLE_STUDENT' : 'ROLE_GUEST';
      
      return axiosInstance.post(ENDPOINTS.CHANGE_ROLE, {
        userId: user.id,
        newRole
      });
    },
    onSuccess: (_, user) => {
      const isGuest = user.roles.some(r => r.name === 'GUEST' || r.name === 'ROLE_GUEST');
      toast.success(
        isGuest 
          ? `${user.firstName} ${user.lastName} a été promu en élève`
          : `${user.firstName} ${user.lastName} a été rétrogradé en invité`
      );
      queryClient.invalidateQueries(['guest-student-users']);
      setIsDialogOpen(false);
    },
    onError: (error) => {
      console.error('Error changing role:', error);
      toast.error("Une erreur est survenue lors du changement de rôle");
    }
  });

  // Calculate pagination
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return usersData.slice(startIndex, endIndex);
  }, [usersData, currentPage]);

  // Check if user is authorized (recruiter or admin)
  useEffect(() => {
    const checkUserRole = () => {
      const currentUser = authService.getUser();
      
      const isRecruiter = currentUser?.roles?.some(role => 
        typeof role === 'string' 
          ? role.toLowerCase().includes('recruiter')
          : (role.name || role.role || '').toLowerCase().includes('recruiter')
      );
      
      const isAdmin = currentUser?.roles?.some(role => 
        typeof role === 'string' 
          ? (role.toLowerCase().includes('admin') || role.toLowerCase().includes('superadmin'))
          : (role.name || role.role || '').toLowerCase().includes('admin')
      );
      
      if (!isRecruiter && !isAdmin) {
        toast.error("Vous n'avez pas les droits pour accéder à cette page");
        // Redirect logic could be added here
      }
    };
    
    checkUserRole();
  }, []);

  useEffect(() => {
    if (usersData) {
      setUsers(usersData);
    }
  }, [usersData]);

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Gestion des rôles Invité/Élève</CardTitle>
            <CardDescription>
              Gérez la promotion des invités en élèves et la rétrogradation des élèves en invités
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="invites"
                  checked={selectedRoles.guest}
                  onCheckedChange={(checked) => 
                    setSelectedRoles(prev => ({ ...prev, guest: checked }))
                  }
                />
                <label htmlFor="invites">Invités</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="eleves"
                  checked={selectedRoles.student}
                  onCheckedChange={(checked) => 
                    setSelectedRoles(prev => ({ ...prev, student: checked }))
                  }
                />
                <label htmlFor="eleves">Élèves</label>
              </div>
              <div className="ml-auto flex items-center space-x-2">
                <span>Éléments par page:</span>
                <select
                  className="border rounded p-1"
                  value={itemsPerPage}
                  disabled
                >
                  <option value={10}>10</option>
                </select>
                <span>Affichage de {paginatedUsers.length} sur {users.length} utilisateurs</span>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Nom ↑</TableHead>
                  <TableHead>Prénom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôles actuels</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.lastName}</TableCell>
                      <TableCell>{user.firstName}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.roles.map((role) => (
                          <RoleBadge
                            key={role.id || role.name}
                            role={role.name}
                            className="mr-1"
                          />
                        ))}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setSelectedUser(user);
                            setIsDialogOpen(true);
                          }}
                        >
                          {user.roles.some(r => r.name === 'GUEST' || r.name === 'ROLE_GUEST')
                            ? 'Promouvoir en élève'
                            : 'Rétrograder en invité'
                          }
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <RoleChangeDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        user={selectedUser}
        onConfirm={() => mutation.mutate(selectedUser)}
        isProcessing={mutation.isPending}
      />
    </DashboardLayout>
  );
}
