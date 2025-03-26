import React from "react";

const Progress = React.forwardRef(({ className, value = 0, ...props }, ref) => (
  <div
    ref={ref}
    className={`relative h-4 w-full overflow-hidden rounded-full bg-secondary ${className || ''}`}
    {...props}
  >
    <div
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ 
        transform: `translateX(-${100 - (value || 0)}%)`,
        transition: 'transform 0.2s ease-in-out'
      }}
    />
  </div>
));

Progress.displayName = "Progress";

export { Progress }; 