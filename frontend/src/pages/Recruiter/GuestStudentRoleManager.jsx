import React, { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import authService from "@/lib/services/authService";

// Import extracted components
import { RoleFilterControls } from "./components/RoleFilterControls";
import { UserTable } from "./components/UserTable";
import { PaginationControls } from "./components/PaginationControls";
import { RoleChangeDialog } from "./components/RoleChangeDialog";

// Create axios instance with auth token
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
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
  ROLES: '/user-roles/roles',
  USERS_BY_ROLE: (role) => `/user-roles/users/${role}`,
  CHANGE_ROLE: '/user-roles/change-role'
};

export default function GuestStudentRoleManager() {
  const queryClient = useQueryClient();
  
  // State
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState({ guest: true, student: false });
  const [sortConfig, setSortConfig] = useState({ key: 'lastName', direction: 'ascending' });
  const [pagination, setPagination] = useState({ currentPage: 1, itemsPerPage: 10 });

  // Fetch roles
  const { 
    data: roles = [], 
    isLoading: isLoadingRoles 
  } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get(ENDPOINTS.ROLES);
        
        // Handle different response formats
        if (response.status === 200 && response.data) {
          if (response.data.success && response.data.data) {
            return response.data.data;
          } else if (Array.isArray(response.data)) {
            return response.data;
          } else if (response.data.data || response.data.roles) {
            return response.data.data || response.data.roles;
          } else if (response.data.hydra && response.data['hydra:member']) {
            return response.data['hydra:member'];
          }
        }
        
        // Default fallback
        return [];
      } catch (error) {
        console.error("Error fetching roles:", error);
        // Fallback roles
        return [
          { id: 1, name: 'ROLE_GUEST' },
          { id: 2, name: 'ROLE_STUDENT' },
          { id: 3, name: 'ROLE_RECRUITER' },
          { id: 4, name: 'ROLE_ADMIN' }
        ];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Helper function to normalize API response
  const normalizeApiResponse = (response) => {
    if (response.status === 200 && response.data) {
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data.data || response.data.users) {
        return response.data.data || response.data.users;
      } else if (response.data.hydra && response.data['hydra:member']) {
        return response.data['hydra:member'];
      }
    }
    return [];
  };

  // Fetch guest users
  const { 
    data: guestUsers = [], 
    isLoading: isLoadingGuests 
  } = useQuery({
    queryKey: ['users', 'guest'],
    queryFn: async () => {
      try {
        const guestRole = roles.find(r => r.name.toLowerCase().includes('guest'));
        if (!guestRole) return [];
        
        const response = await axiosInstance.get(ENDPOINTS.USERS_BY_ROLE(guestRole.name));
        return normalizeApiResponse(response);
      } catch (error) {
        console.error("Error fetching guest users:", error);
        // Fallback guest users
        return [
          { 
            id: 1, 
            firstName: 'Jean', 
            lastName: 'Dupont', 
            email: 'jean.dupont@exemple.fr',
            roles: [{ id: 1, name: 'ROLE_GUEST' }]
          },
          { 
            id: 2, 
            firstName: 'Marie', 
            lastName: 'Martin', 
            email: 'marie.martin@exemple.fr',
            roles: [{ id: 1, name: 'ROLE_GUEST' }]
          }
        ];
      }
    },
    enabled: selectedRoles.guest && roles.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch student users
  const { 
    data: studentUsers = [], 
    isLoading: isLoadingStudents 
  } = useQuery({
    queryKey: ['users', 'student'],
    queryFn: async () => {
      try {
        const studentRole = roles.find(r => r.name.toLowerCase().includes('student'));
        if (!studentRole) return [];
        
        const response = await axiosInstance.get(ENDPOINTS.USERS_BY_ROLE(studentRole.name));
        return normalizeApiResponse(response);
      } catch (error) {
        console.error("Error fetching student users:", error);
        // Fallback student users
        return [
          { 
            id: 3, 
            firstName: 'Pierre', 
            lastName: 'Leroy', 
            email: 'pierre.leroy@exemple.fr',
            roles: [{ id: 2, name: 'ROLE_STUDENT' }]
          },
          { 
            id: 4, 
            firstName: 'Sophie', 
            lastName: 'Bernard', 
            email: 'sophie.bernard@exemple.fr',
            roles: [{ id: 2, name: 'ROLE_STUDENT' }]
          }
        ];
      }
    },
    enabled: selectedRoles.student && roles.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Role change mutation
  const roleMutation = useMutation({
    mutationFn: async (data) => {
      const response = await axiosInstance.post(ENDPOINTS.CHANGE_ROLE, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      setIsDialogOpen(false);
      
      const message = getCurrentRole(selectedUser).toLowerCase().includes('guest')
        ? `${selectedUser.firstName} ${selectedUser.lastName} a été promu en élève`
        : `${selectedUser.firstName} ${selectedUser.lastName} a été rétrogradé en invité`;
      
      toast.success(message);
    },
    onError: (error) => {
      console.error("Error changing role:", error);
      toast.error("Erreur lors de la modification du rôle");
    }
  });

  // Helper functions
  const getCurrentRole = useCallback((user) => {
    return user?.roles?.find(role => 
      role.name.toLowerCase().includes('guest') || 
      role.name.toLowerCase().includes('student')
    )?.name || '';
  }, []);
  
  const getNewRole = useCallback((user) => {
    const currentRoleName = getCurrentRole(user);
    return currentRoleName.toLowerCase().includes('guest') 
      ? roles.find(r => r.name.toLowerCase().includes('student'))?.name
      : roles.find(r => r.name.toLowerCase().includes('guest'))?.name;
  }, [getCurrentRole, roles]);

  // Handle role change
  const handleRoleChange = useCallback(() => {
    if (!selectedUser) return;
    
    const currentRoleName = getCurrentRole(selectedUser);
    const newRoleName = getNewRole(selectedUser);
    
    roleMutation.mutate({
      userId: selectedUser.id,
      oldRoleName: currentRoleName,
      newRoleName: newRoleName
    });
  }, [selectedUser, getCurrentRole, getNewRole, roleMutation]);

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    let users = [];
    
    if (selectedRoles.guest) {
      users.push(...guestUsers);
    }
    
    if (selectedRoles.student) {
      users.push(...studentUsers);
    }
    
    return [...users].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }, [guestUsers, studentUsers, selectedRoles, sortConfig]);
  
  // Paginate users
  const currentUsers = useMemo(() => {
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, pagination]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredUsers.length / pagination.itemsPerPage);
  }, [filteredUsers.length, pagination.itemsPerPage]);

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

  const isLoading = isLoadingRoles || isLoadingGuests || (isLoadingStudents && selectedRoles.student);

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Gestion des rôles Invité/Élève</CardTitle>
          <CardDescription>
            Gérez la promotion des invités en élèves et la rétrogradation des élèves en invités
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RoleFilterControls 
            selectedRoles={selectedRoles} 
            onChange={setSelectedRoles}
            pagination={pagination}
            setPagination={setPagination}
            filteredUsers={filteredUsers}
          />
          
          {isLoading ? (
            <div className="text-center py-8 flex justify-center">
              <Loader2 className="w-8 h-8 text-gray-500 animate-spin" />
            </div>
          ) : (
            <>
              <UserTable 
                users={currentUsers}
                sortConfig={sortConfig}
                onSort={setSortConfig}
                onChangeRole={(user) => {
                  setSelectedUser(user);
                  setIsDialogOpen(true);
                }}
                getCurrentRole={getCurrentRole}
              />
              
              <PaginationControls 
                currentPage={pagination.currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setPagination({...pagination, currentPage: page})}
                itemsPerPage={pagination.itemsPerPage}
                onItemsPerPageChange={(value) => setPagination({currentPage: 1, itemsPerPage: value})}
              />
            </>
          )}
        </CardContent>
      </Card>

      <RoleChangeDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        user={selectedUser}
        getCurrentRole={getCurrentRole}
        getNewRole={getNewRole}
        onConfirm={handleRoleChange}
        isProcessing={roleMutation.isPending}
      />
    </div>
  );
}
