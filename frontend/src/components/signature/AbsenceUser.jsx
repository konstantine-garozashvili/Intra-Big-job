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
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 mt-8 animate-fadeInUp">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
        <span className="inline-block w-2 h-6 bg-blue-500 rounded-full mr-2"></span>
        Absences de l'utilisateur
      </h2>
      <div className="flex flex-wrap gap-4 mb-6 items-end">
        <div className="flex flex-col">
          <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-400 focus:outline-none transition" />
        </div>
        <div className="flex flex-col">
          <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Période</label>
          <select value={period} onChange={e => setPeriod(e.target.value)} className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-400 focus:outline-none transition">
            <option value="">Toutes</option>
            {periods.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
        <button onClick={() => fetchAbsences(0)} className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-5 py-2 rounded-lg shadow hover:from-blue-700 hover:to-blue-600 transition font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400">Rafraîchir</button>
      </div>
      {loading && <div className="my-6 text-center text-blue-500 animate-pulse">Chargement...</div>}
      {error && <div className="my-6 text-center text-red-500 bg-red-100 dark:bg-red-900/40 rounded-lg px-4 py-2 font-medium animate-fadeInUp">{error}</div>}
      <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">Total absences : <span className="font-semibold text-gray-900 dark:text-white">{totalAbsences}</span></div>
      <div className="overflow-x-auto rounded-lg shadow-sm">
        <table className="w-full border-collapse bg-white dark:bg-gray-900 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Date</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Période</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Formation</th>
            </tr>
          </thead>
          <tbody>
            {absences.length === 0 && !loading ? (
              <tr><td colSpan={3} className="text-center py-4 text-gray-400 dark:text-gray-500">Aucune absence</td></tr>
            ) : (
              absences.map((abs, idx) => (
                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/60 transition">
                  <td className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">{abs.date}</td>
                  <td className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">{periods.find(p => p.value === abs.period)?.label || abs.period}</td>
                  <td className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">{abs.formationName} </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between mt-6">
        <button onClick={handlePrevPage} disabled={offset === 0} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition">Précédent</button>
        <span className="text-sm text-gray-700 dark:text-gray-300">Page <span className="font-bold">{currentPage}</span> / {totalPages}</span>
        <button onClick={handleNextPage} disabled={offset + limit >= totalAbsences} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition">Suivant</button>
      </div>
    </div>
  );
};

export default AbsenceUser; 