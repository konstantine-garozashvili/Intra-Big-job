import React, { useEffect, useState } from 'react';
import { fetchCandidatures } from '../../lib/services/candidatureService';

const CandidatureList = () => {
  const [candidatures, setCandidatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Récupérer les candidatures
  useEffect(() => {
    const getCandidatures = async () => {
      try {
        setLoading(true);
        const data = await fetchCandidatures();
        console.log("Données de candidatures reçues:", data);
        setCandidatures(data || []);
        setError(null);
      } catch (err) {
        console.error("Erreur lors de la récupération des candidatures:", err);
        setError("Erreur lors de la récupération des candidatures");
      } finally {
        setLoading(false);
      }
    };

    getCandidatures();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Liste des candidatures</h1>
      
      {/* Affichage des erreurs */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Indicateur de chargement */}
      {loading ? (
        <div className="text-center py-4">
          <p className="text-gray-500">Chargement des candidatures...</p>
        </div>
      ) : (
        <>
          {/* Tableau des candidatures */}
          {!candidatures || candidatures.length === 0 ? (
            <div className="text-gray-500">
              Aucune candidature trouvée
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-2 px-4 border-b text-left">ID</th>
                    <th className="py-2 px-4 border-b text-left">Nom de l'étudiant</th>
                    <th className="py-2 px-4 border-b text-left">Statut</th>
                    <th className="py-2 px-4 border-b text-left">Domaine</th>
                    <th className="py-2 px-4 border-b text-left">Spécialité</th>
                  </tr>
                </thead>
                <tbody>
                  {candidatures.map((candidature) => (
                    <tr key={candidature.id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b">{candidature.id}</td>
                      <td className="py-2 px-4 border-b">{candidature.studentName}</td>
                      <td className="py-2 px-4 border-b">
                        <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                          {candidature.status}
                        </span>
                      </td>
                      <td className="py-2 px-4 border-b">{candidature.domaine || 'Non précisé'}</td>
                      <td className="py-2 px-4 border-b">{candidature.specialite || 'Non précisé'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CandidatureList;