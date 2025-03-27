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

    // Ajout de logs pour vérifier les variables d'environnement au chargement du composant
    console.log('Variables d\'environnement EmailJS au chargement:');
    console.log('Service ID:', import.meta.env.VITE_EMAILJS_SERVICE_ID);
    console.log('Template ID:', import.meta.env.VITE_EMAILJS_TEMPLATE_ID);
    console.log('Public Key:', import.meta.env.VITE_EMAILJS_PUBLIC_KEY);

    // Fonction de test pour envoyer un email directement
    const testSendEmail = async () => {
        try {
            console.log('Test d\'envoi d\'email direct...');
            const testToken = 'test_token_' + Date.now();
            
            await emailService.sendPasswordResetEmail({
                email: email,
                token: testToken
            });
            
            toast.success('Email de test envoyé avec succès');
        } catch (error) {
            console.error('Erreur lors du test d\'envoi d\'email:', error);
            toast.error('Erreur lors de l\'envoi de l\'email de test');
        }
    };

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
            console.log('Structure de la réponse:', JSON.stringify(response, null, 2));
            
            // Vérifier si la réponse contient un token (soit directement, soit dans data)
            const token = response.token || (response.data && response.data.token);
            
            // Si la réponse contient success=true et un token
            if (response.success && token) {
                console.log('Token reçu, préparation de l\'envoi d\'email:', token.substring(0, 10) + '...');
                
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
                            
                            {/* Bouton de test pour l'envoi direct d'email */}
                            <Button 
                                type="button" 
                                className="w-full mt-2" 
                                variant="outline"
                                onClick={testSendEmail}
                                disabled={!email || !email.includes('@')}
                            >
                                Tester l'envoi d'email
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