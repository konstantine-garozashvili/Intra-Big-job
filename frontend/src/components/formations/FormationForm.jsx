import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import formationService from '../../services/formationService';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select } from '../ui/select';
import { Image, Upload, Trash2 } from 'lucide-react';

const FormationForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    promotion: '',
    description: '',
    capacity: '',
    dateStart: '',
    location: '',
    duration: '',
    specialization_id: '',
    imageUrl: ''
  });

  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    loadSpecializations();
    if (isEditing) {
      loadFormation();
    }
  }, [id]);

  const loadSpecializations = async () => {
    try {
      const data = await formationService.getSpecializations();
      setSpecializations(data);
    } catch (error) {
      console.error('Error loading specializations:', error);
      toast.error('Erreur lors du chargement des spécialisations');
    }
  };

  const loadFormation = async () => {
    try {
      setInitialLoading(true);
      const data = await formationService.getFormation(id);
      console.log('Formation data received:', data);
      
      if (!data) {
        throw new Error('Formation non trouvée');
      }

      // Formatage de la date pour l'input type="date"
      const formattedData = {
        ...data,
        dateStart: data.dateStart ? new Date(data.dateStart).toISOString().split('T')[0] : '',
        specialization_id: data.specialization?.id || '',
        imageUrl: data.imageUrl || ''
      };

      setFormData(formattedData);
      if (data.imageUrl) {
        setImagePreview(data.imageUrl);
      }
    } catch (error) {
      console.error('Error loading formation:', error);
      toast.error('Erreur lors du chargement de la formation');
      navigate('/formations');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Créer une URL pour la prévisualisation
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleImageDelete = async () => {
    if (!id || !formData.imageUrl) return;

    try {
      setLoading(true);
      await formationService.deleteFormationImage(id);
      setImagePreview(null);
      setImageFile(null);
      setFormData(prev => ({ ...prev, imageUrl: null }));
      toast.success('Image supprimée avec succès');
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Erreur lors de la suppression de l\'image');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formattedData = {
        ...formData,
        capacity: parseInt(formData.capacity),
        duration: parseInt(formData.duration),
        specialization_id: parseInt(formData.specialization_id)
      };

      let response;
      if (isEditing) {
        response = await formationService.updateFormation(id, formattedData);
      } else {
        response = await formationService.createFormation(formattedData);
      }

      // Upload de l'image si une nouvelle image est sélectionnée
      if (imageFile) {
        const formationId = isEditing ? id : response.id;
        await formationService.uploadFormationImage(formationId, imageFile);
      }

      toast.success(isEditing ? 'Formation mise à jour avec succès' : 'Formation créée avec succès');
      navigate('/formations');
    } catch (error) {
      console.error('Error submitting formation:', error);
      toast.error(isEditing ? 
        'Erreur lors de la mise à jour de la formation' : 
        'Erreur lors de la création de la formation'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">
        {isEditing ? 'Modifier la Formation' : 'Nouvelle Formation'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        <div>
          <Label htmlFor="name">Nom</Label>
          <Input
            id="name"
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="promotion">Promotion</Label>
          <Input
            id="promotion"
            name="promotion"
            value={formData.promotion || ''}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="capacity">Capacité</Label>
          <Input
            id="capacity"
            name="capacity"
            type="number"
            value={formData.capacity || ''}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="dateStart">Date de début</Label>
          <Input
            id="dateStart"
            name="dateStart"
            type="date"
            value={formData.dateStart || ''}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="location">Lieu</Label>
          <Input
            id="location"
            name="location"
            value={formData.location || ''}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="duration">Durée (en mois)</Label>
          <Input
            id="duration"
            name="duration"
            type="number"
            value={formData.duration || ''}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="specialization_id">Spécialisation</Label>
          <select
            id="specialization_id"
            name="specialization_id"
            value={formData.specialization_id || ''}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-md"
          >
            <option value="">Sélectionnez une spécialisation</option>
            {specializations.map((spec) => (
              <option key={spec.id} value={spec.id}>
                {spec.name}
              </option>
            ))}
          </select>
        </div>

        {/* Image upload section */}
        <div className="space-y-4">
          <Label>Image de la formation</Label>
          <div className="flex items-center space-x-4">
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Prévisualisation"
                  className="w-32 h-32 object-cover rounded-lg"
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

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {isEditing ? 'Mettre à jour' : 'Créer'}
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
    </div>
  );
};

export default FormationForm; 