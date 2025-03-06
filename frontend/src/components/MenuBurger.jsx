import React, {memo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { authService } from '../lib/services/authService';

const MenuBurger = memo(()  => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const user = await authService.getCurrentUser();
        setUserData(user);
        setIsAuthenticated(true);

        if (user && user.roles && user.roles.length > 0) {
          setUserRole(user.roles[0]);
          console.log("User role (direct):", user.roles[0]);
        }
        console.log("User data:", user);
      } catch (error) {
        setUserData(null);
        setIsAuthenticated(false);
        console.log("Error fetching user data", error);
      }
    };

    checkAuthentication();
  }, []);

  useEffect(() => {
    if (userRole) {
      console.log("Updated user role:", userRole);
    }
  }, [userRole]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="relative">
      {/* Burger button (visible on smaller screens or as you prefer) */}
      <button
        className="menu-burger-button text-gray-200 hover:text-white focus:outline-none"
        onClick={toggleMenu}
      >
        {/* Simple burger icon */}
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 w-64 h-full bg-blue-900 text-white shadow-lg z-50"
          >
            <div className="flex flex-col h-full">
              {/* Header / Profile Section */}
              <div className="flex items-center p-4 border-b border-blue-700">
                {/* Placeholder for profile icon */}
                <div className="w-12 h-12 bg-white rounded-full mr-3" />
                <div>
                  <p className="font-semibold">{userData ? `${userData.firstName} ${userData.lastName}` : ''}</p>
                  <p className="text-sm text-blue-200">{userRole}</p>
                </div>
                {/* Optional close button on the right */}
                <button className="ml-auto text-white" onClick={toggleMenu}>
                  ✕
                </button>
              </div>

              {/* Menu Items */}
              <div className="scrollable-div">
                <ul className="py-2">
                  {/* Tableau de bord - always visible */}
                  <li className="flex items-center px-4 py-2 hover:bg-blue-800">
                    Tableau de bord
                  </li>

                  {/* Elèves - show if ROLE_SUPERADMIN or ROLE_ADMIN or ... */}
                  {(userRole === 'ROLE_SUPERADMIN' ||
                    userRole === 'ROLE_ADMIN' ||
                    userRole === 'ROLE_HR' ||
                    userRole === 'ROLE_TEACHER') && (
                    <li className="flex items-center px-4 py-2 hover:bg-blue-800">
                      Élèves
                    </li>
                  )}

                  {/* IF teacher or student */}
                    <li className="flex items-center px-4 py-2 hover:bg-blue-800">
                      Planning
                    </li>

                  {/* IF teacher or student */}
                  {(userRole === 'ROLE_STUDENT' ||
                    userRole === 'ROLE_TEACHER') && (
                    <li className="flex items-center px-4 py-2 hover:bg-blue-800">
                      Cours
                    </li>
                  )}

                  {/* IF teacher or student */}
                  {(userRole === 'ROLE_STUDENT' ||
                    userRole === 'ROLE_TEACHER') && (
                    <li className="flex items-center px-4 py-2 hover:bg-blue-800">
                      Projet
                    </li>
                  )}

                  {/* Enseignants */}
                  {(userRole === 'ROLE_SUPERADMIN' ||
                    userRole === 'ROLE_ADMIN' ||
                    userRole === 'ROLE_HR') && (
                    <li className="flex items-center px-4 py-2 hover:bg-blue-800">
                      Enseignants
                    </li>
                  )}

                  {/* Invités */}
                  {(userRole === 'ROLE_SUPERADMIN' ||
                    userRole === 'ROLE_ADMIN' ||
                    userRole === 'ROLE_HR') && (
                    <li className="flex items-center px-4 py-2 hover:bg-blue-800">
                      Invités
                    </li>
                  )}

                  {/* HR */}
                  {(userRole === 'ROLE_SUPERADMIN' ||
                    userRole === 'ROLE_ADMIN') && (
                    <li className="flex items-center px-4 py-2 hover:bg-blue-800">
                      HR
                    </li>
                  )}

                  {/* Admins - only SUPERADMIN */}
                  {userRole === 'ROLE_SUPERADMIN' && (
                    <li className="flex items-center px-4 py-2 hover:bg-blue-800">
                      Admins
                    </li>
                  )}

                  {/* Sites de formation - always visible (example) */}
                  {userRole === 'ROLE_SUPERADMIN' && (
                    <li className="flex items-center px-4 py-2 hover:bg-blue-800">
                      Sites de formations
                    </li>
                  )}


                  {/* Sites de formation - always visible (example) */}
                    <li className="flex items-center px-4 py-2 hover:bg-blue-800">
                        FAQ
                    </li>
                  

                  {/* Messagerie - always visible (example) */}
                  <li className="flex items-center px-4 py-2 hover:bg-blue-800">
                    Messagerie
                  </li>

                  {/* Notifications - always visible (example) */}
                  <li className="flex items-center px-4 py-2 hover:bg-blue-800">
                    Notifications
                  </li>
                </ul>
              </div>

              {/* Footer / Extra Buttons */}
              <div className="p-4 border-t border-blue-700">
               
                {/* Example "Logout" Button */}
                <button className="flex items-center w-full text-left hover:bg-blue-800 px-4 py-2 mt-2">
                  Déconnexion
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export { MenuBurger };

