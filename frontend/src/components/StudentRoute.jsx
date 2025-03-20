import { Outlet } from 'react-router-dom';

// Since the parent route already has RoleGuard, we don't need to check roles here
const StudentRoute = () => {
  return <Outlet />;
};

export default StudentRoute; 