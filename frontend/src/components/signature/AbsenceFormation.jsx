import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import signatureService from '@/lib/services/signatureService';

const periods = [
  { value: 'morning', label: 'Matin (9h-12h)' },
  { value: 'afternoon', label: 'Après-midi (13h-17h)' }
];

const AbsenceFormation = () => {
  const { formationId } = useParams();
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [period, setPeriod] = useState('morning');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [absents, setAbsents] = useState([]);
  const [studentCount, setStudentCount] = useState(0);

  const fetchAbsences = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await signatureService.getAbsencesByFormation(formationId, { date, period });
      setAbsents(res.absents || []);
      setStudentCount(res.studentCount || 0);
    } catch (e) {
      setError(e.message || 'Erreur lors du chargement des absences');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAbsences();
    // eslint-disable-next-line
  }, [formationId, date, period]);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Absences de la formation #{formationId}</h2>
      <div className="flex gap-4 mb-4 items-end">
        <div>
          <label className="block text-sm font-medium">Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block text-sm font-medium">Période</label>
          <select value={period} onChange={e => setPeriod(e.target.value)} className="border rounded px-2 py-1">
            {periods.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
        <button onClick={fetchAbsences} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Rafraîchir</button>
      </div>
      {loading && <div className="my-4">Chargement...</div>}
      {error && <div className="my-4 text-red-600">{error}</div>}
      <div className="mb-2 text-sm text-gray-600">Total étudiants : {studentCount} | Absents : {absents.length}</div>
      <table className="w-full border mt-2">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">Prénom</th>
            <th className="border px-2 py-1">Nom</th>
            <th className="border px-2 py-1">Email</th>
          </tr>
        </thead>
        <tbody>
          {absents.length === 0 && !loading ? (
            <tr><td colSpan={3} className="text-center py-2">Aucun absent</td></tr>
          ) : (
            absents.map(abs => (
              <tr key={abs.id}>
                <td className="border px-2 py-1">{abs.firstName}</td>
                <td className="border px-2 py-1">{abs.lastName}</td>
                <td className="border px-2 py-1">{abs.email}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AbsenceFormation; 