import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Home from '../pages/Home';
import Profile from '../pages/Profile';
import FormationList from '../pages/FormationList';
import TranslationTest from '../components/Translation/TranslationTest';
import ProtectedRoute from '../components/ProtectedRoute';
import { PublicRoute } from '../components/PublicRoute';
import Formations from '../pages/Formations';
import GuestDashboard from '../pages/GuestDashboard';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'login',
        element: (
          <PublicRoute>
            <Login />
          </PublicRoute>
        ),
      },
      {
        path: 'register',
        element: (
          <PublicRoute>
            <Register />
          </PublicRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: 'manage-formations',
        element: (
          <ProtectedRoute roles={['ROLE_RECRUITER', 'ROLE_ADMIN', 'ROLE_TEACHER']}>
            <FormationList />
          </ProtectedRoute>
        ),
      },
      {
        path: 'guest/formations',
        element: (
          <ProtectedRoute roles={['ROLE_GUEST']}>
            <Formations />
          </ProtectedRoute>
        ),
      },
      {
        path: 'guest/dashboard',
        element: (
          <ProtectedRoute roles={['ROLE_GUEST']}>
            <GuestDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'translation',
        element: (
          <ProtectedRoute>
            <TranslationTest />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
