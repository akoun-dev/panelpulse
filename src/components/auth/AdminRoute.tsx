import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

// Props pour le composant AdminRoute
type AdminRouteProps = {
  children: ReactNode;
};

/**
 * Composant qui vérifie si l'utilisateur est administrateur
 * Si oui, affiche les enfants, sinon redirige vers la page d'accueil
 */
export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, isAdmin, loading, profileLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Attendre que le chargement soit terminé
    if (!loading && !profileLoading) {
      // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
      if (!user) {
        navigate('/auth/login', { state: { from: '/admin/dashboard' } });
        return;
      }
      
      // Si l'utilisateur n'est pas administrateur, rediriger vers la page d'accueil
      if (!isAdmin) {
        navigate('/user/dashboard');
      }
    }
  }, [user, isAdmin, loading, profileLoading, navigate]);

  // Pendant le chargement, afficher un indicateur de chargement
  if (loading || profileLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Vérification des droits d'accès...</p>
        </div>
      </div>
    );
  }

  // Si l'utilisateur est connecté et est administrateur, afficher les enfants
  return (user && isAdmin) ? <>{children}</> : null;
};

/**
 * Composant qui vérifie si l'utilisateur est administrateur
 * Si oui, affiche les enfants, sinon ne les affiche pas
 * Utile pour afficher conditionnellement des éléments d'interface réservés aux administrateurs
 */
export const AdminOnly = ({ children }: { children: ReactNode }) => {
  const { isAdmin, loading, profileLoading } = useAuth();

  // Pendant le chargement, ne rien afficher
  if (loading || profileLoading) {
    return null;
  }

  // Si l'utilisateur est administrateur, afficher les enfants
  return isAdmin ? <>{children}</> : null;
};
