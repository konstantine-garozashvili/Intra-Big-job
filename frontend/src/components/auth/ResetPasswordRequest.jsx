import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../lib/services/apiService';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { toast } from 'sonner';
import { send } from '@emailjs/browser';

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
            console.log('Envoi de la demande de réinitialisation pour:', email);
            
            // Appel API pour demander la réinitialisation
            const response = await apiService.post('/reset-password/request', { email });
            
            console.log('Réponse reçue du backend:', response);
            
            // Si la réponse contient success=true et un token
            if (response.success && response.token) {
                console.log('Token reçu, préparation de l\'envoi d\'email');
                
                // Préparer les données pour EmailJS
                const templateParams = {
                    username: email.split('@')[0],
                    reset_link: `${window.location.origin}/reset-password/${response.token}`,
                    expiry_time: "30", // Durée de validité en minutes
                    email: email
                };
                
                console.log('Paramètres du template:', templateParams);
                console.log('Service ID:', import.meta.env.VITE_EMAILJS_SERVICE_ID);
                console.log('Template ID:', import.meta.env.VITE_EMAILJS_TEMPLATE_ID);
                
                try {
                    // Envoyer l'email avec EmailJS
                    const emailResponse = await send(
                        import.meta.env.VITE_EMAILJS_SERVICE_ID,
                        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
                        templateParams,
                        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
                    );

                    console.log('Email envoyé avec succès:', emailResponse);
                    
                    // Message de succès
                    toast.success('Si votre email est enregistré dans notre système, vous recevrez un lien de réinitialisation');
                
                    // Rediriger vers la page de confirmation
                    navigate('/reset-password/confirmation', { 
                        state: { email } 
                    });
                } catch (emailError) {
                    console.error('Erreur lors de l\'envoi de l\'email:', emailError);
                    toast.error('Erreur lors de l\'envoi de l\'email. Veuillez réessayer.');
                }
            } else {
                // En cas d'erreur côté serveur mais avec une réponse 200
                console.log('Réponse sans token ou avec success=false');
                toast.success('Si votre email est enregistré dans notre système, vous recevrez un lien de réinitialisation');
                
                // On redirige quand même pour ne pas révéler si l'email existe ou non
                navigate('/reset-password/confirmation', { 
                    state: { email } 
                });
            }
        } catch (error) {
            console.error('Erreur lors de la demande de réinitialisation:', error);
            toast.error('Une erreur est survenue lors de la demande de réinitialisation');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Réinitialisation de mot de passe</CardTitle>
                    <CardDescription>
                        Entrez votre adresse email pour recevoir un lien de réinitialisation
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
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
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Button variant="link" onClick={() => navigate('/login')}>
                        Retour à la connexion
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default ResetPasswordRequest;