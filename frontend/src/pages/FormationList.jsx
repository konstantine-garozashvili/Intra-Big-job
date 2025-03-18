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
import { Loader2, UserPlus, Users, ChevronDown, ChevronUp } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const FormationList = () => {
  const [formations, setFormations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedFormation, setSelectedFormation] = useState(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedFormation, setExpandedFormation] = useState(null);

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

  const toggleStudent = (studentId) => {
    setSelectedStudentIds(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
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

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Ajouter des étudiants à {selectedFormation?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">
                {selectedStudentIds.length} étudiant{selectedStudentIds.length > 1 ? 's' : ''} sélectionné{selectedStudentIds.length > 1 ? 's' : ''}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (selectedStudentIds.length === availableStudents.length) {
                    setSelectedStudentIds([]);
                  } else {
                    setSelectedStudentIds(availableStudents.map(student => student.id));
                  }
                }}
              >
                {selectedStudentIds.length === availableStudents.length ? "Tout désélectionner" : "Tout sélectionner"}
              </Button>
            </div>
            <div className="space-y-4">
              {availableStudents.map(student => (
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
            <Button onClick={addStudents} disabled={selectedStudentIds.length === 0}>
              Ajouter {selectedStudentIds.length} étudiant{selectedStudentIds.length > 1 ? 's' : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FormationList;
