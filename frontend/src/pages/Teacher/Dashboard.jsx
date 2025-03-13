import React, { useState, useEffect } from 'react';
import { authService } from '@/lib/services/authService';
import { teacherService } from '@/lib/services/teacherService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, Users, Calendar, ClipboardCheck, GraduationCap, AlertCircle, School } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const LoadingSkeleton = () => {
  return (
    <div className="container p-4 mx-auto sm:p-6 lg:p-8 space-y-6">
      {/* En-tête Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6 lg:mb-8">
        <div className="space-y-3">
          <Skeleton className="h-8 w-[250px]" />
          <Skeleton className="h-4 w-[180px]" />
        </div>
      </div>

      {/* Statistiques Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-[140px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-[60px] mb-2" />
              <Skeleton className="h-3 w-[100px]" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Contenu principal Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[180px] mb-2" />
          <Skeleton className="h-4 w-[250px] mb-4" />
          <div className="flex flex-col sm:flex-row gap-4">
            <Skeleton className="h-10 w-full sm:w-[300px]" />
            <Skeleton className="h-10 w-full sm:w-[120px]" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Tableau de bord spécifique pour les professeurs
 */
const TeacherDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer les données de l'utilisateur
        const userData = await authService.getCurrentUser();
        setUser(userData);

        // Récupérer les données du dashboard
        const data = await teacherService.getDashboardData();
        setDashboardData(data);
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <LoadingSkeleton />;
  if (error) return (
    <div className="container p-4 mx-auto">
      <div className="p-4 text-red-600 bg-red-50 rounded-md">
        Erreur: {error}
      </div>
    </div>
  );
  if (!dashboardData) return null;

  const { formation, courses, attendance, grades, alerts } = dashboardData;

  // Calculer le taux de présence moyen
  const averageAttendance = Math.round(
    attendance.reduce((acc, curr) => {
      const total = curr.present + curr.absent;
      return acc + (curr.present / total) * 100;
    }, 0) / attendance.length
  );

  return (
    <div className="container p-4 mx-auto sm:p-6 lg:p-8">
      {/* En-tête */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Bienvenue {user?.firstName} {user?.lastName}
        </h1>
        <div className="flex items-center gap-2 mt-2">
          <School className="h-5 w-5 text-gray-500" />
          <p className="text-gray-600">Formation {formation.name}</p>
        </div>
      </div>

      {/* Informations de la formation */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Informations de la formation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Niveau</p>
              <p className="font-medium">{formation.level}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Année</p>
              <p className="font-medium">{formation.year}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Durée</p>
              <p className="font-medium">{formation.duration}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Nombre d'étudiants</p>
              <p className="font-medium">{formation.students} étudiants</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Modules enseignés</CardTitle>
            <BookOpen className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
            <p className="text-xs text-gray-500">modules ce semestre</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taux de présence</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageAttendance}%</div>
            <p className="text-xs text-gray-500">moyenne sur tous les modules</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Alertes</CardTitle>
            <AlertCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.length}</div>
            <p className="text-xs text-gray-500">à traiter</p>
          </CardContent>
        </Card>
      </div>

      {/* Contenu principal */}
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
                  {courses.map((course) => (
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
                  {attendance.map((record) => (
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
                  {grades.map((grade) => (
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
                {alerts.map((alert) => (
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
    </div>
  );
};

export default TeacherDashboard; 