import { createBrowserRouter } from 'react-router-dom';
import App from '@/App';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/auth/Login';
import RegisterPage from '../pages/auth/Register';
import ForgotPasswordPage from '../pages/auth/ForgotPassword';
import AdminLayout from '@/components/layout/admin/AdminLayout';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminManageUsers from '../pages/admin/AdminManageUsers';
import AdminManagePanels from '../pages/admin/AdminManagePanels';
import AdminStats from '../pages/admin/AdminStats';
import AdminSettings from '../pages/admin/AdminSettings';
import UserDashboard from '../pages/user/UserDashboard';
import UserMyPanels from '../pages/user/UserMyPanels';
import UserInvitations from '../pages/user/UserInvitations';
import NotFound from '../pages/NotFound';
import UserLayout from '@/components/layout/user/UserLayout';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <NotFound />,
    children: [
      {
        path: '',
        element: <HomePage />,
      },
      {
        path: 'login',
        element: <LoginPage />
      },
      {
        path: 'register',
        element: <RegisterPage />
      },
      {
        path: 'forgot-password',
        element: <ForgotPasswordPage />
      }
    ]
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    errorElement: <NotFound />,
    children: [
      {
        path: 'dashboard',
        element: <AdminDashboard />
      },
      {
        path: 'users',
        element: <AdminManageUsers />
      },
      {
        path: 'panels',
        element: <AdminManagePanels />
      },
      {
        path: 'stats',
        element: <AdminStats />
      },
      {
        path: 'settings',
        element: <AdminSettings />
      }
    ]
  },
  {
    path: '/user',
    element: <UserLayout />,
    errorElement: <NotFound />,
    children: [
      {
        path: 'dashboard',
        element: <UserDashboard />
      },
      {
        path: 'my-panels',
        element: <UserMyPanels />
      },
      {
        path: 'invitations',
        element: <UserInvitations />
      }
      
    ]
  }
]);
