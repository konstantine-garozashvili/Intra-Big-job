import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Loader2, Calendar, Users, Clock, MapPin, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate, Link } from 'react-router-dom';
import { useRolePermissions } from '@/features/roles';
import { motion } from 'framer-motion';
import Masonry from 'react-masonry-css';
import { formationService } from '@/services/formation.service';
import { Progress } from '@/components/ui/progress';

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
  const listRef = useRef(null);
  const navigate = useNavigate();
  const permissions = useRolePermissions();

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

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-initial">
            <input
              type="text"
              placeholder="Rechercher une formation..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              ref={searchRef}
              className="pl-10 pr-4 py-2 w-full md:w-[300px] rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
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
      <div ref={listRef} />
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
                      <div className="w-full h-48 bg-gray-50 flex items-center justify-center overflow-hidden border-b border-gray-100">
                        <img
                          src={f.image_url || '/placeholder.svg'}
                          alt={f.name}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="p-6 z-20 relative flex flex-col flex-1 min-h-0">
                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge className="bg-[#528eb2]/10 text-[#528eb2] border border-[#528eb2]/30 font-medium">{f.specialization?.name || 'Formation'}</Badge>
                          <Badge variant="outline" className="border-[#528eb2]/40 text-[#528eb2] bg-white">{f.promotion || 'N/A'}</Badge>
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
                        <button
                          className="absolute right-6 bottom-6 border border-[#528eb2] text-[#528eb2] px-5 py-2 rounded-full font-semibold bg-white hover:bg-[#528eb2] hover:text-white shadow transition-all opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-4 duration-300"
                          onClick={e => {
                            e.stopPropagation();
                            navigate(`/formations/edit/${f.id}`);
                          }}
                        >
                          Voir détails
                        </button>
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
      <style>{`
        .masonry-column {
          background-clip: padding-box;
        }
      `}</style>
    </div>
  );
} 