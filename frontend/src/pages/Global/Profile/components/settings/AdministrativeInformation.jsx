import React from 'react';
import { Shield } from 'lucide-react';
import * as roleUtils from '../../utils/roleUtils';

const AdministrativeInformation = ({ userData, userRole }) => {
  // Check if this component should be rendered at all
  if (!roleUtils.isAdmin(userRole)) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800/80 dark:border dark:border-gray-700 rounded-lg shadow p-4 sm:p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
        <Shield className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
        Informations administratives
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rôle</label>
          <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{userRole}</p>
        </div>
        {userData.stats && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Complétude du profil</label>
            <div className="mt-2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div
                  className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${userData.stats.profile?.completionPercentage || 0}%` }}
                ></div>
              </div>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {Math.round(userData.stats.profile?.completionPercentage || 0)}% complété
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdministrativeInformation; 