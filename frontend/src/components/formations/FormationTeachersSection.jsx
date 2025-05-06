import React, { useState, useEffect, useMemo } from 'react';
import apiService from '../../lib/services/apiService';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const FormationTeachersSection = ({ formationId }) => {
  // États locaux
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [isMainTeacher, setIsMainTeacher] = useState(false);
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [formationTeachers, setFormationTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Convertir formationId en nombre et valider
  const validFormationId = useMemo(() => {
    const id = parseInt(formationId);
    return !isNaN(id) ? id : null;
  }, [formationId]);

  // Charger les données initiales
  const loadData = async () => {
    if (!validFormationId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const [availableResponse, formationResponse] = await Promise.all([
        apiService.get('/api/formation-teachers/available-teachers'),
        apiService.get(`/api/formation-teachers/formation/${validFormationId}`)
      ]);
      
      setAvailableTeachers(availableResponse.data || []);
      setFormationTeachers(formationResponse.data || []);
    } catch (err) {
      setError(err.message || 'Une erreur est survenue lors du chargement des données');
      toast.error('Erreur de chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les données au montage et quand formationId change
  useEffect(() => {
    loadData();
  }, [validFormationId]);

  // Réinitialiser les états quand formationId change
  useEffect(() => {
    setSelectedTeacherId('');
    setIsMainTeacher(false);
  }, [formationId]);

  // Gérer l'ajout d'un enseignant (mise à jour optimiste)
  const handleAddTeacher = async () => {
    if (!selectedTeacherId || !validFormationId) {
      toast.error('Veuillez sélectionner un enseignant');
      return;
    }

    setIsCreating(true);
    
    // Trouver l'enseignant sélectionné dans la liste des disponibles
    const selectedTeacher = availableTeachers.find(t => t.id === parseInt(selectedTeacherId));
    if (!selectedTeacher) {
      toast.error('Enseignant non trouvé');
      return;
    }

    // Créer un objet optimiste pour l'affichage immédiat
    const optimisticTeacher = {
      id: `temp_${Date.now()}`, // ID temporaire
      isMainTeacher,
      user: selectedTeacher,
      formation: { id: validFormationId }
    };

    // Mise à jour optimiste de l'UI
    setFormationTeachers(prev => [...prev, optimisticTeacher]);
    setAvailableTeachers(prev => prev.filter(t => t.id !== selectedTeacher.id));
    setSelectedTeacherId('');
    setIsMainTeacher(false);

    try {
      const response = await apiService.post('/api/formation-teachers', {
        formation_id: validFormationId,
        user_id: parseInt(selectedTeacherId),
        is_main_teacher: isMainTeacher
      });
      
      // Mettre à jour l'ID temporaire avec l'ID réel
      if (response.data?.id) {
        setFormationTeachers(prev => 
          prev.map(ft => 
            ft.id === optimisticTeacher.id 
              ? { ...ft, id: response.data.id }
              : ft
          )
        );
      }
      
      toast.success('Enseignant ajouté avec succès');
    } catch (error) {
      console.error('Error adding teacher:', error);
      toast.error(error.message || 'Erreur lors de l\'ajout de l\'enseignant');
      // On pourrait faire un rollback ici si nécessaire
    } finally {
      setIsCreating(false);
    }
  };

  // Gérer la mise à jour du statut d'un enseignant (mise à jour optimiste)
  const handleUpdateStatus = async (id, newStatus) => {
    setIsUpdating(true);

    // Mise à jour optimiste de l'UI
    setFormationTeachers(prev =>
      prev.map(ft =>
        ft.id === id ? { ...ft, isMainTeacher: newStatus } : ft
      )
    );

    try {
      await apiService.put(`/api/formation-teachers/${id}`, {
        is_main_teacher: newStatus
      });
      
      toast.success('Statut mis à jour avec succès');
    } catch (error) {
      console.error('Error updating teacher status:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour du statut');
      // On pourrait faire un rollback ici si nécessaire
    } finally {
      setIsUpdating(false);
    }
  };

  // Gérer la suppression d'un enseignant (mise à jour optimiste)
  const handleDeleteTeacher = async (id) => {
    setIsDeleting(true);

    // Trouver l'enseignant à supprimer pour la mise à jour optimiste
    const teacherToRemove = formationTeachers.find(ft => ft.id === id);
    
    // Mise à jour optimiste de l'UI
    setFormationTeachers(prev => prev.filter(ft => ft.id !== id));
    if (teacherToRemove?.user) {
      setAvailableTeachers(prev => [...prev, teacherToRemove.user]);
    }

    try {
      await apiService.delete(`/api/formation-teachers/${id}`);
      toast.success('Enseignant supprimé avec succès');
    } catch (error) {
      console.error('Error deleting teacher:', error);
      toast.error(error.message || 'Erreur lors de la suppression');
      // On pourrait faire un rollback ici si nécessaire
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtrer les enseignants disponibles
  const filteredAvailableTeachers = useMemo(() => {
    if (!Array.isArray(availableTeachers) || !Array.isArray(formationTeachers)) {
      return [];
    }
    return availableTeachers.filter(
      teacher => !formationTeachers.some(ft => ft?.user?.id === teacher.id)
    );
  }, [availableTeachers, formationTeachers]);

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Une erreur est survenue lors du chargement des données
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Gestion des enseignants</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Formulaire d'ajout */}
        <div className="space-y-4 mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex-1">
              <Label htmlFor="teacher-select">Sélectionner un enseignant</Label>
              <Select
                value={selectedTeacherId}
                onValueChange={setSelectedTeacherId}
                disabled={isLoading || isCreating}
              >
                <SelectTrigger id="teacher-select">
                  <SelectValue placeholder="Choisir un enseignant" />
                </SelectTrigger>
                <SelectContent>
                  {filteredAvailableTeachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={String(teacher.id)}>
                      {teacher.firstName} {teacher.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="main-teacher"
                checked={isMainTeacher}
                onCheckedChange={setIsMainTeacher}
                disabled={isLoading || isCreating}
              />
              <Label htmlFor="main-teacher">Formateur principal</Label>
            </div>
            <Button
              onClick={handleAddTeacher}
              disabled={!selectedTeacherId || isLoading || isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ajout en cours...
                </>
              ) : (
                'Ajouter'
              )}
            </Button>
          </div>
        </div>

        {/* Liste des enseignants */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : formationTeachers.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              Aucun enseignant assigné à cette formation
            </div>
          ) : (
            formationTeachers.map((ft) => (
              <div
                key={ft.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div>
                    <div className="font-medium">
                      {ft.user.firstName} {ft.user.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{ft.user.email}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`main-teacher-${ft.id}`}
                      checked={ft.isMainTeacher}
                      onCheckedChange={(checked) => handleUpdateStatus(ft.id, checked)}
                      disabled={isUpdating}
                    />
                    <Label htmlFor={`main-teacher-${ft.id}`}>Principal</Label>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteTeacher(ft.id)}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FormationTeachersSection; 