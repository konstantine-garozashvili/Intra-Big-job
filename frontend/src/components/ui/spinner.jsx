import React from 'react';

/**
 * A simple spinner component using Tailwind CSS
 */
const Spinner = ({ className = "", ...props }) => {
  return (
    <div className={`flex items-center justify-center ${className}`} {...props}>
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#528eb2]"></div>
    </div>
  );
};

export { Spinner }; 