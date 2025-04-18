import React, { useMemo, useRef, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useUserData } from '@/hooks/useDashboardQueries';
import { FileText, Upload, Clock, CheckCircle2, XCircle, School, ArrowRight, Calendar, BookOpen, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import gsap from 'gsap';

// Header sticky animé
const GuestHeader = ({ firstName }) => {
  const headerRef = useRef(null);
  useEffect(() => {
    gsap.fromTo(headerRef.current, { y: -60, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out' });
  }, []);
  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-30 flex justify-center"
      style={{ pointerEvents: 'none' }}
    >
      <div
        className="w-full max-w-[1100px] bg-gradient-to-r from-blue-100 via-blue-50 to-blue-200 rounded-2xl shadow-lg px-6 py-4 sm:py-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-0 border border-blue-200"
        style={{ pointerEvents: 'auto' }}
      >
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-blue-900 mb-1">
            Bienvenue{firstName ? `, ${firstName}` : ' !'}
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-blue-900/80 max-w-2xl">
            Finalisez votre inscription et explorez nos formations d'exception. Un parcours immersif vous attend !
          </p>
        </div>
        <div className="flex-shrink-0 w-full sm:w-auto flex justify-center sm:justify-end">
          <Button size="sm" className="bg-blue-600/90 text-white font-bold border border-blue-300 hover:bg-blue-700/90 transition-all shadow-lg">
            Découvrir les formations
          </Button>
        </div>
      </div>
    </header>
  );
};

// Progression circulaire animée
const CircularProgress = ({ value, size = 90, stroke = 8, color = '#6366f1', bg = '#e5e7eb', children }) => {
  const circleRef = useRef(null);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  useEffect(() => {
    gsap.to(circleRef.current, { strokeDashoffset: offset, duration: 1.2, ease: 'power2.out' });
  }, [offset]);
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bg}
          strokeWidth={stroke}
        />
        <circle
          ref={circleRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
};

// Card Document animée
const DocumentCard = ({ doc, idx }) => {
  const cardRef = useRef(null);
  useEffect(() => {
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 40, rotateZ: 3 },
      { opacity: 1, y: 0, rotateZ: 0, duration: 0.8, delay: idx * 0.08, ease: 'power3.out' }
    );
  }, [idx]);
  // Hover animation
  const handleMouseEnter = () => {
    gsap.to(cardRef.current, {
      boxShadow: '0 8px 32px 0 rgba(30,64,175,0.18)',
      y: -8,
      borderColor: '#528eb2',
      background: 'linear-gradient(120deg, #528eb2 0%, #2563eb 60%, #60a5fa 100%)',
      duration: 0.4,
      ease: 'power2.out',
    });
  };
  const handleMouseLeave = () => {
    gsap.to(cardRef.current, {
      boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)',
      y: 0,
      borderColor: 'rgba(255,255,255,0.2)',
      background: 'rgba(255,255,255,0.7)',
      duration: 0.4,
      ease: 'power2.in',
    });
  };
  return (
    <div
      ref={cardRef}
      tabIndex={0}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="rounded-2xl border-2 border-white/20 dark:border-gray-700/40 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg p-4 sm:p-6 flex flex-col gap-2 min-h-[120px] group relative overflow-hidden transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
      style={{ transitionDelay: `${idx * 80}ms` }}
    >
      <div className="absolute -top-2 -right-2 z-10">
        {doc.status === 'validated' && <CheckCircle2 className="h-6 w-6 text-green-400 drop-shadow-lg" />}
        {doc.status === 'pending' && <Clock className="h-6 w-6 text-amber-400 drop-shadow-lg animate-pulse" />}
        {doc.status === 'not_submitted' && <XCircle className="h-6 w-6 text-gray-300 dark:text-gray-600 drop-shadow-lg" />}
      </div>
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-blue-400" />
        <span className="font-semibold text-gray-900 dark:text-white">{doc.name}</span>
        {doc.required ? (
          <Badge variant="outline" className="text-xs font-normal border-red-200 text-red-700 dark:border-red-900 dark:text-red-400">Requis</Badge>
        ) : (
          <Badge variant="outline" className="text-xs font-normal">Optionnel</Badge>
        )}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-300">{doc.description}</p>
      {doc.status !== 'validated' && (
        <Button size="sm" variant="ghost" className="mt-2 w-fit bg-gradient-to-r from-blue-500 via-blue-400 to-blue-300 text-white shadow-md">
          <Upload className="h-4 w-4 mr-1" /> Soumettre
        </Button>
      )}
    </div>
  );
};

// Grille Documents animée
const DocumentsGrid = () => {
  const documents = [
    { id: 1, name: "Carte d'identité", status: "not_submitted", required: true, description: "Carte nationale d'identité, passeport ou titre de séjour valide" },
    { id: 2, name: "Diplôme(s)", status: "pending", required: true, description: "Dernier diplôme obtenu ou relevé de notes" },
    { id: 3, name: "CV", status: "validated", required: true, description: "Curriculum Vitae à jour" },
    { id: 4, name: "Lettre de motivation", status: "not_submitted", required: true, description: "Lettre expliquant votre motivation à rejoindre cette formation" },
    { id: 5, name: "Portfolio", status: "not_submitted", required: false, description: "Exemples de projets personnels (optionnel mais recommandé)" },
    { id: 6, name: "Lettre de recommandation", status: "not_submitted", required: false, description: "Recommandation d'un ancien professeur ou employeur (optionnel)" }
  ];
  const completedDocs = documents.filter(doc => doc.status === 'validated').length;
  const totalRequiredDocs = documents.filter(doc => doc.required).length;
  const progress = (completedDocs / totalRequiredDocs) * 100;
  const gridRef = useRef(null);
  useEffect(() => {
    gsap.fromTo(gridRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1, delay: 0.2, ease: 'power3.out' });
  }, []);
  return (
    <section ref={gridRef} className="flex flex-col items-center justify-center min-h-[420px] bg-white/70 dark:bg-gray-900/70 rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 w-full max-w-xl mx-auto flex-shrink-0">
      <div className="mb-6 flex flex-col items-center">
        <CircularProgress value={progress} color="#528eb2" bg="#e0e7ef">
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-300">{Math.round(progress)}%</span>
          <span className="block text-xs text-gray-500 dark:text-gray-300">complété</span>
        </CircularProgress>
        <h2 className="mt-6 text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <FileText className="h-6 w-6 text-blue-400" /> Documents à fournir
        </h2>
        <p className="text-gray-500 dark:text-gray-300 mt-1">Finalisez votre inscription en téléchargeant les documents requis.</p>
      </div>
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-4">
        {documents.map((doc, idx) => <DocumentCard key={doc.id} doc={doc} idx={idx} />)}
      </div>
      <Button className="mt-8 w-full bg-gradient-to-r from-blue-700 via-blue-500 to-blue-300 text-white shadow-lg">
        Gérer mes documents <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </section>
  );
};

// Card Formation animée
const FormationCard = ({ formation, idx }) => {
  const cardRef = useRef(null);
  const [hovered, setHovered] = React.useState(false);
  useEffect(() => {
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 40, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8, delay: idx * 0.12, ease: 'power3.out' }
    );
  }, [idx]);
  // Hover animation
  const handleMouseEnter = () => {
    setHovered(true);
    gsap.to(cardRef.current, {
      boxShadow: '0 8px 32px 0 rgba(30,64,175,0.18)',
      y: -8,
      borderColor: '#528eb2',
      background: 'linear-gradient(120deg, #528eb2 0%, #2563eb 60%, #60a5fa 100%)',
      duration: 0.4,
      ease: 'power2.out',
    });
  };
  const handleMouseLeave = () => {
    setHovered(false);
    gsap.to(cardRef.current, {
      boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)',
      y: 0,
      borderColor: 'rgba(255,255,255,0.2)',
      background: 'rgba(255,255,255,0.9)',
      duration: 0.4,
      ease: 'power2.in',
    });
  };
  return (
    <div
      ref={cardRef}
      tabIndex={0}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="min-w-[280px] max-w-[340px] w-full flex flex-col rounded-2xl border-2 border-white/20 dark:border-gray-700/40 bg-white/90 dark:bg-gray-900/90 shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-400 relative overflow-hidden mt-6"
      style={{ transitionDelay: `${idx * 80}ms` }}
    >
      <div className="relative h-40 w-full rounded-t-2xl overflow-hidden">
        <img src={formation.image} alt={formation.name} className="object-cover w-full h-full" />
        {hovered && <div className="absolute inset-0 bg-black/30 transition-all duration-200" />}
        <div className="absolute top-2 right-2 flex gap-2 z-10">
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">{formation.domain}</Badge>
          <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200">{formation.specialization}</Badge>
        </div>
      </div>
      <div className={`flex-1 flex flex-col p-4 sm:p-5 z-10 ${hovered ? 'text-white' : 'text-gray-900 dark:text-white'}`}> 
        <h3 className={`font-bold text-lg mb-1 ${hovered ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{formation.name}</h3>
        <p className={`text-sm mb-2 ${hovered ? 'text-white/90' : 'text-gray-500 dark:text-gray-300'}`}>{formation.description}</p>
        <div className="flex items-center gap-3 mb-2">
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">{formation.level}</Badge>
          <span className={`text-xs flex items-center gap-1 ${hovered ? 'text-white/80' : 'text-gray-400'}`}><Calendar className="h-4 w-4" /> {formation.startDate}</span>
        </div>
        <span className={`text-xs flex items-center gap-1 mb-2 ${hovered ? 'text-white/80' : 'text-gray-400'}`}><BookOpen className="h-4 w-4" /> Promotion {formation.promotion}</span>
        <Button size="sm" className={`mt-auto bg-gradient-to-r from-blue-500 via-blue-400 to-blue-300 text-white shadow-md ${hovered ? 'ring-2 ring-white' : ''}`}>En savoir plus</Button>
      </div>
    </div>
  );
};

// Carrousel Formations animé
const FormationsCarousel = () => {
  const formations = [
    { id: 1, name: "Développement Web Fullstack", description: "Formation complète au développement web front-end et back-end", domain: "Informatique", specialization: "Développement Web", level: "Bac+3/4", startDate: "15 septembre 2023", promotion: "2023-2024", image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80" },
    { id: 2, name: "Data Science & Intelligence Artificielle", description: "Maîtrisez l'analyse de données et les algorithmes d'IA", domain: "Informatique", specialization: "Data Science", level: "Bac+5", startDate: "10 octobre 2023", promotion: "2023-2024", image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=400&q=80" },
    { id: 3, name: "Cybersécurité", description: "Devenez expert en sécurité informatique et protection des données", domain: "Informatique", specialization: "Sécurité", level: "Bac+5", startDate: "5 novembre 2023", promotion: "2023-2024", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80" }
  ];
  const carouselRef = useRef(null);
  useEffect(() => {
    gsap.fromTo(carouselRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1, delay: 0.3, ease: 'power3.out' });
  }, []);
  return (
    <section
      ref={carouselRef}
      className="p-4 sm:p-6 md:p-8 flex flex-col min-h-[420px] rounded-3xl shadow-2xl w-full max-w-[1400px] mx-auto mt-8 lg:mt-0 flex-shrink-0 overflow-visible pt-12"
    >
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
        <School className="h-6 w-6 text-blue-400" /> Formations disponibles
      </h2>
      <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-2 hide-scrollbar">
        {formations.map((formation, idx) => <FormationCard key={formation.id} formation={formation} idx={idx} />)}
      </div>
      <div className="flex justify-end mt-6">
        <Button variant="outline" className="border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-300 font-semibold">
          Voir toutes les formations <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </section>
  );
};

// Main Dashboard
const GuestDashboard = () => {
  const { data: user, isLoading, error } = useUserData();

  return (
    <DashboardLayout 
      error={error} 
      isLoading={isLoading}
      user={user}
      headerIcon={User}
      headerTitle="Tableau de bord invité"
      className="min-h-screen"
      showHeader={false}
    >
      <GuestHeader firstName={user?.firstName} />
      <div className="w-full max-w-[1400px] mx-auto px-2 sm:px-4 min-w-0">
        <FormationsCarousel />
      </div>
    </DashboardLayout>
  );
};

export default GuestDashboard; 