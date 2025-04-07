import React, { useState, useEffect } from 'react';
import { GraduationCap, Plus, Trash2, X, Save, Calendar, Check, ChevronsUpDown } from 'lucide-react';
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
import { useQueryClient } from '@tanstack/react-query';
import { getSessionId } from '@/lib/services/authService';

const DiplomaManager = ({ userData, diplomas, setDiplomas }) => {
  const queryClient = useQueryClient();
  const userRole = userData?.role;
  const [isAdding, setIsAdding] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [diplomaToDelete, setDiplomaToDelete] = useState(null);
  
  const [newDiploma, setNewDiploma] = useState({
    diplomaId: '',
    obtainedDate: format(new Date(), 'yyyy-MM-dd')
  });

  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);

  // Fetch available diplomas using React Query
  const { 
    data: availableDiplomasResponse, 
    isLoading,
    refetch: refetchAvailableDiplomas  // Get direct refetch function
  } = useApiQuery(
    '/api/user-diplomas/available', 
    'availableDiplomas',
    {
      onError: (error) => {
        toast.error('Erreur lors du chargement des diplômes');
      }
    }
  );

  // Get user diplomas query reference to allow explicit refetching
  const { refetch: refetchUserDiplomas } = useApiQuery(
    '/api/user-diplomas',
    'userDiplomas',
    {
      enabled: true, // Always enabled to ensure we have the data
      onSuccess: (data) => {
        // Ensure diplomas state is always in sync with API data
        console.log("[DiplomaManager] Successfully fetched user diplomas:", data);
        if (data && Array.isArray(data)) {
          setDiplomas(data);
        } else if (data && data.data && Array.isArray(data.data)) {
          setDiplomas(data.data);
        }
      },
      onError: (error) => {
        console.error('Error fetching user diplomas:', error);
      }
    }
  );

  // Add an effect to refetch available diplomas when diplomas change
  useEffect(() => {
    if (diplomas && Array.isArray(diplomas)) {
      // Force refetch available diplomas when diplomas list changes
      refetchAvailableDiplomas();
    }
  }, [diplomas, refetchAvailableDiplomas]);

  // Function to ensure we definitely call both API endpoints
  const forceRefreshAllData = () => {
    console.log("[DiplomaManager] Force refreshing all diploma data");
    
    // Clear caches first
    queryClient.invalidateQueries(['userDiplomas']);
    queryClient.invalidateQueries(['availableDiplomas']);
    queryClient.invalidateQueries(['/api/profile']);
    
    // Force direct API calls regardless of React Query cache
    setTimeout(() => {
      // Call user diplomas endpoint with direct service call
      console.log("[DiplomaManager] Calling getUserDiplomas directly");
      diplomaService.getUserDiplomas()
        .then(data => console.log("[DiplomaManager] Direct getUserDiplomas success"))
        .catch(err => console.error("[DiplomaManager] Error in direct getUserDiplomas call:", err));
      
      // Call available diplomas endpoint with direct service call
      console.log("[DiplomaManager] Calling getAvailableDiplomas directly");
      diplomaService.getAvailableDiplomas()
        .then(data => console.log("[DiplomaManager] Direct getAvailableDiplomas success"))
        .catch(err => console.error("[DiplomaManager] Error in direct getAvailableDiplomas call:", err));
      
      // Also refetch through React Query
      refetchUserDiplomas();
      refetchAvailableDiplomas();
    }, 500); // Increased delay to ensure backend has processed changes
  };

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
        
        // First invalidate the cache immediately
        queryClient.invalidateQueries(['userDiplomas']);      // User's diplomas list
        queryClient.invalidateQueries(['/api/profile']);      // Profile data for completeness widget
        
        // Then queue a refetch of available diplomas with a slight delay to ensure backend processing is complete
        setTimeout(() => {
          console.log("[DiplomaManager] Refetching available diplomas after add");
          // Use both methods to ensure the API call happens
          refetchAvailableDiplomas();
          diplomaService.getAvailableDiplomas().catch(err => 
            console.error("[DiplomaManager] Error fetching available diplomas:", err)
          );
        }, 300);
        
        // Force a complete refresh of all relevant data
        forceRefreshAllData();
        
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
        
        // Dispatch event to notify MainLayout about the update
        document.dispatchEvent(new CustomEvent('user:data-updated'));
        
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
        
        // First invalidate the cache immediately
        queryClient.invalidateQueries(['userDiplomas']);      // User's diplomas list
        queryClient.invalidateQueries(['/api/profile']);      // Profile data for completeness widget
        
        // Then queue a refetch of available diplomas with a slight delay to ensure backend processing is complete
        setTimeout(() => {
          console.log("[DiplomaManager] Refetching available diplomas after delete");
          // Use both methods to ensure the API call happens
          refetchAvailableDiplomas();
          diplomaService.getAvailableDiplomas().catch(err => 
            console.error("[DiplomaManager] Error fetching available diplomas:", err)
          );
        }, 300);
        
        // Force a complete refresh of all relevant data
        forceRefreshAllData();
        
        // Remove the diploma from the list using the setDiplomas prop
        setDiplomas(diplomas.filter(diploma => diploma.id !== variables));
        setDiplomaToDelete(null);
        
        // Dispatch event to notify MainLayout about the update
        document.dispatchEvent(new CustomEvent('user:data-updated'));
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
      diploma => {
        // Handle both old and new data formats
        if (diploma.diploma && typeof diploma.diploma === 'object') {
          // New format: diploma object is nested
          return diploma.diploma.id.toString() === newDiploma.diplomaId.toString();
        } else {
          // Old format: diploma id is at the root level
          return diploma.id.toString() === newDiploma.diplomaId.toString();
        }
      }
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
                  <label
                    htmlFor="date-obtention"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Date d'obtention
                  </label>
                  <input
                    id="date-obtention"
                    type="date"
                    value={newDiploma.obtainedDate}
                    onChange={(e) => {
                      setNewDiploma({...newDiploma, obtainedDate: e.target.value});
                      if (error) setError('');
                    }}
                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                  />
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