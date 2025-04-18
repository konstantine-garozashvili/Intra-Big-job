import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { authService } from '../../lib/services/authService';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  RefreshCw, 
  ClipboardList,
  Calendar,
  AlertCircle,
  Clock
} from 'lucide-react';
import { Button } from '../ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { motion } from 'framer-motion';

// Variants d'animation
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 10, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 25 }
  }
};

const SignatureHistory = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [weeklyData, setWeeklyData] = useState(null);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchWeeklyHistory = async () => {
    try {
      if (isRefreshing) {
        // Ne pas montrer l'indicateur de chargement complet pendant un rafraîchissement
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);
      
      // Ensure user data is in localStorage
      await authService.ensureUserDataInLocalStorage();
      
      // Get token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token d\'authentification non trouvé');
      }
      
      // Essayer de récupérer les données depuis l'API
      let apiSuccess = false;
      let apiData = null;
      
      try {
        // Fetch weekly signature history
        const response = await fetch('/api/signatures/weekly', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          apiData = await response.json();
          apiSuccess = true;
          
          // Filtrer pour ne garder que les jours de la semaine (lundi à vendredi)
          if (apiData && apiData.signaturesByDate) {
            apiData.signaturesByDate = apiData.signaturesByDate.filter(day => 
              !['Saturday', 'Sunday'].includes(day.dayName)
            );
          }
          
          console.log('Weekly signature history from API:', apiData);
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('API error response:', errorData);
          throw new Error(errorData.message || `Erreur ${response.status}`);
        }
      } catch (apiError) {
        console.error('API request failed:', apiError);
        // Continue avec le mode dégradé - API inaccessible
      }
      
      // Si l'API a fonctionné, utiliser ces données
      if (apiSuccess && apiData) {
        setWeeklyData(apiData);
      } else {
        // Fallback: générer des données locales à partir du localStorage
        console.log('Fallback: Using local signature data');
        
        // Obtenir les dates de la semaine courante
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 = dimanche, 1 = lundi, etc.
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Calculer le décalage jusqu'à lundi
        const monday = new Date(today);
        monday.setDate(today.getDate() + mondayOffset);
        
        // Générer un tableau de dates pour la semaine (lundi à vendredi)
        const weekDates = [];
        for (let i = 0; i < 5; i++) {
          const date = new Date(monday);
          date.setDate(monday.getDate() + i);
          weekDates.push(date);
        }
        
        // Convertir les dates en format YYYY-MM-DD
        const formattedDates = weekDates.map(date => date.toISOString().split('T')[0]);
        
        // Construire les données de la semaine
        const localWeeklyData = {
          success: true,
          weekStart: formattedDates[0],
          weekEnd: new Date(weekDates[4]).setDate(weekDates[4].getDate() + 1), // Jour suivant
          availablePeriods: {
            morning: 'Matin (9h-12h)',
            afternoon: 'Après-midi (13h-17h)'
          },
          signaturesByDate: []
        };
        
        // Remplir avec les données locales
        formattedDates.forEach((dateStr, index) => {
          const morningKey = `signature_${dateStr}_morning`;
          const afternoonKey = `signature_${dateStr}_afternoon`;
          const morningDataKey = `signature_data_${dateStr}_morning`;
          const afternoonDataKey = `signature_data_${dateStr}_afternoon`;
          
          // Vérifier si nous avons des signatures dans localStorage
          const hasMorningSignature = localStorage.getItem(morningKey) === 'true';
          const hasAfternoonSignature = localStorage.getItem(afternoonKey) === 'true';
          
          // Récupérer les données détaillées si disponibles
          let morningData = null;
          let afternoonData = null;
          
          if (hasMorningSignature) {
            const storedData = localStorage.getItem(morningDataKey);
            if (storedData) {
              try {
                morningData = JSON.parse(storedData);
              } catch (e) {
                console.error('Error parsing morning signature data:', e);
              }
            }
            
            if (!morningData) {
              // Données minimales si pas de détails
              morningData = {
                date: `${dateStr}T09:30:00.000Z`
              };
            }
          }
          
          if (hasAfternoonSignature) {
            const storedData = localStorage.getItem(afternoonDataKey);
            if (storedData) {
              try {
                afternoonData = JSON.parse(storedData);
              } catch (e) {
                console.error('Error parsing afternoon signature data:', e);
              }
            }
            
            if (!afternoonData) {
              // Données minimales si pas de détails
              afternoonData = {
                date: `${dateStr}T14:30:00.000Z`
              };
            }
          }
          
          // Ajouter l'entrée pour cette journée
          const date = weekDates[index];
          localWeeklyData.signaturesByDate.push({
            date: dateStr,
            dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()],
            signatures: {
              morning: hasMorningSignature ? morningData : null,
              afternoon: hasAfternoonSignature ? afternoonData : null
            }
          });
        });
        
        console.log('Generated local weekly data:', localWeeklyData);
        setWeeklyData(localWeeklyData);
      }
    } catch (error) {
      console.error('Error fetching weekly history:', error);
      setError(error.message || 'Erreur de chargement de l\'historique');
      toast.error('Erreur', {
        description: error.message || 'Impossible de charger l\'historique des signatures'
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWeeklyHistory();
  }, []);
  
  const formatDateToFrench = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const translateDayName = (dayName) => {
    const translations = {
      'Monday': 'Lundi',
      'Tuesday': 'Mardi',
      'Wednesday': 'Mercredi',
      'Thursday': 'Jeudi',
      'Friday': 'Vendredi'
    };
    return translations[dayName] || dayName;
  };
  
  const weekSummary = () => {
    if (!weeklyData?.signaturesByDate) return { total: 0, present: 0 };
    
    let totalPeriods = 0;
    let presentPeriods = 0;
    
    // Get today's date for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentHour = new Date().getHours();
    
    // Compter uniquement les jours ouvrés (lundi à vendredi)
    weeklyData.signaturesByDate.forEach(day => {      
      const dayDate = new Date(day.date);
      dayDate.setHours(0, 0, 0, 0);
      
      // Don't count future days in the total
      const isFutureDay = dayDate > today;
      
      // For today, check morning/afternoon based on current time
      const isMorningPast = !(dayDate.getTime() === today.getTime() && currentHour < 12);
      const isAfternoonPast = !(dayDate.getTime() === today.getTime() && currentHour < 17);
      
      // Only count past periods in the total
      if (!isFutureDay) {
        // Always count morning for past days
        if (isMorningPast) {
          totalPeriods += 1;
          if (day.signatures.morning) presentPeriods += 1;
        }
        
        // Always count afternoon for past days
        if (isAfternoonPast) {
          totalPeriods += 1;
          if (day.signatures.afternoon) presentPeriods += 1;
        }
      }
    });
    
    return {
      total: totalPeriods,
      present: presentPeriods,
      percentage: totalPeriods > 0 ? Math.round((presentPeriods / totalPeriods) * 100) : 0
    };
  };
  
  if (isLoading && !isRefreshing) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-12 space-y-4"
      >
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-gray-500 dark:text-gray-400">Chargement de l'historique des signatures...</p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>
            {error}
            <Button 
              className="mt-4" 
              variant="outline" 
              onClick={fetchWeeklyHistory}
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          </AlertDescription>
        </Alert>
      </motion.div>
    );
  }

  if (!weeklyData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-muted-foreground" />
              Aucune donnée
            </CardTitle>
            <CardDescription>Aucun historique de signatures n'est disponible</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={fetchWeeklyHistory}
              size="sm"
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser les données
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }
  
  const summary = weekSummary();

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Summary Card */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden border-blue-100 dark:border-blue-900/50">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 border-b border-blue-100 dark:border-blue-900/10">
            <div className="flex items-center justify-between">
              <CardTitle className="text-blue-800 dark:text-blue-400 flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Résumé de la semaine
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4">              
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Présent</span>
                </div>
                <span className="text-2xl font-bold text-green-600">{summary.present}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">périodes</span>
              </div>
              
              <div className="p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-1">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium">Absent</span>
                </div>
                <span className="text-2xl font-bold text-red-600">{summary.total - summary.present}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">périodes</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Detailed Table */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Détail des signatures
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsRefreshing(true);
                  fetchWeeklyHistory();
                }}
                disabled={isRefreshing}
                className="gap-1"
              >
                {isRefreshing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5" />
                )}
                <span>Actualiser</span>
              </Button>
            </div>
            <CardDescription>
              Historique détaillé des signatures pour la semaine en cours
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Jour</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-center">Matin (9h-12h)</TableHead>
                    <TableHead className="text-center">Après-midi (13h-17h)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {weeklyData.signaturesByDate.map((day) => (
                    <TableRow key={day.date}>
                      <TableCell className="font-medium">
                        {translateDayName(day.dayName)}
                      </TableCell>
                      <TableCell>
                        {new Date(day.date).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell className="text-center">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger className="cursor-help inline-flex">
                              {day.signatures.morning ? (
                                <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 gap-1">
                                  <CheckCircle className="h-3.5 w-3.5" />
                                  <span>Présent</span>
                                </Badge>
                              ) : (
                                (() => {
                                  // Check if this day is in the future
                                  const today = new Date();
                                  today.setHours(0, 0, 0, 0);
                                  const dayDate = new Date(day.date);
                                  dayDate.setHours(0, 0, 0, 0);
                                  
                                  // For the morning period - if it's today, check if it's before noon
                                  const isFuture = dayDate > today || 
                                    (dayDate.getTime() === today.getTime() && new Date().getHours() < 12);
                                    
                                  return isFuture ? (
                                    <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800 gap-1">
                                      <Calendar className="h-3.5 w-3.5" />
                                      <span>À venir</span>
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800 gap-1">
                                      <XCircle className="h-3.5 w-3.5" />
                                      <span>Absent</span>
                                    </Badge>
                                  );
                                })()
                              )}
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                              {day.signatures.morning ? (
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-green-600" />
                                  <p>Signé à {new Date(day.signatures.morning.date).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}</p>
                                </div>
                              ) : (
                                (() => {
                                  // Check if this day is in the future
                                  const today = new Date();
                                  today.setHours(0, 0, 0, 0);
                                  const dayDate = new Date(day.date);
                                  dayDate.setHours(0, 0, 0, 0);
                                  
                                  // For the morning period - if it's today, check if it's before noon
                                  const isFuture = dayDate > today || 
                                    (dayDate.getTime() === today.getTime() && new Date().getHours() < 12);
                                    
                                  return isFuture ? (
                                    <p>Période à venir</p>
                                  ) : (
                                    <p>Aucune signature enregistrée</p>
                                  );
                                })()
                              )}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="text-center">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger className="cursor-help inline-flex">
                              {day.signatures.afternoon ? (
                                <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 gap-1">
                                  <CheckCircle className="h-3.5 w-3.5" />
                                  <span>Présent</span>
                                </Badge>
                              ) : (
                                (() => {
                                  // Check if this day is in the future
                                  const today = new Date();
                                  today.setHours(0, 0, 0, 0);
                                  const dayDate = new Date(day.date);
                                  dayDate.setHours(0, 0, 0, 0);
                                  
                                  // For the afternoon period - if it's today, check if it's before 5pm
                                  const isFuture = dayDate > today || 
                                    (dayDate.getTime() === today.getTime() && new Date().getHours() < 17);
                                    
                                  return isFuture ? (
                                    <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800 gap-1">
                                      <Calendar className="h-3.5 w-3.5" />
                                      <span>À venir</span>
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800 gap-1">
                                      <XCircle className="h-3.5 w-3.5" />
                                      <span>Absent</span>
                                    </Badge>
                                  );
                                })()
                              )}
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                              {day.signatures.afternoon ? (
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-green-600" />
                                  <p>Signé à {new Date(day.signatures.afternoon.date).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}</p>
                                </div>
                              ) : (
                                (() => {
                                  // Check if this day is in the future
                                  const today = new Date();
                                  today.setHours(0, 0, 0, 0);
                                  const dayDate = new Date(day.date);
                                  dayDate.setHours(0, 0, 0, 0);
                                  
                                  // For the afternoon period - if it's today, check if it's before 5pm
                                  const isFuture = dayDate > today || 
                                    (dayDate.getTime() === today.getTime() && new Date().getHours() < 17);
                                    
                                  return isFuture ? (
                                    <p>Période à venir</p>
                                  ) : (
                                    <p>Aucune signature enregistrée</p>
                                  );
                                })()
                              )}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default SignatureHistory; 