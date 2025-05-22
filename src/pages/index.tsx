import React from 'react';
import { useAuth } from '../hooks/useAuth'; // À créer
import AdminDashboard from './admin/Dashboard';
import UserDashboard from './user/Dashboard';

const HomePage = () => {
  const { user } = useAuth(); // Hook d'authentification à implémenter

  if (!user) {
    // Rediriger vers la page de login si non connecté
    window.location.href = '/auth/login';
    return null;
  }

  return user.role === 'admin' ? <AdminDashboard /> : <UserDashboard />;
};

export default HomePage;
