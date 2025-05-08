import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formationService } from '../../services/formation.service';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Upload, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { useRolePermissions } from '@/features/roles';

const FormationForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [specializations, setSpecializations] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    promotion: '',
    description: '',
    capacity: '',
    duration: '',
    dateStart: '',
    location: '',
    specializationId: '',
    imageFile: null
  });
  const permissions = useRolePermissions();
  const [showAddSpecModal, setShowAddSpecModal] = useState(false);
  const [domains, setDomains] = useState([]);
  const [newSpec, setNewSpec] = useState({ name: '', domainId: '' });
  const [addingSpec, setAddingSpec] = useState(false);
  const [deletingSpec, setDeletingSpec] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [specToDelete, setSpecToDelete] = useState(null);

  useEffect(() => {
    const loadSpecializations = async () => {
      try {
        const specializationsData = await formationService.getSpecializations();
        
        if (Array.isArray(specializationsData)) {
          setSpecializations(specializationsData);
        } else {
          toast.error('Structure de données de spécialisation inattendue');
        }
      } catch (error) {
        toast.error('Erreur lors du chargement des spécialisations');
      }
    };

    loadSpecializations();
  }, []);

  // Fetch domains for the modal
  useEffect(() => {
    if (!showAddSpecModal) return;
    const fetchDomains = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Session expirée. Veuillez vous reconnecter.');
          return;
        }

        const res = await fetch('/api/domains', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const json = await res.json();
        
        if (json.success && json.data && Array.isArray(json.data.domains)) {
          setDomains(json.data.domains);
        } else {
          setDomains([]);
          toast.error('Structure de données de domaines inattendue');
        }
      } catch (e) {
        setDomains([]);
        toast.error('Erreur lors du chargement des domaines');
      }
    };
    fetchDomains();
  }, [showAddSpecModal]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSpecializationChange = (value) => {
    setFormData(prev => ({
      ...prev,
      specializationId: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error('L\'image ne doit pas dépasser 2MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Le fichier doit être une image');
        return;
      }
      setFormData(prev => ({
        ...prev,
        imageFile: file
      }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const validateForm = () => {
    const requiredFields = ['name', 'promotion', 'capacity', 'duration', 'dateStart', 'specializationId'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      toast.error(`Veuillez remplir tous les champs obligatoires : ${missingFields.join(', ')}`);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const formDataToSubmit = {
        ...formData,
        capacity: parseInt(formData.capacity),
        duration: parseInt(formData.duration),
        dateStart: formData.dateStart
      };

      const response = await formationService.createFormation(formDataToSubmit);
      toast.success('Formation créée avec succès');
      navigate('/formations');
    } catch (error) {
      toast.error(error.message || 'Erreur lors de la création de la formation');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSpecialization = async () => {
    if (!newSpec.name || !newSpec.domainId) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    setAddingSpec(true);
    // --- Optimistic update start ---
    // Generate a temporary negative id
    const tempId = -(Date.now());
    const optimisticSpec = { id: tempId, name: newSpec.name, domainId: newSpec.domainId };
    setSpecializations(prev => [...prev, optimisticSpec]);
    setFormData(prev => ({ ...prev, specializationId: tempId.toString() }));
    setShowAddSpecModal(false);
    setNewSpec({ name: '', domainId: '' });
    let added = false;
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      const res = await fetch('/api/specializations', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ name: optimisticSpec.name, domainId: optimisticSpec.domainId })
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const json = await res.json();
      if (json.success && json.data && json.data.specialization) {
        toast.success('Spécialisation ajoutée');
        // Replace the optimistic specialization with the real one
        setSpecializations(prev => prev.map(s => s.id === tempId ? json.data.specialization : s));
        setFormData(prev => ({ ...prev, specializationId: json.data.specialization.id.toString() }));
        added = true;
      } else {
        throw new Error(json.message || 'Erreur lors de l\'ajout');
      }
    } catch (e) {
      // Remove the optimistic specialization if error
      setSpecializations(prev => prev.filter(s => s.id !== tempId));
      setFormData(prev => ({ ...prev, specializationId: '' }));
      toast.error(e.message || 'Erreur lors de l\'ajout');
    } finally {
      setAddingSpec(false);
    }
  };

  const handleDeleteSpecialization = async (specId, specName) => {
    setSpecToDelete({ id: specId, name: specName });
    setShowDeleteDialog(true);
  };

  const confirmDeleteSpecialization = async () => {
    if (!specToDelete) return;
    
    setDeletingSpec(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        return;
      }

      const res = await fetch(`/api/specializations/${specToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const json = await res.json();

      if (json.success) {
        toast.success('Spécialisation supprimée avec succès');
        // Refresh specializations
        const specializationsData = await formationService.getSpecializations();
        setSpecializations(specializationsData);
        // Clear selected specialization if it was the deleted one
        if (formData.specializationId === specToDelete.id.toString()) {
          setFormData(prev => ({ ...prev, specializationId: '' }));
        }
      } else {
        toast.error(json.message || 'Erreur lors de la suppression');
      }
    } catch (e) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeletingSpec(false);
      setShowDeleteDialog(false);
      setSpecToDelete(null);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-6 lg:px-8 py-6">
      <Card className="overflow-hidden w-full shadow-xl bg-white dark:bg-gray-900">
        <CardHeader className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 border-b">
          <CardTitle className="text-xl sm:text-2xl font-bold text-primary drop-shadow mb-1">Nouvelle Formation</CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">Créez une nouvelle formation en remplissant les champs ci-dessous.</p>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 md:px-8 py-8">
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Ligne 1 : image + description */}
            <div className="flex flex-col md:flex-row gap-8 items-stretch md:items-start pt-4">
              {/* Image de la formation */}
              <div className="flex flex-col items-center w-full md:w-1/4 min-w-[180px] justify-center">
                <div className="relative group mb-4">
                  <label
                    htmlFor="formation-image-upload"
                    className="block w-32 h-32 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-blue-200 dark:border-gray-700 shadow-lg cursor-pointer transition-all duration-200 group-hover:ring-4 group-hover:ring-blue-400 group-hover:shadow-xl outline-none select-none"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Prévisualisation"
                          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105 pointer-events-none"
                          draggable="false"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center w-full h-full pointer-events-none select-none">
                          <Upload className="h-10 w-10 text-gray-400 mb-2" />
                          <span className="text-xs text-gray-400">Image</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full pointer-events-none">
                        <span className="text-white text-sm font-semibold px-2 text-center select-none">
                          Changer l'image
                        </span>
                      </div>
                    </div>
                  </label>
                  <input
                    id="formation-image-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={loading}
                  />
                  {imagePreview && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mt-4 text-red-500 hover:bg-red-50 transition-colors"
                      onClick={() => { setImagePreview(null); setFormData(prev => ({ ...prev, imageFile: null })); }}
                      disabled={loading}
                    >
                      Supprimer l'image
                    </Button>
                  )}
                </div>
                <span className="text-xs text-gray-400 text-center select-none">Format JPG, PNG, GIF, WEBP. Max 2MB.</span>
              </div>
              {/* Description */}
              <div className="flex-1 flex flex-col justify-center">
                <Label htmlFor="description" className="font-semibold">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={5}
                  className="mt-2 resize-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
                />
              </div>
            </div>

            {/* Ligne 2 : tous les champs principaux sur une seule ligne en grille responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name" className="font-semibold">Nom *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="promotion" className="font-semibold">Promotion *</Label>
                <Input
                  id="promotion"
                  name="promotion"
                  value={formData.promotion}
                  onChange={handleInputChange}
                  required
                  className="focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="capacity" className="font-semibold">Capacité *</Label>
                <Input
                  id="capacity"
                  name="capacity"
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  required
                  className="focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="duration" className="font-semibold">Durée (en mois) *</Label>
                <Input
                  type="number"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  required
                  className="focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="dateStart" className="font-semibold">Date de début *</Label>
                <Input
                  type="date"
                  id="dateStart"
                  name="dateStart"
                  value={formData.dateStart}
                  onChange={handleInputChange}
                  required
                  className="focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="location" className="font-semibold">Lieu</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                />
              </div>
              <div className="flex flex-col gap-2 lg:col-span-1">
                <Label htmlFor="specializationId" className="font-semibold">Spécialisation *</Label>
                <Select
                  value={formData.specializationId}
                  onValueChange={handleSpecializationChange}
                  required
                >
                  <SelectTrigger className="focus:ring-2 focus:ring-blue-400 focus:border-blue-400">
                    <SelectValue placeholder="Sélectionnez une spécialisation" />
                  </SelectTrigger>
                  <SelectContent>
                    {specializations.map((spec) => (
                      <SelectItem key={spec.id} value={spec.id.toString()}>
                        {spec.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(permissions.isAdmin() || permissions.isRecruiter() || permissions.isSuperadmin()) && (
                  <div className="flex gap-2 mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-fit"
                      onClick={() => setShowAddSpecModal(true)}
                    >
                      + Nouvelle
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-fit text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        if (!formData.specializationId) {
                          toast.error('Veuillez sélectionner une spécialisation à supprimer');
                          return;
                        }
                        const spec = specializations.find(s => s.id.toString() === formData.specializationId);
                        if (spec) {
                          handleDeleteSpecialization(spec.id, spec.name);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Supprimer
                    </Button>
                  </div>
                )}
                <Dialog open={showAddSpecModal} onOpenChange={setShowAddSpecModal}>
                  <DialogContent aria-describedby="add-spec-desc">
                    <DialogHeader>
                      <DialogTitle>Nouvelle spécialisation</DialogTitle>
                      <p id="add-spec-desc" className="text-sm text-gray-500">Ajoutez une nouvelle spécialisation et associez-la à un domaine.</p>
                    </DialogHeader>
                    <div className="flex flex-col gap-4">
                      <Label htmlFor="new-spec-name">Nom</Label>
                      <Input
                        id="new-spec-name"
                        value={newSpec.name}
                        onChange={e => setNewSpec(s => ({ ...s, name: e.target.value }))}
                        placeholder="Nom de la spécialisation"
                        disabled={addingSpec}
                      />
                      <Label htmlFor="new-spec-domain">Domaine</Label>
                      <select
                        id="new-spec-domain"
                        className="border rounded px-3 py-2"
                        value={newSpec.domainId}
                        onChange={e => setNewSpec(s => ({ ...s, domainId: e.target.value }))}
                        disabled={addingSpec}
                      >
                        <option value="">Sélectionnez un domaine</option>
                        {domains.map(domain => (
                          <option key={domain.id} value={domain.id}>{domain.name}</option>
                        ))}
                      </select>
                    </div>
                    <DialogFooter className="mt-4 flex gap-2 justify-end">
                      <Button type="button" variant="outline" onClick={() => setShowAddSpecModal(false)} disabled={addingSpec}>Annuler</Button>
                      <Button type="button" onClick={handleAddSpecialization} disabled={addingSpec}>{addingSpec ? 'Ajout...' : 'Ajouter'}</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Supprimer la spécialisation</DialogTitle>
                      <DialogDescription>
                        Êtes-vous sûr de vouloir supprimer la spécialisation "{specToDelete?.name}" ?
                        Cette action ne sera pas possible si la spécialisation est utilisée par des formations.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 flex gap-2 justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowDeleteDialog(false)}
                        disabled={deletingSpec}
                      >
                        Annuler
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={confirmDeleteSpecialization}
                        disabled={deletingSpec}
                      >
                        {deletingSpec ? 'Suppression...' : 'Supprimer'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="flex gap-4 justify-end">
              <Button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-600 to-cyan-400 text-white shadow hover:from-blue-700 hover:to-cyan-500 transition">
                {loading ? 'Création...' : 'Créer'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/formations')}
                disabled={loading}
              >
                Annuler
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default FormationForm; 