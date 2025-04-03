import React from 'react';
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { cn } from '@/lib/utils';

const Footer = ({ className }) => {
  const [extraPadding, setExtraPadding] = useState(0);

  // Effect to add extra padding when content is minimal
  useEffect(() => {
    const checkContentHeight = () => {
      const viewportHeight = window.innerHeight;
      const bodyHeight = document.body.offsetHeight;
      const mainContent = document.querySelector('main');
      
      if (mainContent && bodyHeight < viewportHeight) {
        // If body height is less than viewport, add extra padding to push footer down
        setExtraPadding(viewportHeight - bodyHeight + 100); // Add 100px buffer
      } else {
        setExtraPadding(0);
      }
    };

    // Check on mount and window resize
    checkContentHeight();
    window.addEventListener('resize', checkContentHeight);
    
    // Also check after a short delay to account for dynamic content loading
    const timer = setTimeout(checkContentHeight, 1000);
    
    return () => {
      window.removeEventListener('resize', checkContentHeight);
      clearTimeout(timer);
    };
  }, []);

  return (
    <footer className={cn(
      "py-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 transition-colors duration-200",
      className
    )}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} BigProject. Tous droits réservés.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200">
              Mentions légales
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200">
              Politique de confidentialité
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
