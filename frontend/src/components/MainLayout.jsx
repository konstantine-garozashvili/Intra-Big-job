import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useUserData } from '../hooks/useUserData';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';
import { useRoles } from '../features/roles/roleContext';

/**
 * Layout principal qui inclut la barre de navigation et le pied de page
 * Gère également l'animation entre les différentes pages
 */
const MainLayout = () => {
  // On utilise useUserData pour récupérer les informations utilisateur
  const { userData, loading, fetchUserData, hasMinimalData, isLoggedIn } = useUserData();
  
  // Récupérer le contexte des rôles
  const { refreshRoles } = useRoles();
  
  // Effet pour charger les données utilisateur au montage
  useEffect(() => {
    const loadUserData = async () => {
      if (isLoggedIn) {
        await fetchUserData();
      }
    };
    
    loadUserData();
  }, [fetchUserData, isLoggedIn]);
  
  // Rafraîchir les rôles lorsque les données utilisateur changent
  useEffect(() => {
    if (userData && userData.id) {
      refreshRoles();
    }
  }, [userData, refreshRoles]);
    
  // S'assurer que la page est affichée depuis le haut à chaque navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Contexte à passer à l'Outlet (disponible via useOutletContext)
  const context = {
    userData,
    loading,
    hasMinimalData
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar userData={userData} />
      
      <main className="flex-grow flex flex-col mt-16">
        <motion.div
          className="flex-1 flex flex-col"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet context={context} />
        </motion.div>
        </main>

        <Footer />
      </div>
  );
};

export default MainLayout;
