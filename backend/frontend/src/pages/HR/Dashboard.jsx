import React, { useMemo, useEffect, useRef, useState } from 'react';
import { useHRDashboardData } from '@/hooks/useDashboardQueries';
import DashboardLayout from '@/components/DashboardLayout';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Users, 
  Calendar, 
  FileText, 
  BookOpen, 
  BarChart3, 
  PlusCircle, 
  FileDown, 
  FileSpreadsheet,
  Briefcase,
  Building2,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import authService from '@/lib/services/authService';

// Enregistrer les composants ChartJS nécessaires
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

// Données fictives pour la démonstration (définies en dehors du composant pour réduire la taille)
const mockData = {
  employee: {
    total: 127, active: 118, onLeave: 9,
    departments: { labels: ['IT', 'Marketing', 'Ventes', 'Finance', 'RH', 'Production'], data: [32, 18, 25, 15, 8, 29] }
  },
  absence: {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
    datasets: [
      { label: 'Congés payés', data: [14, 18, 22, 25, 31, 42, 48, 52, 23, 19, 20, 28], backgroundColor: 'rgba(54, 162, 235, 0.5)', borderColor: 'rgba(54, 162, 235, 1)' },
      { label: 'Maladie', data: [8, 12, 9, 7, 6, 5, 8, 10, 9, 11, 13, 10], backgroundColor: 'rgba(255, 99, 132, 0.5)', borderColor: 'rgba(255, 99, 132, 1)' },
      { label: 'Formation', data: [4, 5, 7, 6, 8, 5, 3, 2, 6, 9, 7, 5], backgroundColor: 'rgba(75, 192, 192, 0.5)', borderColor: 'rgba(75, 192, 192, 1)' }
    ]
  },
  contract: {
    labels: ['CDI', 'CDD', 'Intérim', 'Stage', 'Apprentissage'],
    datasets: [{
      data: [78, 22, 10, 12, 5],
      backgroundColor: ['#3b82f6', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6'],
      borderColor: ['#2563eb', '#d97706', '#dc2626', '#059669', '#7c3aed'],
      borderWidth: 1
    }]
  },
  training: {
    labels: ['Techniques', 'Management', 'Soft Skills', 'Outils', 'Sécurité', 'Conformité'],
    datasets: [{
      label: 'Heures de formation par catégorie',
      data: [120, 85, 65, 45, 35, 50],
      backgroundColor: ['#ef4444', '#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#f97316'],
      borderWidth: 1
    }]
  }
};

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

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { 
    legend: { 
      position: 'top',
      labels: {
        font: {
          family: 'Inter, sans-serif',
          size: 12
        },
        usePointStyle: true,
        padding: 20
      }
    },
    tooltip: {
      backgroundColor: 'rgba(17, 24, 39, 0.8)',
      titleFont: {
        family: 'Inter, sans-serif',
        size: 14
      },
      bodyFont: {
        family: 'Inter, sans-serif',
        size: 13
      },
      padding: 12,
      cornerRadius: 8
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      },
      ticks: {
        font: {
          family: 'Inter, sans-serif',
          size: 12
        }
      }
    },
    y: {
      grid: {
        color: 'rgba(156, 163, 175, 0.1)'
      },
      ticks: {
        font: {
          family: 'Inter, sans-serif',
          size: 12
        }
      }
    }
  }
};

// Composant pour les statistiques
const StatCard = ({ title, value, icon: Icon, color }) => (
  <motion.div variants={itemVariants}>
    <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h3 className={`mt-2 text-3xl font-bold text-${color}-600`}>{value}</h3>
          </div>
          <div className={`p-3 rounded-full bg-${color}-100`}>
            <Icon className={`h-6 w-6 text-${color}-600`} />
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

// Composant pour les boutons d'action
const ActionButton = ({ text, icon: Icon, color }) => (
  <motion.button 
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.97 }}
    className={`flex items-center justify-center w-full px-4 py-3 text-white bg-${color}-600 rounded-lg hover:bg-${color}-700 transition-colors duration-200`}
  >
    <Icon className="w-5 h-5 mr-2" />
    <span>{text}</span>
  </motion.button>
);

/**
 * Tableau de bord spécifique pour les RH
 */
const HRDashboard = () => {
  const { user, isLoading, isError, error, refetch } = useHRDashboardData();
  const [activeTab, setActiveTab] = useState('overview');
  const refreshAttemptedRef = useRef(false);
  
  // Utiliser useMemo pour éviter les re-rendus inutiles
  const roleAlias = useMemo(() => {
    if (!user?.roles?.length) return '';
    const role = user.roles[0].replace('ROLE_', '');
    
    // Mapping des rôles vers des alias plus conviviaux
    const roleAliases = {
      'SUPERADMIN': 'Super Administrateur',
      'ADMIN': 'Administrateur',
      'TEACHER': 'Formateur',
      'STUDENT': 'Étudiant',
      'HR': 'Ressources Humaines',
      'RECRUITER': 'Recruteur'
    };
    
    return roleAliases[role] || role;
  }, [user]);

  // Approche améliorée pour gérer les données utilisateur
  useEffect(() => {
    // Si nous avons déjà des données complètes, ne pas rafraîchir
    if (user?.firstName && user?.lastName) {
      refreshAttemptedRef.current = true;
      return;
    }
    
    // Si une tentative a déjà été faite, ne pas réessayer
    if (refreshAttemptedRef.current) {
      return;
    }
    
    // Une seule tentative de rafraîchissement si nécessaire
    const refreshUserData = async () => {
      try {
        refreshAttemptedRef.current = true;
        await refetch();
      } catch (error) {
        // Suppression des console.log d'erreur
      }
    };
    
    // Attendre un court instant pour permettre aux données initiales de se charger
    const timeoutId = setTimeout(() => {
      if (!user?.firstName) {
        refreshUserData();
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [user, refetch]);
  
  // Définir les cartes d'accès rapide
  const quickAccessCards = [
    {
      title: 'Candidatures',
      description: 'Gérer les candidatures',
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-50',
      link: '/hr/applications',
    },
    {
      title: 'Événements',
      description: 'Gérer les événements de recrutement',
      icon: Calendar,
      color: 'from-green-500 to-green-600',
      textColor: 'text-green-50',
      link: '/hr/events',
    },
    {
      title: 'Entreprises',
      description: 'Gérer les entreprises partenaires',
      icon: Building2,
      color: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-50',
      link: '/hr/companies',
    },
  ];

  return (
    <DashboardLayout 
      loading={isLoading} 
      error={error?.message || null}
      user={user}
      headerIcon={Briefcase}
      headerTitle="Tableau de bord ressources humaines"
    >
      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
          key="dashboard-title"
        >
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Tableau de bord RH</h2>
            <p className="mt-1 text-gray-500">Visualisez et gérez les données RH en temps réel</p>
          </div>
          <div className="mt-4 md:mt-0">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </motion.div>

        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="w-full md:w-auto bg-white p-1 rounded-lg shadow-sm border border-gray-100 mb-6">
            <TabsTrigger 
              value="overview" 
              className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Aperçu</span>
            </TabsTrigger>
            <TabsTrigger 
              value="employees" 
              className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              <Users className="h-4 w-4" />
              <span>Employés</span>
            </TabsTrigger>
            <TabsTrigger 
              value="absences" 
              className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              <Calendar className="h-4 w-4" />
              <span>Absences</span>
            </TabsTrigger>
            <TabsTrigger 
              value="contracts" 
              className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              <FileText className="h-4 w-4" />
              <span>Contrats</span>
            </TabsTrigger>
            <TabsTrigger 
              value="training" 
              className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              <BookOpen className="h-4 w-4" />
              <span>Formations</span>
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value="overview" className="mt-0" key="overview-tab">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                key="overview-motion"
              >
                <StatCard 
                  key="total-employees"
                  title="Effectif total" 
                  value={mockData.employee.total} 
                  icon={Users} 
                  color="blue" 
                />
                <StatCard 
                  key="active-employees"
                  title="Employés actifs" 
                  value={mockData.employee.active} 
                  icon={Users} 
                  color="green" 
                />
                <StatCard 
                  key="on-leave"
                  title="En congé" 
                  value={mockData.employee.onLeave} 
                  icon={Calendar} 
                  color="yellow" 
                />
                <StatCard 
                  key="occupation-rate"
                  title="Taux d'occupation" 
                  value={`${Math.round((mockData.employee.active / mockData.employee.total) * 100)}%`} 
                  icon={BarChart3} 
                  color="purple" 
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="employees" className="mt-0" key="employees-tab">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="lg:col-span-2"
                  key="employees-chart-motion"
                >
                  <Card className="border-none shadow-md h-full">
                    <CardHeader className="pb-2">
                      <CardTitle>Répartition par département</CardTitle>
                      <CardDescription>Distribution des employés par service</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                      <Bar
                        data={{
                          labels: mockData.employee.departments.labels,
                          datasets: [{
                            label: 'Nombre d\'employés',
                            data: mockData.employee.departments.data,
                            backgroundColor: [
                              '#3b82f6', '#f59e0b', '#ef4444', 
                              '#10b981', '#8b5cf6', '#f97316'
                            ],
                            borderRadius: 6
                          }]
                        }}
                        options={chartOptions}
                      />
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  key="employees-actions-motion"
                >
                  <Card className="border-none shadow-md h-full">
                    <CardHeader>
                      <CardTitle>Actions rapides</CardTitle>
                      <CardDescription>Gérez efficacement vos ressources</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ActionButton 
                        key="generate-report"
                        text="Générer rapport d'effectifs" 
                        icon={FileSpreadsheet} 
                        color="green" 
                      />
                      <ActionButton 
                        key="export-list"
                        text="Exporter liste des employés" 
                        icon={FileDown} 
                        color="purple" 
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>

            <TabsContent value="absences" className="mt-0" key="absences-tab">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                key="absences-motion"
              >
                <Card className="border-none shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle>Suivi des absences et congés</CardTitle>
                    <CardDescription>Évolution mensuelle par type d'absence</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[400px]">
                    <Line 
                      data={mockData.absence} 
                      options={{
                        ...chartOptions,
                        elements: {
                          line: {
                            tension: 0.3
                          },
                          point: {
                            radius: 3,
                            hoverRadius: 5
                          }
                        }
                      }} 
                    />
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="contracts" className="mt-0" key="contracts-tab">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                key="contracts-motion"
              >
                <Card className="border-none shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle>Types de contrats</CardTitle>
                    <CardDescription>Répartition des employés par type de contrat</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[350px] flex items-center justify-center">
                    <div className="h-full w-full">
                      <Pie 
                        data={mockData.contract} 
                        options={{
                          ...chartOptions,
                          plugins: {
                            ...chartOptions.plugins,
                            legend: {
                              ...chartOptions.plugins.legend,
                              position: 'bottom',
                              labels: {
                                ...chartOptions.plugins.legend.labels,
                                boxWidth: 15,
                                padding: 15
                              }
                            },
                            tooltip: {
                              ...chartOptions.plugins.tooltip,
                              callbacks: {
                                label: function(context) {
                                  const label = context.label || '';
                                  const value = context.raw || 0;
                                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                  const percentage = Math.round((value / total) * 100);
                                  return `${label}: ${value} (${percentage}%)`;
                                }
                              }
                            }
                          }
                        }} 
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle>Détails des contrats</CardTitle>
                    <CardDescription>Informations détaillées par type de contrat</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { type: 'CDI', count: 78, color: 'blue', details: 'Contrat à durée indéterminée', percentage: '61%' },
                        { type: 'CDD', count: 22, color: 'amber', details: 'Contrat à durée déterminée', percentage: '17%' },
                        { type: 'Intérim', count: 10, color: 'red', details: 'Contrat temporaire', percentage: '8%' },
                        { type: 'Stage', count: 12, color: 'emerald', details: 'Période de formation pratique', percentage: '9%' },
                        { type: 'Apprentissage', count: 5, color: 'purple', details: 'Formation en alternance', percentage: '4%' }
                      ].map((contract, index) => (
                        <motion.div 
                          key={`contract-${contract.type}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className={`w-3 h-10 rounded-full bg-${contract.color}-500 mr-4`}></div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <h4 className="font-medium text-gray-900">{contract.type}</h4>
                              <span className="text-sm font-semibold text-gray-700">{contract.percentage}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <p className="text-sm text-gray-500">{contract.details}</p>
                              <span className="text-sm font-medium text-gray-600">{contract.count} employés</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                              <div 
                                className={`bg-${contract.color}-500 h-1.5 rounded-full`} 
                                style={{ width: contract.percentage }}
                              ></div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-md lg:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle>Évolution des types de contrats</CardTitle>
                    <CardDescription>Tendance sur les 12 derniers mois</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[250px]">
                    <Line
                      data={{
                        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
                        datasets: [
                          {
                            label: 'CDI',
                            data: [75, 76, 76, 77, 77, 78, 78, 78, 79, 79, 78, 78],
                            borderColor: '#3b82f6',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            tension: 0.3,
                            fill: false
                          },
                          {
                            label: 'CDD',
                            data: [25, 24, 24, 23, 23, 22, 22, 22, 21, 21, 22, 22],
                            borderColor: '#f59e0b',
                            backgroundColor: 'rgba(245, 158, 11, 0.1)',
                            tension: 0.3,
                            fill: false
                          },
                          {
                            label: 'Autres',
                            data: [28, 28, 27, 27, 27, 26, 26, 27, 27, 28, 27, 27],
                            borderColor: '#8b5cf6',
                            backgroundColor: 'rgba(139, 92, 246, 0.1)',
                            tension: 0.3,
                            fill: false
                          }
                        ]
                      }}
                      options={{
                        ...chartOptions,
                        elements: {
                          line: {
                            tension: 0.3
                          },
                          point: {
                            radius: 2,
                            hoverRadius: 4
                          }
                        }
                      }}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="training" className="mt-0" key="training-tab">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                key="training-motion"
              >
                <Card className="border-none shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle>Formations par catégorie</CardTitle>
                    <CardDescription>Heures de formation dispensées par type</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[350px]">
                    <Bar 
                      data={mockData.training} 
                      options={{
                        ...chartOptions,
                        indexAxis: 'y',
                        elements: {
                          bar: {
                            borderRadius: 6
                          }
                        }
                      }} 
                    />
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>

        <div className="bg-white shadow-md rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Accès rapide</h2>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-5"
          >
            {quickAccessCards.map((card, index) => (
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
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HRDashboard;