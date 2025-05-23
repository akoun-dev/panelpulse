import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

// Props pour le composant ProtectedRoute
type ProtectedRouteProps = {
  children: ReactNode;
};

/**
 * Composant qui protège les routes nécessitant une authentification
 * Si l'utilisateur n'est pas connecté, il est redirigé vers la page de connexion
 */
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Si le chargement est terminé et que l'utilisateur n'est pas connecté
    if (!loading && !user) {
      // Rediriger vers la page de connexion
      navigate('/auth/login');
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

  // Si l'utilisateur est connecté, afficher les enfants
  return user ? <>{children}</> : null;
};

export default ProtectedRoute;
