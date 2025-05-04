import React from 'react';
import './magic-button.css';

const Star = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlSpace="preserve"
    version="1.1"
    style={{
      shapeRendering: 'geometricPrecision',
      textRendering: 'geometricPrecision',
      imageRendering: 'optimizeQuality',
      fillRule: 'evenodd',
      clipRule: 'evenodd'
    }}
    viewBox="0 0 784.11 815.53"
  >
    <g id="Layer_x0020_1">
      <metadata id="CorelCorpID_0Corel-Layer"></metadata>
      <path
        className="fil0"
        d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.37 371.12,197.68 392.05,407.74 20.93,-210.06 184.09,-378.37 392.05,-407.74 -207.98,-29.38 -371.16,-197.69 -392.06,-407.78z"
      />
    </g>
  </svg>
);

export function MagicButton({ children, className, ...props }) {
  return (
    <button className={`magic-button ${className || ''}`} {...props}>
      {children}
      <div className="star-1"><Star /></div>
      <div className="star-2"><Star /></div>
      <div className="star-3"><Star /></div>
      <div className="star-4"><Star /></div>
      <div className="star-5"><Star /></div>
      <div className="star-6"><Star /></div>
    </button>
  );
} 