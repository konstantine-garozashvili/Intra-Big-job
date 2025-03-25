import React from 'react';
import { Label } from '@/components/ui/label';
import { formatValue } from './utils';

export const StaticField = ({ label, icon, value, fieldType = 'text' }) => {
  // Format the value based on field type
  const formattedValue = formatValue(value, fieldType);
      
  return (
    <div className="bg-gray-50 dark:bg-gray-800/60 dark:border dark:border-gray-700 dark:hover:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700/70 transition-all duration-200 rounded-lg p-4 sm:p-5">
      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</Label>
      <div className="mt-2">
        <div className="flex items-center text-sm text-gray-900 dark:text-gray-100">
          {icon}
          <span className="font-medium break-words">{formattedValue}</span>
        </div>
      </div>
    </div>
  );
}; 