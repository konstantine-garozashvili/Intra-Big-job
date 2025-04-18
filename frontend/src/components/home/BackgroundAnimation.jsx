import React from 'react';
import Star from './Star';
import ShootingStar from './ShootingStar';
import Particle from './Particle';

/**
 * Background Animation component that combines stars, shooting stars, and particles
 */
const BackgroundAnimation = () => {
  // Generate random positions for stars
  const stars = Array.from({ length: 50 }, (_, i) => ({
    id: `star-${i}`,
    top: Math.random() * 100,
    left: Math.random() * 100,
    size: Math.random() * 2 + 1,
    delay: Math.random() * 5,
  }));

  // Generate random positions for shooting stars
  const shootingStars = Array.from({ length: 5 }, (_, i) => ({
    id: `shooting-star-${i}`,
    top: Math.random() * 70,
    left: Math.random() * 70,
    size: Math.random() * 2 + 1.5,
    delay: Math.random() * 10 + i * 2,
    duration: Math.random() * 1.5 + 1,
    angle: Math.random() * 60 + 20,
  }));

  // Generate random positions for particles
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: `particle-${i}`,
    top: Math.random() * 100,
    left: Math.random() * 100,
    size: Math.random() * 6 + 2,
    color: i % 3 === 0 
      ? 'rgba(64, 156, 255, 0.8)' 
      : i % 3 === 1 
        ? 'rgba(138, 43, 226, 0.7)' 
        : 'rgba(0, 191, 255, 0.6)',
    delay: Math.random() * 10,
    duration: Math.random() * 5 + 5,
    amplitude: Math.random() * 30 + 10,
  }));

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Stars */}
      {stars.map((star) => (
        <Star
          key={star.id}
          top={star.top}
          left={star.left}
          size={star.size}
          delay={star.delay}
        />
      ))}

      {/* Shooting Stars */}
      {shootingStars.map((star) => (
        <ShootingStar
          key={star.id}
          top={star.top}
          left={star.left}
          size={star.size}
          delay={star.delay}
          duration={star.duration}
          angle={star.angle}
        />
      ))}

      {/* Particles */}
      {particles.map((particle) => (
        <Particle
          key={particle.id}
          top={particle.top}
          left={particle.left}
          size={particle.size}
          color={particle.color}
          delay={particle.delay}
          duration={particle.duration}
          amplitude={particle.amplitude}
        />
      ))}
    </div>
  );
};

export default BackgroundAnimation;
