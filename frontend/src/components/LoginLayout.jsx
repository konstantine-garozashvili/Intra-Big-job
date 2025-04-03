import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * Special layout for login page that shows navbar and footer
 * but still redirects authenticated users away from login
 */
const LoginLayout = () => {
  // Assurer que la page est toujours affichée depuis le haut
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow flex flex-col">
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
    </div>
  );
};

export default LoginLayout; 