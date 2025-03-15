import React from 'react';
import { LoadingAnimationNoText } from './LoadingAnimation';

/**
 * A simple spinner component that uses our LoadingAnimationNoText
 * This ensures consistent loading indicators across the application
 */
const Spinner = ({ className = "", ...props }) => {
  return (
    <div className={`flex items-center justify-center ${className}`} {...props}>
      <LoadingAnimationNoText />
    </div>
  );
};

export { Spinner }; 