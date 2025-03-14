import React from 'react';
import { Link } from 'react-router-dom';
import { useStudentDashboardData } from '@/hooks/useDashboardQueries';
import DashboardLayout from '@/components/DashboardLayout';
import { Calendar, Clock, GraduationCap, UserCheck, FolderGit2 } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

/**
 * Tableau de bord spécifique pour les étudiants
 */
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

  const menuItems = [
    {
      title: 'Emploi du temps',
      description: 'Consultez votre planning de cours',
      icon: Calendar,
      color: 'bg-blue-500',
      link: '/student/schedule'
    },
    {
      title: 'Notes et résultats',
      description: 'Suivez vos performances académiques',
      icon: GraduationCap,
      color: 'bg-green-500',
      link: '/student/grades'
    },
    {
      title: 'Suivi des absences',
      description: 'Gérez vos absences et justificatifs',
      icon: UserCheck,
      color: 'bg-yellow-500',
      link: '/student/absences'
    },
    {
      title: 'Projets',
      description: 'Vos projets en cours et à venir',
      icon: FolderGit2,
      color: 'bg-purple-500',
      link: '/student/projects'
    }
  ];

  return (
    <DashboardLayout loading={isLoading} error={error?.message} className="p-0">
      <div className="p-8">
        {/* En-tête du dashboard */}
        <div className="p-6 bg-white rounded-lg shadow-lg mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Bienvenue {user?.firstName} {user?.lastName}
          </h1>
          <p className="mt-2 text-gray-600">
            Voici votre tableau de bord étudiant
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Section des compétences */}
          <div className="lg:col-span-1 p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Compétences
            </h2>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart
                  cx="50%"
                  cy="50%"
                  outerRadius="70%"
                  data={competencesData}
                  style={{ backgroundColor: '#f8fafc' }}
                >
                  <PolarGrid
                    gridType="circle"
                    stroke="#e2e8f0"
                    strokeWidth={0.5}
                  />
                  <PolarAngleAxis
                    dataKey="name"
                    tick={{
                      fill: '#4a5568',
                      fontSize: 12,
                      fontWeight: 500,
                      dy: 4
                    }}
                    stroke="#e2e8f0"
                    strokeWidth={0.5}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 140]}
                    axisLine={false}
                    tick={{
                      fill: '#4a5568',
                      fontSize: 10
                    }}
                    tickCount={7}
                    stroke="#e2e8f0"
                    strokeWidth={0.5}
                  />
                  <Radar
                    name="Compétences"
                    dataKey="value"
                    stroke="#ff4081"
                    fill="#ff4081"
                    fillOpacity={0.3}
                    dot
                    activeDot={{ r: 4 }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p className="font-medium">QCP 37873 Bloc 3 - Préparer le déploiement d'une application sécurisée</p>
            </div>
          </div>

          {/* Grille des menus */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                to={item.link}
                className="block p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg ${item.color}`}>
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-800">
                      {item.title}
                    </h2>
                    <p className="mt-1 text-gray-600">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Section des informations rapides */}
        <div className="mt-8 p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Informations du jour
          </h2>
          <div className="flex items-center text-gray-600">
            <Clock className="w-5 h-5 mr-2" />
            <span>Prochain cours dans : --:--</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard; 