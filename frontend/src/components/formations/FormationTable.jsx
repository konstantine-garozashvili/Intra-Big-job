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
import { Image as ImageIcon } from 'lucide-react';

const FormationTable = () => {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadFormations = async () => {
      try {
        const data = await formationService.getAllFormations();
        if (isMounted) {
          setFormations(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error loading formations:', error);
        if (isMounted) {
          toast.error('Erreur lors du chargement des formations');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadFormations();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) {
      try {
        const response = await formationService.deleteFormation(id);
        if (response && response.success) {
          toast.success('Formation supprimée avec succès');
          setFormations(prev => prev.filter(f => f.id !== id));
        } else {
          throw new Error(response?.message || 'Erreur lors de la suppression');
        }
      } catch (error) {
        console.error('Error deleting formation:', error);
        toast.error(error.message || 'Erreur lors de la suppression de la formation');
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">
          <p>Chargement...</p>
        </div>
      </div>
    );
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
            <TableHead>Spécialisation</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {formations.map((formation) => (
            <TableRow key={formation.id}>
              <TableCell>{formation.name}</TableCell>
              <TableCell>{formation.promotion}</TableCell>
              <TableCell>{formation.description}</TableCell>
              <TableCell>{formation.specialization?.name || 'Non spécifiée'}</TableCell>
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

export default FormationTable; 