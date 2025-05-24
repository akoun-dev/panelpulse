import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/services/supabaseClient';
import { UserProfile } from '@/types';

// Types pour notre contexte d'authentification
type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  profileLoading: boolean;
  signUp: (email: string, password: string, userData?: Record<string, any>) => Promise<{
    error: Error | null;
    data: any | null;
  }>;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    data: any | null;
  }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{
    error: Error | null;
    data: any | null;
  }>;
  refreshProfile: () => Promise<void>;
};

// Création du contexte avec des valeurs par défaut
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props pour le provider
type AuthProviderProps = {
  children: ReactNode;
};

// Provider qui va envelopper notre application
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);

  // Fonction pour récupérer le profil utilisateur
  const fetchUserProfile = async (userId: string) => {
    if (!userId) return null;

    try {
      setProfileLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        return null;
      }

      return data as UserProfile;
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      return null;
    } finally {
      setProfileLoading(false);
    }
  };

  // Fonction pour rafraîchir le profil utilisateur
  const refreshProfile = async () => {
    if (!user) return;

    const userProfile = await fetchUserProfile(user.id);
    setProfile(userProfile);
    setIsAdmin(userProfile?.is_admin || false);
  };

  useEffect(() => {
    // Récupérer la session actuelle
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Si l'utilisateur est connecté, récupérer son profil
      if (session?.user) {
        const userProfile = await fetchUserProfile(session.user.id);
        setProfile(userProfile);
        setIsAdmin(userProfile?.is_admin || false);
      }
    };

    // Appel initial pour récupérer la session
    getSession();

    // Configurer l'écouteur pour les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Si l'utilisateur est connecté, récupérer son profil
        if (session?.user) {
          const userProfile = await fetchUserProfile(session.user.id);
          setProfile(userProfile);
          setIsAdmin(userProfile?.is_admin || false);
        } else {
          setProfile(null);
          setIsAdmin(false);
        }
      }
    );

    // Nettoyer l'écouteur lors du démontage
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fonction d'inscription
  const signUp = async (email: string, password: string, userData?: Record<string, any>) => {
    try {
      // Inscription de l'utilisateur
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData, // Données supplémentaires pour l'utilisateur
        },
      });

      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  };

  // Fonction de connexion
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  };

  // Fonction de déconnexion
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // Fonction de réinitialisation de mot de passe
  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  };

  // Valeur du contexte
  const value = {
    session,
    user,
    profile,
    isAdmin,
    loading,
    profileLoading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    refreshProfile,
  };

  // Rendu du provider avec les valeurs
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
};
