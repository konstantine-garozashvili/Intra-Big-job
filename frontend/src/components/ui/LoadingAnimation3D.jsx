import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';

/**
 * A sophisticated 3D loading animation component with advanced visual effects
 * Uses Framer Motion for complex animations and 3D transformations
 * Colors are consistent with the website's theme
 */
const LoadingAnimation3D = () => {
  const [mounted, setMounted] = useState(false);
  const controls = useAnimation();
  
  // Colors for the animation based on the website's theme
  const colors = [
    "hsl(var(--primary))", // Primary color
    "hsl(var(--secondary))", // Secondary color
    "hsl(var(--chart-1))", // Chart color 1
    "hsl(var(--chart-2))", // Chart color 2
    "hsl(var(--chart-3))", // Chart color 3
    "hsl(var(--chart-4))", // Chart color 4
    "hsl(var(--chart-5))", // Chart color 5
  ];

  // Start animations after component mount for better performance
  useEffect(() => {
    setMounted(true);
    controls.start("animate");
  }, [controls]);

  // Animation variants for the cube faces
  const cubeVariants = {
    initial: { 
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0,
    },
    animate: {
      rotateX: [0, 90, 180, 270, 360],
      rotateY: [0, 90, 180, 270, 360],
      rotateZ: [0, 90, 180, 270, 360],
      transition: {
        repeat: Infinity,
        duration: 8,
        ease: "linear",
      },
    },
  };

  // Animation variants for the floating particles
  const particleVariants = {
    initial: { 
      y: 0,
      opacity: 0,
    },
    animate: (i) => ({
      y: [-20, -40, -20],
      opacity: [0, 0.8, 0],
      transition: {
        repeat: Infinity,
        duration: 2 + (i * 0.2),
        ease: "easeInOut",
        delay: i * 0.1,
      },
    }),
  };

  // Animation variants for the outer rings
  const ringVariants = {
    initial: { 
      rotate: 0,
      opacity: 0.3,
    },
    animate: (i) => ({
      rotate: i % 2 === 0 ? 360 : -360,
      opacity: [0.3, 0.6, 0.3],
      transition: {
        repeat: Infinity,
        duration: 6 - i,
        ease: "linear",
      },
    }),
  };

  // Animation variants for the pulsing background
  const pulseVariants = {
    initial: { 
      scale: 0.8,
      opacity: 0.2,
    },
    animate: {
      scale: [0.8, 1.2, 0.8],
      opacity: [0.2, 0.4, 0.2],
      transition: {
        repeat: Infinity,
        duration: 3,
        ease: "easeInOut",
      },
    },
  };

  // Animation variants for the loading text
  const textVariants = {
    initial: { 
      opacity: 0,
      y: 10,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  // Animation variants for the dots in the loading text
  const dotVariants = {
    initial: { 
      opacity: 0,
      y: 0,
    },
    animate: (i) => ({
      opacity: [0, 1, 0],
      y: [0, -5, 0],
      transition: {
        repeat: Infinity,
        duration: 1.5,
        ease: "easeInOut",
        delay: i * 0.2,
      },
    }),
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] overflow-hidden">
      {/* Main container with perspective for 3D effect */}
      <div className="relative perspective-[1200px] w-64 h-64 flex items-center justify-center">
        {/* Background gradient pulse */}
        <motion.div
          className="absolute w-full h-full rounded-full bg-gradient-to-r from-[hsl(var(--primary)/20)] via-[hsl(var(--chart-1)/20)] to-[hsl(var(--secondary)/20)] blur-xl"
          variants={pulseVariants}
          initial="initial"
          animate={controls}
        />
        
        {/* Outer rings */}
        {[1, 2, 3].map((ring, i) => (
          <motion.div
            key={`ring-${i}`}
            className={`absolute border-2 rounded-full opacity-30 ${
              i === 0 
                ? 'w-48 h-48 border-[hsl(var(--primary)/50)]' 
                : i === 1 
                ? 'w-56 h-56 border-[hsl(var(--chart-1)/50)]' 
                : 'w-64 h-64 border-[hsl(var(--secondary)/50)]'
            }`}
            variants={ringVariants}
            custom={i}
            initial="initial"
            animate={controls}
          />
        ))}
        
        {/* 3D Cube */}
        <motion.div
          className="relative w-24 h-24 transform-style-3d"
          variants={cubeVariants}
          initial="initial"
          animate={controls}
        >
          {/* Cube faces */}
          <div className="absolute inset-0 w-full h-full transform-style-3d">
            {/* Front face */}
            <div className="absolute w-full h-full bg-gradient-to-br from-[hsl(var(--primary)/80)] to-[hsl(var(--chart-1)/80)] backdrop-blur-sm transform translate-z-[48px] shadow-lg rounded-md border border-white/20" />
            
            {/* Back face */}
            <div className="absolute w-full h-full bg-gradient-to-br from-[hsl(var(--chart-1)/80)] to-[hsl(var(--secondary)/80)] backdrop-blur-sm transform -translate-z-[48px] shadow-lg rounded-md border border-white/20" />
            
            {/* Left face */}
            <div className="absolute w-full h-full bg-gradient-to-br from-[hsl(var(--chart-2)/80)] to-[hsl(var(--primary)/80)] backdrop-blur-sm transform -translate-x-[48px] rotate-y-90 shadow-lg rounded-md border border-white/20" />
            
            {/* Right face */}
            <div className="absolute w-full h-full bg-gradient-to-br from-[hsl(var(--secondary)/80)] to-[hsl(var(--chart-3)/80)] backdrop-blur-sm transform translate-x-[48px] rotate-y-90 shadow-lg rounded-md border border-white/20" />
            
            {/* Top face */}
            <div className="absolute w-full h-full bg-gradient-to-br from-[hsl(var(--primary)/80)] to-[hsl(var(--chart-2)/80)] backdrop-blur-sm transform -translate-y-[48px] rotate-x-90 shadow-lg rounded-md border border-white/20" />
            
            {/* Bottom face */}
            <div className="absolute w-full h-full bg-gradient-to-br from-[hsl(var(--chart-3)/80)] to-[hsl(var(--chart-4)/80)] backdrop-blur-sm transform translate-y-[48px] rotate-x-90 shadow-lg rounded-md border border-white/20" />
          </div>
          
          {/* Glowing center */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full"
            animate={{
              boxShadow: [
                "0 0 10px 5px rgba(82, 142, 178, 0.5)",
                "0 0 20px 10px rgba(82, 142, 178, 0.7)",
                "0 0 10px 5px rgba(82, 142, 178, 0.5)",
              ],
              scale: [1, 1.2, 1],
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: "easeInOut",
            }}
          />
        </motion.div>
        
        {/* Floating particles */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          const radius = 80 + (i % 3) * 15;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          return (
            <motion.div
              key={`particle-${i}`}
              className="absolute w-2 h-2 rounded-full"
              style={{
                x,
                y,
                backgroundColor: colors[i % colors.length],
                filter: "blur(1px)",
              }}
              variants={particleVariants}
              custom={i}
              initial="initial"
              animate={controls}
            />
          );
        })}
      </div>
      
      {/* Loading text with animated dots */}
      <motion.div
        className="mt-12 text-center"
        variants={textVariants}
        initial="initial"
        animate="animate"
      >
        <div className="flex items-center justify-center">
          <p className="text-lg font-medium bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] bg-clip-text text-transparent">
            Chargement
          </p>
          {/* Animated dots */}
          <div className="flex ml-1">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={`dot-${i}`}
                className="text-lg font-medium bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] bg-clip-text text-transparent"
                variants={dotVariants}
                custom={i}
                initial="initial"
                animate="animate"
              >
                .
              </motion.span>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoadingAnimation3D; 