import React, { useEffect } from 'react';
import { AuthForm } from '@/components/AuthForm';
import { Button } from '@/components/ui/button';
import { authService } from '@/lib/services/authService';
import PageTransition from '@/components/PageTransition';
import { useLocation } from 'react-router-dom';

const Welcome = () => {
  // Fonction pour réinitialiser le localStorage
  const handleReset = () => {
    authService.clearStorageAndRedirect();
  };

  // Récupérer les paramètres d'URL pour afficher des messages
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const errorParam = searchParams.get('error');

  // Déterminer le message d'erreur à afficher
  const getErrorMessage = () => {
    if (errorParam === 'session_expired') {
      return "Votre session a expiré ou est invalide. Veuillez vous reconnecter.";
    }
    return null;
  };

  const errorMessage = getErrorMessage();

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md px-4">
          {errorMessage && (
            <div className="mb-6 p-4 border border-red-300 bg-red-50 text-red-700 rounded-md">
              <p className="font-medium mb-1">Session expirée</p>
              <p className="text-sm">{errorMessage}</p>
            </div>
          )}
          
          <AuthForm />
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 mb-2">Problèmes de connexion?</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleReset}
              className="text-xs"
            >
              Réinitialiser la session
            </Button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Welcome; 