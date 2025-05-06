import React, { useState, useEffect, useMemo } from 'react';
import { useFormationTeachers } from '../../hooks/useFormationTeachers';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const FormationTeachersSection = ({ formationId }) => {
  // Convertir formationId en nombre et valider
  const validFormationId = useMemo(() => {
    const id = parseInt(formationId);
    return !isNaN(id) ? id : null;
  }, [formationId]);

  // États locaux
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [isMainTeacher, setIsMainTeacher] = useState(false);

  // Utiliser le hook avec l'ID de formation validé
  const {
    availableTeachers,
    formationTeachers,
    isLoading,
    error,
    createTeacher,
    updateTeacher,
    deleteTeacher,
    isCreating,
    isUpdating,
    isDeleting
  } = useFormationTeachers(validFormationId);

  // Réinitialiser les états quand formationId change
  useEffect(() => {
    setSelectedTeacherId('');
    setIsMainTeacher(false);
  }, [formationId]);

  // Gérer l'ajout d'un enseignant
  const handleAddTeacher = async () => {
    if (!selectedTeacherId || !validFormationId) {
      toast.error('Veuillez sélectionner un enseignant');
      return;
    }

    try {
      await createTeacher({
        formationId: validFormationId,
        userId: parseInt(selectedTeacherId),
        isMainTeacher
      });
      setSelectedTeacherId('');
      setIsMainTeacher(false);
      // Rafraîchir la page après l'ajout
      window.location.reload();
    } catch (error) {
      console.error('Error adding teacher:', error);
    }
  };

  // Gérer la mise à jour du statut d'un enseignant
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateTeacher({ id, isMainTeacher: newStatus });
      // Rafraîchir la page après la mise à jour
      window.location.reload();
    } catch (error) {
      console.error('Error updating teacher status:', error);
    }
  };

  // Gérer la suppression d'un enseignant
  const handleDeleteTeacher = async (id) => {
    try {
      await deleteTeacher(id);
      // Rafraîchir la page après la suppression
      window.location.reload();
    } catch (error) {
      console.error('Error deleting teacher:', error);
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