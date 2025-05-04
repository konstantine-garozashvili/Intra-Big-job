import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import formationService from '../../services/formationService';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Upload, Trash2 } from 'lucide-react';

const EditFormationForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [specializations, setSpecializations] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    promotion: '',
    description: '',
    image_url: '',
    specializationId: '',
    capacity: '',
    duration: '',
    dateStart: '',
    location: ''
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        console.log('[EditFormationForm] Loading formation data for id:', id);
        
        // Charger les spécialisations d'abord
        const specializationsData = await formationService.getSpecializations();
        console.log('[EditFormationForm] Received specializations:', specializationsData);
        
        if (Array.isArray(specializationsData?.specializations)) {
          setSpecializations(specializationsData.specializations);
        }

        // Charger les données de la formation
        const formationData = await formationService.getFormation(id);
        console.log('[EditFormationForm] Received formation data:', formationData);
        
        if (!formationData) {
          console.error('[EditFormationForm] No formation data received');
          toast.error('Erreur lors du chargement de la formation');
          return;
        }

        // Formater la date au format YYYY-MM-DD pour l'input date
        const dateStart = formationData.dateStart ? new Date(formationData.dateStart).toISOString().split('T')[0] : '';

        setFormData({
          name: formationData.name || '',
          promotion: formationData.promotion || '',
          description: formationData.description || '',
          image_url: formationData.image_url || '',
          specializationId: formationData.specialization?.id?.toString() || '',
          capacity: formationData.capacity?.toString() || '',
          duration: formationData.duration?.toString() || '',
          dateStart: dateStart,
          location: formationData.location || ''
        });

        // Si une image existe, la prévisualiser
        if (formationData.image_url) {
          setImagePreview(formationData.image_url);
        }
      } catch (error) {
        console.error('[EditFormationForm] Error loading data:', error);
        toast.error('Erreur lors du chargement de la formation');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadData();
    }
  }, [id]);

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

  const handleImageDelete = async () => {
    if (!id || !imagePreview) return;

    try {
      setLoading(true);
      await formationService.deleteFormationImage(id);
      setImagePreview(null);
      setFormData(prev => ({ ...prev, imageFile: null }));
      toast.success('Image supprimée avec succès');
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Erreur lors de la suppression de l\'image');
    } finally {
      setLoading(false);
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

      // Mise à jour de la formation
      await formationService.updateFormation(id, formDataToSubmit);

      // Si une nouvelle image a été sélectionnée, la télécharger
      if (formData.imageFile) {
        await formationService.uploadFormationImage(id, formData.imageFile);
      }

      toast.success('Formation mise à jour avec succès');
      navigate('/formations');
    } catch (error) {
      console.error('Error updating formation:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour de la formation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Modifier la Formation</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <Label htmlFor="name">Nom *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="promotion">Promotion *</Label>
                <Input
                  id="promotion"
                  name="promotion"
                  value={formData.promotion}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label htmlFor="capacity">Capacité *</Label>
                <Input
                  id="capacity"
                  name="capacity"
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="duration">Durée (en mois) *</Label>
                <Input
                  type="number"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="dateStart">Date de début *</Label>
                <Input
                  type="date"
                  id="dateStart"
                  name="dateStart"
                  value={formData.dateStart}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="location">Lieu</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label htmlFor="specializationId">Spécialisation *</Label>
                <Select
                  value={formData.specializationId}
                  onValueChange={handleSpecializationChange}
                  required
                >
                  <SelectTrigger>
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
              </div>

              <div className="space-y-4">
                <Label>Image de la formation</Label>
                <div className="flex items-center space-x-4">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Prévisualisation"
                        className="w-32 h-32 object-cover rounded-lg"
                        onError={(e) => {
                          console.error('[EditFormationForm] Image load error:', e);
                          e.target.onerror = null;
                        }}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-0 right-0 -mt-2 -mr-2"
                        onClick={handleImageDelete}
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center">
                      <label className="cursor-pointer flex flex-col items-center">
                        <Upload className="h-8 w-8 text-gray-400" />
                        <span className="text-sm text-gray-500">Upload</span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageChange}
                          disabled={loading}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Enregistrement...' : 'Mettre à jour'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/formations')}
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

export default EditFormationForm; 