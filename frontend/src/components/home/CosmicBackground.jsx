import React, { useEffect, useRef } from 'react';

/**
 * CosmicBackground component that creates a space-themed background with stars and nebulas
 * @param {string} colorMode - 'navy' or 'purple' theme
 * @param {string} animationMode - 'cosmic' for animation, any other value for static
 * @param {string} shootingStarDirection - 'diagonal' (default) or 'horizontal'
 */
const CosmicBackground = ({
  colorMode = 'navy',
  animationMode = 'cosmic',
  shootingStarDirection = 'diagonal'
}) => {
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

    const shootingStars = [];
    const shootingStarParticles = [];
    const trailGhosts = []; // Persistent trail segments (ghosts) after a shooting star has disappeared
    const createShootingStar = () => {
      if (shootingStars.length < 3 && Math.random() < 0.01) {
        const headRadius = 1 + Math.random() * 0.5;
        const headBlur = 0 + Math.random() * 14;

        // Direction des étoiles filantes selon le paramètre
        let angle, startX, startY;

        if (shootingStarDirection === 'horizontal') {
          angle = 0; // 0 radians = direction horizontale vers la droite
          startX = 0; // Commence du côté gauche
          startY = Math.random() * (canvas.height * 0.7); // Position Y aléatoire (70% supérieur de l'écran)
        } else {
          angle = (Math.PI / 4) + (Math.random() * Math.PI / 4); // Angle diagonal
          startX = Math.random() * canvas.width;
          startY = 0; // Commence du haut
        }

        
        const maxDistance = shootingStarDirection === 'horizontal' ? canvas.width : Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height);
        const lifespan = Math.random() < 0.6 ? // 60% de chance de disparaître en cours de route
          (0.3 + Math.random() * 0.5) * maxDistance : // Disparaît entre 30% et 80% du chemin
          maxDistance * 1.2; // Traverse tout l'écran (120% pour s'assurer qu'elle sort complètement)

        const fadeOutPoint = lifespan * (0.9 + Math.random() * 0.15);

        shootingStars.push({
          x: startX,
          y: startY,
          length: 80 + Math.random() * 70,
          speed: 5 + Math.random() * 7,
          angle: angle,
          headRadius,
          headBlur,
          vibratePhase: Math.random() * Math.PI * 2,
          distanceTraveled: 0,
          lifespan,
          fadeOutPoint,
          // Tableau pour stocker les positions précédentes (pour la traînée persistante)
          trailSegments: [],
          // Durée de vie de la tête (plus courte que la traînée)
          headLifespan: lifespan * 0.85,
          // La tête est-elle encore visible
          headVisible: true
        });
      }
    };

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

    const createTrailGhost = (x, y, angle, speed) => {
      // Create a trail segment (line) instead of points
      const startX = x;
      const startY = y;
      const endX = x - Math.cos(angle) * 12; // Longueur de la traînée
      const endY = y - Math.sin(angle) * 12;

      trailGhosts.push({
        startX,
        startY,
        endX,
        endY,
        alpha: 0.5,
        width: 2.2, // Épaisseur de la ligne
        life: 25 + Math.floor(Math.random() * 15),
        startColor: 'rgba(200,220,255,',
        endColor: 'rgba(100,150,255,'
      });
    };

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

    // Satellites traversant l'écran (login uniquement)
    let satelliteL = null;
    let satelliteLTimer = 0;
    let satelliteLVisible = false;
    let nextSatelliteLDelay = 0;
    let satelliteLSpeed = 0.1;

    let satelliteR = null;
    let satelliteRTimer = 0;
    let satelliteRVisible = false;
    let nextSatelliteRDelay = 0;
    let satelliteRSpeed = 0.1;

    if (shootingStarDirection === 'horizontal') {
      // Satellite left -> right
      const spawnSatelliteL = () => {
        satelliteL = {
          x: -8,
          y: canvas.height * (0.4 + Math.random() * 0.2),
          radius: 1.1 + Math.random() * 0.8,
          color: 'rgba(180,220,255,1)',
        };
        satelliteLVisible = true;
        satelliteLSpeed = 0.08 + Math.random() * 0.07;
        nextSatelliteLDelay = 2000 + Math.random() * 4000;
      };
      spawnSatelliteL();
      // Satellite right -> left
      const spawnSatelliteR = () => {
        satelliteR = {
          x: canvas.width + 8,
          y: canvas.height * (0.4 + Math.random() * 0.2),
          radius: 1.1 + Math.random() * 0.8,
          color: 'rgba(180,220,255,1)',
        };
        satelliteRVisible = true;
        satelliteRSpeed = 0.08 + Math.random() * 0.07;
        nextSatelliteRDelay = 3000 + Math.random() * 5000; // offset to avoid sync between satellites
      };
      setTimeout(spawnSatelliteR, 1200 + Math.random() * 2000); // delayed appearance of the 2nd satellite
    }

    let animationFrameId;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Subtle aurora effect (login only)
      if (shootingStarDirection === 'horizontal') {
        const auroraHeight = canvas.height * 0.21;
        const auroraY = auroraHeight * 0.6;
        const time = Date.now() / 2200;
        // Horizontal undulating movement
        const offset = Math.sin(time) * canvas.width * 0.08;

        const grad = ctx.createLinearGradient(
          offset, auroraY, canvas.width + offset, auroraY + auroraHeight
        );
        grad.addColorStop(0, 'rgba(60,180,255,0.17)'); // bleu clair
        grad.addColorStop(0.3, 'rgba(80,255,180,0.23)'); // vert-bleu
        grad.addColorStop(0.6, 'rgba(180,120,255,0.19)'); // violet pâle
        grad.addColorStop(1, 'rgba(60,180,255,0.13)'); // bleu clair
        ctx.save();
        ctx.globalAlpha = 1;
        ctx.filter = 'blur(28px)';
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, auroraHeight * 1.5);
        ctx.filter = 'none';
        ctx.globalAlpha = 1;
        ctx.restore();
      }

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

      // Satellite left -> right (login uniquement)
      if (shootingStarDirection === 'horizontal' && satelliteL) {
        if (satelliteLVisible) {
          satelliteL.x += satelliteLSpeed;
          const now = Date.now();
          const blink = 0.65 + 0.35 * Math.abs(Math.sin(now / 400));
          ctx.save();
          ctx.beginPath();
          ctx.arc(satelliteL.x, satelliteL.y, satelliteL.radius, 0, Math.PI * 2);
          ctx.shadowColor = '#bcdfff';
          ctx.shadowBlur = 12;
          ctx.globalAlpha = blink;
          ctx.fillStyle = satelliteL.color;
          ctx.fill();
          ctx.globalAlpha = 1;
          ctx.shadowBlur = 0;
          ctx.restore();
          if (satelliteL.x - satelliteL.radius > canvas.width + 8) {
            satelliteLVisible = false;
            satelliteLTimer = 0;
          }
        } else {
          satelliteLTimer += 16;
          if (satelliteLTimer > nextSatelliteLDelay) {
            satelliteL.x = -8;
            satelliteL.y = canvas.height * (0.4 + Math.random() * 0.2);
            satelliteL.radius = 1.1 + Math.random() * 0.8;
            satelliteLVisible = true;
            satelliteLSpeed = 0.08 + Math.random() * 0.07;
            nextSatelliteLDelay = 2000 + Math.random() * 4000;
          }
        }
      }
      // Satellite right -> left (login uniquement)
      if (shootingStarDirection === 'horizontal' && satelliteR) {
        if (satelliteRVisible) {
          satelliteR.x -= satelliteRSpeed;
          const now = Date.now() + 1000; // blinking phase offset
          const blink = 0.65 + 0.35 * Math.abs(Math.sin(now / 400));
          ctx.save();
          ctx.beginPath();
          ctx.arc(satelliteR.x, satelliteR.y, satelliteR.radius, 0, Math.PI * 2);
          ctx.shadowColor = '#bcdfff';
          ctx.shadowBlur = 12;
          ctx.globalAlpha = blink;
          ctx.fillStyle = satelliteR.color;
          ctx.fill();
          ctx.globalAlpha = 1;
          ctx.shadowBlur = 0;
          ctx.restore();
          if (satelliteR.x + satelliteR.radius < -8) {
            satelliteRVisible = false;
            satelliteRTimer = 0;
          }
        } else {
          satelliteRTimer += 16;
          if (satelliteRTimer > nextSatelliteRDelay) {
            satelliteR.x = canvas.width + 8;
            satelliteR.y = canvas.height * (0.6 + Math.random() * 0.2);
            satelliteR.radius = 1.1 + Math.random() * 0.8;
            satelliteRVisible = true;
            satelliteRSpeed = 0.08 + Math.random() * 0.07;
            nextSatelliteRDelay = 3000 + Math.random() * 5000;
          }
        }
      }

      createShootingStar();
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const star = shootingStars[i];

        // Calcul de l'angle avec effet de vibration
        const vibrAngle = star.angle + Math.sin(star.vibratePhase + Date.now() / 200) * 0.03;

        // Vérifie si la tête doit disparaître (avant la traînée)
        if (star.headVisible && star.distanceTraveled >= star.headLifespan) {
          star.headVisible = false;
        }

        // Calcul de l'opacité de la traînée en fonction de la distance parcourue
        let trailOpacity = 1;
        if (star.distanceTraveled > star.fadeOutPoint) {
          trailOpacity = Math.max(0, 1 - ((star.distanceTraveled - star.fadeOutPoint) / (star.lifespan - star.fadeOutPoint)));
        }

        // Stocke la position actuelle pour la traînée persistante (beaucoup plus longue)
        if (star.trailSegments.length < 50) { // Much thicker line segments for a longer trail
          star.trailSegments.push({
            x: star.x,
            y: star.y,
            opacity: trailOpacity
          });
        } else {
          // Shift segments (remove the oldest, add the new one)
          // Fait glisser les segments (supprime le plus ancien, ajoute le nouveau)
          star.trailSegments.shift();
          star.trailSegments.push({
            x: star.x,
            y: star.y,
            opacity: trailOpacity
          });
        }

        // Crée des "fantômes" de traînée qui persistent après le passage
        if (Math.random() < 0.3) { // Fréquence réduite pour moins de points
          createTrailGhost(star.x, star.y, star.angle, star.speed);
        }

        // Dessine la tête de l'étoile filante (seulement si elle est encore visible)
        if (star.headVisible) {
          // Position de la tête
          const headX = star.x + Math.cos(vibrAngle) * star.speed * 3;
          const headY = star.y + Math.sin(vibrAngle) * star.speed * 3;

          // Opacité de la tête
          let headOpacity = 1;
          if (star.distanceTraveled > star.fadeOutPoint) {
            const fadeProgress = (star.distanceTraveled - star.fadeOutPoint) / (star.headLifespan - star.fadeOutPoint);
            headOpacity = Math.max(0, 1 - fadeProgress);
          }

          // Dessine la tête lumineuse
          ctx.save();
          ctx.save();
          ctx.translate(headX, headY);
          ctx.rotate(vibrAngle);
          ctx.scale(2.2, 1); // Allongement horizontal (ajuster le facteur pour l'effet désiré)
          ctx.beginPath();
          ctx.arc(0, 0, star.headRadius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(230,240,255,${headOpacity})`;
          ctx.shadowColor = `rgba(230,240,255,${headOpacity})`;
          ctx.shadowBlur = star.headBlur * headOpacity;
          ctx.globalAlpha = 0.93 * headOpacity;
          ctx.fill();
          ctx.globalAlpha = 1;
          ctx.shadowBlur = 0;
          ctx.restore();

          // Génère des particules/étincelles derrière la tête
          if (Math.random() < 0.9 * headOpacity) {
            spawnShootingStarParticle(
              headX - Math.cos(vibrAngle) * 2,
              headY - Math.sin(vibrAngle) * 2,
              vibrAngle
            );
          }
        }

        // Déplacement de l'étoile filante
        star.x += Math.cos(star.angle) * star.speed;
        star.y += Math.sin(star.angle) * star.speed;

        // Mise à jour de la distance parcourue
        star.distanceTraveled += star.speed;

        // Suppression de l'étoile si elle sort de l'écran ou si la traînée est complètement invisible
        if (star.x > canvas.width || star.y > canvas.height ||
          star.distanceTraveled >= star.lifespan ||
          trailOpacity <= 0.05) {
          shootingStars.splice(i, 1);
        }
      }

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

      // Affichage des segments de traînée (qui persistent après la disparition de l'étoile)
      for (let i = trailGhosts.length - 1; i >= 0; i--) {
        const ghost = trailGhosts[i];
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(ghost.startX, ghost.startY);
        ctx.lineTo(ghost.endX, ghost.endY);

        // Crée un dégradé pour la traînée
        const gradient = ctx.createLinearGradient(
          ghost.startX, ghost.startY, ghost.endX, ghost.endY
        );
        gradient.addColorStop(0, `${ghost.startColor}${ghost.alpha})`);
        gradient.addColorStop(1, `${ghost.endColor}${ghost.alpha * 0.6})`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = ghost.width;
        ctx.shadowColor = '#bcdfff';
        ctx.shadowBlur = 5;
        ctx.stroke();
        ctx.restore();

        // Gradual opacity decrease
        ghost.alpha *= 0.96;
        ghost.life--;

        // Remove when invisible or life is over
        if (ghost.life <= 0 || ghost.alpha < 0.05) {
          trailGhosts.splice(i, 1);
        }
      }

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
