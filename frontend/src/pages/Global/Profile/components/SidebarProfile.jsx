import { useNavigate, useLocation } from 'react-router-dom';
import { useMemo, memo, useCallback } from 'react';
import {
  User,
  Bell,
  Lock,
  Briefcase,
} from 'lucide-react';
import { useUserDataCentralized } from '@/hooks';
import { authService } from '@/lib/services/authService';

// Memoized navigation button component
const NavButton = memo(({ item, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors
      ${isActive 
        ? 'bg-primary text-primary-foreground no' 
        : 'hover:bg-muted text-muted-foregrfound hover:text-foreground'
      }
      focus:outline-none focus-visible:outline-none`}
  >
    <div className="flex items-center gap-3">
      <item.icon className="w-5 h-5" />
      <span className="text-sm font-medium">{item.title}</span>
    </div>
    {item.badge && (
      <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full">
        {item.badge}
      </span>
    )}
  </button>
));

NavButton.displayName = 'NavButton';

// Highly optimized SidebarProfile component
const SidebarProfile = memo(({ onNavigate }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Utiliser notre hook centralisé avec son nouveau nom
  const { user, isLoading, isStudent, isGuest } = useUserDataCentralized();

  // Memoized navigation handler to prevent recreation on each render
  const handleNavigation = useCallback((href) => {
    navigate(href);
    onNavigate?.(); // Call onNavigate callback if provided (for mobile)
  }, [navigate, onNavigate]);

  // Utiliser useMemo pour éviter de reconstruire les items à chaque render
  const sidebarItems = useMemo(() => {
    // Base items communs à tous les utilisateurs
    const items = [
      {
        title: 'Mon compte',
        type: 'header',
      },
      {
        title: 'Modifier profil',
        icon: User,
        href: '/settings/profile',
      }
    ];
    
    // Ajouter l'option Carrière uniquement pour les étudiants et invités
    if (isStudent || isGuest) {
      items.push({
        title: 'Carrière',
        icon: Briefcase,
        href: '/settings/career',
      });
    }
    
    // Ajouter les options communes après Carrière
    items.push(
      {
        title: 'Sécurité',
        icon: Lock,
        href: '/settings/security',
      },
      {
        title: 'Notifications',
        icon: Bell,
        href: '/settings/notifications',
      }
    );
    
    return items;
  }, [isStudent, isGuest]);

  const handleLogout = useCallback(async () => {
    try {
      await authService.logout();
      // Invalider le cache de React Query pour forcer un rafraîchissement au prochain chargement
      window.queryClient?.invalidateQueries('currentUser');
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="space-y-4">
      <nav className="space-y-1">
        {sidebarItems.map((item) => {
          if (item.type === 'header') {
            return (
              <h2 key={item.title} className="px-3 text-lg font-semibold text-foreground">
                {item.title}
              </h2>
            );
          }

          const isActive = location.pathname === item.href;
          return (
            <NavButton
              key={item.href}
              item={item}
              isActive={isActive}
              onClick={() => handleNavigation(item.href)}
            />
          );
        })}
      </nav>
    </div>
  );
});

SidebarProfile.displayName = 'SidebarProfile';

export default SidebarProfile; 