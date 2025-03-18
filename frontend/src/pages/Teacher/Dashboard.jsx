import React, { useMemo } from 'react';
import { useTeacherDashboardData } from '@/hooks/useDashboardQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from 'react-router-dom';
import DashboardHeader from '@/components/shared/DashboardHeader';

import { 
  BookOpen, 
  Users, 
  Calendar, 
  ClipboardCheck, 
  GraduationCap, 
  AlertCircle, 
  School,
  Clock,
  TrendingUp,
  Bell,
  ChevronRight,
  BarChart3,
  CheckCircle2,
  XCircle,
  User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from '@/components/DashboardLayout';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

/**
 * Tableau de bord spécifique pour les formateurs
 */
const TeacherDashboard = () => {
  const { user, dashboardData, isLoading, isError, error, refetch } = useTeacherDashboardData();

  // Calculate attendance percentage for progress bar
  const attendancePercentage = useMemo(() => {
    if (!dashboardData?.attendance?.length) return 0;
    
    return Math.round(
      dashboardData.attendance.reduce((acc, curr) => {
        const total = curr.present + curr.absent;
        return acc + (curr.present / total) * 100;
      }, 0) / dashboardData.attendance.length
    );
  }, [dashboardData]);

  // Get initials for avatar fallback
  const userInitials = useMemo(() => {
    if (!user?.firstName || !user?.lastName) return 'T';
    return `${user.firstName[0]}${user.lastName[0]}`;
  }, [user]);

  // Utiliser le DashboardLayout pour gérer les états de chargement et d'erreur
  return (
    <DashboardLayout 
      loading={isLoading} 
      error={isError ? error?.message || 'Une erreur est survenue lors du chargement des données' : null}
      className="p-0"
    >
      <div className="container p-4 mx-auto sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <DashboardHeader 
          user={user}
          icon={GraduationCap}
          roleTitle="Tableau de bord formateur"
        />

        {/* Informations de la formation */}
        {dashboardData?.formation && (
          <motion.div 
            variants={fadeInVariants}
            initial="hidden"
            animate="visible"
            className="mb-8"
          >
            <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl text-primary/90 flex items-center gap-2">
                  <School className="h-5 w-5" />
                  Informations de la formation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Niveau</p>
                    <p className="font-medium text-lg">{dashboardData.formation.level}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Année</p>
                    <p className="font-medium text-lg">{dashboardData.formation.year}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Durée</p>
                    <p className="font-medium text-lg">{dashboardData.formation.duration}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Nombre d'étudiants</p>
                    <p className="font-medium text-lg">{dashboardData.formation.students} étudiants</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Statistiques */}
        {dashboardData && (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
          >
            <motion.div variants={itemVariants}>
              <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300 h-full overflow-hidden bg-white dark:bg-gray-800">
                <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6 px-6">
                  <CardTitle className="text-lg font-medium text-gray-800 dark:text-gray-200">Modules enseignés</CardTitle>
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </CardHeader>
                <CardContent className="px-6 pb-4">
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">{dashboardData.courses.length}</div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">modules ce semestre</p>
                </CardContent>
                <CardFooter className="pt-0 px-6 pb-6">
                  <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400 p-0 h-auto hover:bg-transparent hover:underline">
                    <span className="text-sm">Voir les détails</span>
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300 h-full overflow-hidden bg-white dark:bg-gray-800">
                <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6 px-6">
                  <CardTitle className="text-lg font-medium text-gray-800 dark:text-gray-200">Taux de présence</CardTitle>
                  <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                </CardHeader>
                <CardContent className="px-6 pb-4">
                  <div className="text-4xl font-bold text-green-600 dark:text-green-400">{attendancePercentage}%</div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">moyenne sur tous les modules</p>
                  <div className="mt-4">
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 mb-1">
                      <div 
                        className="h-2.5 rounded-full bg-gradient-to-r from-green-400 to-green-600 dark:from-green-500 dark:to-green-700"
                        style={{ width: `${attendancePercentage}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 px-6 pb-6">
                  <Button variant="ghost" size="sm" className="text-green-600 dark:text-green-400 p-0 h-auto hover:bg-transparent hover:underline">
                    <span className="text-sm">Voir les détails</span>
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300 h-full overflow-hidden bg-white dark:bg-gray-800">
                <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6 px-6">
                  <CardTitle className="text-lg font-medium text-gray-800 dark:text-gray-200">Alertes</CardTitle>
                  <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                </CardHeader>
                <CardContent className="px-6 pb-4">
                  <div className="text-4xl font-bold text-amber-600 dark:text-amber-400">{dashboardData.alerts.length}</div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">à traiter</p>
                </CardContent>
                <CardFooter className="pt-0 px-6 pb-6">
                  <Button variant="ghost" size="sm" className="text-amber-600 dark:text-amber-400 p-0 h-auto hover:bg-transparent hover:underline">
                    <span className="text-sm">Voir les détails</span>
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {/* Contenu principal */}
        {dashboardData && (
          <motion.div
            variants={fadeInVariants}
            initial="hidden"
            animate="visible"
          >
            <Tabs defaultValue="schedule" className="space-y-6">
              <div className="bg-white dark:bg-gray-800 p-1 rounded-lg shadow-md">
                <TabsList className="w-full grid grid-cols-4 gap-2 p-1 bg-gray-100 dark:bg-gray-700/50 rounded-md">
                  <TabsTrigger value="schedule" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm rounded-md transition-all">
                    <Calendar className="h-4 w-4 mr-2" />
                    Emploi du temps
                  </TabsTrigger>
                  <TabsTrigger value="attendance" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm rounded-md transition-all">
                    <ClipboardCheck className="h-4 w-4 mr-2" />
                    Présences
                  </TabsTrigger>
                  <TabsTrigger value="grades" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm rounded-md transition-all">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Notes
                  </TabsTrigger>
                  <TabsTrigger value="alerts" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm rounded-md transition-all">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Alertes
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Emploi du temps */}
              <AnimatePresence mode="wait">
                <TabsContent value="schedule" className="mt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border-none shadow-lg overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
                              <Calendar className="h-5 w-5" />
                              Emploi du temps
                            </CardTitle>
                            <CardDescription>Planning des modules de la formation</CardDescription>
                          </div>
                          <Button size="sm" variant="outline" className="gap-1">
                            <Clock className="h-4 w-4" />
                            <span>Aujourd'hui</span>
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <ScrollArea className="h-[400px]">
                          <Table>
                            <TableHeader className="bg-gray-50 dark:bg-gray-800/50 sticky top-0">
                              <TableRow>
                                <TableHead className="w-[40%]">Module</TableHead>
                                <TableHead className="w-[30%]">Partie</TableHead>
                                <TableHead className="w-[30%]">Horaire</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {dashboardData.courses.map((course) => (
                                <TableRow key={course.id} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors">
                                  <TableCell className="font-medium">{course.name}</TableCell>
                                  <TableCell>{course.module}</TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-3 w-3 text-gray-400" />
                                      {course.schedule}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
              </AnimatePresence>

              {/* Présences */}
              <AnimatePresence mode="wait">
                <TabsContent value="attendance" className="mt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border-none shadow-lg overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-300">
                              <ClipboardCheck className="h-5 w-5" />
                              Suivi des présences
                            </CardTitle>
                            <CardDescription>État des présences par module</CardDescription>
                          </div>
                          <Button size="sm" variant="outline" className="gap-1">
                            <TrendingUp className="h-4 w-4" />
                            <span>Statistiques</span>
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <ScrollArea className="h-[400px]">
                          <Table>
                            <TableHeader className="bg-gray-50 dark:bg-gray-800/50 sticky top-0">
                              <TableRow>
                                <TableHead className="w-[40%]">Module</TableHead>
                                <TableHead className="w-[20%]">Date</TableHead>
                                <TableHead className="w-[20%]">Présents</TableHead>
                                <TableHead className="w-[20%]">Absents</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {dashboardData.attendance.map((record) => (
                                <TableRow key={record.id} className="hover:bg-green-50/50 dark:hover:bg-green-900/10 transition-colors">
                                  <TableCell className="font-medium">{record.module}</TableCell>
                                  <TableCell>{record.date}</TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                        {record.present}
                                      </Badge>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
                                        <XCircle className="h-3 w-3 mr-1" />
                                        {record.absent}
                                      </Badge>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
              </AnimatePresence>

              {/* Notes */}
              <AnimatePresence mode="wait">
                <TabsContent value="grades" className="mt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border-none shadow-lg overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border-b">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2 text-purple-800 dark:text-purple-300">
                              <GraduationCap className="h-5 w-5" />
                              Notes des étudiants
                            </CardTitle>
                            <CardDescription>Dernières notes enregistrées par module</CardDescription>
                          </div>
                          <Button size="sm" variant="outline" className="gap-1">
                            <BarChart3 className="h-4 w-4" />
                            <span>Statistiques</span>
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <ScrollArea className="h-[400px]">
                          <Table>
                            <TableHeader className="bg-gray-50 dark:bg-gray-800/50 sticky top-0">
                              <TableRow>
                                <TableHead className="w-[40%]">Étudiant</TableHead>
                                <TableHead className="w-[40%]">Module</TableHead>
                                <TableHead className="w-[20%]">Note</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {dashboardData.grades.map((grade) => (
                                <TableRow key={grade.id} className="hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-colors">
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <Avatar className="h-6 w-6">
                                        <AvatarFallback className="text-xs bg-gray-200 dark:bg-gray-700">
                                          <User className="h-3 w-3" />
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="font-medium">{grade.student}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>{grade.module}</TableCell>
                                  <TableCell>
                                    <Badge 
                                      className={`
                                        ${grade.grade >= 80 
                                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                                          : grade.grade >= 60 
                                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' 
                                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                        }
                                      `}
                                    >
                                      {grade.grade}/100
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
              </AnimatePresence>

              {/* Alertes */}
              <AnimatePresence mode="wait">
                <TabsContent value="alerts" className="mt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border-none shadow-lg overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-b">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
                              <AlertCircle className="h-5 w-5" />
                              Alertes importantes
                            </CardTitle>
                            <CardDescription>Examens, réunions et échéances</CardDescription>
                          </div>
                          <Button size="sm" variant="outline" className="gap-1">
                            <Bell className="h-4 w-4" />
                            <span>Gérer les alertes</span>
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <ScrollArea className="h-[400px] pr-4">
                          <div className="space-y-4">
                            {dashboardData.alerts.map((alert, index) => (
                              <motion.div 
                                key={alert.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                              >
                                <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
                                  <CardContent className="p-0">
                                    <div className="flex items-start">
                                      <div className={`w-1.5 self-stretch ${
                                        alert.priority === 'high' ? 'bg-red-500' : 'bg-amber-500'
                                      }`} />
                                      <div className="p-4 flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                          <Badge variant={alert.priority === 'high' ? "destructive" : "warning"} className="capitalize">
                                            {alert.type}
                                          </Badge>
                                          <span className="text-xs text-gray-500">
                                            {new Date().toLocaleDateString()}
                                          </span>
                                        </div>
                                        <p className="text-sm font-medium">{alert.message}</p>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            ))}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
              </AnimatePresence>
            </Tabs>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard; 