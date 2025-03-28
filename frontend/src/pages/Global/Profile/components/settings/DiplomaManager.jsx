import React, { useState, lazy, Suspense, memo } from 'react';
import { GraduationCap, Plus, Trash2, X, Save, Calendar as CalendarLucide, Check, ChevronsUpDown, CalendarIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from 'sonner';
import { diplomaService } from '../../services/diplomaService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import * as roleUtils from '../../utils/roleUtils';
import { useApiQuery, useApiMutation } from '@/hooks/useReactQuery';
import 'react-calendar/dist/Calendar.css';
import '@/styles/custom-calendar.css'; // Import du CSS personnalisé pour le calendrier

// Chargement dynamique du calendrier pour améliorer les performances
const Calendar = lazy(() => import('react-calendar'));

// Composant de chargement pour le calendrier - Mémorisé
const CalendarFallback = memo(() => (
  <div className="flex items-center justify-center p-8">
    <div className="w-8 h-8 border-t-2 border-b-2 border-[#0066ff] rounded-full animate-spin"></div>
  </div>
));

CalendarFallback.displayName = 'CalendarFallback';

const DiplomaManager = ({ userData, diplomas, setDiplomas }) => {
  const userRole = userData?.role;
  const [isAdding, setIsAdding] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [diplomaToDelete, setDiplomaToDelete] = useState(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  
  const [newDiploma, setNewDiploma] = useState({
    diplomaId: '',
    obtainedDate: format(new Date(), 'yyyy-MM-dd')
  });

  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);

  // Formater la date pour l'affichage
  const formattedObtainedDate = newDiploma.obtainedDate 
    ? new Intl.DateTimeFormat('fr-FR').format(new Date(newDiploma.obtainedDate)) 
    : null;

  // Fonction pour gérer le changement de date
  const handleDateChange = (date) => {
    setNewDiploma({...newDiploma, obtainedDate: format(date, 'yyyy-MM-dd')});
    if (error) setError('');
  };

  // Fetch available diplomas using React Query
  const { 
    data: availableDiplomasResponse, 
    isLoading 
  } = useApiQuery(
    '/api/user-diplomas/available', 
    'availableDiplomas',
    {
      onError: (error) => {
        toast.error('Erreur lors du chargement des diplômes');
      }
    }
  );

  // Ensure availableDiplomas is always an array
  const availableDiplomas = React.useMemo(() => {
    if (!availableDiplomasResponse) {
      return [];
    }
    
    // Check if response has a success property and data array
    if (availableDiplomasResponse.success && Array.isArray(availableDiplomasResponse.data)) {
      return availableDiplomasResponse.data;
    }
    
    // If response is already an array, use it directly
    if (Array.isArray(availableDiplomasResponse)) {
      return availableDiplomasResponse;
    }
    
    // Fallback to empty array if we can't determine the structure
    return [];
  }, [availableDiplomasResponse]);

  // Setup mutations for adding and deleting diplomas
  const addDiplomaMutation = useApiMutation(
    '/api/user-diplomas',
    'post',
    'userDiplomas',
    {
      onSuccess: (response) => {
        toast.success('Diplôme ajouté avec succès');
        
        // Add the new diploma to the list using the setDiplomas prop
        // If response has data property, use it, otherwise use the whole response
        const newDiplomaData = response.data || response;
        
        // Ajouter le nouveau diplôme et trier la liste par date d'obtention (du plus récent au plus ancien)
        const updatedDiplomas = [...diplomas, newDiplomaData].sort((a, b) => {
          const dateA = new Date(a.obtainedDate);
          const dateB = new Date(b.obtainedDate);
          return dateB - dateA; // Ordre décroissant (du plus récent au plus ancien)
        });
        
        setDiplomas(updatedDiplomas);
        
        // Reset form
        setNewDiploma({
          diplomaId: '',
          obtainedDate: format(new Date(), 'yyyy-MM-dd')
        });
        
        // Close add form
        setIsAdding(false);
      },
      onError: (error) => {
        // Check for specific error messages from the API
        if (error.response) {
          // Handle 400 Bad Request errors which might indicate validation issues
          if (error.response.status === 400) {
            const errorData = error.response.data;
            
            // Check for duplicate diploma error
            if (errorData && errorData.message && errorData.message.includes('already has this diploma')) {
              setError('Vous possédez déjà ce diplôme dans votre profil');
              return;
            }
            
            // Handle other validation errors
            if (errorData && errorData.message) {
              setError(errorData.message);
              return;
            }
          }
          
          // Handle 409 Conflict which might also indicate a duplicate
          if (error.response.status === 409) {
            setError('Vous possédez déjà ce diplôme dans votre profil');
            return;
          }
        }
        
        // Default error message
        setError('Erreur lors de l\'ajout du diplôme');
      }
    }
  );

  const deleteDiplomaMutation = useApiMutation(
    (id) => `/api/user-diplomas/${id}`,
    'delete',
    'userDiplomas',
    {
      onSuccess: (_, variables) => {
        toast.success('Diplôme supprimé avec succès');
        
        // Remove the diploma from the list using the setDiplomas prop
        setDiplomas(diplomas.filter(diploma => diploma.id !== variables));
        setDiplomaToDelete(null);
      },
      onError: (error) => {
        toast.error('Erreur lors de la suppression du diplôme');
      }
    }
  );
  
  const handleAddDiploma = async () => {
    if (!newDiploma.diplomaId) {
      setError('Veuillez sélectionner un diplôme');
      return;
    }
    if (!newDiploma.obtainedDate) {
      setError('Veuillez sélectionner une date d\'obtention');
      return;
    }
    
    // Check if the user already has this diploma
    const alreadyHasDiploma = diplomas.some(
      diploma => diploma.diploma.id.toString() === newDiploma.diplomaId.toString()
    );
    
    if (alreadyHasDiploma) {
      setError('Vous possédez déjà ce diplôme dans votre profil');
      return;
    }
    
    setError('');
    addDiplomaMutation.mutate(newDiploma);
  };
  
  const handleDeleteDiploma = async (diploma) => {
    if (!diploma || !diploma.id) {
      toast.error('Diplôme introuvable');
      return;
    }
    
    setDiplomaToDelete(diploma);
    setDeleteDialogOpen(true);
  };
  
  const confirmDeleteDiploma = () => {
    if (!diplomaToDelete || !diplomaToDelete.id) {
      toast.error('Aucun diplôme à supprimer');
      return;
    }
    
    // Pass the ID directly to the mutation
    deleteDiplomaMutation.mutate(diplomaToDelete.id);
    setDeleteDialogOpen(false);
  };
  
  const cancelAdd = () => {
    setIsAdding(false);
    setNewDiploma({
      diplomaId: '',
      obtainedDate: format(new Date(), 'yyyy-MM-dd')
    });
  };
  
  // Check if this component should be rendered at all
  const shouldRenderDiplomaManager = () => {
    return roleUtils.isAdmin(userRole) || roleUtils.isStudent(userRole) || roleUtils.isGuest(userRole);
  };

  if (!shouldRenderDiplomaManager()) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le diplôme "{diplomaToDelete?.diploma?.name}" ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDiplomaToDelete(null);
              }}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteDiploma}
              disabled={deleteDiplomaMutation.isPending}
            >
              {deleteDiplomaMutation.isPending ? 'Suppression...' : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex items-center gap-2 mb-4">
        <GraduationCap className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-semibold">Gestion des diplômes</h2>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Add Diploma Button */}
          {roleUtils.canEditAcademic(userRole) && !isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 border-dashed border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all"
            >
              <Plus className="h-5 w-5" />
              <span>Ajouter un diplôme</span>
            </button>
          )}

          {/* Add Diploma Form */}
          {isAdding && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <h3 className="text-base font-medium">Ajouter un diplôme</h3>
              {error && (
                <div className="text-sm text-red-500 p-2 bg-red-50 rounded-md">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Diplôme</label>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
                      >
                        <span className="truncate">
                          {newDiploma.diplomaId
                            ? availableDiplomas.find((diploma) => diploma.id.toString() === newDiploma.diplomaId)?.name
                            : "Sélectionner un diplôme..."}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                      <Command>
                        <CommandInput placeholder="Rechercher un diplôme..." />
                        <CommandList>
                          <CommandEmpty>Aucun diplôme trouvé.</CommandEmpty>
                          <CommandGroup>
                            {availableDiplomas.map((diploma) => {
                              const alreadyHasDiploma = diplomas.some(
                                userDiploma => userDiploma.diploma.id.toString() === diploma.id.toString()
                              );
                              
                              return (
                                <CommandItem
                                  key={diploma.id}
                                  value={diploma.name}
                                  disabled={alreadyHasDiploma}
                                  onSelect={() => {
                                    setNewDiploma({ ...newDiploma, diplomaId: diploma.id.toString() });
                                    if (error) setError('');
                                    setOpen(false);
                                  }}
                                  className={cn(
                                    alreadyHasDiploma && "opacity-50",
                                    "flex items-center justify-between"
                                  )}
                                >
                                  <div className="flex flex-col">
                                    <span className="font-medium">{diploma.name}</span>
                                    <span className="text-sm text-gray-500">{diploma.institution}</span>
                                  </div>
                                  {newDiploma.diplomaId === diploma.id.toString() && (
                                    <Check className="h-4 w-4 shrink-0" />
                                  )}
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Date d'obtention
                  </label>
                  <div className="relative">
                    <div 
                      className={`w-full px-4 py-3 rounded-md border flex items-center cursor-pointer transition-colors hover:border-[#0066ff] ${error && error.includes('date') ? 'border-red-500' : 'border-gray-300'}`}
                      onClick={() => setCalendarOpen(true)}
                    >
                      {formattedObtainedDate ? (
                        <span className="text-gray-900">
                          {formattedObtainedDate}
                        </span>
                      ) : (
                        <span className="text-gray-500">JJ/MM/AAAA</span>
                      )}
                      <CalendarIcon className="ml-auto h-5 w-5 text-gray-500" />
                    </div>
                    
                    <Dialog open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <DialogContent className="p-0 sm:max-w-[425px] bg-white rounded-lg shadow-xl border-none overflow-hidden">
                        <div className="p-4 pb-0">
                          <DialogTitle className="text-xl font-semibold text-center text-gray-900">
                            Sélectionnez la date d'obtention
                          </DialogTitle>
                          <DialogDescription className="text-sm text-center text-gray-500 mt-1">
                            Choisissez la date à laquelle vous avez obtenu ce diplôme.
                          </DialogDescription>
                        </div>
                        <div className="calendar-container w-full p-4">
                          <Suspense fallback={<CalendarFallback />}>
                            <Calendar 
                              onChange={handleDateChange} 
                              value={new Date(newDiploma.obtainedDate)} 
                              locale="fr"
                              maxDate={new Date()}
                              minDetail="decade" 
                              defaultView="decade"
                              minDate={new Date(1940, 0, 1)}
                              className="modern-calendar w-full"
                              formatShortWeekday={(locale, date) => ['L', 'M', 'M', 'J', 'V', 'S', 'D'][date.getDay()]}
                              navigationLabel={({ date }) => 
                                date.toLocaleString('fr', { month: 'long', year: 'numeric' }).toLowerCase()
                              }
                              next2Label={<span className="text-lg text-[#0066ff]">»</span>}
                              prev2Label={<span className="text-lg text-[#0066ff]">«</span>}
                              nextLabel={<span className="text-lg text-[#0066ff]">›</span>}
                              prevLabel={<span className="text-lg text-[#0066ff]">‹</span>}
                              showNeighboringMonth={false}
                              tileClassName={({ date, view }) => {
                                // Vérifie si la date est dans le futur
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                
                                if (view === 'month' && date > today) {
                                  return 'calendar-future-date';
                                }
                                
                                return null;
                              }}
                            />
                          </Suspense>
                        </div>
                        <div className="p-4 flex justify-end">
                          <button 
                            className="calendar-confirm-button"
                            onClick={() => setCalendarOpen(false)}
                          >
                            Confirmer
                          </button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <Button 
                  variant="outline" 
                  onClick={cancelAdd}
                  className="text-sm"
                >
                  <X className="h-4 w-4 mr-2" />
                  Annuler
                </Button>
                <Button 
                  onClick={handleAddDiploma}
                  disabled={addDiplomaMutation.isPending}
                  className="text-sm"
                >
                  {addDiplomaMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      <span>Enregistrement...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Enregistrer
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
          
          {/* Diplomas List */}
          {diplomas && diplomas.length > 0 ? (
            <div className="space-y-3">
              {diplomas.map((diploma) => (
                <div 
                  key={diploma.id} 
                  className="flex items-start justify-between gap-4 py-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <GraduationCap className="h-5 w-5 text-gray-400 flex-shrink-0 mt-1" />
                    <div className="min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">
                        {diploma.diploma.name}
                      </h4>
                      <p className="text-sm text-gray-500 truncate">
                        {diploma.diploma.institution}
                      </p>
                      <p className="text-sm text-gray-400">
                        Obtenu le {format(new Date(diploma.obtainedDate), 'dd MMMM yyyy', { locale: fr })}
                      </p>
                    </div>
                  </div>
                  {roleUtils.canEditAcademic(userRole) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteDiploma(diploma)}
                      disabled={deleteDiplomaMutation.isPending}
                      className="h-8 w-8 text-red-500 hover:text-red-600"
                    >
                      {deleteDiplomaMutation.isPending && deleteDiplomaMutation.variables === diploma.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <GraduationCap className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">Vous n'avez pas encore ajouté de diplômes à votre profil.</p>
              {roleUtils.canEditAcademic(userRole) && !isAdding && (
                <Button 
                  variant="outline" 
                  onClick={() => setIsAdding(true)}
                  className="mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un diplôme
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DiplomaManager; 