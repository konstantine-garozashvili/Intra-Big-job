import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Home from '../pages/Home';
import Profile from '../pages/Profile';
import FormationList from '../pages/FormationList';
import TranslationTest from '../components/Translation/TranslationTest';
import { ProtectedRoute } from '../components/ProtectedRoute';
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
        path: 'formations',
        element: (
          <ProtectedRoute roles={['ROLE_RECRUITER', 'ROLE_ADMIN', 'ROLE_TEACHER']}>
            <FormationList />
          </ProtectedRoute>
        ),
      },
      {
        path: 'guest-formations',
        element: (
          <PublicRoute>
            <Formations />
          </PublicRoute>
        ),
      },
      {
        path: 'guest/dashboard',
        element: (
          <ProtectedRoute>
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
