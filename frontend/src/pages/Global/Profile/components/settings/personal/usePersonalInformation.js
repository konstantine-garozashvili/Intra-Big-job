import { useState, useCallback } from 'react';
import * as roleUtils from '../../../utils/roleUtils';
import { profileService } from '../../../services/profileService';

/**
 * Hook personnalisé pour gérer les informations personnelles
 * @param {Object} userData - Données de l'utilisateur
 * @returns {Object} - États et fonctions pour gérer les informations personnelles
 */
export const usePersonalInformation = (userData) => {
  // État pour suivre les champs en cours d'édition
  const [editingFields, setEditingFields] = useState({
    firstName: false,
    lastName: false,
    email: false,
    phoneNumber: false,
    birthDate: false,
    linkedinUrl: false,
    address: false,
    portfolioUrl: false
  });
  
  // État pour stocker les données éditées
  const [personalData, setPersonalData] = useState({
    firstName: userData?.firstName || '',
    lastName: userData?.lastName || '',
    email: userData?.email || '',
    phoneNumber: userData?.phoneNumber || '',
    linkedinUrl: userData?.linkedinUrl || '',
    portfolioUrl: userData?.studentProfile?.portfolioUrl || ''
  });
  
  // État pour suivre le chargement
  const [isSaving, setIsSaving] = useState(false);
  
  const userRole = userData?.role || '';
  const isStudent = roleUtils.isStudent(userRole);
  const isAdmin = roleUtils.isAdmin(userRole);
  const studentProfile = userData?.studentProfile || null;
  
  // Déterminer si un champ est éditable en fonction du rôle
  const isFieldEditable = useCallback((field) => {
    return roleUtils.isFieldEditable(userRole, field);
  }, [userRole]);
  
  /**
   * Activer l'édition d'un champ
   * @param {string} fieldName - Nom du champ à éditer
   */
  const startEditing = useCallback((fieldName) => {
    setEditingFields(prev => ({ ...prev, [fieldName]: true }));
  }, []);
  
  /**
   * Annuler l'édition d'un champ et restaurer la valeur originale
   * @param {string} fieldName - Nom du champ dont l'édition est annulée
   */
  const cancelEditing = useCallback((fieldName) => {
    setEditingFields(prev => ({ ...prev, [fieldName]: false }));
    setPersonalData(prev => ({
      ...prev,
      [fieldName]: userData?.[fieldName] || ''
    }));
  }, [userData]);
  
  /**
   * Gérer le changement de valeur d'un champ
   * @param {string} fieldName - Nom du champ à modifier
   * @param {*} value - Nouvelle valeur
   */
  const handleChange = useCallback((fieldName, value) => {
    setPersonalData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  }, []);
  
  /**
   * Enregistrer les modifications des informations personnelles
   * @returns {Promise<Object>} - Résultat de la sauvegarde
   */
  const savePersonalInfo = useCallback(async () => {
    setIsSaving(true);
    
    try {
      const result = await profileService.updatePersonalInfo({
        firstName: personalData.firstName,
        lastName: personalData.lastName,
        email: personalData.email,
        phoneNumber: personalData.phoneNumber,
        linkedinUrl: personalData.linkedinUrl,
        portfolioUrl: personalData.portfolioUrl
      });
      
      // Réinitialiser tous les états d'édition
      setEditingFields({
        firstName: false,
        lastName: false,
        email: false,
        phoneNumber: false,
        birthDate: false,
        linkedinUrl: false,
        address: false,
        portfolioUrl: false
      });
      
      return result;
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des informations personnelles:", error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [personalData]);
  
  return {
    editingFields,
    personalData,
    isSaving,
    startEditing,
    cancelEditing,
    handleChange,
    savePersonalInfo,
    isStudent,
    isAdmin,
    isSuperAdmin: roleUtils.isFieldEditable(userRole, 'email'), // Utilisé pour vérifier si on est super admin
    studentProfile,
    isFieldEditable
  };
}; 