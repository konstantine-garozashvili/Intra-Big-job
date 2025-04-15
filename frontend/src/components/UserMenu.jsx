import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ProfilePictureDisplay } from "@/components/ProfilePictureDisplay";
import { Settings, LogOut, Zap } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { setLowPerformanceMode } from '@/lib/utils/loadingUtils';
import { useState, useEffect } from 'react';

export function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLowPerformanceMode, setIsLowPerformanceMode] = useState(false);

  // Load current performance mode on component mount
  useEffect(() => {
    const storedPref = localStorage.getItem('preferLowPerformanceMode');
    setIsLowPerformanceMode(storedPref === 'true');
  }, []);

  // Toggle performance mode
  const togglePerformanceMode = () => {
    const newMode = !isLowPerformanceMode;
    setIsLowPerformanceMode(newMode);
    setLowPerformanceMode(newMode);
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <ProfilePictureDisplay className="h-8 w-8" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => navigate('/profile')}>
          <ProfilePictureDisplay className="w-4 h-4" />
          Profil
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/settings')}>
          <Settings className="w-4 h-4 mr-2" />
          Paramètres
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={togglePerformanceMode}>
          <Zap className="w-4 h-4 mr-2" />
          {isLowPerformanceMode ? 'Mode performance normal' : 'Mode performance faible'}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          Déconnexion
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
