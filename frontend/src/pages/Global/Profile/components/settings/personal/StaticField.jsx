import React, { memo } from 'react';
import { Label } from '@/components/ui/label';
import { formatValue } from './utils';

const StaticField = memo(({ label, icon, value, fieldType = 'text' }) => {
  // Format the value based on field type
  const formattedValue = formatValue(value, fieldType);
      
  return (
    <div className="address-edit-card w-full flex flex-col justify-between">
      <div className="flex items-center gap-2 mb-1">
        {icon && <span className="flex items-center justify-center"><span className="h-5 w-5 text-blue-500 flex items-center justify-center">{icon}</span></span>}
        <Label className="text-sm font-semibold text-gray-700 p-0 m-0 leading-none">{label}</Label>
      </div>
      <div className="mt-1 min-h-[2.2rem] flex items-center text-base text-gray-900 pl-0">
        <span>{formattedValue}</span>
      </div>
    </div>
  );
});

export default StaticField; 