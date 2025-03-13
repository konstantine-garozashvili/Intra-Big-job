import React from 'react';
import { GraduationCap, Briefcase, Pencil, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from 'sonner';
import * as roleUtils from '../../utils/roleUtils';

const AcademicInformation = ({ 
  userData, 
  editMode, 
  setEditMode, 
  editedData, 
  setEditedData, 
  userRole,
  diplomas,
  onSave 
}) => {
  const handleInputChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      academic: {
        ...prev.academic,
        [field]: value,
      },
    }));
  };

  const handleSaveAcademic = async () => {
    try {
      // Call the parent save handler
      await onSave(editedData.academic);
      
      // Exit edit mode
      setEditMode(prev => ({
        ...prev,
        academic: false
      }));
      
      toast.success('Informations académiques mises à jour avec succès');
    } catch (error) {
      console.error('Error updating academic information:', error);
      toast.error('Erreur lors de la mise à jour des informations académiques');
    }
  };

  const handleCancel = () => {
    setEditedData(prev => ({
      ...prev,
      academic: {
        situationType: userData.situationType || '',
        currentDiploma: userData.currentDiploma || '',
      },
    }));
    setEditMode(prev => ({
      ...prev,
      academic: false,
    }));
  };

  // Check if this component should be rendered at all
  const shouldRenderAcademic = () => {
    return roleUtils.isAdmin(userRole) || roleUtils.isStudent(userRole);
  };

  if (!shouldRenderAcademic()) {
    return null;
  }
};

export default AcademicInformation; 