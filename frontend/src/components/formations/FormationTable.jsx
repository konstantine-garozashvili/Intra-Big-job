import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import formationService from '../../services/formationService';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

const FormationList = () => {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFormations();
  }, []);

  const loadFormations = async () => {
    try {
      const data = await formationService.getAllFormations();
      console.log('Formations reçues:', data);
      setFormations(data || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des formations');
      console.error('Error loading formations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) {
      try {
        await formationService.deleteFormation(id);
        toast.success('Formation supprimée avec succès');
        loadFormations();
      } catch (error) {
        toast.error('Erreur lors de la suppression de la formation');
        console.error('Error deleting formation:', error);
      }
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!formations || formations.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Liste des Formations</h1>
          <Link to="/formations/new">
            <Button>Nouvelle Formation</Button>
          </Link>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500">Aucune formation disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Liste des Formations</h1>
        <Link to="/formations/new">
          <Button>Nouvelle Formation</Button>
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Promotion</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Capacité</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {formations.map((formation) => (
            <TableRow key={formation.id}>
              <TableCell>{formation.name}</TableCell>
              <TableCell>{formation.promotion}</TableCell>
              <TableCell>{formation.description}</TableCell>
              <TableCell>{formation.capacity}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Link to={`/formations/edit/${formation.id}`}>
                    <Button variant="outline" size="sm">
                      Modifier
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(formation.id)}
                  >
                    Supprimer
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default FormationList; 