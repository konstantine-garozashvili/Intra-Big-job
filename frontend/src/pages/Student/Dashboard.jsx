import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStudentDashboardData } from '@/hooks/useDashboardQueries';
import DashboardLayout from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  GraduationCap, 
  UserCheck, 
  FolderGit2, 
  Bell,
  ChevronRight,
  User,
  BarChart3,
  BookOpen,
  Trophy,
  Clock,
  ArrowRight,
  Sparkles,
  Zap,
  Activity,
  CheckCircle2,
  FolderCheck,
  Award
} from 'lucide-react';

// Import des composants Chart
import * as RechartsPrimitive from "recharts";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Variants d'animation
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 15, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 400, damping: 25 }
  }
};

const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.4 }
  }
};

const StudentDashboard = () => {
  const { user, isLoading, isError, error } = useStudentDashboardData();

  // Données du graphique radar des compétences
  const competencesData = [
    { name: 'Système', value: 90 },
    { name: 'DevOps', value: 60 },
    { name: 'Base de données', value: 85 },
    { name: 'Cyber Sécurité', value: 70 },
    { name: 'Développement', value: 95 },
    { name: 'Outils', value: 75 },
  ];

  // Configuration pour le graphique radar
  const chartConfig = useMemo(() => ({
    system: { label: "Système", color: "hsl(var(--primary))" },
    devops: { label: "DevOps", color: "hsl(var(--primary))" },
    database: { label: "Base de données", color: "hsl(var(--primary))" },
    security: { label: "Cyber Sécurité", color: "hsl(var(--primary))" },
    development: { label: "Développement", color: "hsl(var(--primary))" },
    tools: { label: "Outils", color: "hsl(var(--primary))" },
  }), []);

  // Données pour les cartes principales
  const mainCards = [
    {
      title: 'Emploi du temps',
      description: 'Consultez votre planning de cours',
      icon: Calendar,
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-50',
      link: '/student/schedule',
      stats: '3 cours aujourd\'hui',
      progress: 75
    },
    {
      title: 'Notes et résultats',
      description: 'Suivez vos performances académiques',
      icon: GraduationCap,
      color: 'from-emerald-500 to-emerald-600',
      textColor: 'text-emerald-50',
      link: '/student/grades',
      stats: 'Moyenne: 16.5/20',
      progress: 82
    },
    {
      title: 'Suivi des absences',
      description: 'Gérez vos absences et justificatifs',
      icon: UserCheck,
      color: 'from-amber-500 to-amber-600',
      textColor: 'text-amber-50',
      link: '/student/absences',
      stats: '98% de présence',
      progress: 98
    },
    {
      title: 'Projets',
      description: 'Vos projets en cours et à venir',
      icon: FolderGit2,
      color: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-50',
      link: '/student/projects',
      stats: '2 projets en cours',
      progress: 65
    }
  ];

  // Prochains événements
  const upcomingEvents = [
    { 
      title: 'Développement Web Avancé', 
      type: 'Cours', 
      time: 'Aujourd\'hui, 14:00 - 17:00',
      location: 'Salle B204',
      icon: BookOpen,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    { 
      title: 'Projet DevOps', 
      type: 'Rendu', 
      time: 'Demain, 23:59',
      location: 'En ligne',
      icon: FolderGit2,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20'
    },
    { 
      title: 'Sécurité des applications', 
      type: 'Examen', 
      time: 'Vendredi, 10:00 - 12:00',
      location: 'Amphithéâtre A',
      icon: GraduationCap,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/20'
    }
  ];

  return (
    <DashboardLayout 
      loading={isLoading} 
      error={isError ? error?.message || 'Une erreur est survenue lors du chargement des données' : null}
      className="min-h-screen bg-gray-50 dark:bg-gray-900"
    >
      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* En-tête du dashboard avec avatar */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, y: -15 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
          }}
          initial="hidden"
          animate="visible"
          className="relative p-6 mb-8 overflow-hidden bg-white shadow-lg dark:bg-gray-800 rounded-xl"
        >
          <div className="flex flex-col items-start justify-between md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-16 w-16 border-4 border-white dark:border-gray-800 shadow-md">
                  <AvatarImage src={user?.avatar} alt={`${user?.firstName} ${user?.lastName}`} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-white text-xl">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">
                  Bienvenue{" "}
                  <span className="relative inline-block px-3 py-1 text-white transition-all duration-300 transform rounded-lg shadow-md bg-gradient-to-r from-blue-500 to-indigo-600 hover:scale-105">
                    <span className="relative inline-block">
                      {user?.firstName || 'Étudiant'}
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-white rounded-lg opacity-0"
                      animate={{
                        opacity: [0, 0.1, 0],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </span>
                </h1>
                <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1.5 mt-1">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span>Tableau de bord étudiant</span>
                </p>
              </div>
            </div>
            <div className="flex items-center mt-4 md:mt-0 gap-3">
              <div className="flex items-center mr-4">
                <Clock className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400" />
                <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
              <Link to="/profile">
                <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Mon profil</span>
                </Button>
              </Link>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
        </motion.div>

        {/* Cartes principales */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8"
        >
          {mainCards.map((card, index) => (
            <motion.div key={index} variants={itemVariants} className="h-full">
              <Link to={card.link} className="block h-full">
                <div className="relative h-full overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group">
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-90 group-hover:opacity-100 transition-opacity`}></div>
                  <div className="relative p-5 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2.5 rounded-lg bg-white/20 backdrop-blur-sm">
                        <card.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="p-1.5 rounded-full bg-white/20 backdrop-blur-sm">
                        <ChevronRight className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    
                    <h2 className="text-xl font-semibold text-white mb-1">
                      {card.title}
                    </h2>
                    <p className="text-white/80 text-sm mb-4">
                      {card.description}
                    </p>
                    
                    <div className="mt-auto">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white/90">{card.stats}</span>
                        <span className="text-sm font-medium text-white/90">{card.progress}%</span>
                      </div>
                      <div className="w-full bg-white/30 rounded-full h-1.5">
                        <div 
                          className="h-1.5 rounded-full bg-white"
                          style={{ width: `${card.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Section principale - Graphique et événements */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Section des compétences */}
          <motion.div 
            variants={fadeInVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-1"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden h-full">
              <div className="p-5 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                      <BarChart3 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Compétences</h3>
                  </div>
                  <Button variant="ghost" size="sm" className="gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 p-0 h-auto hover:bg-transparent">
                    Détails
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="aspect-square w-full p-4">
                <RechartsPrimitive.ResponsiveContainer width="100%" height="100%">
                  <RechartsPrimitive.RadarChart 
                    data={competencesData}
                    margin={{ top: 20, right: 30, bottom: 20, left: 30 }}
                  >
                    <RechartsPrimitive.PolarGrid 
                      gridType="circle"
                      stroke="rgba(148, 163, 184, 0.2)"
                      strokeWidth={1}
                    />
                    <RechartsPrimitive.PolarAngleAxis 
                      dataKey="name"
                      tick={{
                        fill: '#64748b',
                        fontSize: 11,
                        fontWeight: 500
                      }}
                    />
                    <RechartsPrimitive.PolarRadiusAxis 
                      angle={30}
                      domain={[0, 100]}
                      axisLine={false}
                      tick={{
                        fill: '#94a3b8',
                        fontSize: 10
                      }}
                      tickCount={5}
                    />
                    <RechartsPrimitive.Radar
                      name="Compétences"
                      dataKey="value"
                      stroke="rgba(99, 102, 241, 0.8)"
                      fill="rgba(99, 102, 241, 0.4)"
                      fillOpacity={0.6}
                      dot
                      activeDot={{ r: 4 }}
                    />
                    <RechartsPrimitive.Tooltip 
                      formatter={(value) => [`${value}%`, 'Niveau']}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '6px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        border: 'none',
                        padding: '8px 12px'
                      }}
                    />
                  </RechartsPrimitive.RadarChart>
                </RechartsPrimitive.ResponsiveContainer>
              </div>
              <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  QCP 37873 Bloc 3 - Préparer le déploiement d'une application sécurisée
                </p>
              </div>
            </div>
          </motion.div>

          {/* Section des événements à venir */}
          <motion.div 
            variants={fadeInVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-2"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden h-full">
              <div className="p-5 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Événements à venir</h3>
                  </div>
                  <Button variant="outline" size="sm" className="gap-1 text-xs">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Planning complet</span>
                  </Button>
                </div>
              </div>
              <div className="p-5">
                <div className="space-y-4">
                  {upcomingEvents.map((event, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      className="flex gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                    >
                      <div className={`rounded-full p-3 self-start ${event.bgColor}`}>
                        <event.icon className={`h-5 w-5 ${event.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">{event.title}</h4>
                          <Badge variant="outline" className={`${event.color} border-current/30`}>
                            {event.type}
                          </Badge>
                        </div>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-gray-400" />
                            {event.time}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                            {event.location}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700">
                <Button variant="ghost" size="sm" className="w-full justify-center gap-1 text-primary">
                  <span>Voir tous les événements</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Section des objectifs */}
        <motion.div
          variants={fadeInVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                    <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Objectifs du semestre</h3>
                </div>
                <Badge variant="outline" className="text-green-600 dark:text-green-400 border-green-200 dark:border-green-800">
                  En cours
                </Badge>
              </div>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div 
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
                  whileHover={{ scale: 1.03 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    </div>
                    <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Votre progression</h4>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Vous avez déjà validé <span className="font-bold text-green-500">30 ECTS</span> ! Continuez comme ça, vous êtes sur la bonne voie.
                  </p>
                  <Button variant="outline" className="w-full">
                    Voir les prochaines étapes
                  </Button>
                </motion.div>

                <motion.div 
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
                  whileHover={{ scale: 1.03 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <FolderCheck className="h-6 w-6 text-blue-500" />
                    </div>
                    <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Vos projets</h4>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Félicitations ! Vous avez terminé <span className="font-bold text-blue-500">8 projets</span>. Le prochain est à portée de main.
                  </p>
                  <Button variant="outline" className="w-full">
                    Découvrir le prochain projet
                  </Button>
                </motion.div>

                <motion.div 
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
                  whileHover={{ scale: 1.03 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <Award className="h-6 w-6 text-purple-500" />
                    </div>
                    <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Vos compétences</h4>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Vous avez développé <span className="font-bold text-purple-500">75% des compétences</span> visées. Un excellent travail !
                  </p>
                  <Button variant="outline" className="w-full">
                    Explorer vos compétences
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bannière de motivation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/90 to-primary p-6 shadow-lg">
            <div className="absolute top-0 right-0 -mt-4 -mr-16 h-40 w-40 rounded-full bg-white/10 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -mb-16 -ml-10 h-40 w-40 rounded-full bg-white/10 blur-xl"></div>
            
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Continuez sur votre lancée !
                </h3>
                <p className="text-white/90 max-w-lg">
                  Vous avez accompli 75% de vos objectifs ce semestre. Maintenez vos efforts pour terminer en beauté !
                </p>
              </div>
              <Button className="bg-white text-primary hover:bg-white/90 shadow-sm">
                Voir mes objectifs
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;