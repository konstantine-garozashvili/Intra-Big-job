import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';

const PublicNavbar = () => {
  const { colorMode, toggleColorMode, currentTheme } = useTheme();
  const location = useLocation();

  // Déterminer la page courante
  const isLoginPage = location.pathname === '/login';
  const isRegisterPage = location.pathname === '/register';

  return (
    <nav className="fixed top-0 left-0 w-full z-40 transition-all duration-300">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <div className="text-2xl font-bold text-white">
              Big<span className="text-[#528eb2]">Project</span>
            </div>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {/* Theme toggle icon */}
          <button
            className="relative w-10 h-10 rounded-full overflow-hidden hover:scale-110 active:scale-90 transition-transform"
            onClick={toggleColorMode}
          >
            <div className={`absolute inset-0 ${colorMode === 'navy' ? 'bg-gradient-to-br from-[#0a3c6e] to-[#001a38]' : 'bg-gradient-to-br from-gray-800 to-black'} rounded-full flex items-center justify-center shadow-lg ${currentTheme.shadow}`}>
              {colorMode === 'navy' ? (
                <div className="w-full h-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="32px" height="32px" viewBox="0 0 25 25" fill="none">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 11.5373 21.3065 11.4608 21.0672 11.8568C19.9289 13.7406 17.8615 15 15.5 15C11.9101 15 9 12.0899 9 8.5C9 6.13845 10.2594 4.07105 12.1432 2.93276C12.5392 2.69347 12.4627 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="#BFDBFF"/>
                </svg>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32px" height="32px" viewBox="0 0 25 25" fill="none">
                    <path d="M17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12Z" aria-label="Activer le mode sombre" role="img" fill="#FDE047" />
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M12 1.25C12.4142 1.25 12.75 1.58579 12.75 2V4C12.75 4.41421 12.4142 4.75 12 4.75C11.5858 4.75 11.25 4.41421 11.25 4V2C11.25 1.58579 11.5858 1.25 12 1.25ZM1.25 12C1.25 11.5858 1.58579 11.25 2 11.25H4C4.41421 11.25 4.75 11.5858 4.75 12C4.75 12.4142 4.41421 12.75 4 12.75H2C1.58579 12.75 1.25 12.4142 1.25 12ZM19.25 12C19.25 11.5858 19.5858 11.25 20 11.25H22C22.4142 11.25 22.75 11.5858 22.75 12C22.75 12.4142 22.4142 12.75 22 12.75H20C19.5858 12.75 19.25 12.4142 19.25 12ZM12 19.25C12.4142 19.25 12.75 19.5858 12.75 20V22C12.75 22.4142 12.4142 22.75 12 22.75C11.5858 22.75 11.25 22.4142 11.25 22V20C11.25 19.5858 11.5858 19.25 12 19.25Z" fill="#FDE047" />
                    <g opacity="0.5">
                      <path d="M3.66919 3.7156C3.94869 3.4099 4.42309 3.38867 4.72879 3.66817L6.95081 5.69975C7.25651 5.97925 7.27774 6.45365 6.99824 6.75935C6.71874 7.06505 6.24434 7.08629 5.93865 6.80679L3.71663 4.7752C3.41093 4.4957 3.38969 4.0213 3.66919 3.7156Z" fill="#FDE047" />
                      <path d="M20.3319 3.7156C20.6114 4.0213 20.5902 4.4957 20.2845 4.7752L18.0624 6.80679C17.7567 7.08629 17.2823 7.06505 17.0028 6.75935C16.7233 6.45365 16.7446 5.97925 17.0503 5.69975L19.2723 3.66817C19.578 3.38867 20.0524 3.4099 20.3319 3.7156Z" fill="#FDE047" />
                      <path d="M17.0261 17.0247C17.319 16.7318 17.7938 16.7319 18.0867 17.0248L20.3087 19.2471C20.6016 19.54 20.6016 20.0148 20.3087 20.3077C20.0158 20.6006 19.5409 20.6006 19.248 20.3076L17.026 18.0854C16.7331 17.7924 16.7332 17.3176 17.0261 17.0247Z" fill="#FDE047" />
                      <path d="M6.97521 17.0249C7.2681 17.3177 7.2681 17.7926 6.97521 18.0855L4.75299 20.3077C4.46009 20.6006 3.98522 20.6006 3.69233 20.3077C3.39943 20.0148 3.39943 19.54 3.69233 19.2471L5.91455 17.0248C6.20744 16.732 6.68232 16.732 6.97521 17.0249Z" fill="#FDE047" />
                    </g>
                  </svg>
                </div>
              )}
            </div>
          </button>

          {/* Login button - hidden on login page */}
          {!isLoginPage && (
            <Link to="/login">
              <button
                className={`py-2 px-6 ${currentTheme.navButtonBg} text-white rounded-full font-medium hover:bg-opacity-90 transition-colors shadow-lg ${currentTheme.shadow} hover:scale-105 active:scale-95 transition-transform`}
              >
                Connexion
              </button>
            </Link>
          )}

          {/* Register button - hidden on register page */}
          {!isRegisterPage && (
            <Link to="/register">
              <button
                className={`py-2 px-6 bg-transparent border ${currentTheme.navButtonBorder} ${currentTheme.textPrimary} rounded-full font-medium hover:bg-opacity-10 hover:bg-white hover:text-white transition-colors shadow-lg ${currentTheme.shadow} hover:scale-105 active:scale-95 transition-transform`}
              >
                Inscription
              </button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default PublicNavbar; 