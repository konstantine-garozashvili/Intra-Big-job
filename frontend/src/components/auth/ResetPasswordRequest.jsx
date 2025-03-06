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
            // Mode développement: simulation de réponse réussie
            // TODO: Décommenter le code ci-dessous et supprimer cette simulation
            // quand le backend sera fonctionnel
            
            // Simulation d'une attente réseau
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Simuler une réponse réussie
            toast.success('Si votre email est enregistré dans notre système, vous recevrez un lien de réinitialisation');
            
            // Rediriger vers la page de confirmation
            navigate('/reset-password/confirmation', { 
                state: { email } 
            });
            
            /* Code réel commenté temporairement
            const response = await apiService.post('/api/reset-password/request', { email });
            
            if (response.data.success) {
                // Rediriger vers la page de confirmation
                navigate('/reset-password/confirmation', { 
                    state: { email } 
                });
            } else {
                toast.error(response.data.message || 'Une erreur est survenue');
            }
            */
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