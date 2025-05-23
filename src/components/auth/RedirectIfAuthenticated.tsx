import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

// Props pour le composant RedirectIfAuthenticated
type RedirectIfAuthenticatedProps = {
  children: ReactNode;
};

/**
 * Composant qui redirige les utilisateurs déjà authentifiés
 * Si l'utilisateur est connecté, il est redirigé vers son tableau de bord
 */
const RedirectIfAuthenticated = ({ children }: RedirectIfAuthenticatedProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Si le chargement est terminé et que l'utilisateur est connecté
    if (!loading && user) {
      // Rediriger vers le tableau de bord utilisateur
      navigate('/user/dashboard');
    }
  }, [user, loading, navigate]);

  // Pendant le chargement, afficher un indicateur de chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Si l'utilisateur n'est pas connecté, afficher les enfants
  return !user ? <>{children}</> : null;
};

export default RedirectIfAuthenticated;
