import React, { useState } from 'react';
import { useUserData } from '@/hooks/useUserData';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react'; // For loading spinner

const StudentCandidaturePage = () => {
  const { userData, isLoading, error } = useUserData();
  const [startDate, setStartDate] = useState('');
  const [isRemoteWork, setIsRemoteWork] = useState(false);
  
  // Parse localStorage data
  const localStorageData = JSON.parse(localStorage.getItem('user'));
  
  // Handle both data structures:
  // 1. {success: true, user: {...}}
  // 2. {id: ..., firstName: ..., ...}
  const userInfo = localStorageData?.success ? localStorageData.user : localStorageData;
  
  console.log('Component Data:', {
    localStorageData,
    userInfo,
    userData
  });

  const handleSubmitCandidature = async () => {
    try {
      console.log('Submitting candidature...', {
        startDate,
        isRemoteWork,
        userId: userInfo?.id,
      });
    } catch (error) {
      console.error('Error submitting candidature:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#528eb2]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Une erreur est survenue lors du chargement de vos informations.
          Veuillez réessayer plus tard.
        </div>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          Aucune information utilisateur trouvée.
          Veuillez vous reconnecter.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Déposer ma candidature</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Informations personnelles</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom</label>
                <p className="mt-1 p-2 bg-gray-50 rounded">{userInfo.lastName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Prénom</label>
                <p className="mt-1 p-2 bg-gray-50 rounded">{userInfo.firstName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 p-2 bg-gray-50 rounded">{userInfo.email}</p>
              </div>
            </div>

            {/* Academic Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Informations académiques</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700">Domaine</label>
                <p className="mt-1 p-2 bg-gray-50 rounded">
                  {userInfo.specialization?.domain?.name || 'Non spécifié'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Spécialisation</label>
                <p className="mt-1 p-2 bg-gray-50 rounded">{userInfo.specialization?.name || 'Non spécifié'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Portfolio</label>
                <p className="mt-1 p-2 bg-gray-50 rounded">{userInfo.studentProfile?.portfolioUrl || 'Non spécifié'}</p>
              </div>
            </div>
          </div>

          {/* Availability and Work Preferences Section */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-4">Disponibilité et Préférences</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de début souhaitée
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#528eb2] focus:ring-[#528eb2]"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Télétravail
                </label>
                <div className="mt-2">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={isRemoteWork}
                      onChange={(e) => setIsRemoteWork(e.target.checked)}
                      className="rounded border-gray-300 text-[#528eb2] shadow-sm focus:border-[#528eb2] focus:ring-[#528eb2]"
                    />
                    <span className="ml-2">Je suis disponible pour le télétravail</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* CV Section */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-4">CV et Documents</h2>
            {/* We'll add CV upload/display functionality here */}
          </div>

          {/* Submit Button */}
          <div className="mt-6 flex justify-end">
            <Button 
              onClick={handleSubmitCandidature}
              className="bg-[#528eb2] hover:bg-[#407797] text-white"
            >
              Déposer ma candidature
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentCandidaturePage; 