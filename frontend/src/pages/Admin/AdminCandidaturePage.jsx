import React, { useEffect, useState } from 'react';
import { useApiQuery } from '@/hooks/useReactQuery'; // Custom hook for API calls
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // Assuming you have a table component

const AdminCandidaturePage = () => {
  const [submissions, setSubmissions] = useState([]);

  // Fetch candidate submissions
  const { data, isLoading, isError, error } = useApiQuery('fetchCandidatures', '/api/candidatures'); // Adjust the endpoint as necessary

  useEffect(() => {
    if (data) {
      setSubmissions(data);
    }
  }, [data]);

  if (isLoading) return <div>Loading...</div>;
  if (isError) {
    toast.error(`Error fetching submissions: ${error.message}`);
    return <div>Error loading submissions</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">Liste des Candidatures</h1>
      <div className="bg-white rounded-lg shadow p-6 mt-4">
        {submissions.length === 0 ? (
          <p className="text-center text-gray-500">Aucune candidature soumise.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell>{submission.name}</TableCell>
                  <TableCell>{submission.email}</TableCell>
                  <TableCell>{submission.status}</TableCell>
                  <TableCell>
                    {/* Add action buttons if needed, e.g., approve/reject */}
                    <button className="text-blue-500">View</button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default AdminCandidaturePage; 