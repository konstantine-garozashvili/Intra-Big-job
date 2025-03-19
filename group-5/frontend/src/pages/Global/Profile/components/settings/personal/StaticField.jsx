import React from 'react';
import { Label } from '@/components/ui/label';
import { formatValue } from './utils';

export const StaticField = ({ label, icon, value, fieldType = 'text' }) => {
  // Format the value based on field type
  const formattedValue = formatValue(value, fieldType);
      
  return (
    <div className="bg-gray-50 rounded-lg p-4 sm:p-5">
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      <div className="mt-2">
        <div className="flex items-center text-sm text-gray-900">
          {icon}
          <span className="font-medium break-words">{formattedValue}</span>
        </div>
      </div>
    </div>
  );
}; 