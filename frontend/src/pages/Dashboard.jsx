import React, { useState, useEffect } from 'react';
import signatureService from '../lib/services/signatureService';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { toast } from 'sonner';

/**
 * Composant Tableau de bord affiché comme page d'accueil pour les utilisateurs connectés
 */
const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [signatures, setSignatures] = useState([]);
  const [todaySignatures, setTodaySignatures] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [signaturesData, todayData] = await Promise.all([
          signatureService.getSignatures(),
          signatureService.getTodaySignatures()
        ]);
        setSignatures(signaturesData);
        setTodaySignatures(todayData);
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        toast.error("Erreur", {
          description: "Impossible de charger les données du tableau de bord."
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container mx-auto p-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Tableau de bord</h1>
        
        {/* Section des signatures du jour */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Signatures du jour</h2>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : todaySignatures && todaySignatures.signatures.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {todaySignatures.signatures.map((signature) => (
                <Card key={signature.id} className="overflow-hidden">
                  <CardHeader className="bg-gray-50">
                    <CardTitle className="text-lg">
                      Période: {signature.period === 'morning' ? 'Matin' : 'Après-midi'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    {signature.drawing && (
                      <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Signature:</h3>
                        <img 
                          src={signature.drawing} 
                          alt="Signature" 
                          className="w-full h-32 object-contain border border-gray-200 rounded-md"
                        />
                      </div>
                    )}
                    <div className="text-sm text-gray-600">
                      <p>Date: {new Date(signature.date).toLocaleString()}</p>
                      <p>Localisation: {signature.location}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Aucune signature enregistrée aujourd'hui.</p>
          )}
        </div>

        {/* Section des signatures récentes */}
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Signatures récentes</h2>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : signatures.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {signatures.slice(0, 4).map((signature) => (
                <Card key={signature.id} className="overflow-hidden">
                  <CardHeader className="bg-gray-50">
                    <CardTitle className="text-lg">
                      Période: {signature.period === 'morning' ? 'Matin' : 'Après-midi'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    {signature.drawing && (
                      <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Signature:</h3>
                        <img 
                          src={signature.drawing} 
                          alt="Signature" 
                          className="w-full h-32 object-contain border border-gray-200 rounded-md"
                        />
                      </div>
                    )}
                    <div className="text-sm text-gray-600">
                      <p>Date: {new Date(signature.date).toLocaleString()}</p>
                      <p>Localisation: {signature.location}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Aucune signature enregistrée.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
