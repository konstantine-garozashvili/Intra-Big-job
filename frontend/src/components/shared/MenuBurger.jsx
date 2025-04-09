import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/contexts/TranslationContext';

const MenuBurger = ({ isOpen, onClose }) => {
  const { translate, currentLanguage } = useTranslation();
  const [translations, setTranslations] = useState({});

  // Memoize translation function to prevent unnecessary re-renders
  const translateMenuItems = useCallback(async () => {
    try {
      const [
        home,
        forum,
        contact,
        about,
        formations,
        partners,
        legal,
        terms
      ] = await Promise.all([
        translate('Accueil'),
        translate('Forum'),
        translate('Contact'),
        translate('À propos'),
        translate('Formations'),
        translate('Partenaires'),
        translate('Mentions légales'),
        translate('CGU')
      ]);

      setTranslations({
        home,
        forum,
        contact,
        about,
        formations,
        partners,
        legal,
        terms
      });
    } catch (error) {
      console.error('Translation error:', error);
    }
  }, [translate]);

  // Effect for translations
  useEffect(() => {
    translateMenuItems();
  }, [currentLanguage, translateMenuItems]);

  const menuItems = [
    { name: translations.home, href: '/home' },
    { name: translations.forum, href: '/forum' },
    { name: translations.contact, href: '/contact' },
    { name: translations.about, href: '/about' },
    { name: translations.formations, href: '/formations' },
    { name: translations.partners, href: '/partenaires' },
    { name: translations.legal, href: '/mentions-legales' },
    { name: translations.terms, href: '/cgu' },
  ];

  return (
    <div
      className={`fixed inset-0 z-50 transform ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      } transition-transform duration-300 ease-in-out`}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="absolute right-0 h-full w-64 bg-white shadow-lg">
        <div className="flex justify-end p-4">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <nav className="px-4">
          <ul className="space-y-4">
            {menuItems.map((item, index) => (
              <li key={index}>
                <Link
                  to={item.href}
                  className="block py-2 text-gray-700 hover:text-[#528eb2] transition-colors duration-300"
                  onClick={onClose}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default MenuBurger; 