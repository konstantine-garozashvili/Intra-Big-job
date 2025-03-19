import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const StudentRoute = () => {
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isStudent, setIsStudent] = useState(false);
  
  useEffect(() => {
    const checkRole = () => {
      const userRoles = JSON.parse(localStorage.getItem('userRoles') || '[]');
      const isStudentRole = userRoles.includes('ROLE_STUDENT');
      setIsStudent(isStudentRole);
      setIsChecking(false);

      if (!isStudentRole) {
        toast.error("Accès non autorisé", {
          description: "Seuls les étudiants peuvent accéder à cette page."
        });
      }
    };

    checkRole();
  }, [location.pathname]);

  if (isChecking) {
    return null;
  }

  if (!isStudent) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default StudentRoute; 