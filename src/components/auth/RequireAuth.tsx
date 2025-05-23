import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

// Props pour le composant RequireAuth
type RequireAuthProps = {
  children: ReactNode;
};

// Composant qui vérifie si l'utilisateur est authentifié
// Si oui, affiche les enfants, sinon redirige vers la page de connexion
export const RequireAuth = ({ children }: RequireAuthProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Attendre que le chargement soit terminé
    if (!loading) {
      // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
      if (!user) {
        // Stocker l'URL actuelle pour rediriger l'utilisateur après la connexion
        navigate('/auth/login', { state: { from: location.pathname } });
      }
    }
  }, [user, loading, navigate, location]);

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

// Props pour le composant RedirectIfAuthenticated
type RedirectIfAuthenticatedProps = {
  children: ReactNode;
};

// Composant qui vérifie si l'utilisateur est authentifié
// Si oui, redirige vers le tableau de bord, sinon affiche les enfants
export const RedirectIfAuthenticated = ({ children }: RedirectIfAuthenticatedProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Attendre que le chargement soit terminé
    if (!loading && user) {
      // Si l'utilisateur est connecté, rediriger vers le tableau de bord
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
