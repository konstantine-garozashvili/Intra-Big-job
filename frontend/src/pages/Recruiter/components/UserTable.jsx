import React from 'react';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, MoreHorizontal } from "lucide-react";
import RoleBadge from '@/components/ui/RoleBadge';

export function UserTable({ 
  users, 
  sortConfig, 
  onSort, 
  onChangeRole, 
  getCurrentRole 
}) {
  // Function to generate the sort icon
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <MoreHorizontal className="w-4 h-4 ml-1" />;
    }
    return sortConfig.direction === 'ascending' 
      ? <ArrowUp className="w-4 h-4 ml-1" /> 
      : <ArrowDown className="w-4 h-4 ml-1" />;
  };

  // Function to determine the text of the change role button
  const getChangeRoleButtonText = (user) => {
    const currentRoleName = getCurrentRole(user);
    
    if (currentRoleName.toLowerCase().includes('guest')) {
      return "Promouvoir en élève";
    } else if (currentRoleName.toLowerCase().includes('student')) {
      return "Rétrograder en invité";
    }
    
    return "Changer le rôle";
  };

  // Function to handle sorting
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    onSort({ key, direction });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="cursor-pointer" onClick={() => handleSort('lastName')}>
            <div className="flex items-center">
              Nom
              {getSortIcon('lastName')}
            </div>
          </TableHead>
          <TableHead className="cursor-pointer" onClick={() => handleSort('firstName')}>
            <div className="flex items-center">
              Prénom
              {getSortIcon('firstName')}
            </div>
          </TableHead>
          <TableHead className="cursor-pointer" onClick={() => handleSort('email')}>
            <div className="flex items-center">
              Email
              {getSortIcon('email')}
            </div>
          </TableHead>
          <TableHead>Rôles actuels</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map(user => (
          <TableRow key={user.id}>
            <TableCell>{user.lastName}</TableCell>
            <TableCell>{user.firstName}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              {user.roles.map(role => {
                const roleName = typeof role === 'object' && role !== null ? role.name : 
                             typeof role === 'string' ? role : 'USER';
                
                return (
                  <RoleBadge 
                    key={typeof role === 'object' ? role.id || roleName : roleName} 
                    role={roleName}
                    solid={true}
                    className="mr-1.5"
                  />
                );
              })}
            </TableCell>
            <TableCell className="text-right">
              <Button 
                variant="outline"
                onClick={() => onChangeRole(user)}
                className="w-52 text-center"
              >
                {getChangeRoleButtonText(user)}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
