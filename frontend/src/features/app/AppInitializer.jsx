import { useEffect } from 'react';
import { queryClient } from '../../App';

/**
 * Composant AppInitializer - Initialise les services et configurations globales de l'application
 * Ce composant est responsable de l'initialisation des services nécessaires au démarrage de l'application
 */
const AppInitializer = () => {
  useEffect(() => {
    // Exposer queryClient pour le débogage
    window.queryClient = queryClient;
    
    // Exposer userDataManager pour le débogage
    import('../../lib/services/userDataManager')
      .then(({ default: userDataManager }) => {
        window.userDataManager = userDataManager;
      });
    
    // Configurer QueryClient
    import('../../lib/services/queryClient')
      .then(({ setQueryClient }) => {
        setQueryClient(queryClient);
      });
      
  }, []);
  
  return null;
};

export default AppInitializer;
