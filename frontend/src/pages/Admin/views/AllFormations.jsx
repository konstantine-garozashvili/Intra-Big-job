import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Loader2, Calendar, Users, Clock, MapPin, Search, ChevronLeft, ChevronRight, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate, Link } from 'react-router-dom';
import { useRolePermissions } from '@/features/roles';
import { motion } from 'framer-motion';
import Masonry from 'react-masonry-css';
import { formationService } from '@/services/formation.service';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function AllFormations() {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 9,
    total: 0
  });
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const permissions = useRolePermissions();
  const [deletingId, setDeletingId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formationToDelete, setFormationToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPagination(prev => ({ ...prev, currentPage: 1 }));
      fetchFormations(1);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line
  }, [searchTerm]);

  useEffect(() => {
    fetchFormations(pagination.currentPage);
    // eslint-disable-next-line
  }, [pagination.currentPage]);

  const fetchFormations = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const data = await formationService.getAllFormations(page, pagination.limit, searchTerm);
      setFormations(data.formations);
      setPagination(data.pagination || {
        currentPage: page,
        totalPages: 1,
        limit: pagination.limit,
        total: data.formations.length
      });
    } catch (err) {
      setFormations([]);
      setError('Erreur lors du chargement des formations.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: newPage }));
    }
  };

  const breakpointColumnsObj = {
    default: 3,
    1100: 2,
    700: 1,
  };

  const getCapacityStatus = (enrolled, capacity) => {
    const percentage = (enrolled / capacity) * 100;
    if (percentage >= 100) return { text: 'Complet', color: 'text-red-500', bgColor: 'bg-red-100 dark:bg-red-900/20' };
    if (percentage >= 80) return { text: 'Presque complet', color: 'text-orange-500', bgColor: 'bg-orange-100 dark:bg-orange-900/20' };
    if (percentage >= 50) return { text: 'Places limitées', color: 'text-yellow-500', bgColor: 'bg-yellow-100 dark:bg-yellow-900/20' };
    return { text: 'Places disponibles', color: 'text-green-500', bgColor: 'bg-green-100 dark:bg-green-900/20' };
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
      if (newFormations.length === 0 && pagination.currentPage > 1) {
        fetchFormations(pagination.currentPage - 1);
      }
      setDeleteDialogOpen(false);
      setFormationToDelete(null);
    } catch (error) {
      setFormations(prevFormations);
      setPagination(prev => ({ ...prev, total: prev.total + 1 }));
      setError(error.message);
    } finally {
      setDeleting(false);
    }
  };

  // Badge color variants (copied from FormationCard)
  const badgeVariants = {
    "Développement Web": "bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 dark:from-amber-900 dark:via-yellow-900 dark:to-orange-900 text-amber-800 dark:text-amber-200 hover:from-amber-200 hover:via-yellow-200 hover:to-orange-200 dark:hover:from-amber-800 dark:hover:via-yellow-800 dark:hover:to-orange-800",
    "Data Science": "bg-gradient-to-r from-blue-100 via-cyan-100 to-teal-100 dark:from-blue-900 dark:via-cyan-900 dark:to-teal-900 text-blue-700 dark:text-blue-300 hover:from-blue-200 hover:via-cyan-200 hover:to-teal-200 dark:hover:from-blue-800 dark:hover:via-cyan-800 dark:hover:to-teal-800",
    "Cybersécurité": "bg-gradient-to-r from-violet-100 via-purple-100 to-fuchsia-100 dark:from-violet-900 dark:via-purple-900 dark:to-fuchsia-900 text-violet-700 dark:text-violet-300 hover:from-violet-200 hover:via-purple-200 hover:to-fuchsia-200 dark:hover:from-violet-800 dark:hover:via-purple-800 dark:hover:to-fuchsia-800",
    "DevOps": "bg-gradient-to-r from-orange-100 via-amber-100 to-yellow-100 dark:from-orange-900 dark:via-amber-900 dark:to-yellow-900 text-orange-700 dark:text-orange-300 hover:from-orange-200 hover:via-amber-200 hover:to-yellow-200 dark:hover:from-orange-800 dark:hover:via-amber-800 dark:hover:to-yellow-800",
    "IA": "bg-gradient-to-r from-indigo-100 via-blue-100 to-sky-100 dark:from-indigo-900 dark:via-blue-900 dark:to-sky-900 text-indigo-700 dark:text-indigo-300 hover:from-indigo-200 hover:via-blue-200 hover:to-sky-200 dark:hover:from-indigo-800 dark:hover:via-blue-800 dark:hover:to-sky-800",
    "Cloud Computing": "bg-gradient-to-r from-sky-100 via-cyan-100 to-blue-100 dark:from-sky-900 dark:via-cyan-900 dark:to-blue-900 text-sky-700 dark:text-sky-300 hover:from-sky-200 hover:via-cyan-200 hover:to-blue-200 dark:hover:from-sky-800 dark:hover:via-cyan-800 dark:hover:to-blue-800",
    "default": "bg-gradient-to-r from-emerald-100 via-teal-100 to-cyan-100 dark:from-emerald-900 dark:via-teal-900 dark:to-cyan-900 text-emerald-700 dark:text-emerald-300 hover:from-emerald-200 hover:via-teal-200 hover:to-cyan-200 dark:hover:from-emerald-800 dark:hover:via-teal-800 dark:hover:to-cyan-800"
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-end items-center mb-10 gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
          <div className="relative flex-1 md:flex-initial max-w-[300px]">
            <input
              type="text"
              placeholder="Rechercher une formation..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              ref={searchRef}
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
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <Loader2 className="animate-spin w-10 h-10 text-blue-300" />
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-8">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.isArray(formations) && formations.length === 0 ? (
              <div className="text-center text-gray-300 col-span-2">Aucune formation trouvée.</div>
            ) : (
              Array.isArray(formations) && formations.map((f, idx) => {
                const enrolledCount = Array.isArray(f.students) ? f.students.length : 0;
                const capacity = f.capacity || 0;
                const capacityStatus = getCapacityStatus(enrolledCount, capacity);
                const progressPercentage = capacity > 0 ? Math.min((enrolledCount / capacity) * 100, 100) : 0;
                return (
                  <motion.div
                    key={f.id}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08, duration: 0.6, type: 'spring', stiffness: 120 }}
                    whileHover={{ scale: 1.03, boxShadow: '0 8px 32px 0 rgba(82, 142, 178, 0.10)' }}
                    className="flex"
                  >
                    <Card
                      className="relative rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-md hover:shadow-lg transition-all cursor-pointer group flex flex-col w-full h-[460px]"
                      onClick={() => {
                        navigate(`/formations/edit/${f.id}`);
                      }}
                    >
                      {/* Image with hover overlay and details button */}
                      <div className="relative w-full h-48 bg-gray-50 flex items-center justify-center overflow-hidden">
                        <img
                          src={f.image_url || '/placeholder.svg'}
                          alt={f.name}
                          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#02284f]/90 via-[#02284f]/50 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                          <Button
                            className="bg-transparent text-white font-semibold px-6 py-2 rounded-full shadow-none border-none hover:text-blue-200 transition"
                            style={{background: 'none', boxShadow: 'none'}}
                            onClick={e => {
                              e.stopPropagation();
                              navigate(`/formations/edit/${f.id}`);
                            }}
                          >
                            Voir détails
                          </Button>
                        </div>
                      </div>
                      <div className="p-6 z-20 relative flex flex-col flex-1 min-h-0">
                        <div className="flex flex-wrap gap-2 mb-2 items-center justify-between">
                          <div className="flex gap-2 items-center">
                            <Badge className={`${badgeVariants[f.specialization?.name || 'default']} transition-all duration-300 text-xs sm:text-sm`}>
                              {f.specialization?.name || 'Formation'}
                            </Badge>
                            <Badge variant="outline" className="bg-gradient-to-r from-amber-50 to-white dark:from-amber-900/20 dark:to-slate-900 border-amber-200 dark:border-amber-700/50 text-xs sm:text-sm">
                              {f.promotion || 'N/A'}
                            </Badge>
                          </div>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="hover:bg-red-600 hover:text-white transition ml-2"
                            onClick={e => {
                              e.stopPropagation();
                              handleDeleteClick(f);
                            }}
                            disabled={deletingId === f.id}
                            title="Supprimer la formation"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <h2
                          className="text-xl font-bold text-gray-900 mb-1 line-clamp-2 min-h-[2.5em]"
                          title={f.name}
                          style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                        >
                          {f.name}
                        </h2>
                        <p
                          className="text-gray-700 text-sm mb-3 min-h-[40px] line-clamp-2"
                          title={f.description}
                          style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                        >
                          {f.description || 'Aucune description.'}
                        </p>
                        {/* Capacity Section */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-[#528eb2]" />
                              <span className="text-sm font-medium">
                                {enrolledCount} / {capacity} étudiants
                              </span>
                            </div>
                            <Badge className={`${capacityStatus.bgColor} ${capacityStatus.color} text-xs`}>
                              {capacityStatus.text}
                            </Badge>
                          </div>
                          <Progress value={progressPercentage} className="h-2" />
                        </div>
                        <div className="flex flex-wrap gap-4 text-gray-500 text-xs mb-3">
                          <div className="flex items-center gap-1"><Calendar className="w-4 h-4 text-[#528eb2]" />{f.dateStart ? new Date(f.dateStart).toLocaleDateString() : 'N/A'}</div>
                          <div className="flex items-center gap-1"><Clock className="w-4 h-4 text-[#528eb2]" />{f.duration ? `${f.duration} mois` : 'N/A'}</div>
                          {f.location && <div className="flex items-center gap-1"><MapPin className="w-4 h-4 text-[#528eb2]" />{f.location}</div>}
                        </div>
                        {f.createdAt && (
                          <div className="text-xs text-gray-400 mt-1">Créée le {new Date(f.createdAt).toLocaleDateString()}</div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                );
              })
            )}
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
        </>
      )}
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
      <style>{`
        .masonry-column {
          background-clip: padding-box;
        }
      `}</style>
    </div>
  );
} 