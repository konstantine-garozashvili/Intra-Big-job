import React from 'react';
import { useLocation } from 'react-router-dom';
import { usePublicTheme } from '@/contexts/theme/PublicThemeContext';
import { useProtectedTheme } from '@/contexts/theme/ProtectedThemeContext';
import { Moon, Sun } from 'lucide-react';
import { Button } from './button';

export function ThemeToggle() {
  const location = useLocation();
  const { colorMode: publicColorMode, toggleColorMode: togglePublicMode } = usePublicTheme();
  const { theme: protectedTheme, toggleTheme: toggleProtectedTheme } = useProtectedTheme();

  const isPublicRoute = location.pathname === '/' || 
    location.pathname.startsWith('/login') || 
    location.pathname.startsWith('/register') ||
    location.pathname.startsWith('/reset-password') ||
    location.pathname.startsWith('/verification') ||
    location.pathname.startsWith('/formations') ||
    location.pathname.startsWith('/formation-finder') ||
    location.pathname.startsWith('/skill-assessment');

  const handleToggle = () => {
    if (isPublicRoute) {
      togglePublicMode();
    } else {
      toggleProtectedTheme();
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      className="h-9 w-9 px-0"
    >
      {isPublicRoute ? (
        publicColorMode === 'navy' ? (
          <Sun className="h-4 w-4 text-blue-100" />
        ) : (
          <Moon className="h-4 w-4 text-gray-100" />
        )
      ) : protectedTheme === 'light' ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

export function ThemeToggleWithText({ variant = "ghost", className = "" }) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Button 
      variant={variant} 
      onClick={toggleTheme}
      aria-label={
        theme === "light"
          ? "Basculer vers le mode sombre"
          : "Basculer vers le mode clair"
      }
      className={`gap-2 hover:bg-accent/80 transition-colors duration-300 ${className}`}
    >
      {theme === "light" ? (
        <>
          <Moon className="h-4 w-4" />
          <span>Mode sombre</span>
        </>
      ) : (
        <>
          <Sun className="h-4 w-4" />
          <span>Mode clair</span>
        </>
      )}
    </Button>
  );
} 