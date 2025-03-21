import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  setLowPerformanceMode, 
  isLowPerformanceModeEnabled, 
  syncWithServerPerformanceMode, 
  getTimeoutConfig 
} from '../lib/utils/loadingUtils';

const PerformanceSettings = () => {
  const [isLowPerformance, setIsLowPerformance] = useState(isLowPerformanceModeEnabled());
  const [timeouts, setTimeouts] = useState({
    default: getTimeoutConfig('default'),
    profile: getTimeoutConfig('profile'),
    large: getTimeoutConfig('large'),
  });
  const [systemMetrics, setSystemMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fonction pour synchroniser avec le serveur
  const syncWithServer = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Utiliser l'API backend pour récupérer les informations
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await axios.get(`${apiUrl}/test/timeout`, {
        timeout: 5000
      });
      
      if (response.data && response.data.success) {
        setSystemMetrics(response.data.system_metrics || {});
        
        // Mettre à jour l'état local
        setIsLowPerformance(response.data.is_low_performance);
        setTimeouts({
          default: response.data.default_timeout * 1000, // Convertir en ms
          profile: response.data.profile_request_timeout * 1000,
          large: response.data.default_timeout * 2000, // Double du timeout standard
        });
        
        // Mettre à jour le mode performance global
        setLowPerformanceMode(response.data.is_low_performance);
        
        console.info('Synchronized performance settings with server');
      }
    } catch (err) {
      console.error('Error syncing with server:', err);
      setError('Impossible de synchroniser avec le serveur: ' + (err.message || 'Erreur inconnue'));
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les informations au montage du composant
  useEffect(() => {
    syncWithServer();
  }, []);

  // Fonction pour changer manuellement le mode de performance
  const togglePerformanceMode = () => {
    const newMode = !isLowPerformance;
    setIsLowPerformance(newMode);
    setLowPerformanceMode(newMode);
    // Resynchroniser avec le serveur après un court délai
    setTimeout(syncWithServer, 500);
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 md:p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Paramètres de Performance
      </h2>
      
      {isLoading ? (
        <div className="flex justify-center my-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <button 
            onClick={syncWithServer}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-700 dark:text-gray-300">
              Mode Performance Réduite
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={isLowPerformance}
                onChange={togglePerformanceMode}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="space-y-4 mb-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Timeouts actuels</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Standard</div>
                  <div className="text-sm font-semibold">{timeouts.default / 1000}s</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Profil</div>
                  <div className="text-sm font-semibold">{timeouts.profile / 1000}s</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Large</div>
                  <div className="text-sm font-semibold">{timeouts.large / 1000}s</div>
                </div>
              </div>
            </div>
            
            {systemMetrics && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Métriques Système</h3>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-500 dark:text-gray-400">CPU Cores:</div>
                    <div className="font-mono">{systemMetrics.cpuCores || 'N/A'}</div>
                    
                    <div className="text-gray-500 dark:text-gray-400">Mémoire Total:</div>
                    <div className="font-mono">{systemMetrics.totalMemoryGB ? `${systemMetrics.totalMemoryGB.toFixed(1)} GB` : 'N/A'}</div>
                    
                    <div className="text-gray-500 dark:text-gray-400">Mémoire Disponible:</div>
                    <div className="font-mono">{systemMetrics.freeMemoryGB ? `${systemMetrics.freeMemoryGB.toFixed(1)} GB` : 'N/A'}</div>
                    
                    <div className="text-gray-500 dark:text-gray-400">Charge Système:</div>
                    <div className="font-mono">{systemMetrics.loadAvg1 ? systemMetrics.loadAvg1.toFixed(2) : 'N/A'}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={syncWithServer}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={isLoading}
            >
              Synchroniser
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PerformanceSettings; 