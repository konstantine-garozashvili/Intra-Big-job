import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formationService } from '../../services/formation.service';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Upload, Trash2, Info, Calendar, Users, Image as ImageIcon, BookOpen, MapPin, ArrowLeft } from 'lucide-react';
import FormationTeachersSection from './FormationTeachersSection';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/badge';
import { motion } from 'framer-motion';
import FormationStudentsSection from './FormationStudentsSection';

const EditFormationForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [formationId, setFormationId] = useState(null);
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
    const parsedId = parseInt(id);
    if (!isNaN(parsedId)) {
      setFormationId(parsedId);
    }
  }, [id]);

  useEffect(() => {
    const loadData = async () => {
      if (!formationId) return;

      try {
        setLoading(true);
        console.log('[EditFormationForm] Loading formation data for id:', formationId);
        
        // Charger les spécialisations d'abord
        const specializationsData = await formationService.getSpecializations();
        console.log('[EditFormationForm] Received specializations:', specializationsData);
        
        if (Array.isArray(specializationsData)) {
          setSpecializations(specializationsData);
        } else {
          console.error('[EditFormationForm] Invalid specializations data format');
        }

        // Charger les données de la formation
        const formationData = await formationService.getFormation(formationId);
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

    loadData();
  }, [formationId]);

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
      // Validate file size (2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('L\'image ne doit pas dépasser 2MB');
        e.target.value = ''; // Reset input
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Format de fichier non supporté. Utilisez JPG, PNG, GIF ou WEBP');
        e.target.value = ''; // Reset input
        return;
      }

      // Create a new FileReader
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
        setFormData(prev => ({
          ...prev,
          imageFile: file
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageDelete = async () => {
    if (!formationId || !imagePreview) return;

    try {
      setLoading(true);
      await formationService.deleteFormationImage(formationId);
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
        name: formData.name,
        promotion: formData.promotion,
        description: formData.description,
        image_url: formData.image_url,
        specializationId: formData.specializationId,
        capacity: parseInt(formData.capacity),
        duration: parseInt(formData.duration),
        dateStart: formData.dateStart,
        location: formData.location
      };

      // Mise à jour de la formation
      await formationService.updateFormation(formationId, formDataToSubmit);

      // Si une nouvelle image a été sélectionnée, la télécharger
      if (formData.imageFile instanceof File) {
        const formDataImage = new FormData();
        formDataImage.append('image', formData.imageFile, formData.imageFile.name);

        try {
          console.log('[EditFormationForm] Uploading image...', {
            fileName: formData.imageFile.name,
            fileType: formData.imageFile.type,
            fileSize: formData.imageFile.size
          });

          const imageResult = await formationService.uploadFormationImage(formationId, formDataImage);
          console.log('[EditFormationForm] Image upload result:', imageResult);

          if (imageResult.success && imageResult.image_url) {
            setFormData(prev => ({
              ...prev,
              image_url: imageResult.image_url,
              imageFile: null // Reset the imageFile after successful upload
            }));
            setImagePreview(imageResult.image_url);
          } else {
            console.error('[EditFormationForm] Invalid image upload result:', imageResult);
            throw new Error('Résultat invalide du téléchargement de l\'image');
          }
        } catch (imageError) {
          console.error('[EditFormationForm] Image upload error:', imageError);
          toast.error(imageError.message || 'Erreur lors du téléchargement de l\'image');
          return; // Stop here if image upload fails
        }
      }

      toast.success('Formation mise à jour avec succès');
      navigate('/formations');
    } catch (error) {
      console.error('[EditFormationForm] Form submission error:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour de la formation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-6 lg:px-8 py-10 min-h-[90vh]">
      {/* Bouton retour en haut à gauche */}
      <div className="mb-4 flex items-center">
        <Button
          type="button"
          variant="ghost"
          className="flex items-center gap-2 text-blue-700 hover:bg-blue-50 font-semibold shadow-none px-3 py-2 rounded-lg"
          onClick={() => navigate('/formation-management')}
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Retour</span>
        </Button>
      </div>
      <Card className="overflow-hidden w-full shadow-2xl">
        <CardHeader className="px-6 py-6 bg-gradient-to-r from-blue-700 to-cyan-500 text-white border-b-0">
          <div className="flex items-center gap-3">
            <Info className="h-7 w-7 text-white/90" />
            <CardTitle className="text-2xl font-bold drop-shadow">Modifier la Formation</CardTitle>
            <span className="ml-auto text-base font-medium text-white/80">Edition avancée</span>
          </div>
        </CardHeader>
        <div className="px-6 py-8">
          <Tabs defaultValue="informations" className="w-full bg-transparent">
            <TabsList className="flex gap-4 mb-8 bg-transparent">
              <TabsTrigger value="informations" className="text-lg font-semibold px-6 py-2 rounded-md bg-white/80 dark:bg-gray-800/80 shadow hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors data-[state=active]:bg-blue-600 data-[state=active]:text-white">Informations</TabsTrigger>
              <TabsTrigger value="teachers" className="text-lg font-semibold px-6 py-2 rounded-md bg-white/80 dark:bg-gray-800/80 shadow hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors data-[state=active]:bg-blue-600 data-[state=active]:text-white">Enseignants</TabsTrigger>
              <TabsTrigger value="students" className="text-lg font-semibold px-6 py-2 rounded-md bg-white/80 dark:bg-gray-800/80 shadow hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors data-[state=active]:bg-blue-600 data-[state=active]:text-white">Étudiants</TabsTrigger>
            </TabsList>
            <TabsContent value="informations" className="p-0 mt-0">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-10">
                {/* Nouvelle grille : image seule à gauche, tout le reste à droite */}
                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-10 items-start">
                  {/* Colonne 1 : Image */}
                  <div className="flex flex-col items-center w-full h-full justify-start">
                    <div className="relative group w-40 h-40">
                      <label htmlFor="formation-image-upload" className="block w-full h-full rounded-xl bg-gray-100 dark:bg-gray-800 border-2 border-blue-200 dark:border-gray-700 shadow-lg cursor-pointer transition-all duration-200 group-hover:ring-4 group-hover:ring-blue-400 group-hover:shadow-xl outline-none select-none">
                        <div className="w-full h-full rounded-xl overflow-hidden flex items-center justify-center">
                          {imagePreview ? (
                            <img src={imagePreview} alt="Prévisualisation" className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105 pointer-events-none" draggable="false" />
                          ) : (
                            <div className="flex flex-col items-center justify-center w-full h-full pointer-events-none select-none">
                              <Upload className="h-12 w-12 text-gray-400 mb-2" />
                              <span className="text-xs text-gray-400">Image</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none">
                            <span className="text-white text-sm font-semibold px-2 text-center select-none">Changer l'image</span>
                          </div>
                        </div>
                      </label>
                      <input id="formation-image-upload" type="file" className="hidden" accept="image/*" onChange={handleImageChange} disabled={loading} />
                    </div>
                    {imagePreview && (
                      <Button type="button" variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 transition-colors mt-2" onClick={() => { setImagePreview(null); setFormData(prev => ({ ...prev, imageFile: null })); }} disabled={loading}>
                        Supprimer l'image
                      </Button>
                    )}
                  </div>
                  {/* Colonne 2 : Tous les champs du formulaire */}
                  <div className="flex flex-col gap-4 w-full">
                    {/* Ligne 1 : Nom et Capacité côte à côte */}
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1 flex flex-col gap-2">
                        <Label htmlFor="name" className="font-semibold">Nom *</Label>
                        <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required className="focus:ring-2 focus:ring-blue-400 focus:border-blue-400" />
                      </div>
                      <div className="flex-1 flex flex-col gap-2">
                        <Label htmlFor="capacity" className="font-semibold">Capacité *</Label>
                        <Input id="capacity" name="capacity" type="number" min="1" value={formData.capacity} onChange={handleInputChange} required className="focus:ring-2 focus:ring-blue-400 focus:border-blue-400" />
                      </div>
                    </div>
                    {/* Ligne 2 : Description sur toute la largeur */}
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="description" className="font-semibold">Description</Label>
                      <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={4} className="mt-2 resize-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none min-h-[120px]" />
                    </div>
                    {/* Ligne 3 : autres champs principaux */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="promotion" className="font-semibold">Promotion *</Label>
                        <Input id="promotion" name="promotion" value={formData.promotion} onChange={handleInputChange} required className="focus:ring-2 focus:ring-blue-400 focus:border-blue-400" />
                      </div>
                      <div className="flex flex-col gap-2 lg:col-span-1">
                        <Label htmlFor="specializationId" className="font-semibold">Spécialisation *</Label>
                        <Select value={formData.specializationId} onValueChange={handleSpecializationChange} required>
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
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="duration" className="font-semibold">Durée (en mois) *</Label>
                        <Input type="number" id="duration" name="duration" value={formData.duration} onChange={handleInputChange} required className="focus:ring-2 focus:ring-blue-400 focus:border-blue-400" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="dateStart" className="font-semibold">Date de début *</Label>
                        <Input type="date" id="dateStart" name="dateStart" value={formData.dateStart} onChange={handleInputChange} required className="focus:ring-2 focus:ring-blue-400 focus:border-blue-400" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="location" className="font-semibold">Lieu</Label>
                        <Input id="location" name="location" value={formData.location} onChange={handleInputChange} className="focus:ring-2 focus:ring-blue-400 focus:border-blue-400" />
                      </div>
                    </div>
                    <div className="flex gap-4 justify-end mt-8">
                      <Button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-600 to-cyan-400 text-white shadow hover:from-blue-700 hover:to-cyan-500 transition">
                        {loading ? 'Enregistrement...' : 'Mettre à jour'}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => navigate('/formations')} disabled={loading}>
                        Annuler
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </TabsContent>
            <TabsContent value="teachers" className="p-0 mt-0">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="relative rounded-b-xl p-6">
                {formationId && <FormationTeachersSection formationId={formationId} />}
              </motion.div>
            </TabsContent>
            <TabsContent value="students" className="p-0 mt-0">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="relative rounded-b-xl p-6">
                {formationId && <FormationStudentsSection formationId={formationId} />}
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  );
};

export default EditFormationForm; 