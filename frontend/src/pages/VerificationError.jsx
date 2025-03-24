import { Link } from 'react-router-dom';
import { XCircle } from 'lucide-react';

const VerificationError = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div 
        className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-lg fade-in-up"
      >
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            Erreur de vérification
          </h2>
          <p className="mt-4 text-gray-600">
            Nous n'avons pas pu vérifier votre adresse email. Le lien est peut-être expiré ou invalide.
          </p>
          <div className="mt-8 space-y-4">
            <Link
              to="/login"
              className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Retour à la connexion
            </Link>
            <p className="text-sm text-gray-500">
              Besoin d'aide ? <a href="#" className="font-medium text-blue-600 hover:text-blue-500">Contactez notre support</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationError; 