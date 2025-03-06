import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../../lib/services/apiService';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { toast } from 'sonner';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isValid, setIsValid] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { token } = useParams();
    const navigate = useNavigate();

    // Vérification de validité du token
    useEffect(() => {
        const verifyToken = async () => {
            setIsLoading(true);
            
            // Mode développement: simulation de validation du token
            // TODO: Décommenter le code ci-dessous et supprimer cette simulation
            // quand le backend sera fonctionnel
            
            // Simulation d'une attente réseau
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Simuler une validation réussie
            if (token && token.length > 10) {
                setIsValid(true);
                toast.success('Vous pouvez maintenant définir votre nouveau mot de passe');
            } else {
                setIsValid(false);
                toast.error('Ce lien de réinitialisation est invalide ou a expiré');
            }
            
            setIsLoading(false);
            
            /* Code réel commenté temporairement
            try {
                const response = await apiService.get(`/api/reset-password/verify/${token}`);
                if (!response.data.success) {
                    setIsValid(false);
                    toast.error(response.data.message || 'Lien de réinitialisation invalide');
                } else {
                    setIsValid(true);
                }
            } catch (error) {
                setIsValid(false);
                toast.error('Ce lien de réinitialisation est invalide ou a expiré.');
            } finally {
                setIsLoading(false);
            }
            */
        };

        if (token) {
            verifyToken();
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation de base
        if (password.length < 8) {
            toast.error('Le mot de passe doit contenir au moins 8 caractères');
            return;
        }
        
        if (password !== confirmPassword) {
            toast.error('Les mots de passe ne correspondent pas');
            return;
        }
        
        setIsSubmitting(true);
        
        // Mode développement: simulation de réinitialisation réussie
        // TODO: Décommenter le code ci-dessous et supprimer cette simulation
        // quand le backend sera fonctionnel
        
        try {
            // Simulation d'une attente réseau
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Simuler une réponse réussie
            toast.success('Votre mot de passe a été réinitialisé avec succès');
            
            // Redirection vers la page de connexion après un court délai
            setTimeout(() => {
                navigate('/login');
            }, 2000);
            
            /* Code réel commenté temporairement
            const response = await apiService.post(`/api/reset-password/reset/${token}`, { 
                password,
                confirmPassword 
            });
            
            if (response.data.success) {
                toast.success('Votre mot de passe a été réinitialisé avec succès');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                toast.error(response.data.message || 'Une erreur est survenue');
            }
            */
        } catch (error) {
            const errorMessage = error.response?.data?.message || 
                                'Impossible de réinitialiser votre mot de passe. Veuillez réessayer plus tard.';
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Affichage pendant le chargement
    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <p>Vérification du token...</p>
                </div>
            </div>
        );
    }

    // Affichage si le token est invalide
    if (!isValid) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Lien invalide ou expiré</CardTitle>
                        <CardDescription>
                            Le lien de réinitialisation que vous avez utilisé est invalide ou a expiré.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-center">
                            Veuillez demander un nouveau lien de réinitialisation.
                        </p>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <Button 
                            onClick={() => navigate('/reset-password')}
                        >
                            Demander un nouveau lien
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    // Formulaire de réinitialisation
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Définir un nouveau mot de passe</CardTitle>
                    <CardDescription>
                        Veuillez entrer et confirmer votre nouveau mot de passe.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label 
                                    htmlFor="password" 
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Nouveau mot de passe
                                </label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="new-password"
                                    required
                                    className="w-full"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Le mot de passe doit contenir au moins 8 caractères.
                                </p>
                            </div>
                            
                            <div>
                                <label 
                                    htmlFor="confirmPassword" 
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Confirmer le mot de passe
                                </label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    autoComplete="new-password"
                                    required
                                    className="w-full"
                                />
                            </div>
                            
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Mise à jour...' : 'Réinitialiser mon mot de passe'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default ResetPassword;
