import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-[#02284f] text-gray-200 py-6 shadow-lg w-full mt-auto">
      <div className="container mx-auto px-4">
        {/* Contenu principal du footer */}
        <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-700 pb-4">
          {/* Logo ou Nom du site */}
          <div className="text-2xl font-black">
          OHS <span className="text-[#528eb2]">COURS</span>
          </div>

          {/* Liens de navigation */}
          <nav className="mt-4 md:mt-0">
            <ul className="flex space-x-6">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/konstantine-garozashvili/Intra-Big-job"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  GitHub
                </a>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Bas du footer */}
        <div className="text-center text-sm text-gray-400 mt-4">
          &copy; {new Date().getFullYear()} OHS COURS. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
