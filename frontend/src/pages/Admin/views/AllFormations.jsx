import React, { useEffect, useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Loader2, Calendar, Users, Clock, MapPin, ChevronDown } from 'lucide-react';
import apiService from '@/lib/services/apiService';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useRolePermissions } from '@/features/roles';
import { motion } from 'framer-motion';
import Masonry from 'react-masonry-css';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Nouveautés' },
  { value: 'oldest', label: 'Plus anciennes' },
  { value: 'name', label: 'Nom (A-Z)' },
  { value: 'capacity', label: 'Capacité' },
];

export default function AllFormations() {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const navigate = useNavigate();
  const permissions = useRolePermissions();

  useEffect(() => {
    const fetchFormations = async () => {
      setLoading(true);
      try {
        const res = await apiService.get('/api/formations');
        let formationsArray = [];
        if (res && res.success && Array.isArray(res.data)) {
          formationsArray = res.data;
        } else if (res && res.success && res.data && Array.isArray(res.data.formations)) {
          formationsArray = res.data.formations;
        } else if (Array.isArray(res)) {
          formationsArray = res;
        }
        setFormations(formationsArray);
      } catch (err) {
        setFormations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFormations();
  }, []);

  const sortedFormations = useMemo(() => {
    let arr = [...formations];
    switch (sortBy) {
      case 'oldest':
        arr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'name':
        arr.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'capacity':
        arr.sort((a, b) => (b.capacity || 0) - (a.capacity || 0));
        break;
      case 'newest':
      default:
        arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }
    return arr;
  }, [formations, sortBy]);

  const breakpointColumnsObj = {
    default: 3,
    1100: 2,
    700: 1,
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-2 md:px-0">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 gap-4">
        <h1 className="text-4xl font-extrabold text-white drop-shadow-lg tracking-tight">Toutes les formations</h1>
        <div className="relative inline-block">
          <select
            className="appearance-none bg-white/10 text-white px-5 py-2 rounded-xl border border-white/20 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-white pointer-events-none" size={20} />
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <Loader2 className="animate-spin w-10 h-10 text-blue-300" />
        </div>
      ) : (
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="flex gap-8"
          columnClassName="masonry-column"
        >
          {Array.isArray(sortedFormations) && sortedFormations.length === 0 ? (
            <div className="text-center text-gray-300 col-span-2">Aucune formation trouvée.</div>
          ) : (
            Array.isArray(sortedFormations) && sortedFormations.map((f, idx) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08, duration: 0.6, type: 'spring', stiffness: 120 }}
                whileHover={{ scale: 1.03, boxShadow: '0 8px 32px 0 rgba(82, 142, 178, 0.10)' }}
                className="mb-8"
              >
                <Card
                  className="relative rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-md hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => {
                    if (permissions.isRecruiter()) {
                      navigate(`/recruiter/formation-management/${f.id}`);
                    } else {
                      navigate(`/admin/formations/${f.id}`);
                    }
                  }}
                >
                  <div className="w-full h-48 bg-gray-50 flex items-center justify-center overflow-hidden border-b border-gray-100">
                    <img
                      src={f.image_url || '/placeholder.svg'}
                      alt={f.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="p-6 z-20 relative">
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge className="bg-[#528eb2]/10 text-[#528eb2] border border-[#528eb2]/30 font-medium">{f.specialization?.name || 'Formation'}</Badge>
                      <Badge variant="outline" className="border-[#528eb2]/40 text-[#528eb2] bg-white">{f.promotion || 'N/A'}</Badge>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1 truncate" title={f.name}>{f.name}</h2>
                    <p className="text-gray-700 text-sm mb-3 min-h-[40px] truncate" title={f.description}>{f.description || 'Aucune description.'}</p>
                    <div className="flex flex-wrap gap-4 text-gray-500 text-xs mb-3">
                      <div className="flex items-center gap-1"><Calendar className="w-4 h-4 text-[#528eb2]" />{f.dateStart ? new Date(f.dateStart).toLocaleDateString() : 'N/A'}</div>
                      <div className="flex items-center gap-1"><Clock className="w-4 h-4 text-[#528eb2]" />{f.duration ? `${f.duration} mois` : 'N/A'}</div>
                      <div className="flex items-center gap-1"><Users className="w-4 h-4 text-[#528eb2]" />Capacité: {f.capacity || 'N/A'}</div>
                      {f.location && <div className="flex items-center gap-1"><MapPin className="w-4 h-4 text-[#528eb2]" />{f.location}</div>}
                    </div>
                    {f.createdAt && (
                      <div className="text-xs text-gray-400 mt-1">Créée le {new Date(f.createdAt).toLocaleDateString()}</div>
                    )}
                    <button
                      className="absolute right-6 bottom-6 border border-[#528eb2] text-[#528eb2] px-5 py-2 rounded-full font-semibold bg-white hover:bg-[#528eb2] hover:text-white shadow transition-all opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-4 duration-300"
                      onClick={e => {
                        e.stopPropagation();
                        if (permissions.isRecruiter()) {
                          navigate(`/recruiter/formation-management/${f.id}`);
                        } else {
                          navigate(`/admin/formations/${f.id}`);
                        }
                      }}
                    >
                      Voir détails
                    </button>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </Masonry>
      )}
      <style>{`
        .masonry-column {
          background-clip: padding-box;
        }
      `}</style>
    </div>
  );
} 