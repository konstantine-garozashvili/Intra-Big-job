import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";
import { useEffect, useState } from "react";

export function ThemeToggle({ variant = "ghost", size = "icon", className = "" }) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Attendre que le composant soit monté pour éviter les problèmes d'hydratation
  useEffect(() => {
    setMounted(true);
  }, []);

  // Ne rien afficher pendant le montage pour éviter un rendu incorrect côté serveur
  if (!mounted) {
    return null;
  }

  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={toggleTheme}
      aria-label={
        theme === "light"
          ? "Basculer vers le mode sombre"
          : "Basculer vers le mode clair"
      }
      title={
        theme === "light"
          ? "Basculer vers le mode sombre"
          : "Basculer vers le mode clair"
      }
      className={`hover:bg-accent/80 transition-colors duration-300 ${className}`}
    >
      {theme === "light" ? (
        <Sun className="h-5 w-5 text-amber-500" />
      ) : (
        <Moon className="h-5 w-5 text-indigo-300" />
      )}
      <span className="sr-only">
        {theme === "light" ? "Mode sombre" : "Mode clair"}
      </span>
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