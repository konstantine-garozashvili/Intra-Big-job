import { useState, useEffect } from 'react';

/**
 * Hook pour vérifier si l'utilisateur doit signer sa présence
 * Renvoie un rappel visuel (point rouge) lorsque la période de signature
 * est active et que l'utilisateur n'a pas encore signé.
 * 
 * @returns {boolean} needsSignature - true si l'utilisateur doit signer
 */
export function useSignatureReminder() {
  const [needsSignature, setNeedsSignature] = useState(false);
  
  useEffect(() => {
    let isMounted = true;
    let checkInterval;
    
    // Fonction pour vérifier si une signature est nécessaire
    const checkSignatureStatus = async () => {
      try {
        // Vérifier si l'utilisateur est authentifié
        const token = localStorage.getItem('token');
        if (!token) return;
        
        // Vérifier si l'utilisateur est un étudiant ou un enseignant (rôles concernés)
        const roles = JSON.parse(localStorage.getItem('userRoles') || '[]');
        const hasRelevantRole = roles.some(
          role => role === 'ROLE_STUDENT' || role === 'ROLE_TEACHER'
        );
        
        if (!hasRelevantRole) return;
        
        // Vérifier l'heure actuelle pour déterminer si c'est une période de signature
        const now = new Date();
        const hour = now.getHours();
        
        // Périodes de signature: 9h-12h et 13h-17h
        const isMorningPeriod = hour >= 9 && hour < 12;
        const isAfternoonPeriod = hour >= 13 && hour < 17;
        
        if (!isMorningPeriod && !isAfternoonPeriod) {
          if (isMounted) setNeedsSignature(false);
          return;
        }

        // Déterminer la période actuelle
        const currentPeriod = isMorningPeriod ? 'morning' : 'afternoon';
        
        try {
          // Vérifier d'abord si nous avons déjà signé pour cette période (stocké en local)
          const todayStr = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
          const storageKey = `signature_${todayStr}_${currentPeriod}`;
          const hasSigned = localStorage.getItem(storageKey) === 'true';
          
          if (hasSigned) {
            if (isMounted) setNeedsSignature(false);
            return;
          }
          
          // Si pas d'information locale sur la signature, essayer d'appeler l'API
          const response = await fetch('/api/signatures/today', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (!response.ok) {
            // Si l'API échoue, utiliser l'état local seulement
            if (isMounted) setNeedsSignature(true);
            return;
          }
          
          const data = await response.json();
          
          // Vérifier si l'utilisateur a déjà signé pour cette période
          const hasSignedCurrentPeriod = data.signedPeriods && data.signedPeriods.includes(currentPeriod);
          
          if (hasSignedCurrentPeriod) {
            // Mettre à jour le stockage local pour mémoriser la signature
            localStorage.setItem(storageKey, 'true');
          }
          
          if (isMounted) {
            setNeedsSignature(!hasSignedCurrentPeriod);
          }
        } catch (error) {
          // En cas d'erreur d'API, nous supposons que la signature est nécessaire
          if (isMounted) setNeedsSignature(true);
        }
      } catch (error) {
        // console.error('Erreur dans useSignatureReminder:', error);
      }
    };
    
    // Vérifier immédiatement
    checkSignatureStatus();
    
    // Vérifier toutes les 5 minutes
    checkInterval = setInterval(checkSignatureStatus, 5 * 60 * 1000);
    
    // Écouteur d'événement pour la signature soumise
    const handleSignatureSubmitted = (event) => {
      // console.log('Signature submitted event received', event.detail);
      if (event.detail.success) {
        // Enregistrer la signature dans le localStorage en plus de mettre à jour l'état
        const todayStr = new Date().toISOString().split('T')[0];
        const period = event.detail.period;
        const storageKey = `signature_${todayStr}_${period}`;
        
        // Mettre à jour le stockage local
        localStorage.setItem(storageKey, 'true');
        
        // Mettre à jour l'état immédiatement après une signature réussie
        setNeedsSignature(false);
      }
    };
    
    // Ajouter l'écouteur d'événement
    window.addEventListener('signatureSubmitted', handleSignatureSubmitted);
    
    return () => {
      isMounted = false;
      clearInterval(checkInterval);
      // Nettoyer l'écouteur d'événement
      window.removeEventListener('signatureSubmitted', handleSignatureSubmitted);
    };
  }, []);
  
  return needsSignature;
} 