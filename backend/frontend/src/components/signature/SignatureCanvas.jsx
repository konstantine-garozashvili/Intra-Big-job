import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';

// Use only our custom canvas implementation
const SignatureCanvas = forwardRef(({ width, height, onEnd, className }, ref) => {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPosition = useRef({ x: 0, y: 0 });

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    clear: () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    },
    isEmpty: () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        
        // Check if all pixel alpha values are 0 (transparent)
        for (let i = 3; i < pixelData.length; i += 4) {
          if (pixelData[i] !== 0) return false;
        }
        return true;
      }
      return true;
    },
    toDataURL: (type = 'image/png', encoderOptions) => {
      if (canvasRef.current) {
        return canvasRef.current.toDataURL(type, encoderOptions);
      }
      return '';
    }
  }));

  // Canvas implementation using HTML Canvas API
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set up canvas
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#000';

    // Helper functions for drawing
    const getPosition = (event) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = event.clientX || (event.touches && event.touches[0].clientX);
      const clientY = event.clientY || (event.touches && event.touches[0].clientY);
      
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };

    const startDrawing = (event) => {
      isDrawing.current = true;
      lastPosition.current = getPosition(event);
    };

    const draw = (event) => {
      if (!isDrawing.current) return;
      
      const currentPosition = getPosition(event);
      
      ctx.beginPath();
      ctx.moveTo(lastPosition.current.x, lastPosition.current.y);
      ctx.lineTo(currentPosition.x, currentPosition.y);
      ctx.stroke();
      
      lastPosition.current = currentPosition;
    };

    const stopDrawing = () => {
      if (isDrawing.current && onEnd) {
        onEnd();
      }
      isDrawing.current = false;
    };

    // Add event listeners
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // Touch events
    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', stopDrawing);

    // Cleanup
    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseout', stopDrawing);
      
      canvas.removeEventListener('touchstart', startDrawing);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', stopDrawing);
    };
  }, [onEnd]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={className}
      style={{ border: '1px solid #ccc', touchAction: 'none' }}
    />
  );
});

SignatureCanvas.displayName = 'SignatureCanvas';

SignatureCanvas.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  onEnd: PropTypes.func,
  className: PropTypes.string
};

SignatureCanvas.defaultProps = {
  width: 500,
  height: 200,
  onEnd: () => {},
  className: ''
};

export default SignatureCanvas;
