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
        console.log('Starting to load formations in FormationTable');
        const data = await formationService.getAllFormations();
        console.log('Received formations data:', data);
        
        if (isMounted) {
          setFormations(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error in FormationTable loadFormations:', error);
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
        await formationService.deleteFormation(id);
        toast.success('Formation supprimée avec succès');
        setFormations(prev => prev.filter(f => f.id !== id));
      } catch (error) {
        console.error('Error deleting formation:', error);
        toast.error('Erreur lors de la suppression de la formation');
      }
    }
  };

  const handleImageError = (e) => {
    console.error('Error loading formation image:', e.target.src);
    e.target.src = '/src/assets/placeholder.png';
  };
  
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Liste des formations</h2>
        <Link to="/formations/new">
          <Button>Nouvelle formation</Button>
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Nom</TableHead>
            <TableHead>Promotion</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {formations.map((formation) => (
            <TableRow key={formation.id}>
              <TableCell>
                {formation.image_url ? (
                  <img
                    src={formation.image_url}
                    alt={`${formation.name}`}
                    className="w-16 h-16 object-cover rounded"
                    onError={handleImageError}
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </TableCell>
              <TableCell>{formation.name}</TableCell>
              <TableCell>{formation.promotion}</TableCell>
              <TableCell>{formation.description}</TableCell>
              <TableCell>
                <div className="space-x-2">
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