import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import apiService from '@/lib/services/apiService';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Clock, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AllFormations() {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Toutes les formations</h1>
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="animate-spin w-8 h-8 text-gray-400" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {Array.isArray(formations) && formations.length === 0 ? (
            <div className="text-center text-gray-500 col-span-2">Aucune formation trouvée.</div>
          ) : (
            Array.isArray(formations) && formations.map(f => (
              <Card
                key={f.id}
                className="hover:shadow-lg transition-shadow flex flex-col md:flex-row overflow-hidden cursor-pointer"
                onClick={() => navigate(`/admin/formations/${f.id}`)}
              >
                <div className="md:w-56 w-full h-40 md:h-auto flex-shrink-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <img
                    src={f.image_url || '/placeholder.svg'}
                    alt={f.name}
                    className="object-cover w-full h-full"
                  />
                </div>
                <CardContent className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge>{f.specialization?.name || 'Formation'}</Badge>
                      <Badge variant="outline">{f.promotion || 'N/A'}</Badge>
                    </div>
                    <div className="font-semibold text-lg mb-1">{f.name}</div>
                    <div className="text-gray-700 text-sm mb-2">{f.description || 'Aucune description.'}</div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-300 mb-2">
                      <div className="flex items-center gap-1"><Calendar className="w-4 h-4" />{f.dateStart ? new Date(f.dateStart).toLocaleDateString() : 'N/A'}</div>
                      <div className="flex items-center gap-1"><Clock className="w-4 h-4" />{f.duration ? `${f.duration} mois` : 'N/A'}</div>
                      <div className="flex items-center gap-1"><Users className="w-4 h-4" />Capacité: {f.capacity || 'N/A'}</div>
                      {f.location && <div className="flex items-center gap-1"><MapPin className="w-4 h-4" />{f.location}</div>}
                    </div>
                  </div>
                  {f.createdAt && (
                    <div className="text-xs text-gray-400 mt-2">Créée le {new Date(f.createdAt).toLocaleDateString()}</div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
} 