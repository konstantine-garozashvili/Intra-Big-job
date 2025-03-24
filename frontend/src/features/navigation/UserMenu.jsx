import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  UserRound, 
  LayoutDashboard, 
  LogOut, 
  Settings, 
  Bell
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../../components/ui/dropdown-menu';

/**
 * Composant UserMenu - Affiche le menu utilisateur avec les options de profil, tableau de bord, etc.
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {Function} props.onLogout - Fonction appelée lors de la déconnexion
 * @param {Object} props.userData - Les données de l'utilisateur
 * @param {Function} props.setLogoutDialogOpen - Fonction pour ouvrir/fermer la boîte de dialogue de déconnexion
 */
const UserMenu = ({ onLogout, userData, setLogoutDialogOpen }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownMenuRef = useRef(null);

  // Style personnalisé pour le menu dropdown
  const dropdownMenuStyles = {
    enter: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: { duration: 0.2, ease: "easeOut" },
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.2, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: { duration: 0.1, ease: "easeIn" },
    },
  };

  return (
    <div className="flex items-center">
      {/* Icône de notification (placeholder) */}
      <button
        className="rounded-full w-10 h-10 p-0 bg-transparent text-gray-200 hover:bg-[#02284f]/80 hover:text-white mr-2"
      >
        <Bell className="h-5 w-5" />
      </button>

      {/* Menu déroulant utilisateur */}
      <DropdownMenu onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <button
            className="flex items-center space-x-2 px-2 py-1 rounded-full hover:bg-[#02284f]/80 transition-colors"
            aria-label="Menu utilisateur"
          >
            <div className="w-8 h-8 bg-[#528eb2] rounded-full flex items-center justify-center text-white">
              <UserRound className="h-5 w-5" />
            </div>
            <span className="text-gray-200 hover:text-white hidden md:inline-block">
              {userData ? `${userData.firstName} ${userData.lastName}` : 'Utilisateur'}
            </span>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          sideOffset={5}
          asChild
          forceMount={dropdownOpen}
        >
          <motion.div
            ref={dropdownMenuRef}
            initial="enter"
            animate={dropdownOpen ? "visible" : "enter"}
            exit="exit"
            variants={dropdownMenuStyles}
            className="z-50 min-w-[220px] overflow-hidden rounded-xl border border-gray-200 bg-white p-1 shadow-md"
          >
            {/* En-tête du menu */}
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="font-medium">{userData ? `${userData.firstName} ${userData.lastName}` : 'Utilisateur'}</p>
              <p className="text-sm text-gray-500 truncate">{userData ? userData.email : 'email@exemple.com'}</p>
            </div>

            {/* Options du menu */}
            <DropdownMenuItem
              className="navbar-dropdown-item"
              onClick={() => navigate('/profile')}
            >
              <UserRound className="w-4 h-4 mr-2" />
              Mon profil
            </DropdownMenuItem>

            <DropdownMenuItem
              className="navbar-dropdown-item"
              onClick={() => navigate('/dashboard')}
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Tableau de bord
            </DropdownMenuItem>

            <DropdownMenuItem
              className="navbar-dropdown-item"
              onClick={() => navigate('/profile/settings')}
            >
              <Settings className="w-4 h-4 mr-2" />
              Paramètres
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="navbar-dropdown-item danger"
              onClick={onLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </DropdownMenuItem>
          </motion.div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserMenu;
