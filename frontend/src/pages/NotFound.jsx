import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[#528eb2] mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page non trouvée</h2>
        <p className="text-gray-400 mb-8">
          La page que vous recherchez n'existe pas ou n'est pas accessible.
        </p>
        <Link
          to="/dashboard"
          className="inline-block px-6 py-3 bg-[#528eb2] text-white rounded-lg hover:bg-[#407a9b] transition-colors"
        >
          Retour au tableau de bord
        </Link>
      </div>
    </div>
  );
};

export default NotFound; 