import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { signOutFromAllDevices } from '@/services/accountService';
import { useToast } from '@/components/ui/use-toast';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SignOutAllDevicesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SignOutAllDevicesModal({ isOpen, onClose }: SignOutAllDevicesModalProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signOutFromAllDevices();

      if (result.success) {
        toast({
          title: 'Déconnexion réussie',
          description: result.message,
        });
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
      console.error('Erreur lors de la déconnexion de tous les appareils:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la déconnexion de tous les appareils.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Gérer la fermeture du modal
  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Se déconnecter de tous les appareils</DialogTitle>
            <DialogDescription>
              Vous serez déconnecté de tous les appareils sur lesquels vous êtes actuellement connecté, y compris cet appareil.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-md text-sm text-yellow-600 dark:text-yellow-400">
              <p className="font-semibold">Remarque :</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Vous serez déconnecté de tous vos appareils</li>
                <li>Vous devrez vous reconnecter sur chaque appareil</li>
                <li>Cette action est utile si vous pensez que quelqu'un d'autre a accès à votre compte</li>
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
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading && (
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
              )}
              <LogOut className="h-4 w-4 mr-1" />
              Déconnecter tous les appareils
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
