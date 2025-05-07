import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, BookOpen, Inbox, ArrowLeft, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const GuestEnrollmentRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  const fetchRequests = () => {
    setLoading(true);
    fetch('/api/formation-requests/my', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.requests) {
          // Only show pending requests (status === null)
          setRequests(data.requests.filter(r => r.status === null));
        } else {
          setRequests([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Erreur lors du chargement des demandes.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleCancelRequest = async (requestId) => {
    setDeletingId(requestId);
    try {
      const response = await fetch(`/api/formation-requests/${requestId}/cancel`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de l\'annulation de la demande');
      }

      toast.success('Demande annulée avec succès');
      fetchRequests(); // Refresh the list
    } catch (error) {
      toast.error(error.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="p-4 text-center text-red-600 bg-red-50 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <BookOpen className="w-7 h-7 text-gray-600" />
          <h1 className="text-2xl font-semibold text-gray-800">Mes demandes d'inscription</h1>
        </div>
        <Button
          variant="ghost"
          className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Retour
        </Button>
      </div>

      {requests.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl shadow-sm"
        >
          <Inbox className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-medium text-gray-700 mb-2">Aucune demande en attente</h2>
          <p className="text-gray-500 mb-6 max-w-md">
            Vous n'avez pas encore fait de demande d'inscription à une formation.
          </p>
          <Button
            onClick={() => navigate('/formations')}
            className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Voir les formations
          </Button>
        </motion.div>
      ) : (
        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="space-y-4 pr-4">
            <AnimatePresence>
              {requests.map((req, idx) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                >
                  <Card className="overflow-hidden border border-gray-100 hover:border-gray-200 transition-colors">
                    <CardHeader className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-50 rounded-lg">
                            <BookOpen className="w-5 h-5 text-gray-600" />
                          </div>
                          <CardTitle className="text-lg font-medium text-gray-800">
                            {req.formation.name}
                          </CardTitle>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                          onClick={() => handleCancelRequest(req.id)}
                          disabled={deletingId === req.id}
                        >
                          {deletingId === req.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-sm text-gray-500">
                        Demandé le {new Date(req.createdAt).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default GuestEnrollmentRequests; 