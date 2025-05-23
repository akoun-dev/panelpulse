import * as React from 'react';
import { useAuth } from '../hooks/useAuth'; // À créer
import AdminDashboard from './admin/AdminDashboard';
import UserDashboard from './user/UserDashboard';

const HomePage = () => {
  const { user } = useAuth(); // Hook d'authentification à implémenter

  if (!user) {
    // Rediriger vers la page de login si non connecté
    window.location.href = '/login';
    return null;
  }

  return user.role === 'admin' ? <AdminDashboard /> : <UserDashboard />;
};

export default HomePage;
