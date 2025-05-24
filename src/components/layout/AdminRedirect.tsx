import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isCurrentUserAdmin } from '@/services/profileService';
import { Loader2 } from 'lucide-react';

/**
 * Composant qui vérifie si l'utilisateur est administrateur et le redirige vers l'interface admin si c'est le cas
 * Ce composant peut être utilisé dans les pages où l'on souhaite rediriger les administrateurs
 */
export function AdminRedirect() {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        setIsChecking(true);
        const isAdmin = await isCurrentUserAdmin();
        
        if (isAdmin) {
          // Rediriger vers l'interface administrateur
          navigate('/admin/dashboard');
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du statut administrateur:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkAdminStatus();
  }, [navigate]);

  // Ne rien afficher si la vérification est terminée
  if (!isChecking) return null;

  // Afficher un loader pendant la vérification
  return (
    <div className="flex items-center justify-center p-2">
      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
    </div>
  );
}

/**
 * Composant qui vérifie si l'utilisateur est administrateur et affiche le contenu en conséquence
 * Ce composant peut être utilisé pour afficher du contenu spécifique aux administrateurs
 */
export function AdminOnly({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const adminStatus = await isCurrentUserAdmin();
        setIsAdmin(adminStatus);
      } catch (error) {
        console.error('Erreur lors de la vérification du statut administrateur:', error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, []);

  // Afficher un loader pendant la vérification
  if (isAdmin === null) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Ne rien afficher si l'utilisateur n'est pas administrateur
  if (!isAdmin) return null;

  // Afficher le contenu si l'utilisateur est administrateur
  return <>{children}</>;
}

/**
 * Composant qui vérifie si l'utilisateur est administrateur et affiche un message d'erreur si ce n'est pas le cas
 * Ce composant peut être utilisé pour protéger les pages d'administration
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const adminStatus = await isCurrentUserAdmin();
        setIsAdmin(adminStatus);
        
        if (!adminStatus) {
          // Rediriger vers la page d'accueil si l'utilisateur n'est pas administrateur
          navigate('/');
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du statut administrateur:', error);
        setIsAdmin(false);
        navigate('/');
      }
    };

    checkAdminStatus();
  }, [navigate]);

  // Afficher un loader pendant la vérification
  if (isAdmin === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Vérification des droits d'accès...</p>
        </div>
      </div>
    );
  }

  // Afficher le contenu si l'utilisateur est administrateur
  return <>{children}</>;
}
