import React from 'react';
import { RoleGuard, useRolePermissions, useRoleUI, ROLES } from '../features/roles';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

/**
 * Example component demonstrating different ways to use role-based features
 */
const RoleBasedExample = () => {
  // Use the role permissions hook for function-based checks
  const permissions = useRolePermissions();
  
  // Use the role UI hook for UI-related utilities
  const roleUI = useRoleUI();
  
  // Get the main role for display
  const mainRole = roleUI.getMainRole();
  const roleName = roleUI.translateRoleName(mainRole);
  const roleColor = roleUI.getRoleBadgeColor(mainRole);
  
  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Role-Based UI Examples</h1>
      
      {/* Current user role display */}
      <Card>
        <CardHeader>
          <CardTitle>Your Current Role</CardTitle>
          <CardDescription>This shows your primary role in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <span>You are currently a:</span>
            <Badge className={`bg-gradient-to-r ${roleColor} text-white`}>
              {roleName}
            </Badge>
          </div>
        </CardContent>
      </Card>
      
      {/* Example 1: Using RoleGuard component for conditional rendering */}
      <Card>
        <CardHeader>
          <CardTitle>Example 1: RoleGuard Component</CardTitle>
          <CardDescription>Using the RoleGuard component for declarative role-based rendering</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Only visible to admins */}
          <RoleGuard roles={ROLES.ADMIN} fallback={<p>You need admin access to see this content.</p>}>
            <div className="p-4 bg-amber-100 rounded-md border border-amber-300">
              <h3 className="font-semibold">Admin Only Content</h3>
              <p>This content is only visible to administrators.</p>
            </div>
          </RoleGuard>
          
          {/* Visible to either students or teachers */}
          <RoleGuard 
            roles={[ROLES.STUDENT, ROLES.TEACHER]} 
            fallback={<p>You need to be a student or teacher to see this content.</p>}
          >
            <div className="p-4 bg-blue-100 rounded-md border border-blue-300">
              <h3 className="font-semibold">Educational Content</h3>
              <p>This content is visible to students and teachers.</p>
            </div>
          </RoleGuard>
          
          {/* Visible only to users with both HR and Admin roles */}
          <RoleGuard 
            roles={[ROLES.HR, ROLES.ADMIN]} 
            requireAll={true}
            fallback={<p>You need both HR and Admin roles to see this content.</p>}
          >
            <div className="p-4 bg-purple-100 rounded-md border border-purple-300">
              <h3 className="font-semibold">HR Administration</h3>
              <p>This content requires both HR and Admin permissions.</p>
            </div>
          </RoleGuard>
        </CardContent>
      </Card>
      
      {/* Example 2: Using permission hooks for conditional rendering */}
      <Card>
        <CardHeader>
          <CardTitle>Example 2: Permission Hooks</CardTitle>
          <CardDescription>Using the useRolePermissions hook for programmatic checks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {permissions.isAdmin() && (
            <div className="p-4 bg-amber-100 rounded-md border border-amber-300">
              <h3 className="font-semibold">Admin Controls</h3>
              <p>These controls are only visible to administrators.</p>
              <Button variant="outline" className="mt-2">Manage Users</Button>
            </div>
          )}
          
          {permissions.isStudent() && (
            <div className="p-4 bg-blue-100 rounded-md border border-blue-300">
              <h3 className="font-semibold">Student Dashboard</h3>
              <p>Welcome to your student dashboard.</p>
              <Button variant="outline" className="mt-2">View Courses</Button>
            </div>
          )}
          
          {permissions.canEditPortfolioUrl() && (
            <div className="p-4 bg-green-100 rounded-md border border-green-300">
              <h3 className="font-semibold">Portfolio Settings</h3>
              <p>You can edit your portfolio URL here.</p>
              <Button variant="outline" className="mt-2">Edit Portfolio</Button>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            These components use the useRolePermissions hook for fine-grained permission checks.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RoleBasedExample; 