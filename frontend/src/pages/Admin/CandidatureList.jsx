import React, { useEffect, useState } from 'react';
import { fetchCandidatures } from '../../lib/services/candidatureService';

const CandidatureList = () => {
  const [candidatures, setCandidatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    const getData = async () => {
      try {
        console.log("Tentative de récupération des candidatures...");
        const data = await fetchCandidatures();
        console.log("Données reçues:", data);
        setCandidatures(data);
      } catch (err) {
        console.error("Erreur lors de la récupération des candidatures:", err);
        setErreur(err.message);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  if (loading) return <div className="p-6">Chargement des candidatures...</div>;
  if (erreur) return <div className="p-6 text-red-500">Erreur : {erreur}</div>;
  if (candidatures.length === 0) return <div className="p-6">Aucune candidature trouvée.</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Liste des Candidatures</h1>
      <p className="mb-4">Nombre de candidatures : {candidatures.length}</p>
      <table className="w-full border-collapse border border-gray-300">
        <thead className="bg-gray-200">
          <tr>
            <th className="border px-4 py-2">Nom</th>
            <th className="border px-4 py-2">Type</th>
            <th className="border px-4 py-2">Domaine</th>
            <th className="border px-4 py-2">Spécialité</th>
            <th className="border px-4 py-2">Statut</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(candidatures) ? candidatures.map((c) => (
            <tr key={c.id}>
              <td className="border px-4 py-2">{c.studentName}</td>
              <td className="border px-4 py-2">{c.type}</td>
              <td className="border px-4 py-2">{c.domaine}</td>
              <td className="border px-4 py-2">{c.specialite}</td>
              <td className="border px-4 py-2">{c.status}</td>
            </tr>
          )) : null}
          <script>
            console.log('CandidatureList:', candidatures);
          </script>
        </tbody>
      </table>
    </div>
  );
};


export default CandidatureList;