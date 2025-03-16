import React from 'react';
import { styled } from 'styled-components';

/**
 * A unified spinner component that can render different types of loading animations
 * @param {Object} props - Component props
 * @param {string} props.type - Type of spinner: 'simple', 'dots', or '3d'
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.color - Custom color (defaults to theme primary color)
 * @param {string} props.size - Size of the spinner ('sm', 'md', 'lg')
 */
const Spinner = ({ 
  type = "simple", 
  className = "", 
  color = "#528eb2", 
  size = "md",
  ...props 
}) => {
  // Size mapping
  const sizeMap = {
    sm: { height: "1rem", width: "1rem", borderWidth: "2px" },
    md: { height: "1.5rem", width: "1.5rem", borderWidth: "2px" },
    lg: { height: "2rem", width: "2rem", borderWidth: "3px" }
  };
  
  const { height, width, borderWidth } = sizeMap[size] || sizeMap.md;
  
  // Simple spinner (default)
  if (type === "simple") {
    return (
      <div className={`flex items-center justify-center ${className}`} {...props}>
        <div 
          className="animate-spin rounded-full border-b-2 border-[#528eb2]"
          style={{ 
            height, 
            width, 
            borderWidth,
            borderColor: "transparent",
            borderBottomColor: color
          }}
        ></div>
      </div>
    );
  }
  
  // Dot spinner
  if (type === "dots") {
    return <DotSpinner className={className} color={color} size={size} {...props} />;
  }
  
  // Default to simple spinner
  return (
    <div className={`flex items-center justify-center ${className}`} {...props}>
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#528eb2]"></div>
    </div>
  );
};

// Styled component for dot spinner
const SpinnerWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  ${props => props.className && props.className}
  
  .dot-spinner {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    --uib-size: ${props => props.size === 'sm' ? '1.8rem' : props.size === 'lg' ? '3.5rem' : '2.8rem'};
    --uib-speed: 0.9s;
    --uib-color: ${props => props.color || '#528eb2'};
    
    height: var(--uib-size);
    width: var(--uib-size);
  }

  .dot-spinner__dot {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    height: 100%;
    width: 100%;
  }

  .dot-spinner__dot::before {
    content: '';
    height: 15%;
    width: 15%;
    border-radius: 50%;
    background-color: var(--uib-color);
    transform: scale(0);
    opacity: 0.8;
    animation: pulse0112 calc(var(--uib-speed) * 1.111) ease-in-out infinite;
  }

  .dot-spinner__dot:nth-child(1) {
    transform: rotate(45deg);
  }

  .dot-spinner__dot:nth-child(2) {
    transform: rotate(90deg);
  }

  .dot-spinner__dot:nth-child(3) {
    transform: rotate(135deg);
  }

  .dot-spinner__dot:nth-child(4) {
    transform: rotate(180deg);
  }

  .dot-spinner__dot:nth-child(5) {
    transform: rotate(225deg);
  }

  .dot-spinner__dot:nth-child(6) {
    transform: rotate(270deg);
  }

  .dot-spinner__dot:nth-child(7) {
    transform: rotate(315deg);
  }

  .dot-spinner__dot:nth-child(8) {
    transform: rotate(360deg);
  }

  .dot-spinner__dot:nth-child(2)::before {
    animation-delay: calc(var(--uib-speed) * -0.875);
  }

  .dot-spinner__dot:nth-child(3)::before {
    animation-delay: calc(var(--uib-speed) * -0.75);
  }

  .dot-spinner__dot:nth-child(4)::before {
    animation-delay: calc(var(--uib-speed) * -0.625);
  }

  .dot-spinner__dot:nth-child(5)::before {
    animation-delay: calc(var(--uib-speed) * -0.5);
  }

  .dot-spinner__dot:nth-child(6)::before {
    animation-delay: calc(var(--uib-speed) * -0.375);
  }

  .dot-spinner__dot:nth-child(7)::before {
    animation-delay: calc(var(--uib-speed) * -0.25);
  }

  .dot-spinner__dot:nth-child(8)::before {
    animation-delay: calc(var(--uib-speed) * -0.125);
  }

  @keyframes pulse0112 {
    0%, 100% {
      transform: scale(0);
      opacity: 0.8;
    }

    50% {
      transform: scale(1);
      opacity: 0.5;
    }
  }
`;

// Dot spinner component
const DotSpinner = ({ className = "", color, size, ...props }) => {
  return (
    <SpinnerWrapper className={className} color={color} size={size} {...props}>
      <div className="dot-spinner">
        <div className="dot-spinner__dot"></div>
        <div className="dot-spinner__dot"></div>
        <div className="dot-spinner__dot"></div>
        <div className="dot-spinner__dot"></div>
        <div className="dot-spinner__dot"></div>
        <div className="dot-spinner__dot"></div>
        <div className="dot-spinner__dot"></div>
        <div className="dot-spinner__dot"></div>
      </div>
    </SpinnerWrapper>
  );
};

export { Spinner }; 