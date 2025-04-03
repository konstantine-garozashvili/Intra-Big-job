import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * Layout principal pour le tableau de bord
 * Le composant encapsule la barre de navigation et le pied de page
 * et gère l'animation de transition entre les pages
 */
const DashboardLayout = () => {
  // Faire défiler vers le haut lorsque la route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow flex flex-col mt-16">
        <motion.div
          className="flex-1 flex flex-col"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DashboardLayout; 