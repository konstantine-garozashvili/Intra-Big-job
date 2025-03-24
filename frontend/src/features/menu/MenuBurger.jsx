import React, { useState, useEffect, useRef, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRolePermissions } from '../../features/roles/useRolePermissions';
import { authService } from '../../lib/services/authService';
import userDataManager from '../../lib/services/userDataManager';

// Importation des composants et utilitaires extraits
import MenuItem from './MenuItem';
import MenuHeader from './MenuHeader';
import { getMenuItems } from './menuConfig';
import { customStyles } from './menuStyles';

/**
 * Composant MenuBurger - Menu latéral principal de l'application
 * Refactorisé pour une meilleure maintenabilité
 */
const MenuBurger = memo(() => {
  // États
  const [menuOpen, setMenuOpen] = useState(false);
  const [openSubMenus, setOpenSubMenus] = useState({});
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Refs pour la gestion des clics à l'extérieur
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  
  // Hooks
  const navigate = useNavigate();
  const { roles, hasAnyRole } = useRolePermissions();
  
  // Récupération des données utilisateur
  useEffect(() => {
    const fetchUserData = async () => {
      if (authService.isAuthenticated()) {
        try {
          setIsLoading(true);
          const data = await userDataManager.getUserData();
          setUserData(data);
        } catch (error) {
          console.error('Erreur lors de la récupération des données utilisateur:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setUserData(null);
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, []);
  
  // Gestion des clics à l'extérieur pour fermer le menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);
  
  // Fermer le menu quand l'URL change
  useEffect(() => {
    return () => {
      if (menuOpen) setMenuOpen(false);
    };
  }, [navigate]);
  
  // Fonctions de gestion du menu
  const toggleMenu = () => setMenuOpen(!menuOpen);
  
  const toggleSubMenu = (key) => {
    setOpenSubMenus((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };
  
  // Récupération des éléments de menu
  const menuItems = getMenuItems();
  
  return (
    <div className="relative">
      {/* Injection des styles personnalisés */}
      <style>{customStyles}</style>
      
      {/* Bouton du menu burger */}
      <button 
        ref={buttonRef}
        className="menu-burger-button text-gray-200 hover:text-white focus:outline-none" 
        onClick={toggleMenu}
        aria-label="Menu principal"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Animation du menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Fond semi-transparent avec effet de flou */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={() => setMenuOpen(false)}
            />
            
            {/* Menu latéral avec animation */}
            <motion.div
              ref={menuRef}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ 
                type: "tween", 
                ease: "easeInOut",
                duration: 0.3
              }}
              className="sidebar-menu"
            >
              <div className="flex flex-col h-full">
                {/* En-tête du menu */}
                <MenuHeader 
                  roles={roles} 
                  userData={userData} 
                  isLoading={isLoading} 
                  toggleMenu={() => setMenuOpen(false)} 
                />

                {/* Liste des éléments de menu */}
                <div className="scrollable-div overflow-y-auto flex-grow">
                  <ul className="py-2">
                    {menuItems.map((item) => {
                      // Vérifier si l'élément doit être affiché en fonction des rôles
                      if (!item.roles || hasAnyRole(item.roles)) {
                        return (
                          <MenuItem
                            key={`menu-${item.key}`}
                            item={item}
                            isOpen={openSubMenus[item.key]}
                            toggleSubMenu={toggleSubMenu}
                            closeMenu={() => setMenuOpen(false)}
                            hasAnyRole={hasAnyRole}
                          />
                        );
                      }
                      return null;
                    })}
                  </ul>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
});

// Ajout d'un nom d'affichage pour les outils de développement
MenuBurger.displayName = 'MenuBurger';

export { MenuBurger };
