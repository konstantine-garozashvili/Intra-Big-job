import { useState, useEffect } from 'react';
import { authService } from '@/lib/services/authService';

/**
 * Hook personnalisé pour récupérer les données utilisateur communes à tous les dashboards
 * @param {Function} fetchAdditionalData - Fonction optionnelle pour récupérer des données supplémentaires
 * @returns {Object} - Données utilisateur, état de chargement, erreur et données supplémentaires
 */
export const useDashboardData = (fetchAdditionalData) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [additionalData, setAdditionalData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer les données de l'utilisateur
        const userData = await authService.getCurrentUser();
        const finalUserData = userData?.user || userData;
        setUser(finalUserData);

        // Si une fonction pour récupérer des données supplémentaires est fournie, l'exécuter
        if (fetchAdditionalData && typeof fetchAdditionalData === 'function') {
          try {
            const extraData = await fetchAdditionalData(finalUserData);
            setAdditionalData(extraData);
          } catch (extraError) {
            console.error('Erreur lors de la récupération des données supplémentaires:', extraError);
            // Ne pas définir d'erreur globale pour permettre l'affichage des données utilisateur
          }
        }
      } catch (err) {
        console.error('Erreur lors de la récupération des données utilisateur:', err);
        setError('Impossible de charger les informations utilisateur');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchAdditionalData]);

  return { user, loading, error, additionalData };
};

export default useDashboardData; 