import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import mercureService, { TOPICS } from '../lib/services/mercureService';

/**
 * Composant pour afficher les notifications de documents
 * Ce composant peut être utilisé dans n'importe quelle page pour montrer
 * les notifications en temps réel liées aux documents
 */
const DocumentNotifications = () => {
  const [documentNotifications, setDocumentNotifications] = useState([]);
  
  // S'abonner aux notifications de documents
  useEffect(() => {
    // Gestionnaire pour les notifications de documents
    const handleDocumentNotification = (data) => {
      if (data.type === 'document_added') {
        setDocumentNotifications(prev => [...prev, {
          id: Date.now(),
          title: `Nouveau document: ${data.documentName}`,
          message: `Ajouté par ${data.addedBy}`,
          documentId: data.documentId,
          timestamp: new Date(data.timestamp * 1000).toLocaleTimeString()
        }]);
      }
    };
    
    // S'abonner au topic des documents
    const { close } = mercureService.subscribe(TOPICS.DOCUMENTS, handleDocumentNotification);
    
    // Se désabonner lors du démontage du composant
    return close;
  }, []);
  
  // Supprimer une notification
  const dismissNotification = (id) => {
    setDocumentNotifications(prev => 
      prev.filter(notification => notification.id !== id)
    );
  };
  
  // Si aucune notification, ne rien afficher
  if (documentNotifications.length === 0) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {documentNotifications.map(notification => (
        <motion.div 
          key={notification.id}
          className="bg-white rounded-lg shadow-lg p-4 border-l-4 border-blue-500"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-gray-800">{notification.title}</h3>
              <p className="text-sm text-gray-600">{notification.message}</p>
              <span className="text-xs text-gray-500">{notification.timestamp}</span>
            </div>
            <button 
              className="text-gray-400 hover:text-gray-600"
              onClick={() => dismissNotification(notification.id)}
            >
              &times;
            </button>
          </div>
          <div className="mt-2">
            <button 
              className="text-sm text-blue-500 hover:text-blue-700"
              onClick={() => {
                // Ici vous pouvez ajouter une navigation vers le document
                // Par exemple: navigate(`/documents/${notification.documentId}`)
                alert(`Naviguer vers le document ${notification.documentId}`);
              }}
            >
              Voir le document
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default DocumentNotifications; 