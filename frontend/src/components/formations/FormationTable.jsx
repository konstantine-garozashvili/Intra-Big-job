import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { formationService } from '../../services/formation.service';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { Skeleton } from '../ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Image as ImageIcon, Pencil, Trash2, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const FormationTableSkeleton = () => {
  return (
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
          {[...Array(5)].map((_, idx) => (
            <TableRow key={idx} className={`${idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}`}>
              <TableCell className="py-3 px-4">
                <Skeleton className="w-12 h-12 rounded-full" />
              </TableCell>
              <TableCell className="py-3 px-4">
                <Skeleton className="h-4 w-[200px]" />
              </TableCell>
              <TableCell className="py-3 px-4">
                <Skeleton className="h-4 w-[100px]" />
              </TableCell>
              <TableCell className="py-3 px-4">
                <Skeleton className="h-4 w-[150px]" />
              </TableCell>
              <TableCell className="py-3 px-4">
                <div className="flex gap-2 justify-center">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const FormationTable = () => {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 10,
    total: 0
  });
  const tableRef = useRef(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadFormations(1);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  useEffect(() => {
    loadFormations(pagination.currentPage);
  }, [pagination.currentPage]);

  useEffect(() => {
    if (tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [pagination.currentPage]);

  const loadFormations = async (page) => {
    try {
      setLoading(true);
      setError(null);
      const data = await formationService.getAllFormations(page, pagination.limit, searchTerm);
      setFormations(data.formations);
      setPagination(data.pagination);
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: newPage }));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) {
      // Suppression optimiste
      const prevFormations = formations;
      const newFormations = formations.filter(f => f.id !== id);
      setFormations(newFormations);
      setPagination(prev => ({
        ...prev,
        total: prev.total - 1,
        // Si on supprime le dernier élément de la page, on recule la page si possible
        currentPage: newFormations.length === 0 && prev.currentPage > 1 ? prev.currentPage - 1 : prev.currentPage
      }));
      try {
        await formationService.deleteFormation(id);
        toast.success('Formation supprimée avec succès');
        // Si la page est vide après suppression, recharge la page précédente
        if (newFormations.length === 0 && pagination.currentPage > 1) {
          loadFormations(pagination.currentPage - 1);
        }
      } catch (error) {
        // Restaure l'état initial en cas d'échec
        setFormations(prevFormations);
        setPagination(prev => ({ ...prev, total: prev.total + 1 }));
        toast.error(error.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <Skeleton className="h-10 w-[300px]" />
            <Skeleton className="h-10 w-[180px]" />
          </div>
        </div>
        <FormationTableSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 text-red-500">
        Erreur: {error}
        <Button onClick={() => loadFormations(pagination.currentPage)} className="ml-2">Réessayer</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
      >
        <div ref={tableRef} className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <input
                type="text"
                placeholder="Rechercher une formation..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 pr-4 py-2 w-full sm:w-[300px] rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
            <Link to="/formations/new">
              <Button className="bg-gradient-to-r from-blue-600 to-cyan-400 text-white shadow-lg hover:from-blue-700 hover:to-cyan-500 transition">
                Nouvelle Formation
              </Button>
            </Link>
          </div>
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
                      <Link to={`/formations/edit/${formation.id}`} tabIndex={0} aria-label={`Éditer la formation ${formation.name}`}>
                        {formation.image_url ? (
                          <img
                            src={formation.image_url}
                            alt={formation.name}
                            className="w-12 h-12 object-cover rounded-full shadow border-2 border-blue-200 dark:border-gray-700 bg-white hover:opacity-80 transition cursor-pointer"
                          />
                        ) : (
                          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 shadow hover:opacity-80 transition cursor-pointer">
                            <ImageIcon className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </Link>
                    </TableCell>
                    <TableCell className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                      <Link to={`/formations/edit/${formation.id}`} className="hover:underline text-blue-600 dark:text-blue-400 transition" tabIndex={0} aria-label={`Éditer la formation ${formation.name}`}>{formation.name}</Link>
                    </TableCell>
                    <TableCell className="py-3 px-4 text-gray-700 dark:text-gray-300">{formation.promotion}</TableCell>
                    <TableCell className="py-3 px-4 text-gray-700 dark:text-gray-300">{formation.specialization?.name || 'Non spécifiée'}</TableCell>
                    <TableCell className="py-3 px-4 text-center">
                      <div className="flex gap-2 justify-center">
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

        {/* Pagination Controls */}
        <div className="mt-4 flex items-center justify-between px-4">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <span>
              Page {pagination.currentPage} sur {pagination.totalPages} ({pagination.total} formations)
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages}
              className="flex items-center gap-1"
            >
              Suivant
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FormationTable; 