import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 *  3D Computer component with interactive elements
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
        {/* Keyboard centré sous le monitor */}
        <div
          className="absolute bottom-[-110px] transform -translate-x-1/2 w-[320px] h-[64px] bg-gray-800 rounded-xl border-t-2 border-gray-700 z-20 shadow-lg transition-all duration-200"
          style={{
            transform: 'translateY(50px) translateX(20px)',
            height: '100px'
          }}
        >
          {/*  */}
          <div
            className="grid grid-rows-5 grid-cols-12 gap-y-1 gap-x-0.5 justify-center items-end h-full px-3 py-2 w-100"
            style={{ gridTemplateRows: 'repeat(5, minmax(0, 1fr))' }}
          >
            {[
              // 12 colonnes par ligne, alignement compact et centré
              ['', '', '', '', '', '', '', '', '', '', '', ''], // Row 1
              ['', '', '', '', '', '', '', '', '', '', '', ''], // Row 2
              ['', '', '', '', '', '', '', '', '', '', 'enter'], // Row 3
              ['', '', '', '', '', '', '', '', '', '', ''], // Row 4
              [null, null, 'space', 'space', 'space', 'space', 'space', 'space', 'space', null, null, null], // Row 5 (space col-span-6)
            ].map((row, rowIdx) =>
              row.map((keyType, colIdx) => {
                if (keyType === null) return null;
                // Touches larges
                if (keyType === 'shift' || keyType === 'enter') {
                  return (
                    <div
                      key={`r${rowIdx}-c${colIdx}-`+keyType}
                      className={`bg-gray-700 rounded col-span-2 w-10 h-4 flex items-center justify-center shadow-inner hover:bg-blue-600`}
                      style={{ gridRow: rowIdx+1, gridColumn: colIdx+1 }}
                    />
                  );
                }
                if (keyType === 'space') {
                  // La spacebar occupe 6 colonnes au total
                  if (colIdx === 2) {
                    return (
                      <div
                        key={`r${rowIdx}-c${colIdx}-space`}
                        className="bg-gray-700 rounded col-span-6 w-40 h-3 flex items-center justify-center shadow-inner hover:bg-blue-600"
                        style={{ gridRow: rowIdx+1, gridColumn: colIdx+1 }}
                      />
                    );
                  }
                  return null;
                }
                // Touche normale
                return (
                  <div
                    key={`r${rowIdx}-c${colIdx}`}
                    className="bg-gray-700 rounded w-5 h-4 flex items-center justify-center shadow-inner hover:bg-blue-600"
                    style={{ gridRow: rowIdx+1, gridColumn: colIdx+1 }}
                  />
                );
              })
            )}
          </div>
        </div>
        {/* Pied de l'écran (stand) */}
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-[-23px] w-12 h-6 rounded-b-full bg-gradient-to-b from-gray-700 to-gray-900 shadow-lg z-0"
          style={{
            boxShadow: '0 8px 24px 0 rgba(0,0,0,0.40)',
            borderBottom: '4px solid #22223b',
            opacity: 1
          }}
        />
        {/* Socle (base) de l'écran */}
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-[-50px] w-32 h-8 bg-gradient-to-b from-gray-800 to-gray-900 rounded-full z-10"
          style={{
            boxShadow: '0 18px 32px 0 rgba(0,0,0,0.33)',
            opacity: 1,
            borderBottom: '6px solid #1a1a2e'
          }}
        />
        {/* Monitor */}
        <div
          className="relative w-[350px] h-[220px] bg-gray-900 rounded-lg border-4 border-gray-800 preserve-3d z-20"
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
              className="absolute bottom-[33px] left-[42px] w-2 h-4 bg-blue-400"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </div>
        </div>
        
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