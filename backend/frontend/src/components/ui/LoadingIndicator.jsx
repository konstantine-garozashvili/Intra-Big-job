import React, { useEffect, useState } from 'react';

/**
 * Indicateur de chargement adaptatif qui s'ajuste selon le mode de performance
 */
const LoadingIndicator = ({ size = 'medium', isInline = false, text = 'Chargement...' }) => {
  const [isLowPerformanceMode, setIsLowPerformanceMode] = useState(false);
  
  useEffect(() => {
    // Check performance mode setting
    const checkPerformanceMode = () => {
      setIsLowPerformanceMode(localStorage.getItem('preferLowPerformanceMode') === 'true');
    };
    
    // Initial check
    checkPerformanceMode();
    
    // Setup listener for performance mode changes
    const handleStorageChange = (e) => {
      if (e.key === 'preferLowPerformanceMode') {
        checkPerformanceMode();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  // Size classes
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };
  
  // Format inline vs block display
  const containerClasses = isInline 
    ? 'inline-flex items-center' 
    : 'flex flex-col items-center justify-center';

  if (isLowPerformanceMode) {
    // Simple text-based loader for low performance mode
    return (
      <div className={`${containerClasses} gap-2`}>
        <div className="text-gray-500 font-bold animate-pulse">
          {text}
        </div>
      </div>
    );
  }

  // Standard spinner for normal performance mode
  return (
    <div className={`${containerClasses} gap-2`}>
      <div 
        className={`${sizeClasses[size]} border-2 border-t-blue-600 border-blue-300 rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      />
      {text && <span className="text-gray-500">{text}</span>}
    </div>
  );
};

export default LoadingIndicator; 