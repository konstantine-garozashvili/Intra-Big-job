import React, { memo, lazy, Suspense } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

// Import both loading animations
import LoadingAnimation, { LoadingAnimationNoText } from './ui/LoadingAnimation';

// Composant d'erreur optimisé
const ErrorDisplay = memo(({ errorMessage }) => (
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
        <p className="text-red-600">{errorMessage}</p>
        <p className="mt-4 text-sm text-gray-600">
          Veuillez réessayer ultérieurement ou contacter le support si le problème persiste.
        </p>
      </div>
    </div>
  </motion.div>
));

ErrorDisplay.displayName = 'ErrorDisplay';

ErrorDisplay.propTypes = {
  errorMessage: PropTypes.string.isRequired
};

/**
 * Composant de base pour tous les dashboards
 * Gère l'affichage des états de chargement et d'erreur
 */
const DashboardLayout = ({ loading, error, children, className = "" }) => {
  // Affichage du loader avancé
  if (loading) {
    return (
      <div className={`container mx-auto p-8 ${className} loading-animation-container`}>
        <Suspense fallback={<LoadingAnimationNoText />}>
          <LoadingAnimation />
        </Suspense>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`container mx-auto p-8 ${className}`}>
        <ErrorDisplay errorMessage={error} />
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

// Utiliser memo pour éviter les re-rendus inutiles
export default memo(DashboardLayout); 