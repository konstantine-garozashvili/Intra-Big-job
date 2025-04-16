/**
 * Service to handle Mercure hub subscriptions and authentication
 */

// Définir les topics disponibles pour les notifications
export const TOPICS = {
  GENERAL: 'https://example.com/my-private-topic',
  DOCUMENTS: 'https://example.com/documents',
};

/**
 * Sets the Mercure subscriber cookie for JWT authentication
 * This is needed for private topic subscriptions
 */
const setMercureCookie = () => {
  // The JWT for Mercure should match the one in your docker-compose.yml
  // This is typically different from your API authentication JWT
  const mercureJWT = 'eyJhbGciOiJIUzI1NiJ9.eyJtZXJjdXJlIjp7InB1Ymxpc2giOlsiKiJdLCJzdWJzY3JpYmUiOlsiaHR0cHM6Ly9leGFtcGxlLmNvbS9teS1wcml2YXRlLXRvcGljIiwie3NjaGVtZX06Ly97K2hvc3R9L2RlbW8vYm9va3Mve2lkfS5qc29ubGQiLCIvLndlbGwta25vd24vbWVyY3VyZS9zdWJzY3JpcHRpb25zey90b3BpY317L3N1YnNjcmliZXJ9Il0sInBheWxvYWQiOnsidXNlciI6Imh0dHBzOi8vZXhhbXBsZS5jb20vdXNlcnMvZHVuZ2xhcyIsInJlbW90ZUFkZHIiOiIxMjcuMC4wLjEifX19.KKPIikwUzRuB3DTpVw6ajzwSChwFw5omBMmMcWKiDcM';
  
  // Set the Mercure cookie to allow subscribing to private updates
  // Important: domain must match the Mercure hub domain
  document.cookie = `mercureAuthorization=${mercureJWT}; path=/.well-known/mercure; domain=localhost; SameSite=Lax`;
};

/**
 * Subscribe to a Mercure topic
 * @param {string} topic - The topic to subscribe to
 * @param {function} onMessage - Callback function when a message is received
 * @param {function} onError - Callback function when an error occurs
 * @returns {object} - EventSource object and cleanup function
 */
const subscribe = (topic, onMessage, onError = null) => {
  try {
    // Define the Mercure hub URL
    const mercureHubUrl = "http://localhost:9090/.well-known/mercure";
    
    // Build the complete URL for the subscription - version simplifiée
    const mercureUrl = `${mercureHubUrl}?topic=${encodeURIComponent(topic)}`;
    
    console.log("Connecting to Mercure hub:", mercureUrl);
    
    // Create an EventSource without additional parameters
    const eventSource = new EventSource(mercureUrl);
    
    // Set up event handlers
    eventSource.onmessage = function(event) {
      try {
        const data = JSON.parse(event.data);
        console.log("Mercure notification received:", data);
        if (onMessage) {
          onMessage(data);
        }
      } catch (error) {
        console.error("Error processing Mercure message:", error);
      }
    };
    
    eventSource.onopen = () => {
      console.log("Mercure connection established");
    };
    
    eventSource.onerror = function(event) {
      console.error("Error connecting to Mercure hub:", event);
      
      // Si nous avons une erreur, essayons une méthode alternative avec fetch
      if (onError) {
        onError(event);
      }
    };
    
    // Return the EventSource and a cleanup function
    return {
      eventSource,
      close: () => {
        console.log("Closing Mercure connection");
        eventSource.close();
      }
    };
  } catch (error) {
    console.error("Error in subscribe:", error);
    return {
      eventSource: null,
      close: () => console.log("No connection to close")
    };
  }
};

/**
 * Méthode alternative pour écouter les notifications avec un polling régulier
 * @param {string} topic - Le topic à écouter
 * @param {function} onMessage - Callback quand un message est reçu
 * @returns {function} - Fonction pour arrêter l'écoute
 */
const pollForUpdates = (topic, onMessage) => {
  console.log("Setting up polling for topic:", topic);
  let lastEventId = '';
  let isActive = true;
  
  const poll = async () => {
    if (!isActive) return;
    
    try {
      const mercureHubUrl = "http://localhost:9090/.well-known/mercure";
      const url = `${mercureHubUrl}?topic=${encodeURIComponent(topic)}`;
      
      // Créer les en-têtes pour la requête
      const headers = {
        'Accept': 'text/event-stream',
      };
      
      // Ajouter Last-Event-ID si disponible
      if (lastEventId) {
        headers['Last-Event-ID'] = lastEventId;
      }
      
      // Faire la requête fetch
      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
        cache: 'no-store'
      });
      
      // Traiter la réponse - pour un simple test on va juste prendre le premier chunk
      const reader = response.body.getReader();
      const { value, done } = await reader.read();
      
      if (!done && value) {
        // Convertir le tableau d'octets en chaîne
        const chunk = new TextDecoder().decode(value);
        console.log("Received chunk:", chunk);
        
        // Parser les données au format SSE
        const lines = chunk.split('\n');
        let eventData = '';
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          
          if (line.startsWith('id:')) {
            lastEventId = line.substring(3).trim();
          } else if (line.startsWith('data:')) {
            eventData = line.substring(5).trim();
            
            // Traiter les données
            if (eventData && onMessage) {
              try {
                const data = JSON.parse(eventData);
                onMessage(data);
              } catch (error) {
                console.error("Error parsing event data:", error);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error in polling:", error);
    } finally {
      // Continuer le polling après un délai
      if (isActive) {
        setTimeout(poll, 3000); // Polling toutes les 3 secondes
      }
    }
  };
  
  // Démarrer le polling
  poll();
  
  // Retourner une fonction pour arrêter le polling
  return () => {
    isActive = false;
    console.log("Polling stopped for topic:", topic);
  };
};

/**
 * S'abonne à plusieurs topics Mercure
 * @param {Object} subscriptions - Objet contenant les topics et leurs handlers
 * @returns {Function} - Fonction pour se désabonner de tous les topics
 */
const subscribeToTopics = (subscriptions) => {
  const connections = [];
  
  // S'abonner à chaque topic
  Object.entries(subscriptions).forEach(([topic, handler]) => {
    if (typeof handler === 'function') {
      // Essayer d'abord avec EventSource
      const connection = subscribe(topic, handler);
      connections.push(connection);
    }
  });
  
  // Retourner une fonction pour fermer toutes les connexions
  return () => {
    connections.forEach(connection => connection.close());
  };
};

/**
 * Envoie une notification pour un nouveau document
 * @param {Object} documentData - Les données du document
 * @returns {Promise} - La réponse du serveur
 */
const notifyDocumentAdded = async (documentData) => {
  try {
    const response = await fetch('http://localhost:8000/notify-document', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(documentData),
      credentials: 'include'
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error sending document notification:', error);
    throw error;
  }
};

// Export the mercure service
const mercureService = {
  setMercureCookie,
  subscribe,
  pollForUpdates,
  subscribeToTopics,
  notifyDocumentAdded,
  TOPICS
};

export default mercureService; 