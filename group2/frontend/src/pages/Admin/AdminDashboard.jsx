import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Calendar as CalendarIcon, Users, Shield, Book, ChevronRight } from 'lucide-react';
import { useAdminDashboardData } from '@/hooks/useDashboardQueries';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from "@/components/ui/card";
import authService from '@/lib/services/authService';

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

const AdminDashboard = () => {
  const { user, isLoading, isError, error } = useAdminDashboardData();
  const hasAttemptedRefresh = useRef(false);

  const quickAccessCards = [
    {
      title: 'Emploi du temps',
      description: 'Consultez et gérez votre emploi du temps',
      icon: CalendarIcon,
      color: 'bg-gradient-to-br from-blue-500 to-indigo-600',
      textColor: 'text-blue-50',
      link: '/admin/schedule',
    },
    {
      title: 'Gestion des utilisateurs',
      description: 'Gérez les comptes des utilisateurs',
      icon: Users,
      color: 'bg-gradient-to-br from-emerald-500 to-teal-600',
      textColor: 'text-emerald-50',
      link: '/admin/users',
    },
    {
      title: 'Formations',
      description: 'Gérer et consulter les formations',
      icon: Book,
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      textColor: 'text-purple-50',
      link: '/formations',
    }
  ];

  // Avoid infinite loop of refreshes but try once if we don't have user data
  useEffect(() => {
    if (!user && !hasAttemptedRefresh.current && !isLoading) {
      hasAttemptedRefresh.current = true;
      // Wait a short delay before attempting to refresh
      const timer = setTimeout(() => {
        authService.getCurrentUser();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [user, isLoading]);

  return (
    <DashboardLayout
      loading={isLoading}
      error={isError ? error?.message || 'Une erreur est survenue lors du chargement des données' : null}
      className="p-0"
      user={user}
      headerIcon={Shield}
      headerTitle="Tableau de bord administrateur"
    >
      <div className="container min-h-screen p-4 mx-auto sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900">
        {/* Statistiques essentielles */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-4 mb-8 md:grid-cols-2 lg:grid-cols-4"
        >
          {/* ... existing stats code ... */}
        </motion.div>

        <Card className="mb-6 border-0 shadow-md">
          <CardContent className="p-6">
            <h2 className="mb-6 text-xl font-semibold text-gray-800">Accès rapide</h2>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 gap-5 md:grid-cols-2"
            >
              {quickAccessCards.map((card, index) => (
                <motion.div key={index} variants={itemVariants} className="h-full">
                  <Link to={card.link} className="block h-full">
                    <div className="relative h-full overflow-hidden transition-all duration-300 shadow-sm rounded-xl hover:shadow-md group">
                      <div className={`absolute inset-0 ${card.color} opacity-90 group-hover:opacity-100 transition-opacity`}></div>
                      <div className="relative flex flex-col h-full p-5">
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-2.5 rounded-lg bg-white/20 backdrop-blur-sm">
                            <card.icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="p-1.5 rounded-full bg-white/20 backdrop-blur-sm">
                            <ChevronRight className="w-4 h-4 text-white" />
                          </div>
                        </div>

                        <h2 className="mb-1 text-xl font-semibold text-white">
                          {card.title}
                        </h2>
                        <p className="mb-4 text-sm text-white/80">
                          {card.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;