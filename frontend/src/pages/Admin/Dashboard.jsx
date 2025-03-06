import React, { useState, useEffect } from 'react';
import { authService } from '../../lib/services/authService';

/**
 * Tableau de bord spécifique pour les administrateurs
 */
const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await authService.getCurrentUser();
        const finalUserData = userData?.user || userData;
        setUser(finalUserData);
      } catch (err) {
        setError('Impossible de charger les informations utilisateur');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <p className="text-gray-600">Chargement en cours...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Bienvenue {user?.firstName} {user?.lastName} - Admin
        </h1>
      </div>
    </div>
  );
};

export default AdminDashboard; 