import React, { useRef } from 'react';
import { Camera } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string;
  onPhotoUpdate?: (newPhotoUrl: string) => void;
}

export const ProfilePhotoUpload: React.FC<ProfilePhotoUploadProps> = ({ 
  currentPhotoUrl, 
  onPhotoUpdate 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { updateUserPhoto } = useUser();

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('photo', file);

      const response = await axios.post('/api/user/update-photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const newPhotoUrl = response.data.photoUrl;
      
      // Mise à jour du contexte global
      updateUserPhoto(newPhotoUrl);
      
      // Mise à jour locale si callback fourni
      if (onPhotoUpdate) {
        onPhotoUpdate(newPhotoUrl);
      }

      toast.success('Photo de profil mise à jour avec succès');
    } catch (error) {
      console.error('Erreur lors du téléchargement de la photo:', error);
      toast.error('Erreur lors de la mise à jour de la photo');
    }
  };

  return (
    <div className="relative group">
      <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200">
        {currentPhotoUrl ? (
          <img
            src={currentPhotoUrl}
            alt="Photo de profil"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Camera className="w-12 h-12 text-gray-400" />
          </div>
        )}
      </div>
      
      <button
        onClick={() => fileInputRef.current?.click()}
        className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-blue-700"
      >
        <Camera className="w-5 h-5" />
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoUpload}
        className="hidden"
      />
    </div>
  );
}; 