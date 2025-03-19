import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';

const ResetPasswordConfirmation = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || 'votre adresse email';

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Email envoyé</CardTitle>
                    <CardDescription>
                        Instructions de réinitialisation envoyées
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center space-y-4">
                        <div className="bg-green-50 text-green-700 p-4 rounded-md mb-4">
                            <p>Nous avons envoyé un email à <strong>{email}</strong> avec les instructions pour réinitialiser votre mot de passe.</p>
                        </div>
                        <p className="text-sm text-gray-600">
                            Si vous ne recevez pas d'email dans les prochaines minutes, veuillez vérifier votre dossier spam ou essayer de nouveau.
                        </p>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-center space-x-4">
                    <Button 
                        variant="outline" 
                        onClick={() => navigate('/reset-password')}
                    >
                        Renvoyer un email
                    </Button>
                    <Button 
                        onClick={() => navigate('/login')}
                    >
                        Retour à la connexion
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default ResetPasswordConfirmation;
