import React, { useState, useEffect } from 'react';
import { useRoles } from '@/features/roles/roleContext';
import { authService } from '@/lib/services/authService';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Composant de débogage pour les problèmes de rôles
 * Permet de visualiser et de corriger les problèmes de détection de rôle
 */
const RoleDebugger = () => {
  const { roles, refreshRoles } = useRoles();
  const [localStorageUser, setLocalStorageUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isFixing, setIsFixing] = useState(false);
  const queryClient = useQueryClient();

  // Charger les données du localStorage
  useEffect(() => {
    const loadLocalData = () => {
      try {
        const userStr = localStorage.getItem('user');
        const tokenStr = localStorage.getItem('token');
        
        setLocalStorageUser(userStr ? JSON.parse(userStr) : null);
        setToken(tokenStr || null);
      } catch (error) {
        console.error('Erreur lors du chargement des données locales:', error);
      }
    };
    
    loadLocalData();
    
    // Rafraîchir les données toutes les 2 secondes
    const interval = setInterval(loadLocalData, 2000);
    
    return () => clearInterval(interval);
  }, []);

  // Fonction pour forcer le rafraîchissement des données utilisateur
  const handleForceRefresh = async () => {
    setIsFixing(true);
    try {
      // Forcer le rafraîchissement des données utilisateur
      await authService.getCurrentUser(true);
      
      // Invalider toutes les requêtes liées à l'utilisateur
      queryClient.invalidateQueries(['user-data']);
      queryClient.invalidateQueries(['userRoles']);
      
      // Rafraîchir les rôles
      refreshRoles();
      
      // Déclencher un événement de changement de rôle
      window.dispatchEvent(new CustomEvent('role-change'));
      
      alert('Données utilisateur rafraîchies avec succès');
    } catch (error) {
      console.error('Erreur lors du rafraîchissement des données:', error);
      alert(`Erreur: ${error.message}`);
    } finally {
      setIsFixing(false);
    }
  };

  // Fonction pour corriger manuellement le rôle SuperAdmin
  const handleFixSuperAdminRole = () => {
    setIsFixing(true);
    try {
      // Récupérer les données utilisateur actuelles
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        alert('Aucune donnée utilisateur trouvée');
        setIsFixing(false);
        return;
      }
      
      const userData = JSON.parse(userStr);
      
      // Ajouter ou remplacer le rôle SUPER_ADMIN
      userData.roles = ['ROLE_SUPER_ADMIN', ...(userData.roles || []).filter(r => r !== 'ROLE_SUPER_ADMIN')];
      
      // Sauvegarder les données modifiées
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('last_role', 'ROLE_SUPER_ADMIN');
      
      // Invalider les requêtes
      queryClient.invalidateQueries(['user-data']);
      queryClient.invalidateQueries(['userRoles']);
      
      // Rafraîchir les rôles
      refreshRoles();
      
      // Déclencher un événement de changement de rôle
      window.dispatchEvent(new CustomEvent('role-change'));
      
      alert('Rôle SuperAdmin ajouté avec succès. Veuillez rafraîchir la page.');
    } catch (error) {
      console.error('Erreur lors de la correction du rôle:', error);
      alert(`Erreur: ${error.message}`);
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mt-4">
      <h2 className="text-xl font-bold text-red-600 mb-4">Débogueur de Rôles</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-2">Rôles détectés par le contexte:</h3>
          <pre className="bg-gray-200 p-2 rounded text-sm overflow-x-auto">
            {JSON.stringify(roles, null, 2) || 'Aucun rôle détecté'}
          </pre>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-2">Données utilisateur (localStorage):</h3>
          <pre className="bg-gray-200 p-2 rounded text-sm overflow-x-auto">
            {JSON.stringify(localStorageUser, null, 2) || 'Aucune donnée trouvée'}
          </pre>
        </div>
      </div>
      
      <div className="mt-4 bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-700 mb-2">Token JWT:</h3>
        <p className="text-sm mb-2">{token ? 'Token présent' : 'Aucun token trouvé'}</p>
        {token && (
          <div className="text-xs bg-gray-200 p-2 rounded overflow-x-auto">
            {token.substring(0, 20)}...{token.substring(token.length - 20)}
          </div>
        )}
      </div>
      
      <div className="mt-6 flex flex-col md:flex-row gap-4">
        <button
          onClick={handleForceRefresh}
          disabled={isFixing}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isFixing ? 'Rafraîchissement...' : 'Forcer le rafraîchissement des données'}
        </button>
        
        <button
          onClick={handleFixSuperAdminRole}
          disabled={isFixing}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          {isFixing ? 'Application...' : 'Corriger le rôle SuperAdmin'}
        </button>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>
          <strong>Note:</strong> Après avoir corrigé le rôle, vous devrez peut-être rafraîchir la page 
          ou vous déconnecter et vous reconnecter pour que les changements prennent effet.
        </p>
      </div>
    </div>
  );
};

export default RoleDebugger; 