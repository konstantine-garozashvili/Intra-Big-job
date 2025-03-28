import React from 'react';
import { Label } from '@/components/ui/label';
import { formatValue } from './utils';

export const StaticField = ({ label, icon, value, fieldType = 'text' }) => {
  // Format the value based on field type
  const formattedValue = formatValue(value, fieldType);
      
  return (
    <div className="bg-gray-50 p-3 sm:p-4 md:p-5 rounded-lg">
      <span className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-2">
        {icon}
        {label}
      </span>
      <div className="mt-1 min-h-[1.5rem]">
        {value ? (
          <span className="text-gray-900 field-value">{formattedValue}</span>
        ) : (
          <span className="text-gray-500 field-value">Non renseigné</span>
        )}
      </div>
    </div>
  );
}; 