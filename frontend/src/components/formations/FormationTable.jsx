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

const FormationTable = () => {
  console.log('FormationTable component rendering');
  const [formations, setFormations] = useState(() => {
    console.log('Initial state setup');
    return [];
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('FormationTable useEffect triggered');
    let isMounted = true;

    const loadFormations = async () => {
      console.log('Starting loadFormations...');
      try {
        console.log('Before API call');
        const data = await formationService.getAllFormations();
        console.log('After API call, data:', data);
        
        if (isMounted) {
          console.log('Setting formations state with:', data);
          setFormations(data || []);
          console.log('State should be updated now');
        }
      } catch (error) {
        console.error('Detailed error:', error);
        if (isMounted) {
          toast.error('Erreur lors du chargement des formations');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          console.log('Loading complete');
        }
      }
    };

    loadFormations();
    
    return () => {
      console.log('Component cleanup');
      isMounted = false;
    };
  }, []);

  console.log('Current formations state:', formations);
  console.log('Current loading state:', loading);

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) {
      try {
        const response = await formationService.deleteFormation(id);
        if (response && response.success) {
          toast.success('Formation supprimée avec succès');
          // Recharger la liste des formations
          const updatedFormations = formations.filter(f => f.id !== id);
          setFormations(updatedFormations);
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
    console.log('Rendering loading state');
    return <div>Chargement...</div>;
  }

  if (!formations || formations.length === 0) {
    console.log('Rendering empty state');
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

  console.log('Rendering formations table with:', formations);
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
              <TableCell>{formation.capacity}</TableCell>
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