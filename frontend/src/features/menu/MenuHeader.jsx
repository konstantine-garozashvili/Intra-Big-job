import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, X } from 'lucide-react';
import { translateRoleName } from './menuConfig';

/**
 * Composant MenuHeader - Affiche l'en-tête du menu avec les informations utilisateur ou l'invitation à se connecter
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {Array} props.roles - Les rôles de l'utilisateur
 * @param {Object} props.userData - Les données de l'utilisateur
 * @param {boolean} props.isLoading - Indique si les données sont en cours de chargement
 * @param {Function} props.toggleMenu - Fonction pour basculer l'état du menu
 */
const MenuHeader = ({ roles, userData, isLoading, toggleMenu }) => {
  const navigate = useNavigate();
  
  // Si l'utilisateur est connecté
  if (roles.length > 0 && !isLoading) {
    return (
      <div className="flex items-center p-4 border-b border-blue-700 bg-gradient-to-r from-[#00284f] to-[#003a6b]">
        <div 
          className="w-12 h-12 bg-white/20 rounded-full mr-3 flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors" 
          onClick={() => {
            toggleMenu();
            navigate('/profile');
          }}
        >
          <User className="w-6 h-6 text-white" />
        </div>
        <div 
          className="cursor-pointer" 
          onClick={() => {
            toggleMenu();
            navigate('/profile');
          }}
        >
          <p className="font-semibold hover:underline transition-all">
            {userData ? `${userData.firstName} ${userData.lastName}` : 'Chargement...'}
          </p>
          <p className="text-sm text-blue-200">{translateRoleName(roles[0])}</p>
        </div>
        <button 
          className="ml-auto text-white p-2 rounded-full hover:bg-blue-800/50 transition-colors" 
          onClick={toggleMenu}
          aria-label="Fermer le menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    );
  }
  
  // Si l'utilisateur n'est pas connecté
  if (!roles.length && !isLoading) {
    return (
      <div className="p-4 border-b border-blue-700 bg-gradient-to-r from-[#00284f] to-[#003a6b]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold text-white">Bienvenue</h2>
          <button 
            className="text-white p-2 rounded-full hover:bg-blue-800/50 transition-colors" 
            onClick={toggleMenu}
            aria-label="Fermer le menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-blue-200 mb-3">Connectez-vous pour accéder à toutes les fonctionnalités</p>
        <Link 
          to="/login" 
          className="flex items-center justify-center w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          onClick={toggleMenu}
        >
          <User className="w-4 h-4 mr-2" />
          Se connecter
        </Link>
      </div>
    );
  }
  
  // État de chargement
  return null;
};

export default MenuHeader;
