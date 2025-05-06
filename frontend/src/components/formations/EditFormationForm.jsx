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
import { Upload, Trash2, Info, Calendar, Users, Image as ImageIcon, BookOpen, MapPin } from 'lucide-react';
import FormationTeachersSection from './FormationTeachersSection';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/badge';
import { motion } from 'framer-motion';

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
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <Card className="border-none shadow-xl overflow-hidden">
        <CardHeader className="bg-primary text-white">
          <div className="flex items-center gap-2">
            <Info className="h-6 w-6" />
            <CardTitle className="text-2xl">Modifier la Formation</CardTitle>
          </div>
        </CardHeader>

        <Tabs defaultValue="informations" className="w-full">
          <div className="bg-white/5 backdrop-blur-sm border-b border-white/10 rounded-t-xl p-1.5 mb-0">
            <TabsList className="grid w-full grid-cols-2 bg-transparent h-auto p-1 gap-4">
              <TabsTrigger 
                value="informations"
                className="relative overflow-hidden 
                  data-[state=active]:bg-transparent
                  data-[state=active]:text-primary
                  py-2.5 transition-all duration-200 
                  text-slate-400
                  font-medium
                  rounded-md
                  before:absolute before:inset-x-0 before:h-[2px] before:bg-primary
                  before:bottom-0 before:scale-x-0 hover:before:scale-x-100
                  before:transition-transform before:duration-300
                  before:origin-left"
              >
                <span className="relative z-10 font-medium">Informations</span>
              </TabsTrigger>
              <TabsTrigger 
                value="teachers"
                className="relative overflow-hidden 
                  data-[state=active]:bg-transparent
                  data-[state=active]:text-primary
                  py-2.5 transition-all duration-200 
                  text-slate-400
                  font-medium
                  rounded-md
                  before:absolute before:inset-x-0 before:h-[2px] before:bg-primary
                  before:bottom-0 before:scale-x-0 hover:before:scale-x-100
                  before:transition-transform before:duration-300
                  before:origin-left"
              >
                <span className="relative z-10 font-medium">Enseignants</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="informations" className="p-0 mt-0">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="relative bg-white/5 rounded-b-xl p-6"
            >
              <div className="space-y-8">
                {/* General Information Section */}
                <div className="space-y-4 p-5 rounded-lg bg-card bg-primary border">
                  <div className="flex items-center gap-2">
                    <div className="bg-white p-2 rounded-full dark:bg-white">
                      <Info className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium text-white">Informations générales</h3>
                    <Badge variant="outline" className="ml-auto text-white border-white">
                      Essentiel
                    </Badge>
                  </div>
                  <Separator className="bg-white" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-white">
                        Nom <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="text-white placeholder-white bg-primary border-white focus:ring-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="promotion" className="text-white">
                        Promotion <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="promotion"
                        name="promotion"
                        value={formData.promotion}
                        onChange={handleInputChange}
                        required
                        className="text-white placeholder-white bg-primary border-white focus:ring-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Training Details Section */}
                <div className="space-y-4 p-5 rounded-lg bg-card bg-primary border">
                  <div className="flex items-center gap-2">
                    <div className="bg-white p-2 rounded-full dark:bg-white">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium text-white">Détails de la formation</h3>
                    <Badge variant="outline" className="ml-auto text-white border-white">
                      Contenu
                    </Badge>
                  </div>
                  <Separator className="bg-white" />

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-white">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="min-h-[120px] text-white placeholder-white bg-primary border-white focus:ring-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="capacity" className="text-white">
                          Capacité <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <Input
                            id="capacity"
                            name="capacity"
                            type="number"
                            value={formData.capacity}
                            onChange={handleInputChange}
                            required
                            className="text-white placeholder-white bg-primary border-white focus:ring-white"
                          />
                          <Users className="absolute right-3 top-2.5 h-5 w-5 text-white" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="duration" className="text-white">
                          Durée (en mois) <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <Input
                            id="duration"
                            name="duration"
                            type="number"
                            value={formData.duration}
                            onChange={handleInputChange}
                            required
                            className="text-white placeholder-white bg-primary border-white focus:ring-white"
                          />
                          <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-white" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dateStart" className="text-white">
                          Date de début <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          type="date"
                          id="dateStart"
                          name="dateStart"
                          value={formData.dateStart}
                          onChange={handleInputChange}
                          required
                          className="text-white placeholder-white bg-primary border-white focus:ring-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Organization Section */}
                <div className="space-y-4 p-5 rounded-lg bg-card bg-primary border">
                  <div className="flex items-center gap-2">
                    <div className="bg-white p-2 rounded-full dark:bg-white">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium text-white">Organisation</h3>
                    <Badge variant="outline" className="ml-auto text-white border-white">
                      Logistique
                    </Badge>
                  </div>
                  <Separator className="bg-white" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-white">Lieu</Label>
                      <Input
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="text-white placeholder-white bg-primary border-white focus:ring-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="specializationId" className="text-white">
                        Spécialisation <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={formData.specializationId}
                        onValueChange={handleSpecializationChange}
                        required
                      >
                        <SelectTrigger className="text-white bg-primary border-white focus:ring-white">
                          <SelectValue placeholder="Sélectionnez une spécialisation" className="text-white placeholder-white" />
                        </SelectTrigger>
                        <SelectContent>
                          {specializations.map((spec) => (
                            <SelectItem key={`specialization-${spec.id}`} value={spec.id.toString()}>
                              {spec.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Image Section */}
                <div className="space-y-4 p-5 rounded-lg bg-card bg-primary border">
                  <div className="flex items-center gap-2">
                    <div className="bg-white p-2 rounded-full dark:bg-white">
                      <ImageIcon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium text-white">Image de la formation</h3>
                    <Badge variant="outline" className="ml-auto text-white border-white">
                      Média
                    </Badge>
                  </div>
                  <Separator className="bg-white" />

                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="w-full md:w-1/3">
                      {imagePreview ? (
                        <div className="relative group">
                          <img
                            src={imagePreview}
                            alt="Prévisualisation"
                            className="w-full aspect-video object-cover rounded-lg border border-white"
                            onError={(e) => {
                              e.target.src = '/placeholder.png';
                            }}
                          />
                          <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/0 hover:bg-black/50 transition-opacity rounded-lg group">
                            <div className="hidden group-hover:flex flex-col items-center text-white">
                              <Upload className="h-8 w-8" />
                              <span className="text-sm">Changer l'image</span>
                            </div>
                            <input
                              type="file"
                              className="hidden"
                              accept="image/jpeg,image/png,image/gif,image/webp"
                              onChange={handleImageChange}
                              key={formData.imageFile ? 'has-file' : 'no-file'}
                            />
                          </label>
                        </div>
                      ) : (
                        <div className="w-full aspect-video border-2 border-dashed border-white rounded-lg flex items-center justify-center bg-primary/50">
                          <Upload className="h-8 w-8 text-white" />
                          <label className="absolute inset-0 cursor-pointer">
                            <input
                              type="file"
                              className="hidden"
                              accept="image/jpeg,image/png,image/gif,image/webp"
                              onChange={handleImageChange}
                              key={formData.imageFile ? 'has-file' : 'no-file'}
                            />
                          </label>
                        </div>
                      )}
                    </div>
                    <div className="w-full md:w-2/3 space-y-4">
                      <div className="text-sm text-white">
                        <p>Formats acceptés: <span className="font-semibold">JPG, PNG, GIF, WEBP</span></p>
                        <p>Taille maximum: <span className="font-semibold">2MB</span></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/formations')}
                  disabled={loading}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? 'Enregistrement...' : 'Mettre à jour'}
                </Button>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="teachers" className="p-0 mt-0">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="relative bg-white/5 rounded-b-xl p-6"
            >
              {formationId && <FormationTeachersSection formationId={formationId} />}
            </motion.div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default EditFormationForm; 