import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { deleteAccount } from '@/services/accountService';
import { useToast } from '@/components/ui/use-toast';
import { Eye, EyeOff, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteAccountModal({ isOpen, onClose }: DeleteAccountModalProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
    password?: string;
    confirmText?: string;
  }>({});

  // Réinitialiser le formulaire
  const resetForm = () => {
    setPassword('');
    setConfirmText('');
    setErrors({});
    setShowPassword(false);
  };

  // Valider le formulaire
  const validateForm = (): boolean => {
    const newErrors: {
      password?: string;
      confirmText?: string;
    } = {};

    if (!password) {
      newErrors.password = 'Le mot de passe est requis';
    }

    if (confirmText !== 'SUPPRIMER') {
      newErrors.confirmText = 'Veuillez saisir SUPPRIMER pour confirmer';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await deleteAccount(password);

      if (result.success) {
        toast({
          title: 'Compte supprimé',
          description: result.message,
        });
        resetForm();
        onClose();
        // Rediriger vers la page d'accueil
        navigate('/');
      } else {
        toast({
          title: 'Erreur',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du compte:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la suppression du compte.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Gérer la fermeture du modal
  const handleClose = () => {
    if (!isLoading) {
      resetForm();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-red-600 dark:text-red-400">
              Supprimer mon compte
            </DialogTitle>
            <DialogDescription>
              Cette action est irréversible. Toutes vos données seront définitivement supprimées.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={errors.password ? 'border-red-500' : ''}
                  disabled={isLoading}
                  placeholder="Entrez votre mot de passe pour confirmer"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmText">
                Tapez <span className="font-bold">SUPPRIMER</span> pour confirmer
              </Label>
              <Input
                id="confirmText"
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className={errors.confirmText ? 'border-red-500' : ''}
                disabled={isLoading}
                placeholder="SUPPRIMER"
              />
              {errors.confirmText && (
                <p className="text-sm text-red-500">{errors.confirmText}</p>
              )}
            </div>

            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-md text-sm text-red-600 dark:text-red-400">
              <p className="font-semibold">Attention :</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Toutes vos données personnelles seront supprimées</li>
                <li>Vos panels et questions seront supprimés</li>
                <li>Vous ne pourrez plus accéder à votre compte</li>
                <li>Cette action ne peut pas être annulée</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading && (
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
              )}
              <Trash2 className="h-4 w-4 mr-1" />
              Supprimer définitivement
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
