import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../../lib/services/apiService';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { toast } from 'sonner';

// Fonction pour évaluer la force du mot de passe
const evaluatePasswordStrength = (password) => {
    if (!password) return 0;
    
    let score = 0;
    
    // Longueur du mot de passe
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    // Présence de chiffres
    if (/\d/.test(password)) score += 1;
    
    // Présence de lettres minuscules et majuscules
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
    
    // Présence de caractères spéciaux
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
    
    return Math.min(score, 4); // Score de 0 à 4
};

// Composant pour afficher la force du mot de passe
const PasswordStrengthIndicator = ({ password }) => {
    const strength = evaluatePasswordStrength(password);
    
    // Déterminer la couleur et le texte en fonction de la force
    const getColorClass = () => {
        switch (strength) {
            case 0: return "bg-gray-200";
            case 1: return "bg-red-500";
            case 2: return "bg-orange-500";
            case 3: return "bg-yellow-500";
            case 4: return "bg-green-500";
            default: return "bg-gray-200";
        }
    };
    
    const getText = () => {
        switch (strength) {
            case 0: return "Veuillez entrer un mot de passe";
            case 1: return "Très faible";
            case 2: return "Faible";
            case 3: return "Moyen";
            case 4: return "Fort";
            default: return "";
        }
    };
    
    // Calculer le pourcentage de progression
    const strengthPercentage = (strength / 4) * 100;
    
    return (
        <div className="mt-1 space-y-1">
            <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                <div 
                    className={`h-full ${getColorClass()} transition-all duration-300`} 
                    style={{ width: `${strengthPercentage}%` }}
                ></div>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">{getText()}</span>
                <span className="text-xs text-gray-500">{strength > 0 ? `${strength}/4` : ""}</span>
            </div>
        </div>
    );
};

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
            
            try {
                console.log('Vérification du token:', token);
                const response = await apiService.get(`/api/reset-password/verify/${token}`);
                console.log('Réponse de vérification:', response);
                
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
            console.log('Envoi de la réinitialisation pour le token:', token);
            
            const response = await apiService.post(`/api/reset-password/reset/${token}`, { 
                password
            });
            
            console.log('Réponse de réinitialisation:', response);
            
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
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="new-password"
                                    required
                                    className="w-full"
                                />
                                <PasswordStrengthIndicator password={password} />
                                <p className="text-xs text-gray-500 mt-1">
                                    Le mot de passe doit contenir au moins 8 caractères, une lettre minuscule, une lettre majuscule, un chiffre et un caractère spécial.
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
