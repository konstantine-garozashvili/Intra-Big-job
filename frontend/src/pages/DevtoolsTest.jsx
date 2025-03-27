import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

/**
 * Composant de test pour les ReactQuery DevTools
 * Permet de tester et visualiser les requêtes et le cache de ReactQuery
 */
const DevtoolsTest = () => {
  // Exemple de requête pour tester les devtools
  const { data, isLoading, error } = useQuery({
    queryKey: ['devtools-test'],
    queryFn: async () => {
      // Simuler une requête API
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { message: 'DevTools test successful!' };
    },
  });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">ReactQuery DevTools Test</h1>
      
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold mb-2">Statut de la requête</h2>
        {isLoading ? (
          <p className="text-blue-500">Chargement en cours...</p>
        ) : error ? (
          <p className="text-red-500">Erreur: {error.message}</p>
        ) : (
          <div className="bg-gray-100 p-3 rounded">
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>
        )}
      </div>

      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-2">Instructions</h2>
        <p className="mb-2">
          Ce composant permet de tester les ReactQuery DevTools. Vous pouvez voir les requêtes en cours,
          le cache, et d'autres informations utiles pour le débogage.
        </p>
        <p>
          Ouvrez les DevTools en cliquant sur l'icône ReactQuery en bas à droite de l'écran.
        </p>
      </div>

      {/* Afficher les ReactQuery DevTools */}
      <ReactQueryDevtools initialIsOpen={false} />
    </div>
  );
};

export default DevtoolsTest;