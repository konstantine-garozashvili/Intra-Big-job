import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function VerificationSuccess() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6 py-8">
      <div className="mx-auto w-full max-w-md text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        
        <h1 className="mt-2 text-center text-2xl font-bold tracking-tight text-gray-900">
          Vérification réussie
        </h1>
        
        <p className="mt-2 text-center text-sm text-gray-600">
          Votre adresse email a été vérifiée avec succès. Vous pouvez maintenant vous connecter à votre compte.
        </p>
        
        <div className="mt-6 flex flex-col space-y-4">
          <Link
            to="/login"
            className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Se connecter
          </Link>
          
          <p className="text-center text-xs text-gray-500">
            Besoin d&apos;aide ? <a href="#" className="font-medium text-blue-600 hover:text-blue-500">Contactez notre support</a>
          </p>
        </div>
      </div>
    </div>
  );
} 