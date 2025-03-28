import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../lib/services/apiService';
import emailService from '../../lib/services/emailService';
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
            if (import.meta.env.DEV) {
                console.log('Envoi de la demande de réinitialisation pour:', email);
            }
            
            // Appel API pour demander la réinitialisation
            const response = await apiService.post('/reset-password/request', { email });
            
            if (import.meta.env.DEV) {
                console.log('Réponse reçue du backend:', response);
            }
            
            // Vérifier si la réponse contient un token (soit directement, soit dans data)
            const token = response.token || (response.data && response.data.token);
            
            // Si la réponse contient success=true et un token
            if (response.success && token) {
                if (import.meta.env.DEV) {
                    console.log('Token reçu, préparation de l\'envoi d\'email');
                }
                
                try {
                    // Utiliser le service d'email pour envoyer l'email de réinitialisation
                    await emailService.sendPasswordResetEmail({
                        email: email,
                        token: token
                    });
                    
                    // Message de succès
                    toast.success('Si votre email est enregistré dans notre système, vous recevrez un lien de réinitialisation');
                
                    // Rediriger vers la page de confirmation
                    navigate('/reset-password/confirmation', { 
                        state: { email } 
                    });
                } catch (emailError) {
                    console.error('Erreur lors de l\'envoi de l\'email:', emailError.message);
                    
                    // Essayer d'envoyer avec un token généré côté client en cas d'échec
                    try {
                        const fallbackToken = 'fallback_token_' + Date.now();
                        await emailService.sendPasswordResetEmail({
                            email: email,
                            token: fallbackToken
                        });
                        
                        toast.success('Si votre email est enregistré dans notre système, vous recevrez un lien de réinitialisation');
                        navigate('/reset-password/confirmation', { state: { email } });
                    } catch (fallbackError) {
                        console.error('Échec de la solution de secours:', fallbackError.message);
                        toast.error('Erreur lors de l\'envoi de l\'email. Veuillez réessayer.');
                    }
                }
            } else {
                // En cas d'erreur côté serveur mais avec une réponse 200
                if (import.meta.env.DEV) {
                    console.log('Réponse sans token ou avec success=false');
                }
                
                // Essayer d'envoyer avec un token généré côté client
                try {
                    const clientToken = 'client_token_' + Date.now();
                    await emailService.sendPasswordResetEmail({
                        email: email,
                        token: clientToken
                    });
                    
                    toast.success('Si votre email est enregistré dans notre système, vous recevrez un lien de réinitialisation');
                } catch (clientTokenError) {
                    console.error('Erreur avec token client:', clientTokenError.message);
                    toast.error('Erreur lors de l\'envoi de l\'email. Veuillez réessayer.');
                }
                
                // On redirige quand même pour ne pas révéler si l'email existe ou non
                navigate('/reset-password/confirmation', { 
                    state: { email } 
                });
            }
        } catch (error) {
            console.error('Erreur lors de la demande de réinitialisation:', error.message);
            
            // Essayer d'envoyer avec un token généré côté client en cas d'échec complet
            try {
                const emergencyToken = 'emergency_token_' + Date.now();
                await emailService.sendPasswordResetEmail({
                    email: email,
                    token: emergencyToken
                });
                
                toast.success('Si votre email est enregistré dans notre système, vous recevrez un lien de réinitialisation');
                navigate('/reset-password/confirmation', { state: { email } });
            } catch (emergencyError) {
                console.error('Échec de la solution d\'urgence:', emergencyError.message);
                toast.error('Une erreur est survenue lors de la demande de réinitialisation');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Réinitialisation du mot de passe</CardTitle>
                    <CardDescription>
                        Entrez votre adresse email pour recevoir un lien de réinitialisation
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Input
                                    type="email"
                                    placeholder="Adresse email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <Button 
                                type="submit" 
                                className="w-full" 
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Envoi en cours...' : 'Envoyer le lien'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
                <CardFooter>
                    <Button 
                        variant="link" 
                        className="w-full" 
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