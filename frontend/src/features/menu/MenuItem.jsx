import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Composant MenuItem - Gère l'affichage d'un élément de menu
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {Object} props.item - L'élément de menu à afficher
 * @param {boolean} props.isOpen - Indique si le sous-menu est ouvert
 * @param {Function} props.toggleSubMenu - Fonction pour basculer l'état du sous-menu
 * @param {Function} props.closeMenu - Fonction pour fermer le menu
 * @param {Function} props.hasAnyRole - Fonction pour vérifier si l'utilisateur a un rôle spécifique
 */
const MenuItem = ({ item, isOpen, toggleSubMenu, closeMenu, hasAnyRole }) => {
  const { key, icon, label, roles, links, to } = item;
  
  // Si l'élément a un lien direct (pas de sous-menu)
  if (to) {
    return (
      <li className="menu-item">
        <Link to={to} className="flex items-center px-4 py-2.5 w-full" onClick={closeMenu}>
          {icon}
          <span>{label}</span>
        </Link>
      </li>
    );
  }
  
  // Si l'élément a un sous-menu
  return (
    <li className={`menu-item ${isOpen ? 'active' : ''}`} onClick={() => toggleSubMenu(key)}>
      <div className="flex items-center px-4 py-2.5 w-full cursor-pointer">
        {icon}
        <span>{label}</span>
        <div className="ml-auto">
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-[#528eb2]" />
          ) : (
            <ChevronRight className={`w-4 h-4 text-[#528eb2] chevron-icon ${isOpen ? 'open' : ''}`} />
          )}
        </div>
      </div>
      
      <AnimatePresence>
        {isOpen && links && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-[#001f3d] pl-4"
          >
            {links.map((link) => {
              if (!link.roles || hasAnyRole(link.roles)) {
                return (
                  <li key={link.to} className="submenu-item">
                    <Link
                      to={link.to}
                      className="flex items-center px-4 py-2 text-sm"
                      onClick={closeMenu}
                    >
                      {link.name}
                    </Link>
                  </li>
                );
              }
              return null;
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </li>
  );
};

export default MenuItem;
