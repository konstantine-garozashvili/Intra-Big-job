import React, { useEffect, useState, useMemo } from 'react';
import { fetchCandidatures, fetchSituationTypes, fetchStudentsBySituation } from '../../lib/services/candidatureService';

const CandidatureList = () => {
  const [candidatures, setCandidatures] = useState([]);
  const [situationTypes, setSituationTypes] = useState([]);
  const [selectedSituationId, setSelectedSituationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger directement les candidatures au démarrage
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Chargement direct des candidatures
        const candidaturesData = await fetchCandidatures();
        console.log('Données candidatures chargées:', candidaturesData);
        
        // S'assurer que les données sont un tableau
        if (Array.isArray(candidaturesData)) {
          setCandidatures(candidaturesData);
        } else if (candidaturesData && Array.isArray(candidaturesData.data)) {
          setCandidatures(candidaturesData.data);
        } else {
          console.error('Format de données candidatures invalide:', candidaturesData);
          setCandidatures([]);
        }
        
        // Charger les types de situation
        const typesData = await fetchSituationTypes();
        console.log('Types de situation chargés:', typesData);
        
        if (typesData && typesData.success && Array.isArray(typesData.situationTypes)) {
          setSituationTypes(typesData.situationTypes);
        } else {
          console.error('Format de données types de situation invalide:', typesData);
          setSituationTypes([]);
        }
      } catch (err) {
        console.error('Erreur lors du chargement initial des données:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialData();
  }, []);
  
  // Filtrer les candidatures quand le type de situation change
  useEffect(() => {
    // Ne pas exécuter cette fonction au premier rendu
    if (selectedSituationId === null) {
      return;
    }
    
    const filterBySituation = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetchStudentsBySituation(selectedSituationId);
        console.log('Filtrage par situation - réponse:', response);
        
        if (response && response.success && Array.isArray(response.students)) {
          setCandidatures(response.students);
        } else {
          console.error('Format de données filtrage invalide:', response);
          setCandidatures([]);
          setError('Erreur lors du filtrage par situation');
        }
      } catch (err) {
        console.error('Erreur lors du filtrage par situation:', err);
        setError('Erreur lors du filtrage par situation');
        setCandidatures([]);
      } finally {
        setLoading(false);
      }
    };
    
    // Si reset à tous les types (valeur vide)
    if (selectedSituationId === '') {
      const resetToAll = async () => {
        setLoading(true);
        try {
          const allCandidatures = await fetchCandidatures();
          if (Array.isArray(allCandidatures)) {
            setCandidatures(allCandidatures);
          } else {
            setCandidatures([]);
          }
        } catch (err) {
          console.error('Erreur lors du reset des candidatures:', err);
          setCandidatures([]);
        } finally {
          setLoading(false);
        }
      };
      
      resetToAll();
    } else if (selectedSituationId) {
      filterBySituation();
    }
  }, [selectedSituationId]);

  // Changer le type de situation sélectionné
  const handleSituationChange = (e) => {
    const value = e.target.value;
    console.log('Changement de filtre situation, nouvelle valeur:', value);
    setSelectedSituationId(value === "" ? null : parseInt(value, 10));
  };

  // Trouver le nom du type de situation sélectionné
  const selectedSituationName = useMemo(() => {
    if (!selectedSituationId || !Array.isArray(situationTypes) || situationTypes.length === 0) {
      return 'Tous';
    }
    const selected = situationTypes.find(type => type.id === selectedSituationId);
    return selected ? selected.name : 'Tous';
  }, [selectedSituationId, situationTypes]);

  // S'assurer que candidatures est toujours un tableau
  const safeCandidatures = useMemo(() => {
    return Array.isArray(candidatures) ? candidatures : [];
  }, [candidatures]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Liste des candidatures</h1>
      
      {/* Filtres par type de situation */}
      {situationTypes.length > 0 && (
        <div className="mb-6">
          <label htmlFor="situation-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Filtrer par situation :
          </label>
          <select
            id="situation-filter"
            value={selectedSituationId || ''}
            onChange={handleSituationChange}
            className="block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">Tous les types</option>
            {situationTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
      )}
      
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
          {/* Titre dynamique avec le nombre d'éléments */}
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-700">
              {safeCandidatures.length} candidature(s) {selectedSituationId ? `avec statut "${selectedSituationName}"` : ''}
            </h2>
          </div>
          
          {/* Tableau des candidatures */}
          {!safeCandidatures.length ? (
            <div className="text-gray-500">
              Aucune candidature trouvée {selectedSituationId ? `avec le statut "${selectedSituationName}"` : ''}
            </div>
          ) : (
            <div className="overflow-x-auto bg-white rounded-lg shadow">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom de l'étudiant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Domaine</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spécialité</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {safeCandidatures.map((candidature) => (
                    <tr key={candidature.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{candidature.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{candidature.studentName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {candidature.status || 'Non défini'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{candidature.domaine || 'Non précisé'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{candidature.specialite || 'Non précisé'}</td>
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