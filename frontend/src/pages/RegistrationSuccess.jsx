import { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

/**
 * Page de succès d'inscription
 * Affiche une confirmation après l'inscription réussie et redirige si accédée directement
 * @returns {JSX.Element} Page de confirmation d'inscription
 */
export default function RegistrationSuccess() {
  // Vérifier si l'utilisateur vient bien de terminer l'inscription
  const registrationCompleted = sessionStorage.getItem('registrationCompleted');

  // Effet pour nettoyer la session après chargement
  useEffect(() => {
    if (registrationCompleted) {
      // Nettoyer après affichage
      const cleanupTimeout = setTimeout(() => {
        sessionStorage.removeItem('registrationCompleted');
      }, 1000);
      
      return () => clearTimeout(cleanupTimeout);
    }
  }, [registrationCompleted]);

  // Rediriger si l'utilisateur n'a pas terminé l'inscription
  if (!registrationCompleted) {
    return <Navigate to="/register" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6 py-8">
      <div className="mx-auto w-full max-w-md text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-6 w-6 text-green-600" aria-hidden="true" />
        </div>
        
        <h1 className="mt-2 text-center text-2xl font-bold tracking-tight text-gray-900">
          Inscription réussie !
        </h1>
        
        <p className="mt-2 text-center text-sm text-gray-600">
          Votre compte a été créé avec succès. Veuillez vérifier votre boîte mail pour confirmer votre adresse email avant de vous connecter.
        </p>
        
        <div className="mt-6 flex flex-col space-y-4">
          <Link
            to="/login"
            className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Aller à la page de connexion
          </Link>
          
          <p className="text-center text-xs text-gray-500">
            Vous n&apos;avez pas reçu l&apos;email ? <Link to="/resend-verification" className="font-medium text-blue-600 hover:text-blue-500">Renvoyer l&apos;email de vérification</Link>
          </p>
        </div>
      </div>
    </div>
  );
} 