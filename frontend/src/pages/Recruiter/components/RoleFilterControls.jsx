import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function RoleFilterControls({ 
  selectedRoles, 
  onChange, 
  pagination, 
  setPagination, 
  filteredUsers 
}) {
  const itemsPerPageOptions = [10, 25, 50, 100];

  const handleRoleToggle = (role) => {
    // Update the selection
    onChange({
      ...selectedRoles,
      [role]: !selectedRoles[role]
    });
    
    // Reset pagination to first page
    setPagination({
      ...pagination,
      currentPage: 1
    });
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
      <div className="flex space-x-4">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="guest-filter" 
            checked={selectedRoles.guest}
            onCheckedChange={() => handleRoleToggle('guest')}
          />
          <Label htmlFor="guest-filter">Invités</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="student-filter" 
            checked={selectedRoles.student}
            onCheckedChange={() => handleRoleToggle('student')}
          />
          <Label htmlFor="student-filter">Élèves</Label>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Label htmlFor="items-per-page">Éléments par page:</Label>
        <select
          id="items-per-page"
          className="p-2 border rounded-md"
          value={pagination.itemsPerPage}
          onChange={(e) => {
            setPagination({
              ...pagination,
              itemsPerPage: Number(e.target.value),
              currentPage: 1
            });
          }}
        >
          {itemsPerPageOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <div className="text-sm text-gray-500">
          Affichage de {Math.min(filteredUsers.length, 1 + (pagination.currentPage - 1) * pagination.itemsPerPage)}-
          {Math.min(filteredUsers.length, pagination.currentPage * pagination.itemsPerPage)} 
          sur {filteredUsers.length} utilisateurs
        </div>
      </div>
    </div>
  );
}
