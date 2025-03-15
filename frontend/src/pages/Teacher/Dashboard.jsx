import React from 'react';
import { useTeacherDashboardData } from '@/hooks/useDashboardQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Calendar, ClipboardCheck, GraduationCap, AlertCircle, School } from "lucide-react";
import { motion } from "framer-motion";
import DashboardLayout from '@/components/DashboardLayout';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/**
 * Tableau de bord spécifique pour les formateurs
 */
const TeacherDashboard = () => {
  const { user, dashboardData, isLoading, isError, error, refetch } = useTeacherDashboardData();

  // Utiliser le DashboardLayout pour gérer les états de chargement et d'erreur
  return (
    <DashboardLayout 
      loading={isLoading} 
      error={isError ? error?.message || 'Une erreur est survenue lors du chargement des données' : null}
      className="p-0"
    >
      <div className="container p-4 mx-auto sm:p-6 lg:p-8">
        {/* En-tête */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Bienvenue {user?.firstName} {user?.lastName}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <School className="h-5 w-5 text-gray-500" />
            <p className="text-gray-600">Formation {dashboardData?.formation?.name}</p>
          </div>
        </div>

        {/* Informations de la formation */}
        {dashboardData?.formation && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Informations de la formation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Niveau</p>
                  <p className="font-medium">{dashboardData.formation.level}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Année</p>
                  <p className="font-medium">{dashboardData.formation.year}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Durée</p>
                  <p className="font-medium">{dashboardData.formation.duration}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Nombre d'étudiants</p>
                  <p className="font-medium">{dashboardData.formation.students} étudiants</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistiques */}
        {dashboardData && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Modules enseignés</CardTitle>
                <BookOpen className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.courses.length}</div>
                <p className="text-xs text-gray-500">modules ce semestre</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Taux de présence</CardTitle>
                <Users className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(
                    dashboardData.attendance.reduce((acc, curr) => {
                      const total = curr.present + curr.absent;
                      return acc + (curr.present / total) * 100;
                    }, 0) / dashboardData.attendance.length
                  )}%
                </div>
                <p className="text-xs text-gray-500">moyenne sur tous les modules</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Alertes</CardTitle>
                <AlertCircle className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.alerts.length}</div>
                <p className="text-xs text-gray-500">à traiter</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Contenu principal */}
        {dashboardData && (
          <Tabs defaultValue="schedule" className="space-y-6">
            <TabsList className="w-full flex justify-start overflow-x-auto">
              <TabsTrigger value="schedule">
                <Calendar className="h-4 w-4 mr-2" />
                Emploi du temps
              </TabsTrigger>
              <TabsTrigger value="attendance">
                <ClipboardCheck className="h-4 w-4 mr-2" />
                Présences
              </TabsTrigger>
              <TabsTrigger value="grades">
                <GraduationCap className="h-4 w-4 mr-2" />
                Notes
              </TabsTrigger>
              <TabsTrigger value="alerts">
                <AlertCircle className="h-4 w-4 mr-2" />
                Alertes
              </TabsTrigger>
            </TabsList>

            {/* Emploi du temps */}
            <TabsContent value="schedule">
              <Card>
                <CardHeader>
                  <CardTitle>Emploi du temps</CardTitle>
                  <CardDescription>Planning des modules de la formation</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Module</TableHead>
                        <TableHead>Partie</TableHead>
                        <TableHead>Horaire</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dashboardData.courses.map((course) => (
                        <TableRow key={course.id}>
                          <TableCell className="font-medium">{course.name}</TableCell>
                          <TableCell>{course.module}</TableCell>
                          <TableCell>{course.schedule}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Présences */}
            <TabsContent value="attendance">
              <Card>
                <CardHeader>
                  <CardTitle>Suivi des présences</CardTitle>
                  <CardDescription>État des présences par module</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Module</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Présents</TableHead>
                        <TableHead>Absents</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dashboardData.attendance.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">{record.module}</TableCell>
                          <TableCell>{record.date}</TableCell>
                          <TableCell className="text-green-600">{record.present}</TableCell>
                          <TableCell className="text-red-600">{record.absent}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notes */}
            <TabsContent value="grades">
              <Card>
                <CardHeader>
                  <CardTitle>Notes des étudiants</CardTitle>
                  <CardDescription>Dernières notes enregistrées par module</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Étudiant</TableHead>
                        <TableHead>Module</TableHead>
                        <TableHead>Note</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dashboardData.grades.map((grade) => (
                        <TableRow key={grade.id}>
                          <TableCell className="font-medium">{grade.student}</TableCell>
                          <TableCell>{grade.module}</TableCell>
                          <TableCell>
                            <Badge variant={grade.grade >= 80 ? "success" : grade.grade >= 60 ? "warning" : "destructive"}>
                              {grade.grade}/100
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Alertes */}
            <TabsContent value="alerts">
              <Card>
                <CardHeader>
                  <CardTitle>Alertes importantes</CardTitle>
                  <CardDescription>Examens, réunions et échéances</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData.alerts.map((alert) => (
                      <Card key={alert.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <Badge variant={alert.priority === 'high' ? "destructive" : "warning"}>
                              {alert.type}
                            </Badge>
                            <p className="text-sm font-medium">{alert.message}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard; 