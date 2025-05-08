import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiService from '@/lib/services/apiService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, MapPin, Users, ArrowLeft, Info, BookOpen, UserCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const MyFormation = () => {
  const [formation, setFormation] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    apiService.get('/api/profile/formations')
      .then(res => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const f = res.data[0];
          setFormation(f);
          // Fetch full formation details (including students)
          apiService.get(`/api/formations/${f.id}`)
            .then(fRes => {
              if (fRes.success && fRes.data && fRes.data.formation && Array.isArray(fRes.data.formation.students)) {
                setStudents(fRes.data.formation.students);
              } else {
                setStudents([]);
              }
              setLoading(false);
            })
            .catch(() => {
              setStudents([]);
              setLoading(false);
            });
        } else {
          setFormation(null);
          setLoading(false);
        }
      })
      .catch(() => {
        setError('Erreur lors du chargement de la formation.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Skeleton className="h-10 w-2/3 mb-4" />
        <Skeleton className="h-6 w-1/2 mb-2" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-destructive bg-destructive/10 rounded-xl">
        <p>{error}</p>
        <Button className="mt-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour
        </Button>
      </div>
    );
  }

  if (!formation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Info className="h-10 w-10 text-muted-foreground mb-2" />
        <p className="text-lg font-semibold mb-2">Aucune formation trouvée</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-5xl mx-auto py-8 px-4"
    >
      <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Retour au tableau de bord
      </Button>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Formation Info */}
        <div className="flex-1">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-yellow-100/80 to-yellow-200/60 dark:from-yellow-900/40 dark:to-yellow-800/30">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="h-7 w-7 text-yellow-600 dark:text-yellow-300" />
                <CardTitle className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                  {formation.name}
                </CardTitle>
                <Badge variant="outline" className="ml-2 text-yellow-800 dark:text-yellow-200 border-yellow-400 dark:border-yellow-600">
                  {formation.promotion}
                </Badge>
              </div>
              <p className="text-yellow-800 dark:text-yellow-200 text-sm font-medium mb-1">
                {formation.description || 'Aucune description.'}
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-yellow-700 dark:text-yellow-300" />
                  <span className="font-medium">Début :</span>
                  <span>{formation.dateStart || 'Non définie'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-yellow-700 dark:text-yellow-300" />
                  <span className="font-medium">Lieu :</span>
                  <span>{formation.location || 'Non définie'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-yellow-700 dark:text-yellow-300" />
                  <span className="font-medium">Durée :</span>
                  <span>{formation.duration ? `${formation.duration}h` : 'Non définie'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Students List */}
        <div className="w-full md:w-80">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-yellow-50/80 to-yellow-100/60 dark:from-yellow-900/30 dark:to-yellow-800/20 h-full">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-yellow-700 dark:text-yellow-300" />
                <CardTitle className="text-lg font-bold text-yellow-900 dark:text-yellow-100">Étudiants inscrits</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto space-y-3">
                {students.length > 0 ? (
                  students.map((student) => (
                    <div key={student.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-yellow-100/60 dark:hover:bg-yellow-900/20 transition">
                      {student.profilePictureUrl ? (
                        <Link to={`/profile/${student.id}`} tabIndex={-1} onClick={e => e.stopPropagation()} className="block">
                          <img src={student.profilePictureUrl} alt={student.firstName} className="w-9 h-9 rounded-full object-cover" />
                        </Link>
                      ) : (
                        <Link to={`/profile/${student.id}`} tabIndex={-1} onClick={e => e.stopPropagation()} className="block">
                          <div className="w-9 h-9 rounded-full bg-yellow-300 dark:bg-yellow-800 flex items-center justify-center text-yellow-900 dark:text-yellow-100 font-bold text-lg">
                            {student.firstName?.[0]}{student.lastName?.[0]}
                          </div>
                        </Link>
                      )}
                      <div>
                        <Link to={`/profile/${student.id}`} className="font-medium text-yellow-900 dark:text-yellow-100 block hover:underline" onClick={e => e.stopPropagation()} tabIndex={-1}>
                          {student.firstName} {student.lastName}
                        </Link>
                        <div className="text-xs text-yellow-700 dark:text-yellow-300">{student.email}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-yellow-700 dark:text-yellow-200 text-sm text-center py-4">Aucun étudiant inscrit</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default MyFormation; 