import React, { memo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import DashboardSkeleton from './DashboardSkeleton';
import DashboardHeader from './shared/DashboardHeader';

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
 * Gère l'affichage des états d'erreur et de chargement
 * Inclut maintenant le DashboardHeader directement
 */
const DashboardLayout = ({ 
  error, 
  children, 
  className = "", 
  isLoading, 
  showSkeleton = true,
  user,
  headerIcon,
  headerTitle,
  showHeader = true
}) => {
  // Récupérer le contexte de chargement depuis le MainLayout
  const context = useOutletContext() || {};
  
  // Utiliser l'état de chargement passé en prop ou depuis le contexte
  const isLoadingState = isLoading || (context.isLoading && !context.hasMinimalData);
  
  // Afficher le squelette pendant le chargement si demandé
  if (isLoadingState && showSkeleton) {
    return (
      <div className={`container mx-auto p-8 ${className}`}>
        <DashboardSkeleton />
      </div>
    );
  }
  
  // Afficher l'erreur si présente
  if (error) {
    return (
      <div className={`container mx-auto p-8 ${className}`}>
        <ErrorDisplay errorMessage={error} />
      </div>
    );
  }

  // Contenu normal sans animation
  return (
    <div className={`container mx-auto p-8 ${className}`}>
      {/* Intégrer le DashboardHeader ici si showHeader est true */}
      {showHeader && user && (
        <DashboardHeader 
          user={user}
          icon={headerIcon}
          roleTitle={headerTitle}
        />
      )}
      {children}
    </div>
  );
};

DashboardLayout.propTypes = {
  error: PropTypes.string,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  isLoading: PropTypes.bool,
  showSkeleton: PropTypes.bool,
  user: PropTypes.object,
  headerIcon: PropTypes.elementType,
  headerTitle: PropTypes.string,
  showHeader: PropTypes.bool
};

// Utiliser memo pour éviter les re-rendus inutiles
export default memo(DashboardLayout); 