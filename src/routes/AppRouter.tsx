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
import AdminModeration from '../pages/admin/AdminModeration';
import AdminSystemLogs from '../pages/admin/AdminSystemLogs';
import UserDashboard from '../pages/user/UserDashboard';
import UserMyPanels from '../pages/user/UserMyPanels';
import UserInvitations from '../pages/user/UserInvitations';
import UserInvitationDetails from '../pages/user/UserInvitationDetails';
import UserPanelDetails from '../pages/user/UserPanelDetails';
import UserCreatePanel from '../pages/user/UserCreatePanel';
import UserPanelistView from '../pages/user/UserPanelistView';
import UserProfile from '../pages/user/UserProfile';
import UserSettings from '../pages/user/UserSettings';
import NotFound from '../pages/NotFound';
import UserLayout from '@/components/layout/user/UserLayout';
import AudienceLayout from '../pages/audience/AudienceLayout';
import AudienceView from '../pages/audience/AudienceView';
import RedirectIfAuthenticated from '@/components/auth/RedirectIfAuthenticated';

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
        path: 'auth/login',
        element: <RedirectIfAuthenticated><LoginPage /></RedirectIfAuthenticated>
      },
      {
        path: 'auth/register',
        element: <RedirectIfAuthenticated><RegisterPage /></RedirectIfAuthenticated>
      },
      {
        path: 'auth/forgot-password',
        element: <RedirectIfAuthenticated><ForgotPasswordPage /></RedirectIfAuthenticated>
      }
    ]
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    errorElement: <NotFound />,
    children: [
      {
        path: '',
        element: <AdminDashboard />
      },
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
      },
      {
        path: 'moderation',
        element: <AdminModeration />
      },
      {
        path: 'logs',
        element: <AdminSystemLogs />
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
      },
      {
        path: 'invitations/:id',
        element: <UserInvitationDetails />
      },
      {
        path: 'panels/:panelId',
        element: <UserPanelDetails />,
        loader: async ({ params }) => {
          // TODO: Implémenter le chargement des données du panel
          return { panelId: params.panelId }
        }
      },
      {
        path: 'create-panel',
        element: <UserCreatePanel />
      },
      {
        path: 'panelist/:panelId',
        element: <UserPanelistView />
      },
      {
        path: 'profile',
        element: <UserProfile />
      },
      {
        path: 'settings',
        element: <UserSettings />
      }
    ]
  },
  {
    path: '/public/panel/:panelId',
    element: <AudienceLayout />,
    errorElement: <NotFound />,
    children: [
      {
        path: '',
        element: <AudienceView />,
        loader: async ({ params }) => {
          // TODO: Implémenter le chargement des données du panel depuis l'API
          // Cette route est utilisée pour l'interface publique accessible via QR code
          // Elle permet aux spectateurs de voir les informations du panel, poser des questions et voter
          return { panelId: params.panelId }
        }
      }
    ]
  }
]);
