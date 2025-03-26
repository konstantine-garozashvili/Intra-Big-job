import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { authService } from '@/lib/services/authService';

const RegistrationSuccess = () => {
  const navigate = useNavigate();
  
  // Rediriger vers la page de connexion si l'utilisateur n'a pas été redirigé ici après inscription
  useEffect(() => {
    const registrationCompleted = sessionStorage.getItem('registrationCompleted');
    
    if (!registrationCompleted) {
      navigate('/login');
    }
    
    // Nettoyer le stockage de session après vérification
    return () => {
      sessionStorage.removeItem('registrationCompleted');
    };
  }, [navigate]);
  
  return (
    <div className="flex flex-col items-center justify-center p-8 max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        
        <h1 className="text-2xl font-bold mb-4">Inscription réussie !</h1>
        
        <p className="text-gray-600 mb-6">
          Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter pour accéder à votre espace personnel.
        </p>
        
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link to="/login">Se connecter</Link>
          </Button>
          
          <p className="text-sm text-gray-500">
            Si vous avez des questions, n'hésitez pas à contacter notre support.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegistrationSuccess; 