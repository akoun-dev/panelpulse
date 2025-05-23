// Déclaration de type pour étendre l'interface Toast
import '@/components/ui/use-toast';

declare module '@/components/ui/use-toast' {
  interface ToastActionElement {
    altText: string;
    onClick: () => void;
  }

  interface Toast {
    id: string;
    title?: React.ReactNode;
    description?: React.ReactNode;
    action?: ToastActionElement;
    variant?: 'default' | 'destructive';
  }
  
  interface ToastProps {
    variant?: 'default' | 'destructive';
  }
}
