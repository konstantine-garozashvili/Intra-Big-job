import React, { useState } from 'react';
import { 
  GraduationCap, 
  Plus, 
  Trash2, 
  Check, 
  ChevronsUpDown, 
  X, 
  Save 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
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
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import PropTypes from 'prop-types';
import { useApiQuery, useApiMutation } from '@/hooks/useReactQuery';
import { roleUtils } from '@/lib/utils/roleUtils';

const DiplomaManager = ({ userData, diplomas, setDiplomas }) => {
  const userRole = userData?.role;
  const [isAdding, setIsAdding] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [diplomaToDelete, setDiplomaToDelete] = useState(null);
  const [diplomaModalOpen, setDiplomaModalOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [newDiploma, setNewDiploma] = useState({
    diplomaId: '',
    obtainedDate: format(new Date(), 'yyyy-MM-dd')
  });
  const [error, setError] = useState('');

  // Charge la liste des diplômes disponibles
  const { data: availableDiplomasResponse } = useApiQuery(
    'diplomasResource',
    'getAvailableDiplomas',
    {},
    'availableDiplomas',
    {
      onError: () => {
        toast.error('Erreur lors du chargement des diplômes');
      }
    }
  );

  // S'assurer que availableDiplomas est toujours un tableau
  const availableDiplomas = React.useMemo(() => {
    if (!availableDiplomasResponse) {
      return [];
    }
    
    return Array.isArray(availableDiplomasResponse.data) 
      ? availableDiplomasResponse.data 
      : Array.isArray(availableDiplomasResponse) 
        ? availableDiplomasResponse 
        : [];
  }, [availableDiplomasResponse]);

  // API mutation pour ajouter un diplôme
  const { mutate: addDiploma, isPending: isAddingDiploma } = useApiMutation(
    'diplomasResource',
    'addUserDiploma',
    {
      onSuccess: (data) => {
        // Vérifier que la réponse contient un diplôme valide
        if (data && data.diploma) {
          toast.success('Diplôme ajouté avec succès');
          
          // Fermer le formulaire
          setIsAdding(false);
          setDiplomaModalOpen(false);
          
          // Réinitialiser le formulaire
          setNewDiploma({
            diplomaId: '',
            obtainedDate: format(new Date(), 'yyyy-MM-dd')
          });
          
          // Ajouter le nouveau diplôme et trier la liste par date d'obtention (du plus récent au plus ancien)
          const updatedDiplomas = [...diplomas, data].sort((a, b) => {
            return new Date(b.obtainedDate) - new Date(a.obtainedDate);
          });
          
          // Mettre à jour l'état avec les diplômes triés
          setDiplomas(updatedDiplomas);
          setError('');
        } else {
          setError('Erreur lors de l&apos;ajout du diplôme');
        }
      },
      onError: () => {
        setError('Erreur lors de l&apos;ajout du diplôme');
      }
    }
  );

  // API mutation pour supprimer un diplôme
  const { mutate: deleteDiploma, isPending: isDeletingDiploma } = useApiMutation(
    'diplomasResource',
    'deleteUserDiploma',
    {
      onSuccess: (_, variables) => {
        toast.success('Diplôme supprimé avec succès');
        setDeleteDialogOpen(false);
        
        // Supprimer le diplôme de la liste avec la propriété setDiplomas
        setDiplomas(diplomas.filter(diploma => diploma.id !== variables));
        setDiplomaToDelete(null);
      },
      onError: () => {
        toast.error('Erreur lors de la suppression du diplôme');
      }
    }
  );

  // Gérer l'ajout d'un diplôme
  const handleAddDiploma = async () => {
    setError('');
    
    // Vérifier que tous les champs requis sont remplis
    if (!newDiploma.diplomaId) {
      setError('Veuillez sélectionner un diplôme');
      return;
    }
    
    // Vérifier si l'utilisateur a déjà ce diplôme
    const alreadyHasDiploma = diplomas.some(
      diploma => diploma.diploma.id.toString() === newDiploma.diplomaId.toString()
    );
    
    if (alreadyHasDiploma) {
      setError('Vous avez déjà ajouté ce diplôme à votre profil');
      return;
    }
    
    if (!newDiploma.obtainedDate) {
      setError('Veuillez sélectionner une date d&apos;obtention');
      return;
    }
    
    // Ajouter le diplôme
    addDiploma({
      diplomaId: newDiploma.diplomaId,
      obtainedDate: newDiploma.obtainedDate
    });
  };

  // Gérer le clic sur le bouton de suppression
  const handleDeleteDiploma = async (diploma) => {
    setDiplomaToDelete(diploma);
    setDeleteDialogOpen(true);
  };

  // Confirmer la suppression
  const confirmDeleteDiploma = () => {
    if (diplomaToDelete && diplomaToDelete.id) {
      deleteDiploma(diplomaToDelete.id);
    }
  };

  // Annuler l'ajout
  const cancelAdd = () => {
    setIsAdding(false);
    setDiplomaModalOpen(false);
    setNewDiploma({
      diplomaId: '',
      obtainedDate: format(new Date(), 'yyyy-MM-dd')
    });
    setError('');
  };

  // Déterminer si le gestionnaire de diplômes doit être affiché
  const shouldRenderDiplomaManager = () => {
    return roleUtils.canViewAcademic(userRole);
  };

  if (!shouldRenderDiplomaManager()) {
    return null;
  }

  return (
    <div className="space-y-6 bg-white rounded-lg border p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Gestion des diplômes</h2>
          <p className="text-gray-500 text-sm mt-1">
            Ajoutez et gérez vos diplômes pour mettre en valeur votre parcours académique
          </p>
        </div>
        {roleUtils.canEditAcademic(userRole) && !isAdding && (
          <Button 
            onClick={() => {
              setDiplomaModalOpen(true);
              setIsAdding(true);
            }}
            size="sm"
            className="flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un diplôme
          </Button>
        )}
      </div>
      
      {/* Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le diplôme &quot;{diplomaToDelete?.diploma?.name}&quot; ? Cette action est irréversible et supprimera définitivement le diplôme de votre profil.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeletingDiploma}
            >
              Annuler
            </Button>
            <Button 
              type="button" 
              variant="destructive"
              onClick={confirmDeleteDiploma}
              disabled={isDeletingDiploma}
            >
              {isDeletingDiploma ? (
                <>
                  <div className="w-4 h-4 border-t-2 border-white rounded-full animate-spin mr-2" />
                  Suppression...
                </>
              ) : (
                "Supprimer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diploma Add/Edit Dialog */}
      <Dialog open={diplomaModalOpen} onOpenChange={setDiplomaModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Ajouter un diplôme</DialogTitle>
            <DialogDescription>
              Choisissez un diplôme dans la liste et indiquez sa date d&apos;obtention.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Diplôme
              </label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                  >
                    {newDiploma.diplomaId
                      ? availableDiplomas.find(
                          (diploma) => diploma.id.toString() === newDiploma.diplomaId.toString()
                        )?.name || "Sélectionner un diplôme"
                      : "Sélectionner un diplôme"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                  <Command>
                    <CommandInput 
                      placeholder="Rechercher un diplôme..." 
                      value={search}
                      onValueChange={setSearch}
                    />
                    <CommandEmpty>Aucun diplôme trouvé.</CommandEmpty>
                    <CommandList className="max-h-[200px] overflow-y-auto">
                      <CommandGroup>
                        {availableDiplomas.map((diploma) => {
                          const alreadyHasDiploma = diplomas.some(
                            userDiploma => userDiploma.diploma.id.toString() === diploma.id.toString()
                          );
                          
                          return (
                            <CommandItem
                              key={diploma.id}
                              disabled={alreadyHasDiploma}
                              onSelect={() => {
                                setNewDiploma({
                                  ...newDiploma,
                                  diplomaId: diploma.id.toString()
                                });
                                setOpen(false);
                              }}
                              className={cn(
                                alreadyHasDiploma && "opacity-50",
                                "flex items-center justify-between"
                              )}
                            >
                              <span>{diploma.name}</span>
                              {newDiploma.diplomaId === diploma.id.toString() && (
                                <Check className="h-4 w-4" />
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
                htmlFor="obtained-date"
                className="block text-sm font-medium text-gray-700"
              >
                Date d&apos;obtention
              </label>
              <input
                type="date"
                id="obtained-date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                value={newDiploma.obtainedDate}
                onChange={(e) => setNewDiploma({
                  ...newDiploma,
                  obtainedDate: e.target.value
                })}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
          
          <DialogFooter className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={cancelAdd}
              disabled={isAddingDiploma}
              className="text-sm"
            >
              <X className="h-4 w-4 mr-2" />
              Annuler
            </Button>
            <Button 
              type="button"
              onClick={handleAddDiploma}
              disabled={!newDiploma.diplomaId || !newDiploma.obtainedDate || isAddingDiploma}
            >
              {isAddingDiploma ? (
                <>
                  <div className="w-4 h-4 border-t-2 border-white rounded-full animate-spin mr-2" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diplomas List */}
      {diplomas && diplomas.length > 0 ? (
        <div className="space-y-3">
          {diplomas.map((diploma) => (
            <div 
              key={diploma.id} 
              className="flex items-start justify-between gap-4 py-3"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-full">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">{diploma.diploma.name}</h3>
                  <p className="text-sm text-gray-500">
                    {format(new Date(diploma.obtainedDate), 'MMMM yyyy', { locale: fr })}
                    {diploma.diploma.institution && (
                      <span className="ml-1">
                        • {diploma.diploma.institution}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              {roleUtils.canEditAcademic(userRole) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteDiploma(diploma)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  data-testid="delete-diploma-button"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <GraduationCap className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-500">Vous n&apos;avez pas encore ajouté de diplômes à votre profil.</p>
          {roleUtils.canEditAcademic(userRole) && !isAdding && (
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setDiplomaModalOpen(true);
                setIsAdding(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un diplôme
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

// Définition des PropTypes
DiplomaManager.propTypes = {
  userData: PropTypes.shape({
    role: PropTypes.string
  }).isRequired,
  diplomas: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      diploma: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        name: PropTypes.string,
        institution: PropTypes.string
      }),
      obtainedDate: PropTypes.string
    })
  ).isRequired,
  setDiplomas: PropTypes.func.isRequired
};

export default DiplomaManager; 