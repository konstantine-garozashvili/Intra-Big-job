import React, { useState, useEffect } from 'react';
import { authService } from '../../lib/services/authService';

/**
 * Tableau de bord spécifique pour les étudiants
 */
const StudentDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await authService.getCurrentUser();
        console.log('Données utilisateur reçues:', userData); // Pour déboguer
        setUser(userData);
      } catch (err) {
        console.error('Erreur lors de la récupération des données utilisateur:', err);
        setError('Impossible de charger les informations utilisateur');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="container p-8 mx-auto">
        <div className="p-6 bg-white rounded-lg shadow-lg">
          <p className="text-gray-600">Chargement en cours...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container p-8 mx-auto">
        <div className="p-6 bg-white rounded-lg shadow-lg">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container p-8 mx-auto">
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <h1 className="mb-8 text-3xl font-bold text-gray-800">
        Bienvenue {user?.firstName} {user?.lastName}
        </h1>
      </div>
    </div>
  );
};

export default StudentDashboard; 