import React, { useMemo, useRef, useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useUserData } from '@/hooks/useDashboardQueries';
import { FileText, Upload, Clock, CheckCircle2, XCircle, School, ArrowRight, Calendar, BookOpen, User, ChevronDown, ChevronUp, Users, Award, Clock3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import gsap from 'gsap';
import { 
  Expandable, 
  ExpandableCard, 
  ExpandableCardHeader, 
  ExpandableCardContent, 
  ExpandableCardFooter,
  ExpandableContent,
  ExpandableTrigger
} from '@/components/ui/expandable';
import { useClickAway } from 'react-use';

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
        className="w-full max-w-[1100px] bg-gradient-to-r from-blue-100 via-blue-50 to-blue-200 px-6 py-4 sm:py-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-0 border border-blue-200"
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
          <Button size="sm" className="bg-blue-600/90 text-white font-bold border border-blue-300 hover:bg-blue-700/90 transition-all">
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

// Accordéon Expandable pour formations (une seule ouverte à la fois)
const FormationsGrid = () => {
  const formations = [
    {
      id: 1,
      name: "Design Sync",
      description: "Weekly design sync to discuss ongoing projects, share updates, and address any design-related challenges.",
      domain: "Design",
      specialization: "UI/UX",
      level: "All levels",
      startDate: "1:30PM",
      promotion: "2023-2024",
      duration: "1h",
      skills: ["Figma", "Prototyping", "Teamwork"],
      image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: 2,
      name: "Web Fullstack",
      description: "Formation complète au développement web front-end et back-end avec React et Node.js.",
      domain: "Informatique",
      specialization: "Développement Web",
      level: "Bac+3/4",
      startDate: "15 septembre 2023",
      promotion: "2023-2024",
      duration: "12 mois",
      skills: ["JavaScript", "React", "Node.js", "Express", "MongoDB"],
      image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: 3,
      name: "Data Science & IA",
      description: "Maîtrisez l'analyse de données et les algorithmes d'intelligence artificielle pour des applications concrètes.",
      domain: "Informatique",
      specialization: "Data Science",
      level: "Bac+5",
      startDate: "10 octobre 2023",
      promotion: "2023-2024",
      duration: "18 mois",
      skills: ["Python", "Pandas", "TensorFlow", "Scikit-learn", "NLP"],
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: 4,
      name: "Cybersécurité",
      description: "Devenez expert en sécurité informatique et protection des données sensibles contre les cyberattaques.",
      domain: "Informatique",
      specialization: "Sécurité",
      level: "Bac+5",
      startDate: "5 novembre 2023",
      promotion: "2023-2024",
      duration: "15 mois",
      skills: ["Pentest", "Cryptographie", "Sécurité réseau", "Forensics", "OSINT"],
      image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80"
    }
  ];
  const [openId, setOpenId] = useState(null);
  const cardRefs = useRef([]);

  // Fermer la card ouverte si on clique à l'extérieur
  useEffect(() => {
    if (openId === null) return;
    function handleClick(e) {
      const ref = cardRefs.current[openId];
      if (ref && !ref.contains(e.target)) {
        setOpenId(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [openId]);

  return (
    <section className="p-4 sm:p-6 md:p-8 w-full max-w-4xl mx-auto mt-8 flex-shrink-0 overflow-visible pt-8 pb-40">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
        <School className="h-6 w-6 text-blue-400" /> Formations disponibles
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {formations.map((formation, idx) => (
          <div
            key={formation.id}
            ref={el => cardRefs.current[formation.id] = el}
            style={{ zIndex: idx < 2 ? 20 : 10, position: 'relative' }}
          >
            <Expandable
              expandDirection="both"
              expanded={openId === formation.id}
              onToggle={() => setOpenId(openId === formation.id ? null : formation.id)}
              transitionDuration={0.4}
            >
              <ExpandableCard
                className="mx-auto"
                collapsedSize={{ width: 340, height: 210 }}
                expandedSize={{ width: 420, height: 420 }}
                hoverToExpand={false}
              >
                <ExpandableCardHeader className="p-0">
                  <div className="w-full">
                    <div className="relative h-32 w-full rounded-t-xl overflow-hidden">
                      <img src={formation.image} alt={formation.name} className="object-cover w-full h-full" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10"></div>
                      <div className="absolute top-2 right-2 flex gap-2 z-10">
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">{formation.domain}</Badge>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                        <h3 className="font-bold text-lg text-shadow-sm">{formation.name}</h3>
                        <p className="text-sm text-white/80 text-shadow-sm line-clamp-1">{formation.description}</p>
                      </div>
                    </div>
                  </div>
                </ExpandableCardHeader>
                <ExpandableContent preset="slide-down" stagger={true}>
                  <div className="px-2 py-3">
                    <div className="mb-3">
                      <p className="text-gray-700 dark:text-gray-300">{formation.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                        <div className="flex items-center mb-1">
                          <Calendar className="h-4 w-4 text-blue-500 mr-1" />
                          <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Date de début</span>
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{formation.startDate}</span>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                        <div className="flex items-center mb-1">
                          <BookOpen className="h-4 w-4 text-blue-500 mr-1" />
                          <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Niveau</span>
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{formation.level}</span>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                        <div className="flex items-center mb-1">
                          <Users className="h-4 w-4 text-blue-500 mr-1" />
                          <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Promotion</span>
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{formation.promotion}</span>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                        <div className="flex items-center mb-1">
                          <Clock3 className="h-4 w-4 text-blue-500 mr-1" />
                          <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Durée</span>
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{formation.duration || "12 mois"}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {formation.skills && formation.skills.map((skill, i) => (
                        <Badge key={i} variant="outline" className="bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    <div className="text-gray-600 dark:text-gray-300 text-sm mt-2">
                      {formation.description}
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <Users className="h-5 w-5 text-blue-400" />
                      <span className="font-medium">Attendees:</span>
                      <div className="flex -space-x-2">
                        {[1,2,3,4].map((n) => (
                          <span key={n} className="inline-block w-7 h-7 rounded-full bg-gray-200 border-2 border-white"></span>
                        ))}
                      </div>
                    </div>
                    <Button className="w-full mt-6 bg-red-500 hover:bg-red-600 text-white font-semibold">
                      <svg className="inline-block mr-2 h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553 2.276A2 2 0 0121 14.026V17a2 2 0 01-2 2H5a2 2 0 01-2-2v-2.974a2 2 0 01.447-1.75L8 10m7 0V6a3 3 0 00-6 0v4m6 0H9"></path></svg>
                      Join Meeting
                    </Button>
                    <Button variant="outline" className="w-full mt-2 border-gray-300 text-gray-700">
                      <svg className="inline-block mr-2 h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2h2m10 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m10 0H7"></path></svg>
                      Open Chat
                    </Button>
                  </div>
                </ExpandableContent>
              </ExpandableCard>
            </Expandable>
          </div>
        ))}
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
        <FormationsGrid />
      </div>
    </DashboardLayout>
  );
};

export default GuestDashboard; 