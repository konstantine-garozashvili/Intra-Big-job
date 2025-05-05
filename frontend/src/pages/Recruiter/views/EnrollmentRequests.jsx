import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function EnrollmentRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const navigate = useNavigate();

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/formation-requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setRequests(data.requests || []);
    } catch (err) {
      toast.error('Erreur lors du chargement des demandes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAccept = async (id) => {
    setProcessingId(id);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/formation-requests/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: true })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Demande acceptée');
        fetchRequests();
      } else {
        toast.error(data.message || 'Erreur lors de l\'acceptation');
      }
    } catch (err) {
      toast.error('Erreur lors de l\'acceptation');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin w-8 h-8" /></div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Demandes d'inscription aux formations</h1>
      {requests.length === 0 ? (
        <div className="text-center text-gray-500">Aucune demande en attente.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((req) => (
            <Card key={req.id} className="flex flex-col justify-between">
              <CardContent className="p-6">
                <div className="mb-2 text-sm text-gray-500">Formation</div>
                <div className="font-semibold text-lg mb-2">{req.formation.name}</div>
                <div className="mb-2 text-sm text-gray-500">Candidat</div>
                <div className="font-medium">{req.user.firstName} {req.user.lastName}</div>
                <div className="text-xs text-gray-400">{req.user.email}</div>
                <div className="mt-4 text-xs text-gray-400">Demandé le {req.createdAt}</div>
              </CardContent>
              <CardFooter className="p-6 pt-0 flex justify-end">
                <Button
                  onClick={() => handleAccept(req.id)}
                  disabled={processingId === req.id}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {processingId === req.id ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
                  Accepter
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 