import React, { useState, useEffect } from 'react';
import { formationService } from '../lib/services/formationService';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UserPlus, Users, ChevronDown, ChevronUp, Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const FormationList = () => {
  const [formations, setFormations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedFormation, setSelectedFormation] = useState(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedFormation, setExpandedFormation] = useState(null);
  const [newFormation, setNewFormation] = useState({
    name: '',
    promotion: '',
    description: ''
  });

  useEffect(() => {
    loadFormations();
  }, []);

  const loadFormations = async () => {
    try {
      setLoading(true);
      const response = await formationService.getAllFormations();
      if (response.success === false) {
        toast.error(response.message || 'Erreur lors du chargement des formations');
        return;
      }
      setFormations(response);
    } catch (error) {
      console.error('Erreur lors du chargement des formations:', error);
      toast.error('Erreur lors du chargement des formations');
    } finally {
      setLoading(false);
    }
  };

  const showAddStudentModal = async (formation) => {
    setSelectedFormation(formation);
    try {
      const response = await formationService.getAvailableStudents(formation.id);
      if (response.success === false) {
        toast.error(response.message || 'Erreur lors du chargement des étudiants disponibles');
        return;
      }
      setAvailableStudents(response);
      setSelectedStudentIds([]);
      setShowModal(true);
    } catch (error) {
      console.error('Erreur lors du chargement des étudiants disponibles:', error);
      toast.error('Erreur lors du chargement des étudiants disponibles');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedFormation(null);
    setSelectedStudentIds([]);
    setAvailableStudents([]);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setNewFormation({ name: '', promotion: '', description: '' });
  };

  const toggleStudent = (studentId) => {
    setSelectedStudentIds(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleCreateFormation = async (e) => {
    e.preventDefault();
    if (!newFormation.name || !newFormation.promotion) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    try {
      const response = await formationService.createFormation(newFormation);
      if (response.success === false) {
        toast.error(response.message || 'Erreur lors de la création de la formation');
        return;
      }
      toast.success('Formation créée avec succès');
      await loadFormations();
      closeCreateModal();
    } catch (error) {
      console.error('Erreur lors de la création de la formation:', error);
      toast.error('Erreur lors de la création de la formation');
    }
  };

  const addStudents = async () => {
    if (selectedStudentIds.length === 0 || !selectedFormation) {
      toast.error('Veuillez sélectionner au moins un étudiant');
      return;
    }

    try {
      const promises = selectedStudentIds.map(studentId =>
        formationService.addStudentToFormation(selectedFormation.id, studentId)
      );
      
      await Promise.all(promises);
      toast.success('Étudiants ajoutés avec succès');
      await loadFormations();
      closeModal();
    } catch (error) {
      console.error('Erreur lors de l\'ajout des étudiants:', error);
      toast.error('Erreur lors de l\'ajout des étudiants');
    }
  };

  const toggleFormationExpand = (formationId) => {
    setExpandedFormation(expandedFormation === formationId ? null : formationId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-2xl font-bold">Gestion des Formations</CardTitle>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Créer une formation
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom de la formation</TableHead>
                <TableHead>Promotion</TableHead>
                <TableHead>Étudiants</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {formations.map((formation) => (
                <React.Fragment key={formation.id}>
                  <TableRow className="cursor-pointer hover:bg-gray-50" onClick={() => toggleFormationExpand(formation.id)}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        {expandedFormation === formation.id ? <ChevronUp className="w-4 h-4 mr-2" /> : <ChevronDown className="w-4 h-4 mr-2" />}
                        {formation.name}
                      </div>
                    </TableCell>
                    <TableCell>{formation.promotion}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        <Badge variant="secondary">
                          {formation.students.length} étudiants
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          showAddStudentModal(formation);
                        }}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Ajouter des étudiants
                      </Button>
                    </TableCell>
                  </TableRow>
                  {expandedFormation === formation.id && (
                    <TableRow>
                      <TableCell colSpan={4} className="bg-gray-50 p-4">
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm text-gray-700 mb-2">Liste des étudiants inscrits :</h4>
                          {formation.students.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                              {formation.students.map(student => (
                                <div key={student.id} className="flex items-center space-x-2 p-2 bg-white rounded-md shadow-sm">
                                  <Users className="h-4 w-4 text-gray-500" />
                                  <span>{student.firstName} {student.lastName}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 italic">Aucun étudiant inscrit</p>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal d'ajout d'étudiants */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter des étudiants à {selectedFormation?.name}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              {availableStudents.map((student) => (
                <div key={student.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`student-${student.id}`}
                    checked={selectedStudentIds.includes(student.id)}
                    onCheckedChange={() => toggleStudent(student.id)}
                  />
                  <label
                    htmlFor={`student-${student.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {student.firstName} {student.lastName}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>
              Annuler
            </Button>
            <Button onClick={addStudents}>
              Ajouter les étudiants
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de création de formation */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer une nouvelle formation</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateFormation}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nom de la formation</Label>
                <Input
                  id="name"
                  value={newFormation.name}
                  onChange={(e) => setNewFormation(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Entrez le nom de la formation"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="promotion">Promotion</Label>
                <Input
                  id="promotion"
                  value={newFormation.promotion}
                  onChange={(e) => setNewFormation(prev => ({ ...prev, promotion: e.target.value }))}
                  placeholder="Entrez la promotion"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newFormation.description}
                  onChange={(e) => setNewFormation(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Entrez une description (optionnel)"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeCreateModal}>
                Annuler
              </Button>
              <Button type="submit">
                Créer la formation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FormationList;
