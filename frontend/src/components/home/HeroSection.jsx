import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import FloatingElement from './FloatingElement';
import Planet3D from './Planet3D';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, SplitText);

/**
 * Hero Section component for the home page with animated elements
 */
const HeroSection = ({ onExploreClick }) => {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const descriptionRef = useRef(null);
  const buttonsRef = useRef(null);
  const planetsRef = useRef([]);

  useEffect(() => {
    // Create text splits
    const headingSplit = new SplitText(headingRef.current, { type: "chars, words" });
    const descriptionSplit = new SplitText(descriptionRef.current, { type: "lines" });
    
    // Create timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top center",
        end: "bottom top",
        toggleActions: "play none none reverse"
      }
    });

    // Animate heading
    tl.from(headingSplit.chars, {
      opacity: 0,
      y: 50,
      rotateX: -90,
      stagger: 0.02,
      duration: 0.8,
      ease: "back.out(1.7)"
    })
    // Animate description
    .from(descriptionSplit.lines, {
      opacity: 0,
      y: 20,
      stagger: 0.1,
      duration: 0.6
    }, "-=0.4")
    // Animate buttons - Modified animation
    .from(buttonsRef.current?.children || [], {
      opacity: 0,
      y: 30,
      stagger: 0.2,
      duration: 0.6,
      clearProps: "all" // Clear properties after animation
    }, "-=0.2");

    // Parallax effect on planets
    planetsRef.current.forEach((planet, index) => {
      gsap.to(planet, {
        y: `${(index + 1) * 100}`,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1.5,
          toggleActions: "play none none reverse"
        }
      });
    });

    // Cleanup
    return () => {
      headingSplit.revert();
      descriptionSplit.revert();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20 overflow-hidden">
      {/* Main content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <h1 ref={headingRef} className="text-4xl md:text-6xl font-bold text-white mb-6">
          <span className="block">Explorez l'Univers de</span>
          <span className="block text-blue-500 font-extrabold">
            l'Apprentissage Numérique
          </span>
        </h1>
        
        <p ref={descriptionRef} className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
          Découvrez une nouvelle dimension de l'éducation en ligne avec notre plateforme
          interactive et immersive. Apprenez à votre rythme, explorez des technologies
          de pointe et rejoignez une communauté passionnée.
        </p>
        
        <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-4 justify-center opacity-100">
          <Link to="/formation-finder">
            <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#001a38] to-[#0a3c6e] rounded-full text-white font-medium text-lg shadow-lg hover:scale-105 transition-transform">
              Trouver ma formation
            </button>
          </Link>
          
          <Link to="/register">
            <button className="w-full sm:w-auto px-8 py-4 bg-[#001a38]/60 backdrop-blur-sm rounded-full text-white font-medium text-lg border border-[#0a3c6e]/50 hover:border-blue-400 hover:scale-105 transition-transform">
              Rejoindre l'aventure
            </button>
          </Link>
        </div>
      </div>
      
      {/* Decorative planets with refs for parallax */}
      <div ref={el => planetsRef.current[0] = el} className="absolute">
        <FloatingElement amplitude={15} duration={7}>
          <Planet3D 
            className="top-1/4 -right-20 md:right-10"
            color="rgba(10, 60, 110, 0.8)"
            size={100}
            orbitDuration={20}
            orbitDistance={30}
            onClick={onExploreClick}
          >
            <div className="w-full h-full bg-gradient-to-br from-[#0a3c6e] to-[#001a38]" />
          </Planet3D>
        </FloatingElement>
      </div>
      
      <div ref={el => planetsRef.current[1] = el} className="absolute">
        <FloatingElement amplitude={20} duration={8}>
          <Planet3D 
            className="bottom-1/4 -left-10 md:left-20"
            color="rgba(0, 26, 56, 0.8)"
            size={80}
            orbitDuration={25}
            orbitDistance={20}
            onClick={onExploreClick}
          >
            <div className="w-full h-full bg-gradient-to-br from-[#0a3c6e] to-[#002147]" />
          </Planet3D>
        </FloatingElement>
      </div>
      
      <div ref={el => planetsRef.current[2] = el} className="absolute">
        <FloatingElement amplitude={12} duration={6}>
          <Planet3D 
            className="top-1/3 left-1/4"
            color="rgba(0, 51, 102, 0.7)"
            size={60}
            orbitDuration={15}
            orbitDistance={15}
            onClick={onExploreClick}
          >
            <div className="w-full h-full bg-gradient-to-br from-[#003366] to-[#001a38]" />
          </Planet3D>
        </FloatingElement>
      </div>
    </section>
  );
};

export default HeroSection;