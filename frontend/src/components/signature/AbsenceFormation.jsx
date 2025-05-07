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
  const [totalAbsents, setTotalAbsents] = useState(0);
  const [limit] = useState(10);
  const [offset, setOffset] = useState(0);

  const fetchAbsences = async (newOffset = offset) => {
    setLoading(true);
    setError(null);
    try {
      const res = await signatureService.getAbsencesByFormation(formationId, {
        date,
        period,
        limit,
        offset: newOffset
      });
      setAbsents(res.absents || []);
      setStudentCount(res.studentCount || 0);
      setTotalAbsents(res.totalAbsents || 0);
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
  }, [formationId, date, period]);

  const handlePrevPage = () => {
    if (offset - limit >= 0) {
      fetchAbsences(offset - limit);
    }
  };
  const handleNextPage = () => {
    if (offset + limit < totalAbsents) {
      fetchAbsences(offset + limit);
    }
  };
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(totalAbsents / limit);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 mt-8 animate-fadeInUp">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
        <span className="inline-block w-2 h-6 bg-blue-500 rounded-full mr-2"></span>
        Absences de la formation <span className="text-blue-600 dark:text-blue-300">#{formationId}</span>
      </h2>
      <div className="flex flex-wrap gap-4 mb-6 items-end">
        <div className="flex flex-col">
          <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-400 focus:outline-none transition" />
        </div>
        <div className="flex flex-col">
          <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Période</label>
          <select value={period} onChange={e => setPeriod(e.target.value)} className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-400 focus:outline-none transition">
            {periods.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
        <button onClick={() => fetchAbsences(0)} className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-5 py-2 rounded-lg shadow hover:from-blue-700 hover:to-blue-600 transition font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400">Rafraîchir</button>
      </div>
      {loading && <div className="my-6 text-center text-blue-500 animate-pulse">Chargement...</div>}
      {error && <div className="my-6 text-center text-red-500 bg-red-100 dark:bg-red-900/40 rounded-lg px-4 py-2 font-medium animate-fadeInUp">{error}</div>}
      <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">Total étudiants : <span className="font-semibold text-gray-900 dark:text-white">{studentCount}</span> | Absents : <span className="font-semibold text-gray-900 dark:text-white">{totalAbsents}</span></div>
      <div className="overflow-x-auto rounded-lg shadow-sm">
        <table className="w-full border-collapse bg-white dark:bg-gray-900 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Prénom</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Nom</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Email</th>
            </tr>
          </thead>
          <tbody>
            {absents.length === 0 && !loading ? (
              <tr><td colSpan={3} className="text-center py-4 text-gray-400 dark:text-gray-500">Aucun absent</td></tr>
            ) : (
              absents.map(abs => (
                <tr key={abs.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/60 transition">
                  <td className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">{abs.firstName}</td>
                  <td className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">{abs.lastName}</td>
                  <td className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">{abs.email}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between mt-6">
        <button onClick={handlePrevPage} disabled={offset === 0} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition">Précédent</button>
        <span className="text-sm text-gray-700 dark:text-gray-300">Page <span className="font-bold">{currentPage}</span> / {totalPages}</span>
        <button onClick={handleNextPage} disabled={offset + limit >= totalAbsents} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition">Suivant</button>
      </div>
    </div>
  );
};

export default AbsenceFormation; 