import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

/**
 * Composant de base pour tous les dashboards
 * Gère l'affichage des états de chargement et d'erreur
 */
const DashboardLayout = ({ loading, error, children, className = "" }) => {
  // Affichage du loader simple
  if (loading) {
    return (
      <div className={`container mx-auto p-8 ${className}`}>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <motion.div
            className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, ease: "linear", duration: 1 }}
          />
          <p className="mt-4 text-sm font-medium text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`container mx-auto p-8 ${className}`}>
        <motion.div 
          className="bg-white rounded-lg shadow-lg p-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-red-800 mb-2">
                Une erreur est survenue
              </h3>
              <p className="text-red-600">{error}</p>
              <p className="mt-4 text-sm text-gray-600">
                Veuillez réessayer ultérieurement ou contacter le support si le problème persiste.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      className={`container mx-auto p-8 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

DashboardLayout.propTypes = {
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

export default DashboardLayout; 