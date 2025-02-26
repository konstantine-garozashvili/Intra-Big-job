import Navbar from '../components/Navbar';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../components/ui/accordion';

const Welcome = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#02284f] via-[#02284f]/90 to-[#02284f]/80">
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4">
        <div className="max-w-4xl p-8 bg-white rounded-xl shadow-2xl">
          <h1 className="mb-6 text-4xl font-extrabold text-center text-[#02284f]">
            Bienvenue sur <span className="text-[#528eb2]">Big Project</span>
          </h1>
          
          <div className="p-4 mb-6 bg-green-100 border border-green-200 rounded-lg">
            <p className="text-lg text-green-700 text-center">
              Tout est configuré et prêt à l'emploi !
            </p>
          </div>
          
          <div className="mb-8 text-lg text-gray-700">
            <p className="mb-4">
              Ce projet est prêt pour le développement. Voici quelques informations importantes :
            </p>
            
            <ul className="pl-6 list-disc space-y-2">
              <li>La base de données MySQL est configurée et accessible via PHPMyAdmin sur <a href="http://localhost:8080" className="text-[#528eb2] hover:underline" target="_blank" rel="noopener noreferrer">localhost:8080</a></li>
              <li>Le backend API est disponible sur <a href="http://localhost:8000" className="text-[#528eb2] hover:underline" target="_blank" rel="noopener noreferrer">localhost:8000</a></li>
              <li>Le frontend que vous regardez actuellement est sur <a href="http://localhost:5173" className="text-[#528eb2] hover:underline" target="_blank" rel="noopener noreferrer">localhost:5173</a></li>
            </ul>
          </div>
          
          <div className="p-6 bg-gray-100 rounded-lg mb-6">
            <h2 className="mb-4 text-2xl font-bold text-[#02284f]">À propos du projet</h2>
            <p className="mb-4 text-gray-700">
              Le projet BigProject est une plateforme éducative permettant aux utilisateurs de gérer et suivre des tâches associées à des utilisateurs. 
              Le système utilise React et Tailwind CSS pour le frontend, et Symfony avec Doctrine ORM pour le backend.
            </p>
            <p className="mb-4 text-gray-700">
              Pour plus de détails sur l'installation, la configuration et le travail avec ce projet, veuillez consulter le fichier <strong>README.md</strong> à la racine du projet.
            </p>
          </div>
          
          <div className="p-6 bg-gray-50 rounded-lg mb-6">
            <h2 className="mb-4 text-2xl font-bold text-[#02284f]">Spécifications Techniques</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="architecture">
                <AccordionTrigger className="text-[#02284f] font-medium">Architecture du Projet</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-2">Le projet BigProject suit une architecture client-serveur moderne avec :</p>
                  <ul className="pl-6 list-disc space-y-1">
                    <li>Frontend : Application monopage basée sur React</li>
                    <li>Backend : API RESTful basée sur Symfony</li>
                    <li>Base de données : MySQL</li>
                    <li>Infrastructure : Conteneurisation Docker</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="frontend">
                <AccordionTrigger className="text-[#02284f] font-medium">Technologies Frontend</AccordionTrigger>
                <AccordionContent>
                  <p className="font-medium mb-2">Frameworks et Bibliothèques Principales :</p>
                  <ul className="pl-6 list-disc space-y-1 mb-3">
                    <li>Node.js : 18.x (image Docker basée sur Alpine)</li>
                    <li>React : 19.0.0</li>
                    <li>React DOM : 19.0.0</li>
                    <li>React Router DOM : 6.29.0</li>
                    <li>Axios : 1.8.1 (client HTTP)</li>
                  </ul>
                  <p className="font-medium mb-2">CSS et Style :</p>
                  <ul className="pl-6 list-disc space-y-1">
                    <li>Tailwind CSS : 3.4.17</li>
                    <li>PostCSS : 8.5.3</li>
                    <li>Autoprefixer : 10.4.20</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="backend">
                <AccordionTrigger className="text-[#02284f] font-medium">Technologies Backend</AccordionTrigger>
                <AccordionContent>
                  <p className="font-medium mb-2">Framework Principal :</p>
                  <ul className="pl-6 list-disc space-y-1 mb-3">
                    <li>PHP : 8.2 (version FPM dans Docker)</li>
                    <li>Symfony : 7.2.* (Tous les composants Symfony utilisent cette version)</li>
                    <li>Composer : Dernière version (gestionnaire de paquets)</li>
                  </ul>
                  <p className="font-medium mb-2">Base de Données et ORM :</p>
                  <ul className="pl-6 list-disc space-y-1">
                    <li>MySQL : 8.0.32</li>
                    <li>Doctrine ORM : 3.3.*</li>
                    <li>Doctrine DBAL : 3.*</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="database">
                <AccordionTrigger className="text-[#02284f] font-medium">Gestion de la Base de Données</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-2">Pour travailler avec la base de données MySQL :</p>
                  <ul className="pl-6 list-disc space-y-1">
                    <li>Accès via PHPMyAdmin : <a href="http://localhost:8080" className="text-[#528eb2] hover:underline">http://localhost:8080</a> (utilisateur : root, mot de passe : root)</li>
                    <li>Les entités sont définies dans <code className="bg-gray-100 px-1 rounded">backend/src/Entity/</code></li>
                    <li>Les migrations sont stockées dans <code className="bg-gray-100 px-1 rounded">backend/migrations/</code></li>
                    <li>En ligne de commande : <code className="bg-gray-100 px-1 rounded">docker exec -it infra-database-1 mysql -uroot -proot bigproject</code></li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="infrastructure">
                <AccordionTrigger className="text-[#02284f] font-medium">Infrastructure</AccordionTrigger>
                <AccordionContent>
                  <ul className="pl-6 list-disc space-y-1">
                    <li>Serveur Web : Nginx (version Alpine)</li>
                    <li>Conteneurisation : Docker et Docker Compose</li>
                    <li>Base de Données : MySQL 8.0 (Plugin d'authentification : mysql_native_password)</li>
                    <li>Démarrage des conteneurs : <code className="bg-gray-100 px-1 rounded">docker-compose infra/docker-compose.yml up -d --build</code></li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-xl font-medium text-[#02284f] italic">
              "Nous vous souhaitons bonne chance à tous dans vos développements "
            </p>
            <p className="mt-2 text-sm text-gray-500">
              L'équipe du projet vous encourage dans cette aventure technique 
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome; 