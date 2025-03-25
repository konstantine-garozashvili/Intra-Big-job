import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, BookOpen, Award, Activity, Users, ChevronRight } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

const VisualConcept = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Track mouse movement for 3D effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (heroRef.current) {
        const { clientX, clientY } = e;
        const rect = heroRef.current.getBoundingClientRect();
        const x = (clientX - rect.left) / rect.width - 0.5;
        const y = (clientY - rect.top) / rect.height - 0.5;
        setMousePosition({ x, y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Mock data for cards
  const cards = [
    { 
      id: 1, 
      title: 'Emploi du temps', 
      description: 'Consultez votre emploi du temps et vos cours à venir',
      icon: <Calendar className="h-8 w-8 text-blue-400" />,
      color: 'from-blue-600 to-blue-400',
      link: '/visual/schedule'
    },
    { 
      id: 2, 
      title: 'Notes et résultats', 
      description: 'Accédez à vos notes, moyennes et résultats d\'examens',
      icon: <BookOpen className="h-8 w-8 text-indigo-400" />,
      color: 'from-indigo-600 to-indigo-400',
      link: '/visual/grades'
    },
    { 
      id: 3, 
      title: 'Projets', 
      description: 'Gérez vos projets, rendus et travaux de groupe',
      icon: <Award className="h-8 w-8 text-cyan-400" />,
      color: 'from-cyan-600 to-cyan-400',
      link: '/visual/projects'
    },
    { 
      id: 4, 
      title: 'Activités', 
      description: 'Découvrez les événements et activités du campus',
      icon: <Activity className="h-8 w-8 text-blue-300" />,
      color: 'from-blue-500 to-blue-300',
      link: '/visual/activities'
    },
    { 
      id: 5, 
      title: 'Communauté', 
      description: 'Connectez-vous avec vos camarades et enseignants',
      icon: <Users className="h-8 w-8 text-indigo-300" />,
      color: 'from-indigo-500 to-indigo-300',
      link: '/visual/community'
    }
  ];

  // Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-950 to-gray-900 text-white">
      {/* Loading overlay */}
      {!isLoaded && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 z-50">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* 3D Hero Section */}
      <section 
        ref={heroRef}
        className="relative min-h-[70vh] flex items-center justify-center overflow-hidden"
        style={{
          perspective: "1000px"
        }}
      >
        {/* Background 3D elements */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            transform: `rotateX(${mousePosition.y * 10}deg) rotateY(${mousePosition.x * 10}deg)`,
            transition: "transform 0.1s ease-out"
          }}
        >
          <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-blue-500 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-indigo-600 blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-cyan-500 blur-3xl"></div>
        </div>

        {/* Grid lines */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gNDAgMCBMIDAgMCAwIDQwIiBmaWxsPSJub25lIiBzdHJva2U9IiMzMTQxNjgiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiAvPjwvc3ZnPg==')] opacity-10"></div>

        {/* Content container */}
        <motion.div 
          className="relative z-10 container mx-auto px-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.8,
            delay: 0.3
          }}
          style={{
            transform: `rotateX(${mousePosition.y * -3}deg) rotateY(${mousePosition.x * 3}deg)`,
            transition: "transform 0.2s ease-out"
          }}
        >
          <Badge className="mb-6 bg-blue-500/20 text-blue-300 border border-blue-500/30 px-4 py-2 text-sm backdrop-blur-sm">
            School Project 2025
          </Badge>
          <h1 className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500">
            Visual Concept
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed">
            Une expérience éducative immersive avec des fonctionnalités intuitives et une interface 3D moderne
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-8 py-6 rounded-full text-lg group relative overflow-hidden">
              <span className="relative z-10 flex items-center gap-2">
                Explorer
                <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></span>
              <span className="absolute -inset-[3px] bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur opacity-30 group-hover:opacity-60 transition-opacity"></span>
            </Button>
            <Button variant="outline" className="border-blue-500/50 text-blue-300 hover:bg-blue-900/20 px-8 py-6 rounded-full text-lg backdrop-blur-sm">
              En savoir plus
            </Button>
          </div>
          
          {/* 3D Floating Indicator */}
          <motion.div 
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            animate={{ 
              y: [0, 10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="h-12 w-6 rounded-full border-2 border-blue-500/50 flex justify-center">
              <motion.div 
                className="h-2 w-2 rounded-full bg-blue-400 mt-2"
                animate={{ 
                  y: [0, 12, 0],
                  opacity: [0.6, 1, 0.6]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Card-Based Layout */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
              Fonctionnalités Principales
            </h2>
            <p className="text-blue-200 max-w-3xl mx-auto">
              Découvrez les outils conçus pour améliorer votre expérience d'apprentissage avec une interface interactive et moderne
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {cards.map((card) => (
              <motion.div
                key={card.id}
                variants={itemVariants}
                whileHover={{ 
                  y: -10,
                  transition: { duration: 0.2 }
                }}
                className="h-full"
              >
                <Card className="bg-gray-900/60 backdrop-blur-lg border-blue-500/20 hover:border-blue-400/40 h-full flex flex-col overflow-hidden group relative">
                  {/* Glow effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-10 transition-opacity rounded-lg`}></div>
                  
                  {/* Card content */}
                  <div className="p-8 flex-grow flex flex-col">
                    <div className="mb-4 bg-blue-950/80 rounded-xl p-4 w-fit">
                      {card.icon}
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-white group-hover:text-blue-300 transition-colors">{card.title}</h3>
                    <p className="text-blue-200/70 mb-6 flex-grow">{card.description}</p>
                    <Button 
                      className="mt-auto bg-transparent border border-blue-500/30 text-blue-300 hover:bg-blue-900/30 group-hover:border-blue-400"
                      onClick={() => navigate(card.link)}
                    >
                      <span className="flex items-center gap-2">
                        Accéder
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features section with 3D depth */}
      <section className="py-24 relative">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl"></div>
          <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-indigo-600/20 blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                Expérience utilisateur immersive
              </h2>
              <p className="text-blue-200 mb-8 leading-relaxed">
                Notre interface combine des éléments visuels modernes avec une navigation intuitive, offrant une expérience utilisateur fluide et engageante qui transforme votre apprentissage.
              </p>
              <ul className="space-y-4">
                {[
                  "Interface 3D interactive et réactive",
                  "Navigation fluide entre les différentes fonctionnalités",
                  "Design adaptatif pour tous vos appareils",
                  "Animations subtiles pour une meilleure expérience"
                ].map((item, i) => (
                  <motion.li 
                    key={i} 
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <CheckCircle className="h-6 w-6 text-blue-400 shrink-0 mt-0.5" />
                    <span className="text-blue-100">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* 3D mockup */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div 
                className="relative rounded-lg shadow-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-blue-950 border border-blue-500/20"
                style={{
                  transform: "perspective(1200px) rotateY(-15deg) rotateX(10deg)",
                  transformStyle: "preserve-3d"
                }}
              >
                <div className="p-1">
                  <div className="bg-gray-800 rounded-t-md p-2 flex items-center">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                  </div>
                  <div className="bg-gray-900 h-96 p-4 rounded-b-md flex flex-col">
                    <div className="bg-blue-950/50 h-12 rounded-md mb-4 flex items-center px-4">
                      <div className="w-32 h-4 rounded-full bg-blue-500/30"></div>
                      <div className="ml-auto flex gap-3">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-4 h-4 rounded-full bg-blue-500/30"></div>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-4 flex-grow">
                      <div className="w-1/3">
                        <div className="bg-blue-950/40 rounded-md h-full p-3">
                          <div className="w-full h-6 rounded-md bg-blue-500/20 mb-3"></div>
                          {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="w-full h-4 rounded-md bg-blue-500/10 mb-2"></div>
                          ))}
                        </div>
                      </div>
                      <div className="w-2/3 space-y-4">
                        <div className="bg-blue-950/30 rounded-md h-1/2 p-3">
                          <div className="w-1/3 h-4 rounded-md bg-blue-500/20 mb-3"></div>
                          <div className="flex gap-2">
                            {[1, 2, 3].map(i => (
                              <div key={i} className="w-full h-16 rounded-md bg-blue-500/10"></div>
                            ))}
                          </div>
                        </div>
                        <div className="bg-blue-950/30 rounded-md h-1/2 p-3">
                          <div className="w-1/3 h-4 rounded-md bg-blue-500/20 mb-3"></div>
                          <div className="w-full h-20 rounded-md bg-blue-500/10"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Glowing edge effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg blur opacity-30"></div>
              </div>
              {/* Shadow */}
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-4/5 h-8 bg-blue-500/10 blur-xl rounded-full"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <motion.div 
          className="max-w-4xl mx-auto text-center px-6 relative z-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Badge className="mb-6 bg-blue-500/20 text-blue-300 border border-blue-500/30 px-4 py-2">
            Rejoignez-nous
          </Badge>
          <h2 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500">
            Prêt à transformer votre expérience académique ?
          </h2>
          <p className="text-blue-200 mb-10 leading-relaxed">
            Découvrez comment notre interface moderne peut améliorer votre parcours d'apprentissage et vous aider à atteindre vos objectifs académiques.
          </p>
          <Button className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-10 py-6 rounded-full text-lg relative group">
            <span className="relative z-10">Commencer maintenant</span>
            <span className="absolute -inset-[3px] bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur opacity-30 group-hover:opacity-60 transition-opacity"></span>
          </Button>
        </motion.div>
        
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-3xl h-1/2 bg-blue-600/10 blur-3xl rounded-full"></div>
        </div>
      </section>
    </div>
  );
};

export default VisualConcept;
