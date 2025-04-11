import React, { useMemo, useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useUserData } from '../hooks/useDashboardQueries';
import { motion } from 'framer-motion';
import mercureService, { TOPICS } from '../lib/services/mercureService';
import DocumentNotifications from '../components/DocumentNotifications';
import axios from 'axios';
/**
 * Composant Tableau de bord affiché comme page d'accueil pour les utilisateurs connectés
 * avec un message de bienvenue personnalisé selon le rôle
 */
const Dashboard = () => {
  // État local pour suivre si nous avons affiché les données de secours
  const [hasShownFallback, setHasShownFallback] = useState(false);
  // État pour stocker les notifications reçues
  const [notifications, setNotifications] = useState([]);
  
  // Utiliser le hook optimisé pour récupérer les données utilisateur
  const { data: user, error, isLoading, refetch } = useUserData();
  
  // Forcer un refetch au montage du composant
  useEffect(() => {
    console.log("Dashboard mounted, forcing data refresh");
    const timer = setTimeout(() => {
      refetch().catch(err => {
        console.error("Error refreshing dashboard data:", err);
      });
    }, 50); // Court délai pour s'assurer que le composant est monté
    
    return () => clearTimeout(timer);
  }, [refetch]);
  
  // Marquer quand nous avons affiché les données de secours
  useEffect(() => {
    if (user && !hasShownFallback) {
      setHasShownFallback(true);
    }
  }, [user, hasShownFallback]);
  
  // Aussi essayer de récupérer les données du localStorage comme filet de sécurité
  const fallbackUser = useMemo(() => {
    if (user) return null; // Ne pas calculer si nous avons déjà des données
    
    try {
      const storedUser = localStorage.getItem('user');
      console.log("Dashboard fallback: localStorage check", !!storedUser);
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      console.error("Error parsing localStorage user:", e);
      return null;
    }
  }, [user]);
  
  // Utiliser soit les données de l'API, soit les données de fallback
  const displayUser = user || fallbackUser;
  
  // Debugging - log complet des données disponibles
  useEffect(() => {
    console.log("Dashboard component state:", {
      user: user ? { id: user.id, firstName: user.firstName, lastName: user.lastName, roles: user.roles } : null,
      fallbackUser: fallbackUser ? { id: fallbackUser.id, firstName: fallbackUser.firstName, roles: fallbackUser.roles } : null,
      displayUser: displayUser ? { id: displayUser.id, firstName: displayUser.firstName, roles: displayUser.roles } : null,
      isLoading,
      error: error?.message
    });
    
    if (displayUser) {
      // Tentative de mise à jour localStorage si nécessaire
      try {
        localStorage.setItem('user', JSON.stringify(displayUser));
      } catch (e) {
        console.error("Error updating localStorage user:", e);
      }
    }
  }, [user, fallbackUser, displayUser, isLoading, error]);
  
  // Utiliser useMemo pour éviter les re-rendus inutiles
  const welcomeMessage = useMemo(() => {
    if (!displayUser) return '';
    
    // Extraire le rôle correctement
    let role = '';
    if (displayUser.roles) {
      if (Array.isArray(displayUser.roles) && displayUser.roles.length > 0) {
        role = displayUser.roles[0].replace('ROLE_', '');
      } else if (typeof displayUser.roles === 'string') {
        role = displayUser.roles.replace('ROLE_', '');
      }
    }
    
    return `Bienvenue ${displayUser.firstName || ''} ${displayUser.lastName || ''} - ${role}`;
  }, [displayUser]);
  
  // Si pas de données du tout, essayer de forcer un rechargement
  useEffect(() => {
    if (!displayUser && !isLoading) {
      console.log("No display user data, forcing reload");
      const reloadTimer = setTimeout(() => {
        window.location.reload();
      }, 2000);
      
      return () => clearTimeout(reloadTimer);
    }
  }, [displayUser, isLoading]);

  // Abonnement aux notifications Mercure
  useEffect(() => {
    // Définir le topic pour les notifications
    const topic = TOPICS.GENERAL;
    
    // Callback pour les messages reçus
    const handleMessage = (data) => {
      console.log("Dashboard: Message reçu:", data);
      // Ajouter la nouvelle notification à notre état avec un timestamp
      setNotifications(prev => [...prev, {
        id: Date.now(),
        message: data.status || JSON.stringify(data),
        timestamp: new Date().toLocaleTimeString()
      }]);
    };
    
    // S'abonner au topic avec le service Mercure
    const { close } = mercureService.subscribe(topic, handleMessage);
    
    // Nettoyage à la désactivation du composant
    return close;
  }, []);

  // Fonction pour tester directement l'EventSource sans passer par mercureService
  const testDirectEventSource = () => {
    try {
      // Créer un EventSource directement, sans withCredentials pour tester
      const topic = TOPICS.GENERAL;
      const mercureHubUrl = "http://localhost:9090/.well-known/mercure";
      const mercureUrl = `${mercureHubUrl}?topic=${encodeURIComponent(topic)}`;
      
      // Afficher un message
      console.log("DIRECT TEST: Creating EventSource for:", mercureUrl);
      
      // Créer l'EventSource et l'attacher à window pour un accès facile dans la console
      window.testEventSource = new EventSource(mercureUrl);
      
      // Ajouter les listeners
      window.testEventSource.onopen = () => {
        console.log("DIRECT TEST: EventSource connection opened");
        setNotifications(prev => [...prev, {
          id: Date.now(),
          message: "✅ Test direct: Connexion EventSource établie",
          timestamp: new Date().toLocaleTimeString()
        }]);
      };
      
      window.testEventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("DIRECT TEST: Message received:", data);
          setNotifications(prev => [...prev, {
            id: Date.now(),
            message: `✅ Test direct: ${data.status || JSON.stringify(data)}`,
            timestamp: new Date().toLocaleTimeString()
          }]);
        } catch (error) {
          console.error("DIRECT TEST: Error parsing message:", error);
        }
      };
      
      window.testEventSource.onerror = (event) => {
        console.error("DIRECT TEST: EventSource error:", event);
        setNotifications(prev => [...prev, {
          id: Date.now(),
          message: "❌ Test direct: Erreur de connexion EventSource",
          timestamp: new Date().toLocaleTimeString()
        }]);
      };
      
      // Ajouter à notre liste de notifications qu'un test a été lancé
      setNotifications(prev => [...prev, {
        id: Date.now(),
        message: "🔄 Test direct EventSource lancé",
        timestamp: new Date().toLocaleTimeString()
      }]);
      
      // Retourner un message pour l'utilisateur
      alert("Test direct EventSource lancé. Vérifiez la console et les notifications.");
    } catch (error) {
      console.error("Error in direct EventSource test:", error);
    }
  };

  // Fonction pour tester la méthode de polling comme alternative à EventSource
  const testPolling = () => {
    try {
      if (window.pollingStop) {
        // Si un polling existe déjà, l'arrêter d'abord
        window.pollingStop();
        window.pollingStop = null;
        
        setNotifications(prev => [...prev, {
          id: Date.now(),
          message: "⏹️ Polling arrêté",
          timestamp: new Date().toLocaleTimeString()
        }]);
        return;
      }
      
      // Ajouter une notification pour indiquer que le polling démarre
      setNotifications(prev => [...prev, {
        id: Date.now(),
        message: "🔄 Démarrage du polling...",
        timestamp: new Date().toLocaleTimeString()
      }]);
      
      // Fonction de callback pour les messages
      const handleMessage = (data) => {
        console.log("POLLING: Message received:", data);
        setNotifications(prev => [...prev, {
          id: Date.now(),
          message: `📩 Polling: ${data.status || JSON.stringify(data)}`,
          timestamp: new Date().toLocaleTimeString()
        }]);
      };
      
      // Démarrer le polling et stocker la fonction d'arrêt
      window.pollingStop = mercureService.pollForUpdates(TOPICS.GENERAL, handleMessage);
      
      alert("Polling démarré. Cliquez à nouveau pour arrêter.");
    } catch (error) {
      console.error("Error starting polling:", error);
    }
  };

  // Fonction pour tester l'envoi de notifications
  const testNotification = async () => {
    try {
      const response = await axios.get('http://localhost:8000/publish');
      console.log('Notification sent:', response.data);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  // Fonction pour tester la connexion directe au hub Mercure
  const testMercureConnection = async () => {
    try {
      console.log('Testing direct connection to Mercure hub...');
      
      // Récupérer les informations Mercure du backend
      const infoResponse = await axios.get('http://localhost:8000/mercure-info');
      console.log('Mercure info:', infoResponse.data);
      
      // Essayer de se connecter directement au hub Mercure
      const topic = infoResponse.data.topic;
      const mercureHubUrl = infoResponse.data.mercure_public_url;
      
      // Afficher un message pour l'utilisateur
      alert(`Tentative de connexion à ${mercureHubUrl}?topic=${encodeURIComponent(topic)}. Vérifiez la console pour les résultats.`);
    } catch (error) {
      console.error('Error testing Mercure connection:', error);
    }
  };

  // Fonction pour tester une notification de document
  const testDocumentNotification = async () => {
    try {
      // Simuler l'ajout d'un document
      const documentData = {
        documentId: Math.floor(Math.random() * 1000), // ID aléatoire pour les tests
        documentName: "Rapport Mensuel.pdf",
        addedBy: displayUser?.firstName ? `${displayUser.firstName} ${displayUser.lastName || ''}` : "Utilisateur"
      };
      
      const response = await mercureService.notifyDocumentAdded(documentData);
      console.log('Document notification sent:', response);
    } catch (error) {
      console.error('Error sending document notification:', error);
    }
  };

  return (
    <DashboardLayout error={error?.message} isLoading={isLoading && !displayUser}>
      {/* Insérer le composant de notifications de documents */}
      <DocumentNotifications />
      
      {displayUser ? (
        <motion.div 
          className="bg-white rounded-lg shadow-lg p-6 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-8">
            {welcomeMessage}
          </h1>
        </motion.div>
      ) : !isLoading ? (
        <div className="bg-yellow-100 p-4 rounded-md text-yellow-800 mb-6">
          Problème de chargement des données utilisateur. 
          <button 
            onClick={() => refetch()} 
            className="ml-2 text-blue-600 underline"
          >
            Réessayer
          </button>
        </div>
      ) : null}
      
      {/* Zone de notifications améliorée */}
      <motion.div 
        className="bg-white rounded-lg shadow-lg p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Notifications</h2>
          <div className="space-x-2">
            <button 
              onClick={testMercureConnection}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Tester connexion
            </button>
            <button 
              onClick={testDirectEventSource}
              className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
            >
              Test direct ES
            </button>
            <button 
              onClick={testPolling}
              className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
            >
              {window.pollingStop ? "Arrêter polling" : "Tester polling"}
            </button>
            <button 
              onClick={testNotification}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Notif générale
            </button>
            <button 
              onClick={testDocumentNotification}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              Notif document
            </button>
          </div>
        </div>
        <div id="messages" className="space-y-3">
          {notifications.length === 0 ? (
            <p className="text-gray-500 italic">Aucune notification pour le moment</p>
          ) : (
            notifications.map(notification => (
              <motion.div 
                key={notification.id}
                className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-md"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex justify-between">
                  <p className="text-blue-800">{notification.message}</p>
                  <span className="text-xs text-gray-500">{notification.timestamp}</span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default React.memo(Dashboard);
