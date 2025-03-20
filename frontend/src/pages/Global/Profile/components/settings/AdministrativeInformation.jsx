import React from 'react';
import { Shield, Info } from 'lucide-react';
import * as roleUtils from '../../utils/roleUtils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const AdministrativeInformation = ({ userData, userRole }) => {
  // Check if this component should be rendered at all
  if (!roleUtils.isAdmin(userRole)) {
    return null;
  }

  // Calculer le pourcentage arrondi
  const completionPercentage = Math.round(userData.stats?.profile?.completionPercentage || 0);

  // Déterminer la couleur en fonction du pourcentage
  const getProgressColor = () => {
    if (completionPercentage === 100) return "bg-emerald-500"; 
    if (completionPercentage >= 66) return "bg-blue-500";
    if (completionPercentage >= 33) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 sm:p-6">
      <h2 className="text-lg font-semibold mb-5 flex items-center text-gray-800">
        <Shield className="h-5 w-5 mr-2 text-blue-600" />
        Informations administratives
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded-md border border-gray-100">{userRole}</p>
        </div>
        {userData.stats && (
          <div>
            <div className="flex items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">Complétude du profil</label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="ml-1.5 inline-flex items-center justify-center rounded-full w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors">
                      <Info className="w-3 h-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-xs">
                      La complétude du profil est basée sur trois critères: le CV, le profil LinkedIn et la présence d'au moins un diplôme.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-500 px-0.5">
                <span>{completionPercentage}% complété</span>
                {completionPercentage === 100 && <span className="text-emerald-600 font-medium">Profil complet ✨</span>}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`${getProgressColor()} h-2.5 rounded-full transition-all duration-500 ease-out`}
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {completionPercentage < 100 
                  ? "Un profil complet améliore la visibilité auprès des recruteurs." 
                  : "Votre profil est complet et parfaitement visible par les recruteurs."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdministrativeInformation; 