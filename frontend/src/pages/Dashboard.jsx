import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { toast, Toaster } from 'sonner';

const Dashboard = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="p-8 bg-white rounded-lg shadow-md">
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-semibold text-gray-900">BigProject</Link>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Bonjour, {user.username}</span>
            <Button 
              className="rounded-full px-6 bg-black text-white hover:bg-black/90"
              onClick={handleLogout}
            >
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Tableau de bord</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Welcome Card */}
            <Card className="shadow-lg border-none">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <CardTitle className="text-xl">Bienvenue, {user.username}!</CardTitle>
                <CardDescription className="text-blue-100">Votre espace personnel</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-600">
                  Vous êtes connecté avec l'email: <span className="font-medium text-gray-900">{user.email}</span>
                </p>
              </CardContent>
              <CardFooter className="border-t border-gray-100 pt-4">
                <Button variant="outline" className="w-full">Voir mon profil</Button>
              </CardFooter>
            </Card>
            
            {/* Stats Card */}
            <Card className="shadow-lg border-none">
              <CardHeader>
                <CardTitle className="text-xl">Statistiques</CardTitle>
                <CardDescription>Votre progression</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">Cours complétés</span>
                      <span className="text-sm font-medium text-gray-700">75%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">Exercices réussis</span>
                      <span className="text-sm font-medium text-gray-700">60%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t border-gray-100 pt-4">
                <Button variant="outline" className="w-full">Voir tous les détails</Button>
              </CardFooter>
            </Card>
            
            {/* Recent Activity Card */}
            <Card className="shadow-lg border-none">
              <CardHeader>
                <CardTitle className="text-xl">Activité récente</CardTitle>
                <CardDescription>Vos dernières actions</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  <li className="flex items-center text-sm">
                    <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                    <span className="text-gray-600">Connexion réussie</span>
                    <span className="ml-auto text-gray-400 text-xs">Aujourd'hui</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                    <span className="text-gray-600">Cours "Introduction" terminé</span>
                    <span className="ml-auto text-gray-400 text-xs">Hier</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                    <span className="text-gray-600">Badge "Débutant" obtenu</span>
                    <span className="ml-auto text-gray-400 text-xs">Il y a 3 jours</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="border-t border-gray-100 pt-4">
                <Button variant="outline" className="w-full">Voir toute l'activité</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-bold">BigProject</h2>
              <p className="text-gray-400 mt-2">&copy; {new Date().getFullYear()} Tous droits réservés</p>
            </div>
            
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">À propos</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Confidentialité</a>
            </div>
          </div>
        </div>
      </footer>
      
      <Toaster />
    </div>
  );
};

export default Dashboard;
