import React from 'react';
import { useCandidature } from '@/context/CandidatureContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const CandidatureList = () => {
  const { candidatures } = useCandidature();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Liste des Candidatures</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          {candidatures.length === 0 ? (
            <p className="text-center text-gray-500">Aucune candidature pour le moment</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Étudiant</TableHead>
                  <TableHead>Date de début</TableHead>
                  <TableHead>Télétravail</TableHead>
                  <TableHead>CV</TableHead>
                  <TableHead>Date de soumission</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidatures.map((candidature) => (
                  <TableRow key={candidature.id}>
                    <TableCell>{candidature.studentName}</TableCell>
                    <TableCell>{new Date(candidature.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>{candidature.isRemoteWork ? 'Oui' : 'Non'}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        {candidature.cv}
                      </Button>
                    </TableCell>
                    <TableCell>{new Date(candidature.submittedAt).toLocaleDateString()}</TableCell>
                    <TableCell>{candidature.status}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        Examiner
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidatureList;
