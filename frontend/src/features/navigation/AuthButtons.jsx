import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Composant AuthButtons - Affiche les boutons de connexion et d'inscription
 * Extrait du composant Navbar pour améliorer la maintenabilité
 */
const AuthButtons = () => (
  <>
    <Link
      to="/login"
      className="px-4 py-2 text-gray-200 transition-colors rounded-md hover:text-white"
    >
      Connexion
    </Link>
    <Link
      to="/register"
      className="ml-2 px-4 py-2 bg-[#528eb2] rounded-md text-white font-medium hover:bg-[#528eb2]/90 transition-all transform hover:scale-105"
    >
      Inscription
    </Link>
  </>
);

export default AuthButtons;
