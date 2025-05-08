import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { formationTeacherService } from '@/services/formationTeacher.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, Calendar, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const TeacherFormationDetails = () => {
  const { id } = useParams();
  const formationId = parseInt(id, 10);

  const { data: formation, isLoading, error } = useQuery({
    queryKey: ['formation-details', formationId],
    queryFn: () => formationTeacherService.getFormationDetails(formationId),
    enabled: !isNaN(formationId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !formation) {
    return (
      <div className="p-4 bg-destructive/10 text-destructive rounded-md">
        <p>Une erreur est survenue lors du chargement des détails de la formation.</p>
        <p className="text-sm">{error?.message || 'Formation non trouvée'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{formation.name}</h1>
          <p className="text-muted-foreground">{formation.promotion}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant={formation.isMainTeacher ? "default" : "secondary"}>
            {formation.isMainTeacher ? "Professeur Principal" : "Professeur"}
          </Badge>
          <Link
            to={`/absences/formation/${formationId}`}
            className="mt-2 px-4 py-1 rounded bg-primary text-white hover:bg-primary/90 text-sm font-medium transition-colors"
          >
            Voir les absences
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Date de début
            </CardTitle>
          </CardHeader>
          <CardContent>
            {formation.dateStart ? (
              format(new Date(formation.dateStart), 'dd MMMM yyyy', { locale: fr })
            ) : (
              'Non définie'
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Localisation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {formation.location || 'Non définie'}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Étudiants
            </CardTitle>
          </CardHeader>
          <CardContent>
            {formation.students?.length || 0} / {formation.capacity || 'N/A'}
          </CardContent>
        </Card>
      </div>

      {formation.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{formation.description}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Liste des étudiants</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Prénom</TableHead>
                <TableHead>Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {formation.students?.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.lastName}</TableCell>
                  <TableCell>{student.firstName}</TableCell>
                  <TableCell>{student.email}</TableCell>
                </TableRow>
              ))}
              {(!formation.students || formation.students.length === 0) && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    Aucun étudiant inscrit
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherFormationDetails;
