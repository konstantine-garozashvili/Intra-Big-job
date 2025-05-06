import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formationService } from '../../services/formation.service';
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
import { Image as ImageIcon, Pencil, Trash2 } from 'lucide-react';

const FormationTable = () => {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadFormations();
  }, []);

  const loadFormations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await formationService.getAllFormations();
      setFormations(data);
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) {
      try {
        await formationService.deleteFormation(id);
        toast.success('Formation supprimée avec succès');
        setFormations(prev => prev.filter(f => f.id !== id));
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  if (loading) {
    return <div className="text-center p-4">Chargement...</div>;
  }

  if (error) {
    return (
      <div className="text-center p-4 text-red-500">
        Erreur: {error}
        <Button onClick={loadFormations} className="ml-2">Réessayer</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold tracking-tight text-primary drop-shadow">Liste des Formations</h2>
        <Link to="/formations/new">
          <Button className="bg-gradient-to-r from-blue-600 to-cyan-400 text-white shadow-lg hover:from-blue-700 hover:to-cyan-500 transition">Nouvelle Formation</Button>
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl shadow-lg bg-white dark:bg-gray-900">
        <Table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <TableHeader className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-800">
            <TableRow>
              <TableHead className="py-3 px-4 text-left font-semibold text-gray-700 dark:text-gray-200">Image</TableHead>
              <TableHead className="py-3 px-4 text-left font-semibold text-gray-700 dark:text-gray-200">Nom</TableHead>
              <TableHead className="py-3 px-4 text-left font-semibold text-gray-700 dark:text-gray-200">Promotion</TableHead>
              <TableHead className="py-3 px-4 text-left font-semibold text-gray-700 dark:text-gray-200">Spécialisation</TableHead>
              <TableHead className="py-3 px-4 text-center font-semibold text-gray-700 dark:text-gray-200">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {formations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-400 dark:text-gray-500 text-lg">
                  Aucune formation trouvée.
                </TableCell>
              </TableRow>
            ) : (
              formations.map((formation, idx) => (
                <TableRow
                  key={formation.id}
                  className={`transition hover:bg-blue-50 dark:hover:bg-gray-800/60 ${idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}`}
                >
                  <TableCell className="py-3 px-4">
                    {formation.image_url ? (
                      <img
                        src={formation.image_url}
                        alt={formation.name}
                        className="w-12 h-12 object-cover rounded-full shadow border-2 border-blue-200 dark:border-gray-700 bg-white"
                      />
                    ) : (
                      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 shadow">
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">{formation.name}</TableCell>
                  <TableCell className="py-3 px-4 text-gray-700 dark:text-gray-300">{formation.promotion}</TableCell>
                  <TableCell className="py-3 px-4 text-gray-700 dark:text-gray-300">{formation.specialization?.name || 'Non spécifiée'}</TableCell>
                  <TableCell className="py-3 px-4 text-center">
                    <div className="flex gap-2 justify-center">
                      <Link to={`/formations/edit/${formation.id}`}>
                        <Button variant="outline" size="icon" className="hover:border-blue-500 hover:text-blue-600 transition">
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="hover:bg-red-600 hover:text-white transition"
                        onClick={() => handleDelete(formation.id)}
                        title="Supprimer la formation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default FormationTable; 