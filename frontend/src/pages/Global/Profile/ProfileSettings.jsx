import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Globe, 
  User, 
  Briefcase, 
  GraduationCap, 
  LinkedIn 
} from 'lucide-react';

const ProfileSettings = ({ userData, onUpdate, isLoading = false, isSuperAdmin, isAdmin }) => {
  const [formData, setFormData] = React.useState({
    firstName: userData?.firstName || '',
    lastName: userData?.lastName || '',
    email: userData?.email || '',
    role: userData?.role || '',
    phoneNumber: userData?.phoneNumber || '',
    address: userData?.address || '',
    city: userData?.city || '',
    postalCode: userData?.postalCode || '',
    country: userData?.country || '',
    birthDate: userData?.birthDate || '',
    nationality: userData?.nationality || '',
    linkedin: userData?.linkedin || '',
    domain: userData?.domain || '',
    specialization: userData?.specialization || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate?.(formData);
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="space-y-4 sm:space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold mb-6">Mon compte</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 w-full">
        {/* Personal Information Section */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden w-full">
          <div className="p-6 sm:p-8 pt-0 px-3 sm:px-4 md:px-6 pb-6">
            <h3 className="font-semibold tracking-tight text-lg sm:text-xl">Informations personnelles</h3>
            <p className="text-muted-foreground mt-2 text-xs sm:text-sm">Mettre à jour vos informations personnelles</p>
          </div>
          
          <div className="space-y-6 sm:space-y-8 w-full px-1 sm:px-2 md:px-4">
            <div>
              <h3 className="text-base sm:text-lg font-semibold flex items-center mb-3 sm:mb-5">
                <User className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 text-blue-600" />
                Informations personnelles
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                <div className="bg-gray-50 rounded-lg p-4 sm:p-5">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Votre prénom"
                  />
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 sm:p-5">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Votre nom"
                  />
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 sm:p-5">
                  <Label htmlFor="birthDate">Date de naissance</Label>
                  <Input
                    id="birthDate"
                    name="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 sm:p-5">
                  <Label htmlFor="nationality">Nationalité</Label>
                  <Input
                    id="nationality"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    placeholder="Votre nationalité"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden w-full">
          <div className="p-6 sm:p-8 pt-0 px-3 sm:px-4 md:px-6 pb-6">
            <h3 className="font-semibold tracking-tight text-lg sm:text-xl">Coordonnées</h3>
            <p className="text-muted-foreground mt-2 text-xs sm:text-sm">Mettre à jour vos coordonnées</p>
          </div>

          <div className="space-y-6 sm:space-y-8 w-full px-1 sm:px-2 md:px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
              <div className="bg-gray-50 rounded-lg p-4 sm:p-5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="votre@email.com"
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-4 sm:p-5">
                <Label htmlFor="phoneNumber">Téléphone</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="Votre numéro de téléphone"
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-4 sm:p-5">
                <Label htmlFor="address">Adresse</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Votre adresse"
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-4 sm:p-5">
                <Label htmlFor="city">Ville</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Votre ville"
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-4 sm:p-5">
                <Label htmlFor="postalCode">Code postal</Label>
                <Input
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="Votre code postal"
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-4 sm:p-5">
                <Label htmlFor="country">Pays</Label>
                <Input
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="Votre pays"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Professional Information Section */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden w-full">
          <div className="p-6 sm:p-8 pt-0 px-3 sm:px-4 md:px-6 pb-6">
            <h3 className="font-semibold tracking-tight text-lg sm:text-xl">Ma carrière</h3>
            <p className="text-muted-foreground mt-2 text-xs sm:text-sm">Mettre à jour vos informations professionnelles</p>
          </div>

          <div className="space-y-6 sm:space-y-8 w-full px-1 sm:px-2 md:px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
              <div className="bg-gray-50 rounded-lg p-4 sm:p-5">
                <Label htmlFor="domain">Domaine</Label>
                <Input
                  id="domain"
                  name="domain"
                  value={formData.domain}
                  onChange={handleChange}
                  placeholder="Votre domaine"
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-4 sm:p-5">
                <Label htmlFor="specialization">Spécialisation</Label>
                <Input
                  id="specialization"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  placeholder="Votre spécialisation"
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-4 sm:p-5">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder="Votre profil LinkedIn"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button type="submit" className="bg-[#528eb2] hover:bg-[#528eb2]/90">
            Sauvegarder les modifications
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;
