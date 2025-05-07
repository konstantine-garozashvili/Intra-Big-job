import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import signatureService from '@/lib/services/signatureService';

const periods = [
  { value: 'morning', label: 'Matin (9h-12h)' },
  { value: 'afternoon', label: 'Après-midi (13h-17h)' }
];

const AbsenceUser = () => {
  const { userId } = useParams();
  const [formationId, setFormationId] = useState('');
  const [date, setDate] = useState('');
  const [period, setPeriod] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [absences, setAbsences] = useState([]);
  const [totalAbsences, setTotalAbsences] = useState(0);
  const [limit] = useState(10);
  const [offset, setOffset] = useState(0);

  const fetchAbsences = async (newOffset = offset) => {
    setLoading(true);
    setError(null);
    try {
      const res = await signatureService.getAbsencesByUser(userId, {
        formationId: formationId || undefined,
        date: date || undefined,
        period: period || undefined,
        limit,
        offset: newOffset
      });
      setAbsences(res.absences || []);
      setTotalAbsences(res.totalAbsences || 0);
      setOffset(res.offset || 0);
    } catch (e) {
      setError(e.message || 'Erreur lors du chargement des absences');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setOffset(0);
    fetchAbsences(0);
    // eslint-disable-next-line
  }, [userId, formationId, date, period]);

  const handlePrevPage = () => {
    if (offset - limit >= 0) {
      fetchAbsences(offset - limit);
    }
  };
  const handleNextPage = () => {
    if (offset + limit < totalAbsences) {
      fetchAbsences(offset + limit);
    }
  };
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(totalAbsences / limit);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Absences de l'utilisateur #{userId}</h2>
      <div className="flex gap-4 mb-4 items-end">
        <div>
          <label className="block text-sm font-medium">Formation ID</label>
          <input type="text" value={formationId} onChange={e => setFormationId(e.target.value)} placeholder="ID formation (optionnel)" className="border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block text-sm font-medium">Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block text-sm font-medium">Période</label>
          <select value={period} onChange={e => setPeriod(e.target.value)} className="border rounded px-2 py-1">
            <option value="">Toutes</option>
            {periods.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
        <button onClick={() => fetchAbsences(0)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Rafraîchir</button>
      </div>
      {loading && <div className="my-4">Chargement...</div>}
      {error && <div className="my-4 text-red-600">{error}</div>}
      <div className="mb-2 text-sm text-gray-600">Total absences : {totalAbsences}</div>
      <table className="w-full border mt-2">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">Date</th>
            <th className="border px-2 py-1">Période</th>
            <th className="border px-2 py-1">Formation</th>
          </tr>
        </thead>
        <tbody>
          {absences.length === 0 && !loading ? (
            <tr><td colSpan={3} className="text-center py-2">Aucune absence</td></tr>
          ) : (
            absences.map((abs, idx) => (
              <tr key={idx}>
                <td className="border px-2 py-1">{abs.date}</td>
                <td className="border px-2 py-1">{periods.find(p => p.value === abs.period)?.label || abs.period}</td>
                <td className="border px-2 py-1">{abs.formationName} (#{abs.formationId})</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div className="flex items-center justify-between mt-4">
        <button onClick={handlePrevPage} disabled={offset === 0} className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50">Précédent</button>
        <span className="text-sm">Page {currentPage} / {totalPages}</span>
        <button onClick={handleNextPage} disabled={offset + limit >= totalAbsences} className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50">Suivant</button>
      </div>
    </div>
  );
};

export default AbsenceUser; 