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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Loader2, AlertTriangle } from 'lucide-react';

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
  const [firstLoading, setFirstLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 10,
    total: 0
  });
  const tableRef = useRef(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formationToDelete, setFormationToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

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
      setFirstLoading(false);
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

  const handleDeleteClick = (formation) => {
    setFormationToDelete(formation);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!formationToDelete) return;
    setDeleting(true);
    const id = formationToDelete.id;
    const prevFormations = formations;
    const newFormations = formations.filter(f => f.id !== id);
    setFormations(newFormations);
    setPagination(prev => ({
      ...prev,
      total: prev.total - 1,
      currentPage: newFormations.length === 0 && prev.currentPage > 1 ? prev.currentPage - 1 : prev.currentPage
    }));
    try {
      await formationService.deleteFormation(id);
      toast.success('Formation supprimée avec succès');
      if (newFormations.length === 0 && pagination.currentPage > 1) {
        loadFormations(pagination.currentPage - 1);
      }
      setDeleteDialogOpen(false);
      setFormationToDelete(null);
    } catch (error) {
      setFormations(prevFormations);
      setPagination(prev => ({ ...prev, total: prev.total + 1 }));
      toast.error(error.message);
    } finally {
      setDeleting(false);
    }
  };

  if (firstLoading) {
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
      <div className="flex flex-col sm:flex-row justify-end items-center mb-6 gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
          <div className="relative flex-1 sm:flex-initial max-w-[300px]">
            <input
              type="text"
              placeholder="Rechercher une formation..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
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
      <motion.div
        ref={tableRef}
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
      >
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
                        <Link to={`/formations/edit/${formation.id}`} title="Éditer la formation">
                          <Button
                            variant="outline"
                            size="icon"
                            className="hover:bg-blue-600 hover:text-white transition"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="hover:bg-red-600 hover:text-white transition"
                          onClick={() => handleDeleteClick(formation)}
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
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-h-[calc(100vh-2rem)] w-full max-w-md overflow-hidden rounded-2xl border-0 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Confirmation de suppression
            </DialogTitle>
            <DialogDescription className="text-base mt-2">
              Êtes-vous sûr de vouloir supprimer la formation <b>{formationToDelete?.name}</b> ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Attention</AlertTitle>
            <AlertDescription>
              Cette action supprimera définitivement la formation et toutes ses données associées. Cette action ne peut pas être annulée.
            </AlertDescription>
          </Alert>
          <DialogFooter className="mt-6 flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
              className="rounded-full border-2 hover:bg-gray-100 transition-all duration-200"
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="rounded-full bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 transition-all duration-200"
            >
              {deleting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Suppression...</>) : 'Supprimer définitivement'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FormationTable; 