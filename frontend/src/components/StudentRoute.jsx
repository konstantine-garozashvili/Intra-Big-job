import { Outlet } from 'react-router-dom';

// Temporarily bypass all student route checks
const StudentRoute = () => {
  // Simply render the child routes without any protection
  return <Outlet />;
};

export default StudentRoute; 