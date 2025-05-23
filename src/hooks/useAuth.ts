// Ce fichier est maintenant un simple re-export du hook useAuth du contexte
// pour maintenir la compatibilité avec le code existant
import { useAuth as useAuthFromContext } from '@/contexts/AuthContext';

export const useAuth = useAuthFromContext;
