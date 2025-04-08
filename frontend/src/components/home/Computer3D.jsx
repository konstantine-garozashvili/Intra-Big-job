import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * 3D Computer component with interactive elements
 */
const Computer3D = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [rotateY, setRotateY] = useState(15);
  const computerRef = useRef(null);
  
  // Handle mouse move for 3D effect
  const handleMouseMove = (e) => {
    if (!computerRef.current) return;
    
    const rect = computerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const centerX = rect.width / 2;
    
    // Calculate rotation based on mouse position
    const newRotateY = ((x - centerX) / centerX) * 15;
    setRotateY(newRotateY);
  };

  // Code snippet lines to display on screen
  const codeLines = [
    { text: "import React from 'react';", color: "text-blue-400" },
    { text: "import { motion } from 'framer-motion';", color: "text-purple-400" },
    { text: "// Interactive 3D component", color: "text-gray-400", marginTop: "mt-2" },
    { text: "const Computer3D = () => {", color: "text-yellow-400" },
    { text: "return (", color: "text-green-400", indent: 1 },
    { text: '<div className="awesome-3d">', color: "text-blue-300", indent: 2 },
    { text: "<h1>Bienvenue!</h1>", color: "text-pink-400", indent: 3 },
    { text: "</div>", color: "text-blue-300", indent: 2 },
    { text: ");", color: "text-green-400", indent: 1 },
    { text: "};", color: "text-yellow-400" },
    { text: "export default Computer3D;", color: "text-purple-400", marginTop: "mt-2" }
  ];

  return (
    <div className="relative w-full h-[400px] flex items-center justify-center">
      <motion.div
        ref={computerRef}
        className="relative preserve-3d"
        style={{ 
          transformStyle: 'preserve-3d',
          transform: `rotateY(${rotateY}deg) rotateX(10deg)`
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setRotateY(15);
        }}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Monitor */}
        <div 
          className="relative w-[350px] h-[220px] bg-gray-900 rounded-lg border-4 border-gray-800 preserve-3d"
          style={{ 
            transformStyle: 'preserve-3d',
            boxShadow: '0 0 30px rgba(59, 130, 246, 0.3)'
          }}
        >
          {/* Screen */}
          <div 
            className="absolute inset-2 bg-gradient-to-br from-blue-900 to-indigo-900 rounded overflow-hidden"
            style={{ transform: 'translateZ(2px)' }}
          >
            {/* Code on screen */}
            <div className="p-3 text-xs font-mono">
              {codeLines.map((line, index) => (
                <div 
                  key={index} 
                  className={`${line.color} ${line.marginTop || ''}`}
                  style={{ paddingLeft: line.indent ? `${line.indent * 1}rem` : '0' }}
                >
                  {line.text}
                </div>
              ))}
            </div>
            
            {/* Cursor blinking effect */}
            <motion.div 
              className="absolute bottom-10 left-[220px] w-2 h-4 bg-blue-400"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </div>
          
          {/* Monitor logo */}
          <div 
            className="absolute bottom-[-15px] left-1/2 transform -translate-x-1/2 w-20 h-5 bg-gray-800 rounded-sm flex items-center justify-center"
            style={{ transform: 'translateZ(5px)' }}
          >
            <div className="w-4 h-1 bg-blue-500 rounded-full" />
          </div>
        </div>
        
        {/* Monitor Stand */}
        <div 
          className="absolute bottom-[-30px] left-1/2 transform -translate-x-1/2 w-40 h-10 bg-gray-800 rounded-lg"
          style={{ transform: 'translateZ(-10px)' }}
        />
        
        {/* Base */}
        <div 
          className="absolute bottom-[-50px] left-1/2 transform -translate-x-1/2 w-80 h-10 bg-gray-900 rounded-lg"
          style={{ transform: 'translateZ(-20px)' }}
        />
        
        {/* Keyboard */}
        <motion.div 
          className="absolute bottom-[-80px] left-1/2 transform -translate-x-1/2 w-[320px] h-[120px] bg-gray-800 rounded-lg border-t-2 border-gray-700"
          style={{ 
            transform: 'translateZ(20px) rotateX(10deg)',
            transformOrigin: 'top'
          }}
          animate={{ 
            y: isHovered ? -10 : 0,
            rotateX: isHovered ? 5 : 10
          }}
          transition={{ duration: 0.3 }}
        >
          {/* Keys */}
          <div className="absolute inset-4 grid grid-cols-10 gap-1">
            {Array.from({ length: 60 }).map((_, i) => (
              <motion.div
                key={i}
                className="bg-gray-700 rounded-sm"
                whileHover={{ y: -2, backgroundColor: '#3B82F6' }}
                whileTap={{ y: 0 }}
                style={{ 
                  height: i >= 50 ? '10px' : '6px',
                  gridColumn: i >= 50 ? 'span 3' : 'span 1'
                }}
              />
            ))}
          </div>
        </motion.div>
        
        {/* Flying code elements */}
        {isHovered && (
          <>
            <motion.div
              className="absolute text-sm font-mono text-blue-400 bg-gray-900 bg-opacity-80 p-2 rounded"
              initial={{ opacity: 0, y: 0, x: 0, z: 0 }}
              animate={{ 
                opacity: [0, 1, 0],
                y: -100,
                x: -100,
                z: 50
              }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              style={{ 
                transformStyle: 'preserve-3d',
                transform: 'translateZ(50px)'
              }}
            >
              {"<React.StrictMode>"}
            </motion.div>
            
            <motion.div
              className="absolute text-sm font-mono text-green-400 bg-gray-900 bg-opacity-80 p-2 rounded"
              initial={{ opacity: 0, y: 0, x: 0, z: 0 }}
              animate={{ 
                opacity: [0, 1, 0],
                y: -120,
                x: 80,
                z: 70
              }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 0.5, delay: 0.3 }}
              style={{ 
                transformStyle: 'preserve-3d',
                transform: 'translateZ(70px)'
              }}
            >
              {"function App() {"}
            </motion.div>
            
            <motion.div
              className="absolute text-sm font-mono text-purple-400 bg-gray-900 bg-opacity-80 p-2 rounded"
              initial={{ opacity: 0, y: 0, x: 0, z: 0 }}
              animate={{ 
                opacity: [0, 1, 0],
                y: -80,
                x: -50,
                z: 30
              }}
              transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 1.2, delay: 0.6 }}
              style={{ 
                transformStyle: 'preserve-3d',
                transform: 'translateZ(30px)'
              }}
            >
              {"import { useState }"}
            </motion.div>
          </>
        )}
      </motion.div>
      
      {/* Glow effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] bg-blue-500 rounded-full filter blur-3xl opacity-10 animate-pulse" />
      </div>
    </div>
  );
};

export default Computer3D;
