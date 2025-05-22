import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="border-t py-6">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-sm text-muted-foreground">
          © 2025 PanelPulse. Tous droits réservés.
        </p>
        <nav className="flex gap-4">
          <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary">
            Conditions d'utilisation
          </Link>
          <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary">
            Politique de confidentialité
          </Link>
        </nav>
      </div>
    </footer>
  );
}

export default Footer;

