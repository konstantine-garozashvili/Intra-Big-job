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
import { Upload } from 'lucide-react';

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

  useEffect(() => {
    const loadSpecializations = async () => {
      try {
        console.log('[FormationForm] Loading specializations');
        const specializationsData = await formationService.getSpecializations();
        console.log('[FormationForm] Received specializations data:', specializationsData);
        
        if (Array.isArray(specializationsData)) {
          setSpecializations(specializationsData);
        } else {
          console.error('[FormationForm] Unexpected specializations data structure:', specializationsData);
          toast.error('Structure de données de spécialisation inattendue');
        }
      } catch (error) {
        console.error('[FormationForm] Error loading specializations:', error);
        toast.error('Erreur lors du chargement des spécialisations');
      }
    };

    loadSpecializations();
  }, []);

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
      console.error('Error creating formation:', error);
      toast.error(error.message || 'Erreur lors de la création de la formation');
    } finally {
      setLoading(false);
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