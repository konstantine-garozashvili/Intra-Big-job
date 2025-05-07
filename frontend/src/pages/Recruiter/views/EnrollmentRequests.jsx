import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Loader2, UserCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function getInitials(user) {
  if (!user) return '';
  return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
}

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

  const handleReject = async (id) => {
    setProcessingId(id);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/formation-requests/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        toast.success('Demande supprimée');
        fetchRequests();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Erreur lors de la suppression');
      }
    } catch (err) {
      toast.error('Erreur lors de la suppression');
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {requests.map((req, idx) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.07, duration: 0.5, type: 'spring', stiffness: 120 }}
            >
              <Card className="flex flex-col justify-between shadow-xl border-0 bg-gradient-to-br from-yellow-50/80 to-yellow-100/60 dark:from-yellow-900/30 dark:to-yellow-800/20 hover:scale-[1.025] transition-transform">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    {/* Avatar */}
                    {req.user.profilePictureUrl ? (
                      <img src={req.user.profilePictureUrl} alt={req.user.firstName} className="w-12 h-12 rounded-full object-cover border-2 border-yellow-300" />
                    ) : (
                      <Avatar className="h-12 w-12 border-2 border-yellow-300">
                        <AvatarFallback className="bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-100">
                          {getInitials(req.user)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div>
                      <div className="font-semibold text-lg text-yellow-900 dark:text-yellow-100">{req.user.firstName} {req.user.lastName}</div>
                      <div className="text-xs text-yellow-700 dark:text-yellow-300">{req.user.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-gray-500">Formation</span>
                    <span className="px-2 py-0.5 rounded-full bg-yellow-200 dark:bg-yellow-700 text-yellow-900 dark:text-yellow-100 text-xs font-semibold ml-2">
                      {req.formation.name}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-gray-400">Demandé le {formatDate(req.createdAt)}</div>
                </CardContent>
                <CardFooter className="p-6 pt-0 flex justify-end gap-2">
                  <Button
                    onClick={() => handleAccept(req.id)}
                    disabled={processingId === req.id}
                    className="bg-gradient-to-r from-yellow-300 to-yellow-500 text-yellow-900 font-bold rounded-full shadow-lg hover:from-yellow-400 hover:to-yellow-600 hover:scale-105 focus:ring-2 focus:ring-yellow-300 transition-all px-5 py-2"
                  >
                    {processingId === req.id ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
                    Accepter
                  </Button>
                  <Button
                    onClick={() => handleReject(req.id)}
                    disabled={processingId === req.id}
                    className="bg-gradient-to-r from-orange-300 to-orange-500 text-orange-900 font-bold rounded-full shadow-lg hover:from-orange-400 hover:to-orange-600 hover:scale-105 focus:ring-2 focus:ring-orange-300 transition-all px-5 py-2"
                  >
                    {processingId === req.id ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
                    Refuser
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
} 