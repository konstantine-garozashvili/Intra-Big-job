import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Bannière pour indiquer que l'application fonctionne en mode simulé
 * lorsque le backend n'est pas disponible
 */
const MockModeBanner = ({ className = '' }) => {
  return (
    <div className={`bg-blue-50 border-l-4 border-blue-400 p-4 mb-4 rounded ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-blue-500" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-blue-800">Mode simulé actif</h3>
          <div className="mt-1 text-sm text-blue-700">
            <p>
              L'application fonctionne actuellement avec des données générées localement car le
              backend n'est pas accessible. Les données affichées sont simulées et ne seront pas
              sauvegardées sur le serveur.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockModeBanner; 