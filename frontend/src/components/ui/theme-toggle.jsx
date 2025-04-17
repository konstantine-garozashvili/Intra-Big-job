import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import { Button } from './button';

export function ThemeToggle() {
  const { colorMode, toggleColorMode } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleColorMode}
      className="rounded-full"
    >
      {colorMode === 'light' ? (
        <Sun className="h-5 w-5 text-current" />
      ) : (
        <Moon className="h-5 w-5 text-current" />
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