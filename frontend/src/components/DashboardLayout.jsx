import React, { memo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import DashboardHeader from './shared/DashboardHeader';
import { authService } from '@/lib/services/authService';

// Composant d'erreur optimisé
const ErrorDisplay = memo(({ errorMessage }) => (
  <motion.div 
    className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div className="flex items-start space-x-4">
      <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
        <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
      </div>
      <div>
        <h3 className="text-lg font-medium text-red-800 dark:text-red-300 mb-2">
          Une erreur est survenue
        </h3>
        <p className="text-red-600 dark:text-red-400">{errorMessage}</p>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
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
  showHeader = true,
  user,
  headerIcon,
  headerTitle,
}) => {
  // Récupérer le contexte de chargement depuis le MainLayout
  const context = useOutletContext() || {};
  
  // Vérifier si l'utilisateur est authentifié
  const isAuthenticated = authService.isLoggedIn();
  
  // Afficher l'erreur si présente ET si l'utilisateur est authentifié
  if (error && isAuthenticated) {
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
  showHeader: PropTypes.bool,
  user: PropTypes.object,
  headerIcon: PropTypes.elementType,
  headerTitle: PropTypes.string,
};

// Utiliser memo pour éviter les re-rendus inutiles
export default memo(DashboardLayout); 