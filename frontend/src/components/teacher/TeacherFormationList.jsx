import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { formationTeacherService } from '@/services/formationTeacher.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const TeacherFormationList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: formations, isLoading, error } = useQuery({
    queryKey: ['teacher-formations'],
    queryFn: () => formationTeacherService.getMyFormations(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-destructive/10 text-destructive rounded-md">
        <p>Une erreur est survenue lors du chargement des formations.</p>
        <p className="text-sm">{error.message}</p>
      </div>
    );
  }

  const filteredFormations = formations?.filter(formation =>
    formation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    formation.promotion.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleFormationClick = (formationId) => {
    navigate(`/teacher/formations/${formationId}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mes Formations</h2>
        <Input
          type="search"
          placeholder="Rechercher une formation..."
          className="max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Formation</TableHead>
            <TableHead>Promotion</TableHead>
            <TableHead>Rôle</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredFormations.map((formation) => (
            <TableRow key={formation.id}>
              <TableCell>{formation.name}</TableCell>
              <TableCell>{formation.promotion}</TableCell>
              <TableCell>
                <Badge variant={formation.isMainTeacher ? "default" : "secondary"}>
                  {formation.isMainTeacher ? "Professeur Principal" : "Professeur"}
                </Badge>
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  onClick={() => handleFormationClick(formation.id)}
                >
                  Voir les détails
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {filteredFormations.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                Vous n'avez pas de formations
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TeacherFormationList;
