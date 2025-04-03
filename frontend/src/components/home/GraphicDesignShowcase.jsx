import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const GraphicDesignShowcase = () => {
  const canvasRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  
  // Handle mouse movement for interactive effects
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };
  
  // Canvas animation for futuristic design elements
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Particles for the canvas animation
    const particles = [];
    const particleCount = 100;
    
    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 1,
        color: `rgba(59, 130, 246, ${Math.random() * 0.5 + 0.2})`,
        speedX: Math.random() * 2 - 1,
        speedY: Math.random() * 2 - 1,
        connections: []
      });
    }
    
    // Animation function
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Update and draw particles
      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];
        
        // Move particles
        p.x += p.speedX;
        p.y += p.speedY;
        
        // Bounce off edges
        if (p.x < 0 || p.x > width) p.speedX *= -1;
        if (p.y < 0 || p.y > height) p.speedY *= -1;
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        
        // Clear connections
        p.connections = [];
        
        // Check for nearby particles to connect
        for (let j = i + 1; j < particleCount; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Connect particles within range
          if (distance < 100) {
            p.connections.push(j);
            
            // Draw connection line
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(59, 130, 246, ${0.1 * (1 - distance / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
        
        // Special effect for mouse position
        if (isHovering) {
          const dx = p.x - mousePosition.x;
          const dy = p.y - mousePosition.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 150) {
            // Push particles away from mouse
            const force = (150 - distance) / 150;
            p.x += dx * force * 0.05;
            p.y += dy * force * 0.05;
            
            // Draw connection to mouse
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mousePosition.x, mousePosition.y);
            ctx.strokeStyle = `rgba(59, 130, 246, ${0.2 * (1 - distance / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      
      requestAnimationFrame(animate);
    };
    
    animate();
    
    // Clean up
    return () => {
      // Cancel animation frame if needed
    };
  }, [isHovering, mousePosition]);
  
  // 3D design elements
  const designElements = [
    {
      title: "UI/UX Futuriste",
      description: "Interfaces utilisateur avancées avec animations fluides et expériences immersives.",
      icon: "🎨",
      color: "from-blue-500 to-indigo-600"
    },
    {
      title: "Modèles 3D Interactifs",
      description: "Visualisations 3D interactives qui transforment la façon dont les utilisateurs interagissent avec le contenu.",
      icon: "🧊",
      color: "from-purple-500 to-pink-600"
    },
    {
      title: "Animations Dynamiques",
      description: "Animations réactives qui répondent aux interactions des utilisateurs en temps réel.",
      icon: "✨",
      color: "from-cyan-500 to-blue-600"
    },
    {
      title: "Thèmes Personnalisés",
      description: "Designs adaptatifs qui s'ajustent aux préférences et au contexte de l'utilisateur.",
      icon: "🎭",
      color: "from-green-500 to-teal-600"
    }
  ];
  
  return (
    <div 
      className="relative py-20 overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Background canvas animation */}
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        width={1200}
        height={800}
      />
      
      {/* Content overlay */}
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-600">
              Design Graphique Révolutionnaire
            </span>
          </h2>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto">
            Explorez des interfaces utilisateur futuristes et des expériences visuelles impossibles à créer sans l'IA.
          </p>
        </motion.div>
        
        {/* 3D Floating Display */}
        <div className="relative h-[500px] mb-20">
          {/* Central glowing orb */}
          <motion.div 
            className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.8) 0%, rgba(79, 70, 229, 0.4) 50%, transparent 70%)',
              filter: 'blur(20px)',
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 0.9, 0.7],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Floating 3D elements */}
          <div className="absolute inset-0">
            {designElements.map((element, index) => {
              // Calculate position in a circle around the center
              const angle = (index / designElements.length) * Math.PI * 2;
              const radius = 180; // Distance from center
              const x = Math.cos(angle) * radius + 50; // +50 to center in container
              const y = Math.sin(angle) * radius;
              
              return (
                <motion.div
                  key={index}
                  className={`absolute left-1/2 top-1/2 w-64 p-6 rounded-xl bg-gray-900/90 backdrop-blur-lg border border-gray-700 shadow-xl`}
                  style={{
                    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotateX(5deg) rotateY(10deg)`,
                    transformStyle: 'preserve-3d',
                  }}
                  initial={{ opacity: 0, y: 20, rotateY: 0 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2, duration: 0.8 }}
                  whileHover={{
                    z: 30,
                    rotateY: -10,
                    scale: 1.05,
                    transition: { duration: 0.3 }
                  }}
                >
                  {/* Glowing border */}
                  <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${element.color} opacity-20`} />
                  
                  {/* Icon */}
                  <div className="text-4xl mb-4">{element.icon}</div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-bold text-white mb-2">{element.title}</h3>
                  <p className="text-blue-200 text-sm">{element.description}</p>
                  
                  {/* 3D effect elements */}
                  <div 
                    className="absolute right-4 bottom-4 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-600/30"
                    style={{ transform: 'translateZ(20px)' }}
                  />
                </motion.div>
              );
            })}
          </div>
          
          {/* Code snippets floating in background */}
          <div className="absolute inset-0 pointer-events-none">
            {[
              '<div className="futuristic-ui">',
              '<Canvas shadows>',
              '<motion.div animate={{ scale: 1.2 }}>',
              'background: radial-gradient(...);',
              'transform: perspective(1000px);',
              '</motion.div>',
              '</Canvas>',
              '</div>'
            ].map((text, index) => (
              <motion.div
                key={index}
                className="absolute text-xs md:text-sm font-mono text-blue-400/30"
                style={{
                  left: `${Math.random() * 80 + 10}%`,
                  top: `${Math.random() * 80 + 10}%`,
                }}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 0.7, 0],
                  y: [0, -30, 0],
                }}
                transition={{
                  duration: Math.random() * 5 + 10,
                  repeat: Infinity,
                  delay: Math.random() * 5,
                }}
              >
                {text}
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Bottom section with call to action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center"
        >
          <p className="text-xl text-blue-200 mb-8">
            Nos designs combinent esthétique futuriste et fonctionnalité intuitive pour créer des expériences web uniques.
          </p>
          <button className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-full hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-1">
            Explorer Nos Créations
          </button>
        </motion.div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-600/10 rounded-full filter blur-3xl" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-indigo-600/10 rounded-full filter blur-3xl" />
    </div>
  );
};

export default GraphicDesignShowcase;
