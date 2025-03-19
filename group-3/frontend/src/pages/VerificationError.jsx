import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XCircle } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import apiService from '@/lib/services/apiService';

const VerificationError = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleResendEmail = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setMessage('Veuillez entrer votre adresse email');
      setIsSuccess(false);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await apiService.post('/resend-verification-email', { email });
      
      setIsSuccess(true);
      setMessage('Un nouvel email de vérification a été envoyé. Veuillez vérifier votre boîte de réception.');
    } catch (error) {
      setIsSuccess(false);
      setMessage(error.response?.data?.message || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-lg"
      >
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            Erreur de vérification
          </h2>
          <p className="mt-4 text-gray-600">
            Le lien de vérification est invalide ou a expiré. Veuillez demander un nouveau lien de vérification.
          </p>
          
          <form className="mt-8 w-full" onSubmit={handleResendEmail}>
            <div className="rounded-md shadow-sm">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Entrez votre adresse email"
                className="relative block w-full rounded-md border-0 py-3 px-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
                required
              />
            </div>
            
            {message && (
              <div className={`mt-4 text-sm ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </div>
            )}
            
            <div className="mt-4 flex flex-col space-y-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-70"
              >
                {isSubmitting ? 'Envoi en cours...' : 'Renvoyer l\'email de vérification'}
              </button>
              
              <Link
                to="/login"
                className="flex w-full justify-center rounded-md border border-gray-300 bg-white px-3 py-3 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50"
              >
                Retour à la connexion
              </Link>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default VerificationError; 