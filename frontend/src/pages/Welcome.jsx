import Navbar from '../components/Navbar';

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
          
          <div className="p-6 bg-gray-100 rounded-lg">
            <h2 className="mb-4 text-2xl font-bold text-[#02284f]">À propos du projet</h2>
            <p className="mb-4 text-gray-700">
              Le projet Big-Job est une plateforme éducative permettant aux utilisateurs de gérer et suivre des tâches associées à des utilisateurs. 
              Le système utilise React et Tailwind CSS pour le frontend, et Symfony avec Doctrine ORM pour le backend.
            </p>
            <p className="mb-4 text-gray-700">
              Pour plus de détails sur l'installation, la configuration et le travail avec ce projet, veuillez consulter le fichier <strong>README.md</strong> à la racine du projet.
            </p>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-xl font-medium text-[#02284f] italic">
              "Nous vous souhaitons bonne chance à tous dans vos développements "
            </p>
            <p className="mt-2 text-sm text-gray-500">
              L'équipe du projet vous encourage dans cette aventure technique eeeeee 
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome; 