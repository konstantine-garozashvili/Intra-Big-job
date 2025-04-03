import React, { useState } from 'react';
import { useUserData } from '@/hooks/useUserData';
import { Button } from '@/components/ui/button';

const StudentCandidaturePage = () => {
  const { userData } = useUserData();
  const [startDate, setStartDate] = useState('');
  const [isRemoteWork, setIsRemoteWork] = useState(false);
  
  const handleSubmitCandidature = async () => {
    try {
      console.log('Submitting candidature...', {
        startDate,
        isRemoteWork,
      });
    } catch (error) {
      console.error('Error submitting candidature:', error);
    }
  };

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
                <p className="mt-1 p-2 bg-gray-50 rounded">{userData?.lastName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Prénom</label>
                <p className="mt-1 p-2 bg-gray-50 rounded">{userData?.firstName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 p-2 bg-gray-50 rounded">{userData?.email}</p>
              </div>
            </div>

            {/* Academic Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Informations académiques</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700">Domaine</label>
                <p className="mt-1 p-2 bg-gray-50 rounded">
                  {userData?.specialization?.domain?.name || 'Non spécifié'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Spécialisation</label>
                <p className="mt-1 p-2 bg-gray-50 rounded">{userData?.specialization?.name || 'Non spécifié'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Portfolio</label>
                <p className="mt-1 p-2 bg-gray-50 rounded">{userData?.studentProfile?.portfolioUrl || 'Non spécifié'}</p>
              </div>
            </div>
          </div>

          {/* Simplified Availability and Work Preferences Section */}
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