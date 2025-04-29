import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Loader2, CheckCircle, UserRound, Calendar, ClipboardCheck } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

const SignatureMonitoring = () => {
  const [signatures, setSignatures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('today');
  const [weeklyStats, setWeeklyStats] = useState([]);

  // Fetch signatures
    const fetchSignatures = async () => {
      try {
      setIsLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentification requise');
      }
      
        const response = await fetch('/api/signatures', {
        method: 'GET',
          headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch signatures');
        }

        const data = await response.json();
      
        setSignatures(data.signatures);
        setError(null);
    } catch (error) {
      console.error('Error fetching signatures:', error);
        setError('Impossible de récupérer les signatures. Veuillez réessayer plus tard.');
        toast.error('Erreur', {
          description: 'Impossible de récupérer les signatures. Veuillez réessayer plus tard.'
        });
      } finally {
      setIsLoading(false);
    }
  };

  // Fetch weekly statistics
  const fetchWeeklyStats = async () => {
    try {
      setIsLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentification requise');
      }
      
      const response = await fetch('/api/signatures/statistics', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        // Si l'API n'existe pas ou échoue, générer des données de démonstration
        generateMockWeeklyStats();
        return;
      }
      
      const data = await response.json();
      setWeeklyStats(data.statistics);
      setError(null);
    } catch (error) {
      console.error('Error fetching weekly statistics:', error);
      // Générer des données de test pour la démonstration
      generateMockWeeklyStats();
    } finally {
      setIsLoading(false);
    }
  };

  // Génère des statistiques hebdomadaires simulées pour la démonstration
  const generateMockWeeklyStats = () => {
    // Obtenir les dates de la semaine courante
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = dimanche, 1 = lundi, etc.
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Calculer le décalage jusqu'à lundi
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    
    // Générer les données pour chaque jour
    const mockStats = [];
    const weekDays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
    const mockStudents = [
      { id: 1, firstName: 'Jean', lastName: 'Dupont' },
      { id: 2, firstName: 'Marie', lastName: 'Martin' },
      { id: 3, firstName: 'Lucas', lastName: 'Bernard' },
      { id: 4, firstName: 'Emma', lastName: 'Petit' },
      { id: 5, firstName: 'Louis', lastName: 'Durand' },
      { id: 6, firstName: 'Léa', lastName: 'Thomas' },
      { id: 7, firstName: 'Hugo', lastName: 'Robert' },
      { id: 8, firstName: 'Chloé', lastName: 'Richard' },
      { id: 9, firstName: 'Jules', lastName: 'Moreau' },
      { id: 10, firstName: 'Jade', lastName: 'Simon' }
    ];
    
    for (let i = 0; i < 5; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Pour chaque jour, calculer le nombre d'étudiants présents/absents aléatoirement
      const totalStudents = mockStudents.length;
      const morningPresent = Math.floor(Math.random() * (totalStudents + 1));
      const afternoonPresent = Math.floor(Math.random() * (totalStudents + 1));
      
      // Pour les jours passés
      const isPastDay = date < today;
      // Pour aujourd'hui, vérifier si les périodes sont passées
      const isToday = date.getDate() === today.getDate() && 
                      date.getMonth() === today.getMonth() && 
                      date.getFullYear() === today.getFullYear();
      const currentHour = today.getHours();
      const isMorningPast = isPastDay || (isToday && currentHour >= 12);
      const isAfternoonPast = isPastDay || (isToday && currentHour >= 17);
      
      // Créer des signatures simulées pour les étudiants
      const morningSignatures = [];
      const afternoonSignatures = [];
      
      if (isMorningPast) {
        // Distribuer aléatoirement les présences du matin
        const shuffledMorning = [...mockStudents].sort(() => 0.5 - Math.random());
        for (let j = 0; j < morningPresent; j++) {
          morningSignatures.push({
            id: `m${dateStr}${j}`,
            student: shuffledMorning[j],
            time: `${8 + Math.floor(Math.random() * 3)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`
          });
        }
      }
      
      if (isAfternoonPast) {
        // Distribuer aléatoirement les présences de l'après-midi
        const shuffledAfternoon = [...mockStudents].sort(() => 0.5 - Math.random());
        for (let j = 0; j < afternoonPresent; j++) {
          afternoonSignatures.push({
            id: `a${dateStr}${j}`,
            student: shuffledAfternoon[j],
            time: `${13 + Math.floor(Math.random() * 4)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`
          });
        }
      }
      
      mockStats.push({
        date: dateStr,
        dayName: weekDays[i],
        totalStudents,
        morning: {
          present: isMorningPast ? morningPresent : null,
          absent: isMorningPast ? totalStudents - morningPresent : null,
          percentage: isMorningPast ? Math.round((morningPresent / totalStudents) * 100) : null,
          signatures: morningSignatures
        },
        afternoon: {
          present: isAfternoonPast ? afternoonPresent : null,
          absent: isAfternoonPast ? totalStudents - afternoonPresent : null,
          percentage: isAfternoonPast ? Math.round((afternoonPresent / totalStudents) * 100) : null,
          signatures: afternoonSignatures
        }
      });
    }
    
    setWeeklyStats(mockStats);
  };
  
  useEffect(() => {
    fetchSignatures();
    fetchWeeklyStats();
    
    // Set up polling to refresh signatures every minute
    const intervalId = setInterval(fetchSignatures, 60000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // Handle signature validation
  const handleValidate = async (signatureId) => {
    try {
      const response = await fetch(`/api/signatures/${signatureId}/validate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to validate signature');
      }

      // Update the signatures list
      setSignatures(signatures.map(sig => 
        sig.id === signatureId ? { ...sig, validated: true } : sig
      ));

      toast.success('Signature validée', {
        description: 'La signature a été validée avec succès.'
      });
    } catch (error) {
      console.error('Error validating signature:', error);
      toast.error('Erreur', {
        description: 'Impossible de valider la signature. Veuillez réessayer.'
      });
    }
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Affiche le pourcentage de présence avec une couleur en fonction du taux
  const PresencePercentage = ({ percentage }) => {
    if (percentage === null || percentage === undefined) return <span>-</span>;
    
    let textColor = 'text-red-600';
    if (percentage >= 80) textColor = 'text-green-600';
    else if (percentage >= 60) textColor = 'text-amber-600';
    
    return <span className={`font-semibold ${textColor}`}>{percentage}%</span>;
  };

  if (isLoading && !weeklyStats.length && !signatures.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-500">Chargement des données de présence...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="today" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="today">
            <ClipboardCheck className="h-4 w-4 mr-2" />
            Signatures d'aujourd'hui
          </TabsTrigger>
          <TabsTrigger value="weekly">
            <Calendar className="h-4 w-4 mr-2" />
            Statistiques hebdomadaires
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="today" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-blue-700 dark:text-blue-400 flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5" />
                Suivi des signatures d'aujourd'hui
              </CardTitle>
              <CardDescription>
                Validez les signatures des étudiants pour aujourd'hui
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">
                  {error}
                </div>
              )}
              
              {signatures.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-gray-300 rounded-md">
                  <p className="text-gray-500">
                    Aucune signature n'est disponible pour le moment.
                </p>
              </div>
              ) : (
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Étudiant</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {signatures.map((signature) => (
                        <TableRow key={signature.id}>
                          <TableCell className="font-medium">
                            {signature.user.firstName} {signature.user.lastName}
                          </TableCell>
                          <TableCell>
                            {format(new Date(signature.date), 'PPP à HH:mm', { locale: fr })}
                          </TableCell>
                          <TableCell>
              <Badge variant={signature.validated ? "success" : "pending"}>
                {signature.validated ? "Validé" : "En attente"}
              </Badge>
                          </TableCell>
                          <TableCell>
              <p><strong>Localisation:</strong> {signature.location}</p>
            
            {!signature.validated && (
                              <Button 
                                variant="default"
                                size="sm"
                onClick={() => handleValidate(signature.id)}
                                className="mt-2"
              >
                                Valider
                              </Button>
            )}
            
            {signature.validated && (
                              <span className="text-green-600 flex items-center mt-2">
                                <CheckCircle className="h-4 w-4 mr-1" /> Signature validée
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
              </div>
            )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="weekly" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-blue-700 dark:text-blue-400 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Statistiques de présence hebdomadaires
              </CardTitle>
              <CardDescription>
                Suivi des présences des étudiants pour la semaine en cours
              </CardDescription>
            </CardHeader>
            <CardContent>
              {weeklyStats.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-gray-300 rounded-md">
                  <p className="text-gray-500">
                    Aucune statistique n'est disponible pour le moment.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Tableau résumé */}
                  <div className="border rounded-md overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Jour</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-center">Matin</TableHead>
                          <TableHead className="text-center">Après-midi</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {weeklyStats.map((day) => (
                          <TableRow key={day.date}>
                            <TableCell className="font-medium">
                              {day.dayName}
                            </TableCell>
                            <TableCell>
                              {formatDate(day.date)}
                            </TableCell>
                            <TableCell className="text-center">
                              {day.morning.present !== null ? (
                                <>
                                  <PresencePercentage percentage={day.morning.percentage} />
                                  <div className="text-xs text-gray-500 mt-1">
                                    {day.morning.present}/{day.totalStudents} présents
                                  </div>
                                </>
                              ) : (
                                <Badge variant="outline">À venir</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {day.afternoon.present !== null ? (
                                <>
                                  <PresencePercentage percentage={day.afternoon.percentage} />
                                  <div className="text-xs text-gray-500 mt-1">
                                    {day.afternoon.present}/{day.totalStudents} présents
          </div>
                                </>
                              ) : (
                                <Badge variant="outline">À venir</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // Ouvrir la liste détaillée des présences pour ce jour
                                  toast.info("Fonctionnalité à venir", { 
                                    description: "La liste détaillée sera disponible prochainement." 
                                  });
                                }}
                              >
                                Détails
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {/* Graphique d'évolution */}
                  <Card className="p-4 bg-slate-50 dark:bg-slate-900">
                    <div className="text-sm font-medium mb-2">Évolution de la présence</div>
                    <div className="h-40 flex items-end gap-2">
                      {weeklyStats.map((day, index) => {
                        const morningPercentage = day.morning.percentage !== null ? day.morning.percentage : 0;
                        const afternoonPercentage = day.afternoon.percentage !== null ? day.afternoon.percentage : 0;
                        const avgPercentage = (morningPercentage + afternoonPercentage) / 2;
                        
                        return (
                          <div key={index} className="flex-1 flex flex-col items-center gap-1">
                            <div className="text-xs text-gray-500">
                              {avgPercentage > 0 ? `${Math.round(avgPercentage)}%` : '-'}
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-t-sm overflow-hidden relative" style={{ height: `${Math.max(avgPercentage, 5)}%` }}>
                              <div 
                                className={`absolute bottom-0 w-full ${
                                  avgPercentage >= 80 ? 'bg-green-500 dark:bg-green-600' : 
                                  avgPercentage >= 60 ? 'bg-amber-500 dark:bg-amber-600' : 
                                  'bg-red-500 dark:bg-red-600'
                                }`} 
                                style={{ height: '100%' }}
                              />
                            </div>
                            <div className="text-xs text-gray-600 font-medium">
                              {day.dayName.substring(0, 3)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
      </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SignatureMonitoring;
