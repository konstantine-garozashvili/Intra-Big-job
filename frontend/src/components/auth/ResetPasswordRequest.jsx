import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../lib/services/apiService';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { toast } from 'sonner';

const ResetPasswordRequest = () => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation simple de l'email
        if (!email || !email.includes('@')) {
            toast.error('Veuillez entrer une adresse email valide');
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            // Utiliser le chemin correct avec le préfixe /api
            const response = await apiService.post('/api/reset-password/request', { email });
            
            // Si la réponse contient success=true
            if (response.success) {
                // Message de succès
                toast.success(response.message || 'Si votre email est enregistré dans notre système, vous recevrez un lien de réinitialisation');
                
                // Rediriger vers la page de confirmation
                navigate('/reset-password/confirmation', { 
                    state: { email } 
                });
            } else {
                // En cas d'erreur côté serveur mais avec une réponse 200
                toast.error(response.message || 'Une erreur est survenue');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 
                               'Impossible de traiter votre demande. Veuillez réessayer plus tard.';
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Réinitialisation de mot de passe</CardTitle>
                    <CardDescription>
                        Entrez votre adresse email pour recevoir un lien de réinitialisation.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label 
                                htmlFor="email" 
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Adresse email
                            </label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="exemple@email.com"
                                autoComplete="email"
                                required
                                className="w-full"
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Envoi en cours...' : 'Envoyer le lien'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Button 
                        variant="link" 
                        onClick={() => navigate('/login')}
                    >
                        Retour à la connexion
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default ResetPasswordRequest;