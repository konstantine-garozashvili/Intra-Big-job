import { useState, useEffect } from 'react';
import { Badge } from '../ui/badge';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { toast } from 'sonner';
import { CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const SignatureMonitoring = () => {
  const [signatures, setSignatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch signatures
  useEffect(() => {
    const fetchSignatures = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/signatures', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch signatures');
        }

        const data = await response.json();
        setSignatures(data.signatures);
        setError(null);
      } catch (err) {
        setError('Impossible de récupérer les signatures. Veuillez réessayer plus tard.');
        toast.error('Erreur', {
          description: 'Impossible de récupérer les signatures. Veuillez réessayer plus tard.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSignatures();
    
    // Set up polling to refresh signatures every minute
    const intervalId = setInterval(fetchSignatures, 60000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Handle signature validation
  const handleValidate = async (signatureId) => {
    try {
      const response = await fetch(`/api/signatures/${signatureId}/validate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to validate signature');
      }

      // Update the signatures list
      setSignatures(signatures.map(sig => 
        sig.id === signatureId ? { ...sig, validated: true } : sig
      ));

      toast.success('Validation réussie', {
        description: 'La signature a été validée avec succès.'
      });
    } catch (err) {
      toast.error('Erreur de validation', {
        description: 'Impossible de valider la signature. Veuillez réessayer.'
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (signatures.length === 0) {
    return (
      <Alert variant="info">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Information</AlertTitle>
        <AlertDescription>
          Aucune signature n'est disponible pour le moment.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Suivi des signatures</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {signatures.map((signature) => (
          <div 
            key={signature.id} 
            className="border rounded-lg p-4 shadow-sm bg-white dark:bg-gray-800"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-medium">
                  {signature.user.firstName} {signature.user.lastName}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {format(new Date(signature.date), 'PPP à HH:mm', { locale: fr })}
                </p>
              </div>
              <Badge variant={signature.validated ? "success" : "pending"}>
                {signature.validated ? "Validé" : "En attente"}
              </Badge>
            </div>
            
            <div className="text-sm mb-3">
              <p><strong>Localisation:</strong> {signature.location}</p>
            </div>
            
            {!signature.validated && (
              <button
                onClick={() => handleValidate(signature.id)}
                className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
              >
                Valider la présence
              </button>
            )}
            
            {signature.validated && (
              <div className="flex items-center text-green-500">
                <CheckCircle className="h-4 w-4 mr-1" />
                <span className="text-sm">Présence confirmée</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SignatureMonitoring;
