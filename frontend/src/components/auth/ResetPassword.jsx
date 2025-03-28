import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../../lib/services/apiService';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { PasswordStrengthIndicator } from '../register/RegisterUtils';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isValid, setIsValid] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { token } = useParams();
    const navigate = useNavigate();

    // Fonctions pour basculer la visibilité des mots de passe
    const togglePasswordVisibility = () => setShowPassword(prev => !prev);
    const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(prev => !prev);

    // Vérification de validité du token
    useEffect(() => {
        const verifyToken = async () => {
            setIsLoading(true);
            
            try {
                if (import.meta.env.DEV) {
                    console.log('Vérification du token:', token);
                }
                
                // Vérifier si c'est un token généré côté client
                const isClientToken = token && (
                    token.startsWith('fallback_token_') || 
                    token.startsWith('client_token_') || 
                    token.startsWith('emergency_token_')
                );
                
                // Si c'est un token généré côté client en mode développement, on le considère valide
                if (isClientToken && import.meta.env.DEV) {
                    if (import.meta.env.DEV) {
                        console.log('Token généré côté client détecté:', token.substring(0, 15) + '...');
                    }
                    setIsValid(true);
                    toast.success('Vous pouvez maintenant définir votre nouveau mot de passe');
                    setIsLoading(false);
                    return;
                }
                
                // Sinon, on vérifie avec le backend
                const response = await apiService.get(`/api/reset-password/verify/${token}`);
                
                if (import.meta.env.DEV) {
                    console.log('Réponse de vérification:', response);
                }
                
                if (response.success) {
                    setIsValid(true);
                    toast.success('Vous pouvez maintenant définir votre nouveau mot de passe');
                } else {
                    setIsValid(false);
                    toast.error(response.message || 'Lien de réinitialisation invalide');
                }
            } catch (error) {
                console.error('Erreur de vérification:', error);
                setIsValid(false);
                toast.error('Ce lien de réinitialisation est invalide ou a expiré.');
            } finally {
                setIsLoading(false);
            }
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
        
        try {
            if (import.meta.env.DEV) {
                console.log('Envoi de la réinitialisation pour le token:', token);
            }
            
            // Vérifier si c'est un token généré côté client
            const isClientToken = token && (
                token.startsWith('fallback_token_') || 
                token.startsWith('client_token_') || 
                token.startsWith('emergency_token_')
            );
            
            // Si c'est un token généré côté client en mode développement, simuler une réponse réussie
            if (isClientToken && import.meta.env.DEV) {
                if (import.meta.env.DEV) {
                    console.log('Réinitialisation avec token client:', token.substring(0, 15) + '...');
                }
                
                // Simuler un délai de traitement
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                toast.success('Votre mot de passe a été réinitialisé avec succès');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
                return;
            }
            
            // Sinon, envoyer la requête au backend
            const response = await apiService.post(`/api/reset-password/reset/${token}`, { 
                password
            });
            
            if (import.meta.env.DEV) {
                console.log('Réponse de réinitialisation:', response);
            }
            
            if (response.success) {
                toast.success('Votre mot de passe a été réinitialisé avec succès');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                toast.error(response.message || 'Une erreur est survenue');
            }
        } catch (error) {
            console.error('Erreur de réinitialisation:', error);
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
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoComplete="new-password"
                                        required
                                        className="w-full pr-10"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={togglePasswordVisibility}
                                        tabIndex="-1"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 text-gray-400" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                                <PasswordStrengthIndicator password={password} />
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
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        autoComplete="new-password"
                                        required
                                        className="w-full pr-10"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={toggleConfirmPasswordVisibility}
                                        tabIndex="-1"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-4 w-4 text-gray-400" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                            </div>
                            
                            <Button 
                                type="submit" 
                                className="w-full"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Traitement en cours...' : 'Réinitialiser le mot de passe'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default ResetPassword;
