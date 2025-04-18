import React, { useEffect, useRef } from 'react';

/**
 * CosmicBackground component that creates a space-themed background with stars and nebulas
 */
const CosmicBackground = ({ colorMode = 'navy', animationMode = 'cosmic' }) => {
  const canvasRef = useRef(null);
  
  // Get theme colors based on colorMode
  const getThemeColors = () => {
    if (colorMode === 'navy') {
      return {
        nebula1: '#0a3c6e',
        nebula2: '#001a38',
        nebula3: '#002147',
        nebula4: '#003366',
        star: '#e6f0ff',
        dust: '#0a3c6e'
      };
    } else {
      return {
        nebula1: '#4B0082',
        nebula2: '#2D0922',
        nebula3: '#190033',
        nebula4: '#330033',
        star: '#ffffff',
        dust: '#4B0082'
      };
    }
  };

  // Animation for cosmic background
  useEffect(() => {
    if (animationMode !== 'cosmic') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const colors = getThemeColors();
    
    // Stars
    const stars = [];
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5,
        opacity: Math.random(),
        speed: Math.random() * 0.05
      });
    }
    
    // Shooting stars
    const shootingStars = [];
    const shootingStarParticles = [];
    const createShootingStar = () => {
      if (shootingStars.length < 3 && Math.random() < 0.01) {
        // Variation taille/luminosité tête
        const headRadius = 1.2 + Math.random() * 1.5;
        const headBlur = 6 + Math.random() * 14;
        const angle = (Math.PI / 4) + (Math.random() * Math.PI / 4);
        shootingStars.push({
          x: Math.random() * canvas.width,
          y: 0,
          length: 80 + Math.random() * 70,
          speed: 5 + Math.random() * 7,
          angle: angle,
          headRadius,
          headBlur,
          vibratePhase: Math.random() * Math.PI * 2 // Pour effet de vibration
        });
      }
    };

    // Ajout d'étincelles (particules) derrière la tête
    const spawnShootingStarParticle = (x, y, angle) => {
      shootingStarParticles.push({
        x,
        y,
        vx: -Math.cos(angle) * (0.5 + Math.random()),
        vy: -Math.sin(angle) * (0.5 + Math.random()),
        alpha: 0.8 + Math.random() * 0.2,
        radius: 0.6 + Math.random() * 0.7,
        life: 12 + Math.floor(Math.random() * 8)
      });
    };
    
    // Nebulas (cloud-like structures)
    const nebulas = [];
    for (let i = 0; i < 5; i++) {
      nebulas.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: 100 + Math.random() * 200,
        color: [colors.nebula1, colors.nebula2, colors.nebula3, colors.nebula4][Math.floor(Math.random() * 4)],
        opacity: 0.05 + Math.random() * 0.1
      });
    }
    
    // Deep space dust (small particles)
    const dust = [];
    for (let i = 0; i < 100; i++) {
      dust.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1,
        color: colors.dust,
        opacity: 0.1 + Math.random() * 0.2,
        speed: Math.random() * 0.2
      });
    }
    
    // Animation loop
    let animationFrameId;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw nebulas
      nebulas.forEach(nebula => {
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(
          nebula.x, nebula.y, 0,
          nebula.x, nebula.y, nebula.radius
        );
        gradient.addColorStop(0, `${nebula.color}${Math.round(nebula.opacity * 255).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.arc(nebula.x, nebula.y, nebula.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Draw stars
      stars.forEach(star => {
        star.y -= star.speed;
        if (star.y < 0) {
          star.y = canvas.height;
          star.x = Math.random() * canvas.width;
        }
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${colors.star}${Math.round(star.opacity * 255).toString(16).padStart(2, '0')}`;
        ctx.fill();
      });
      
      // Draw shooting stars
      createShootingStar();
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const star = shootingStars[i];
        // Effet vibration/scintillement : légère oscillation sur la trajectoire
        const vibration = Math.sin(Date.now() / 60 + star.vibratePhase) * 1.3;
        const vibrAngle = star.angle + vibration * 0.01; // angle légèrement modifié

        // Calcul position tête (fin de la traînée)
        const endX = star.x + Math.cos(vibrAngle) * star.length;
        const endY = star.y + Math.sin(vibrAngle) * star.length;

        // Traînée avec dégradé coloré et dissipation progressive
        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(endX, endY);
        const gradient = ctx.createLinearGradient(endX, endY, star.x, star.y);
        gradient.addColorStop(0, `${colors.star}ff`); // tête (opaque)
        gradient.addColorStop(0.3, 'rgba(70,131,255,0.5)'); // bleu intermédiaire
        gradient.addColorStop(0.7, 'rgba(138,43,226,0.2)'); // violet intermédiaire
        gradient.addColorStop(1, 'transparent'); // queue
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Tête lumineuse avec variation taille/luminosité
        ctx.save();
        ctx.beginPath();
        ctx.arc(endX, endY, star.headRadius, 0, Math.PI * 2);
        ctx.fillStyle = `${colors.star}ff`;
        ctx.shadowColor = `${colors.star}`;
        ctx.shadowBlur = star.headBlur;
        ctx.globalAlpha = 0.93;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
        ctx.restore();

        // Génère des particules/étincelles derrière la tête
        if (Math.random() < 0.9) {
          spawnShootingStarParticle(
            endX - Math.cos(vibrAngle) * 2,
            endY - Math.sin(vibrAngle) * 2,
            vibrAngle
          );
        }

        // Déplacement de l'étoile filante
        star.x += Math.cos(star.angle) * star.speed;
        star.y += Math.sin(star.angle) * star.speed;

        if (star.x > canvas.width || star.y > canvas.height) {
          shootingStars.splice(i, 1);
        }
      }

      // Affichage des particules/étincelles
      for (let i = shootingStarParticles.length - 1; i >= 0; i--) {
        const p = shootingStarParticles[i];
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,220,255,${p.alpha})`;
        ctx.shadowColor = '#e6f0ff';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.restore();
        // Mise à jour particule
        p.x += p.vx;
        p.y += p.vy;
        p.alpha *= 0.88;
        p.radius *= 0.97;
        p.life--;
        if (p.life <= 0 || p.alpha < 0.05) {
          shootingStarParticles.splice(i, 1);
        }
      }
      
      // Draw dust
      dust.forEach(particle => {
        particle.y += particle.speed;
        if (particle.y > canvas.height) {
          particle.y = 0;
          particle.x = Math.random() * canvas.width;
        }
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${particle.color}${Math.round(particle.opacity * 255).toString(16).padStart(2, '0')}`;
        ctx.fill();
      });
      
      animationFrameId = window.requestAnimationFrame(render);
    };
    
    render();
    
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [colorMode, animationMode]);
  
  return (
    <>
      {/* Static background */}
      <div className={`absolute inset-0 ${colorMode === 'navy' ? 'bg-[#002147]' : 'bg-black'}`}></div>
      
      {/* Stars background image */}
      <div className="absolute inset-0 bg-[url('/images/stars-bg.png')] opacity-40"></div>
      
      {/* Canvas for animated elements */}
      <canvas 
        ref={canvasRef} 
        className={`absolute inset-0 ${animationMode === 'cosmic' ? 'opacity-100' : 'opacity-0'} transition-opacity duration-1000`}
      ></canvas>
      
      {/* Glow effects */}
      <div className={`absolute top-0 left-1/4 w-1/2 h-1/3 rounded-full blur-3xl ${colorMode === 'navy' ? 'bg-blue-900/20' : 'bg-purple-900/20'}`}></div>
      <div className={`absolute bottom-0 right-1/4 w-1/2 h-1/3 rounded-full blur-3xl ${colorMode === 'navy' ? 'bg-blue-900/10' : 'bg-purple-900/10'}`}></div>
    </>
  );
};

export default CosmicBackground;
